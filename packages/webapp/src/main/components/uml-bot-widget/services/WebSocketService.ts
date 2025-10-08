/**
 * WebSocket service for UML Bot communication
 * Handles all WebSocket messaging, connection management, and response parsing
 */

export interface ChatMessage {
  id: string;
  action: string;
  message: string | object;
  isUser: boolean;
  timestamp: Date;
  diagramType?: string; // Track which diagram type this message relates to
}

export interface BotResponse {
  action: string;
  message: string | object;
  diagramType?: string;
}

export interface InjectionCommand {
  action: 'inject_element' | 'inject_complete_system' | 'modify_model';
  element?: any;
  systemSpec?: any;
  modification?: any;
  model?: any;
  message: string;
  diagramType?: string; // Diagram type for context
}

export type MessageHandler = (message: ChatMessage) => void;
export type ConnectionHandler = (connected: boolean) => void;
export type TypingHandler = (typing: boolean) => void;
export type InjectionHandler = (command: InjectionCommand) => void;

/**
 * WebSocket service for managing bot communication
 */
export class WebSocketService {
  private ws: WebSocket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 3000;
  private messageQueue: string[] = [];

  // Event handlers
  private onMessageHandler: MessageHandler | null = null;
  private onConnectionHandler: ConnectionHandler | null = null;
  private onTypingHandler: TypingHandler | null = null;
  private onInjectionHandler: InjectionHandler | null = null;

  constructor(private url: string = 'ws://localhost:8765') {}

  /**
   * Connect to WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('✅ Connected to UML Bot WebSocket');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.onConnectionHandler?.(true);
          
          // Send queued messages
          this.processMessageQueue();
          
          resolve();
        };

        this.ws.onclose = () => {
          console.log('❌ Disconnected from UML Bot WebSocket');
          this.isConnected = false;
          this.onConnectionHandler?.(false);
          
          // Attempt to reconnect
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('🔥 WebSocket error:', error);
          this.isConnected = false;
          this.onConnectionHandler?.(false);
          reject(error);
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };

      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  /**
   * Send message to bot with diagram type
   */
  sendMessage(message: string, diagramType?: string): boolean {
    if (!this.isConnected || !this.ws) {
      console.warn('⚠️ WebSocket not connected, queuing message');
      this.messageQueue.push(message);
      return false;
    }

    try {
      const type = diagramType || 'ClassDiagram';
      
      // Embed diagram type as a prefix that the bot can parse
      // Format: [DIAGRAM_TYPE:AgentDiagram] actual message
      const prefixedMessage = `[DIAGRAM_TYPE:${type}] ${message}`;
      
      const payload = {
        action: 'user_message',
        message: prefixedMessage,
        diagramType: type // Keep this for backward compatibility
      };

      console.log('📤 Sending message with diagram type:', type);
      this.ws.send(JSON.stringify(payload));
      
      // Show typing indicator
      this.onTypingHandler?.(true);
      
      return true;
    } catch (error) {
      console.error('Failed to send message:', error);
      return false;
    }
  }

  /**
   * Send model context to bot with diagram type (new feature)
   */
  sendModelContext(model: any, message: string, diagramType?: string): boolean {
    if (!this.isConnected || !this.ws) {
      console.warn('⚠️ WebSocket not connected, cannot send model context');
      return false;
    }

    try {
      // Send the context as a JSON string in the message field
      // The bot will parse this and extract both message and context
      const contextMessage = JSON.stringify({
        message: message,
        currentModel: model,
        diagramType: diagramType || 'ClassDiagram'
      });

      const payload = {
        action: 'user_message',
        message: contextMessage,
        diagramType: diagramType || 'ClassDiagram'
      };

      this.ws.send(JSON.stringify(payload));
      this.onTypingHandler?.(true);
      
      return true;
    } catch (error) {
      console.error('Failed to send message with context:', error);
      return false;
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const payload = JSON.parse(event.data) as BotResponse;
      
      // Hide typing indicator
      this.onTypingHandler?.(false);
      
      console.log('📨 Received message:', payload);

      // Check if this is an injection command
      if (payload.action === 'agent_reply_str' && typeof payload.message === 'string') {
        const messageStr = payload.message.trim();
        
        // Check if the message is a JSON injection command
        if (messageStr.startsWith('{')) {
          try {
            const injectionData = JSON.parse(messageStr) as InjectionCommand;
            
            if (this.isInjectionCommand(injectionData)) {
              console.log('🎯 Injection command detected:', injectionData);
              this.onInjectionHandler?.(injectionData);
              return;
            }
          } catch (e) {
            console.log('📝 Not a JSON injection command, treating as normal message');
          }
        }
      }

      // Handle as normal chat message
      const chatMessage: ChatMessage = {
        id: this.generateMessageId(),
        action: payload.action,
        message: payload.message,
        isUser: false,
        timestamp: new Date()
      };

      this.onMessageHandler?.(chatMessage);

    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  /**
   * Check if response is an injection command
   */
  private isInjectionCommand(data: any): data is InjectionCommand {
    return data && 
           typeof data.action === 'string' && 
           ['inject_element', 'inject_complete_system', 'modify_model'].includes(data.action);
  }

  /**
   * Attempt to reconnect to WebSocket
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('🚫 Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
      });
    }, this.reconnectDelay);
  }

  /**
   * Process queued messages
   */
  private processMessageQueue(): void {
    if (this.messageQueue.length === 0) return;

    console.log(`📤 Processing ${this.messageQueue.length} queued messages`);
    
    const messages = [...this.messageQueue];
    this.messageQueue = [];
    
    messages.forEach(message => {
      this.sendMessage(message);
    });
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Event handler setters
  onMessage(handler: MessageHandler): void {
    this.onMessageHandler = handler;
  }

  onConnection(handler: ConnectionHandler): void {
    this.onConnectionHandler = handler;
  }

  onTyping(handler: TypingHandler): void {
    this.onTypingHandler = handler;
  }

  onInjection(handler: InjectionHandler): void {
    this.onInjectionHandler = handler;
  }

  // Getters
  get connected(): boolean {
    return this.isConnected;
  }

  get connectionState(): string {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'closed';
      default:
        return 'unknown';
    }
  }
}
