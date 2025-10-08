import React, { useState, useEffect, useRef, useContext } from 'react';
import styled from 'styled-components';
import { ApollonEditorContext } from '../apollon-editor-component/apollon-editor-context';
import { useAppDispatch, useAppSelector } from '../store/hooks';

// Import our new services
import { UMLModelingService, ClassSpec, SystemSpec, ModelModification } from './services/UMLModelingService';
import { WebSocketService, ChatMessage, InjectionCommand } from './services/WebSocketService';
import { UIService } from './services/UIService';

// Styled Components
const ChatWidgetContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
`;

const ChatWindow = styled.div<{ isVisible: boolean }>`
  width: 420px;
  height: 550px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: absolute;
  bottom: 80px;
  right: 0;
  transform: ${props => props.isVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)'};
  opacity: ${props => props.isVisible ? '1' : '0'};
  visibility: ${props => props.isVisible ? 'visible' : 'hidden'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #e0e0e0;
`;

const ChatHeader = styled.div`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 20px;
  font-weight: 600;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  .header-content {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .agent-logo {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
    }
    
    .header-info {
      .title {
        font-size: 16px;
        font-weight: 600;
      }
      
      .subtitle {
        font-size: 12px;
        opacity: 0.8;
        margin-top: 2px;
      }
    }
  }
  
  .status-indicator {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #4CAF50;
    margin-left: 10px;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
  }
`;

const ChatMessages = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
  }
`;

const ChatInput = styled.div`
  padding: 20px;
  background: white;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 12px;
  align-items: flex-end;
  
  .input-container {
    flex: 1;
    position: relative;
    
    input {
      width: 100%;
      padding: 14px 50px 14px 16px;
      border: 2px solid #e2e8f0;
      border-radius: 25px;
      outline: none;
      font-size: 14px;
      font-family: inherit;
      transition: all 0.2s;
      
      &:focus {
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }
      
      &:disabled {
        background-color: #f8fafc;
        cursor: not-allowed;
      }
    }
  }
  
  .send-button {
    padding: 14px 20px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.2s;
    min-width: 60px;
    
    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }
    
    &:active {
      transform: translateY(0);
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
  }
`;

const CircleButton = styled.button<{ isOpen: boolean }>`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 25px rgba(102, 126, 234, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: ${props => props.isOpen ? 'rotate(45deg)' : 'rotate(0deg)'};
  color: white;
  font-size: 24px;
  
  &:hover {
    transform: ${props => props.isOpen ? 'rotate(45deg) scale(1.05)' : 'rotate(0deg) scale(1.05)'};
    box-shadow: 0 8px 30px rgba(102, 126, 234, 0.5);
  }
  
  &:active {
    transform: ${props => props.isOpen ? 'rotate(45deg) scale(0.95)' : 'rotate(0deg) scale(0.95)'};
  }
`;

const Message = styled.div<{ isUser: boolean }>`
  margin-bottom: 16px;
  display: flex;
  justify-content: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  align-items: flex-end;
  gap: 10px;
  
  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: ${props => props.isUser ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#4CAF50'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: bold;
    color: white;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
  
  .message-content {
    max-width: 75%;
    padding: 14px 18px;
    border-radius: 20px;
    font-size: 14px;
    line-height: 1.5;
    background: ${props => props.isUser 
      ? 'linear-gradient(135deg, #667eea, #764ba2)' 
      : '#ffffff'};
    color: ${props => props.isUser ? 'white' : '#2d3748'};
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1);
    border: ${props => props.isUser ? 'none' : '1px solid #e2e8f0'};
    position: relative;
    
    /* Message tail */
    &::before {
      content: '';
      position: absolute;
      bottom: 0;
      ${props => props.isUser ? 'right: -6px' : 'left: -6px'};
      width: 0;
      height: 0;
      border: 8px solid transparent;
      border-top-color: ${props => props.isUser ? '#764ba2' : '#ffffff'};
      border-bottom: 0;
      transform: rotate(${props => props.isUser ? '45deg' : '-45deg'});
    }
    
    .model-import-button {
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      padding: 10px 16px;
      border-radius: 20px;
      cursor: pointer;
      margin-top: 12px;
      font-size: 12px;
      font-weight: 600;
      transition: all 0.2s;
      display: inline-block;
      
      &:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: translateY(-1px);
      }
    }
  }
`;

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  
  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #4CAF50;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: bold;
    color: white;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
  
  .typing-content {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 20px;
    padding: 14px 18px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1);
    
    .typing-text {
      font-size: 14px;
      color: #64748b;
      font-style: italic;
    }
    
    .typing-animation {
      display: flex;
      gap: 4px;
      
      .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #64748b;
        animation: typing 1.4s infinite ease-in-out;
        
        &:nth-child(1) { animation-delay: 0s; }
        &:nth-child(2) { animation-delay: 0.2s; }
        &:nth-child(3) { animation-delay: 0.4s; }
      }
    }
  }
  
  @keyframes typing {
    0%, 60%, 100% {
      transform: translateY(0);
      opacity: 0.4;
    }
    30% {
      transform: translateY(-10px);
      opacity: 1;
    }
  }
`;

const StatusBar = styled.div`
  padding: 8px 20px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  font-size: 12px;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  .status-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .connection-status {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #4CAF50;
  }
  
  .diagram-type-badge {
    padding: 4px 8px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    margin-left: 8px;
  }
`;

/**
 * Enhanced UML Bot Widget with improved architecture
 * Uses service layer for better separation of concerns
 */
export const UMLBotWidget: React.FC = () => {
  // State management
  const [isVisible, setIsVisible] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const [currentDiagramType, setCurrentDiagramType] = useState<string>('ClassDiagram');

  // Services
  const [wsService] = useState(() => new WebSocketService());
  const [uiService] = useState(() => new UIService());
  const [modelingService, setModelingService] = useState<UMLModelingService | null>(null);

  // Refs and hooks
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { editor } = useContext(ApollonEditorContext);
  const dispatch = useAppDispatch();
  const currentDiagram = useAppSelector(state => state.diagram);

  // Initialize services when editor is available
  useEffect(() => {
    if (editor && dispatch && !modelingService) {
      const service = new UMLModelingService(editor, dispatch);
      setModelingService(service);
      console.log('✅ UML Modeling Service initialized');
    }
  }, [editor, dispatch, modelingService]);

  // Update modeling service with current model and detect diagram type
  useEffect(() => {
    if (modelingService && currentDiagram?.diagram?.model) {
      modelingService.updateCurrentModel(currentDiagram.diagram.model);
      
      // Detect and update diagram type
      const detectedType = currentDiagram.diagram.model.type || 'ClassDiagram';
      setCurrentDiagramType(detectedType);
      console.log('📊 Current diagram type:', detectedType);
    }
  }, [modelingService, currentDiagram]);

  // Initialize WebSocket connection
  useEffect(() => {
    const initializeWebSocket = async () => {
      try {
        // Set up event handlers
        wsService.onMessage((message: ChatMessage) => {
          setMessages(prev => [...prev, message]);
        });

        wsService.onConnection((connected: boolean) => {
          if (connected && !hasShownWelcome) {
            const welcomeMessage: ChatMessage = {
              id: uiService.generateId('msg'),
              action: 'agent_reply_str',
              message: `🎨 Hello! I'm your Enhanced UML Assistant!\n\nI can help you with:\n• ➕ **Class Diagrams** - Create classes, attributes, methods\n• 🔷 **Object Diagrams** - Define object instances\n• � **State Machine Diagrams** - Model state transitions\n• 🤖 **Agent Diagrams** - Design agent systems\n\n📊 Currently working on: **${currentDiagramType}**\n\nWhat would you like to build today?`,
              isUser: false,
              timestamp: new Date(),
              diagramType: currentDiagramType
            };
            setMessages(prev => [...prev, welcomeMessage]);
            setHasShownWelcome(true);
          }
        });

        wsService.onTyping((typing: boolean) => {
          setIsTyping(typing);
        });

        wsService.onInjection(async (command: InjectionCommand) => {
          if (!modelingService) {
            console.error('❌ Modeling service not available');
            uiService.showToast('Modeling service not ready', 'error');
            return;
          }

          try {
            let update;
            let successMessage;

            switch (command.action) {
              case 'inject_element':
                if (command.element) {
                  update = modelingService.processSimpleClassSpec(command.element as ClassSpec);
                  successMessage = `✅ Added ${command.element.className} class successfully!`;
                }
                break;

              case 'inject_complete_system':
                if (command.systemSpec) {
                  update = modelingService.processSystemSpec(command.systemSpec as SystemSpec);
                  successMessage = `✅ Created ${command.systemSpec.systemName} system successfully!`;
                }
                break;

              case 'modify_model':
                if (command.modification) {
                  update = modelingService.processModelModification(command.modification as ModelModification);
                  successMessage = `✅ Applied modification successfully!`;
                }
                break;

              default:
                throw new Error(`Unknown injection action: ${command.action}`);
            }

            if (update) {
              const success = await modelingService.injectToEditor(update);
              
              if (success) {
                const successChatMessage: ChatMessage = {
                  id: uiService.generateId('msg'),
                  action: 'agent_reply_str',
                  message: command.message || successMessage || 'Operation completed successfully!',
                  isUser: false,
                  timestamp: new Date()
                };
                setMessages(prev => [...prev, successChatMessage]);
                uiService.showToast('Model updated successfully!', 'success');
              } else {
                throw new Error('Failed to inject to editor');
              }
            }
          } catch (error) {
            console.error('❌ Injection failed:', error);
            const errorMessage: ChatMessage = {
              id: uiService.generateId('msg'),
              action: 'agent_reply_str',
              message: `❌ ${uiService.getFriendlyErrorMessage(error)}`,
              isUser: false,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
            uiService.showToast('Operation failed', 'error');
          }
        });

        // Connect to WebSocket
        await wsService.connect();
        console.log('✅ WebSocket service initialized');

      } catch (error) {
        console.error('❌ Failed to initialize WebSocket:', error);
        uiService.showToast('Failed to connect to AI assistant', 'error');
      }
    };

    initializeWebSocket();

    return () => {
      wsService.disconnect();
    };
  }, [wsService, uiService, hasShownWelcome, modelingService]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      uiService.scrollToBottom(messagesEndRef.current);
    }
  }, [messages, uiService]);

  // Handle sending messages
  const sendMessage = async () => {
    const validation = uiService.validateUserInput(inputValue);
    if (!validation.valid) {
      uiService.showToast(validation.error!, 'error');
      return;
    }

    const userMessage: ChatMessage = {
      id: uiService.generateId('msg'),
      action: 'user_message',
      message: inputValue,
      isUser: true,
      timestamp: new Date(),
      diagramType: currentDiagramType
    };

    setMessages(prev => [...prev, userMessage]);

    // Send message with diagram type
    const success = wsService.sendMessage(inputValue, currentDiagramType);

    if (!success) {
      uiService.showToast('Failed to send message', 'error');
    }

    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderMessage = (message: ChatMessage) => {
    const content = uiService.formatMessageContent(message);
    
    // Check if message contains importable model
    const hasImportableModel = uiService.containsImportableModel(content);
    
    return (
      <Message key={message.id} isUser={message.isUser}>
        {!message.isUser && (
          <div className="avatar">
            🤖
          </div>
        )}
        
        <div className="message-content">
          {content}
          
          {hasImportableModel && (
            <button 
              className="model-import-button"
              onClick={() => {
                const jsonBlocks = uiService.extractJsonBlocks(content);
                if (jsonBlocks.length > 0) {
                  // Import the first valid JSON block
                  // This could be enhanced to show a selection dialog
                  console.log('Importing model:', jsonBlocks[0].json);
                  uiService.showToast('Model import functionality coming soon!', 'info');
                }
              }}
            >
              📥 Import to Editor
            </button>
          )}
        </div>
        
        {message.isUser && (
          <div className="avatar">
            👤
          </div>
        )}
      </Message>
    );
  };

  return (
    <ChatWidgetContainer>
      <ChatWindow isVisible={isVisible}>
        <ChatHeader>
          <div className="header-content">
            <div className="agent-logo">🧠</div>
            <div className="header-info">
              <div className="title">UML Assistant</div>
              <div className="subtitle">Enhanced with AI</div>
            </div>
          </div>
          <div 
            className="status-indicator" 
            style={{ 
              background: wsService.connected ? '#4CAF50' : '#f44336' 
            }} 
          />
        </ChatHeader>
        
        <ChatMessages>
          {messages.map(renderMessage)}
          
          {isTyping && (
            <TypingIndicator>
              <div className="avatar">🤖</div>
              <div className="typing-content">
                <div className="typing-text">AI is thinking...</div>
                <div className="typing-animation">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
              </div>
            </TypingIndicator>
          )}
          
          <div ref={messagesEndRef} />
        </ChatMessages>
        
        <StatusBar>
          <div className="status-left">
            <div className="connection-status"></div>
            <span>Connected • {wsService.connectionState}</span>
            <div className="diagram-type-badge">
              📊 {currentDiagramType.replace('Diagram', '')}
            </div>
          </div>
          <span>{messages.length} messages</span>
        </StatusBar>
        
        <ChatInput>
          <div className="input-container">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe what you want to create or modify..."
              disabled={!wsService.connected}
            />
          </div>
          
          <button
            className="send-button"
            onClick={sendMessage}
            disabled={!wsService.connected || !inputValue.trim()}
          >
            Send
          </button>
        </ChatInput>
      </ChatWindow>
      
      <CircleButton isOpen={isVisible} onClick={() => setIsVisible(!isVisible)}>
        {isVisible ? '✕' : '🤖'}
      </CircleButton>
    </ChatWidgetContainer>
  );
};
