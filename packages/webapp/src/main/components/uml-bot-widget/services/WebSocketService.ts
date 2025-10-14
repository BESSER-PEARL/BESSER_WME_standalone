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
  private messageQueue: Array<{ message: string; diagramType: string; model?: any }> = [];

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
   * CRITICAL: Sends text message FIRST for intent detection, then JSON payload after delay
   */
  sendMessage(message: string, diagramType?: string, model?: any): boolean {
    const type = diagramType || 'ClassDiagram';
    const messageWithPrefix = `[DIAGRAM_TYPE:${type}] ${message}`;

    if (!this.isConnected || !this.ws) {
      console.warn('[ws] WebSocket not connected, queuing message');
      this.messageQueue.push({
        message: messageWithPrefix,
        diagramType: type,
        model
      });
      return false;
    }

    try {
      // Step 1: Send text message FIRST for intent detection
      console.log('[ws] Step 1: Sending text message for intent detection');
      this.sendTextMessage(messageWithPrefix, type);

      // Step 2: Send JSON payload with model context AFTER a small delay
      // This ensures the bot processes intent BEFORE receiving the full context
      if (model) {
        setTimeout(() => {
          console.log('[ws] Step 2: Sending JSON payload with model context');
          this.sendModelContext(model, messageWithPrefix, type);
        }, 500); // 500ms delay to ensure intent is detected first
      }

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
    const type = diagramType || 'ClassDiagram';

    if (!this.isConnected || !this.ws) {
      console.warn('[ws] WebSocket not connected, queuing context payload');
      this.messageQueue.push({
        message,
        diagramType: type,
        model
      });
      return false;
    }

    try {
      const sanitizedModel = JSON.parse(JSON.stringify(model));
      const envelope = {
        message,
        diagramType: type,
        currentModel: sanitizedModel
      };

      const payload = {
        action: 'user_message',
        message: JSON.stringify(envelope),
        diagramType: type
      };

      this.ws.send(JSON.stringify(payload));
      this.onTypingHandler?.(true);
      return true;
    } catch (error) {
      console.error('[ws] Failed to send model context:', error);
      return false;
    }
  }

  private sendTextMessage(message: string, diagramType: string): void {
    if (!this.isConnected || !this.ws) {
      throw new Error('WebSocket is not connected');
    }

    const payload = {
      action: 'user_message',
      message,
      diagramType
    };

    console.log('[ws] Sending message with diagram type:', diagramType);
    this.ws.send(JSON.stringify(payload));
    this.onTypingHandler?.(true);
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
   * Sends text message first, then model context with delay
   */
  private processMessageQueue(): void {
    if (this.messageQueue.length === 0) {
      return;
    }

    console.log(`[ws] Processing ${this.messageQueue.length} queued messages`);

    const messages = [...this.messageQueue];
    this.messageQueue = [];

    messages.forEach((item, index) => {
      try {
        // Send text message first
        setTimeout(() => {
          this.sendTextMessage(item.message, item.diagramType);
          
          // Send model context after delay
          if (item.model) {
            setTimeout(() => {
              this.sendModelContext(item.model, item.message, item.diagramType);
            }, 500);
          }
        }, index * 1000); // Stagger multiple queued messages
      } catch (error) {
        console.error('[ws] Failed to process queued message:', error);
      }
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
