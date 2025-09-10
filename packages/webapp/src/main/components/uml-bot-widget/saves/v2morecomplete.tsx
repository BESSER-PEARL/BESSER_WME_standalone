// import React, { useState, useEffect, useRef, useContext } from 'react';
// import styled from 'styled-components';
// import { ApollonEditorContext } from '../apollon-editor-component/apollon-editor-context';
// import { useAppDispatch, useAppSelector } from '../store/hooks';
// import { updateDiagramThunk } from '../../services/diagram/diagramSlice';

// // UML Element Creation Utilities
// interface ClassSpec {
//   className: string;
//   attributes: Array<{
//     name: string;
//     type: string;
//     visibility: 'public' | 'private' | 'protected';
//   }>;
//   methods: Array<{
//     name: string;
//     returnType: string;
//     visibility: 'public' | 'private' | 'protected';
//     parameters: Array<{ name: string; type: string; }>;
//   }>;
// }

// interface SystemSpec {
//   systemName: string;
//   classes: ClassSpec[];
//   relationships: Array<{
//     type: 'Association' | 'Inheritance' | 'Composition' | 'Aggregation';
//     sourceClass: string;
//     targetClass: string;
//     sourceMultiplicity?: string;
//     targetMultiplicity?: string;
//     name?: string;
//   }>;
// }

// const generateUniqueId = (prefix: string = 'id') => {
//   return `${prefix}_${Math.random().toString(36).substr(2, 9)}_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 3)}`;
// };

// const generateMessageId = () => {
//   return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
// };

// const createClassElement = (spec: ClassSpec, position?: { x: number; y: number }) => {
//   const classId = generateUniqueId('class');
//   const pos = position || { 
//     x: Math.floor(Math.random() * 400) + 50, 
//     y: Math.floor(Math.random() * 300) + 50 
//   };
  
//   // Calculate height based on content
//   const baseHeight = 60;
//   const attrHeight = spec.attributes.length * 25 + (spec.attributes.length > 0 ? 10 : 0);
//   const methodHeight = spec.methods.length * 25 + (spec.methods.length > 0 ? 10 : 0);
//   const totalHeight = baseHeight + attrHeight + methodHeight;
  
//   const classElement = {
//     type: "Class",
//     id: classId,
//     name: spec.className,
//     owner: null,
//     bounds: { x: pos.x, y: pos.y, width: 220, height: totalHeight },
//     attributes: [] as string[],
//     methods: [] as string[]
//   };
  
//   return { classElement, classId };
// };

// const createAttributeElements = (spec: ClassSpec, classId: string, startY: number, startX: number) => {
//   const attributes: Record<string, any> = {};
//   let currentY = startY;
  
//   spec.attributes.forEach((attr, index) => {
//     const attrId = generateUniqueId('attr');
//     const visibilitySymbol = attr.visibility === 'public' ? '+' : 
//                            attr.visibility === 'private' ? '-' : '#';
    
//     attributes[attrId] = {
//       id: attrId,
//       name: `${visibilitySymbol} ${attr.name}: ${attr.type}`,
//       type: "ClassAttribute",
//       owner: classId,
//       bounds: { x: startX + 1, y: currentY, width: 218, height: 25 }
//     };
    
//     currentY += 25;
//   });
  
//   return { attributes, endY: currentY };
// };

// const createMethodElements = (spec: ClassSpec, classId: string, startY: number, startX: number) => {
//   const methods: Record<string, any> = {};
//   let currentY = startY + (spec.attributes.length > 0 ? 10 : 0);
  
//   spec.methods.forEach((method, index) => {
//     const methodId = generateUniqueId('method');
//     const visibilitySymbol = method.visibility === 'public' ? '+' : 
//                            method.visibility === 'private' ? '-' : '#';
    
//     const paramStr = method.parameters.map(p => `${p.name}: ${p.type}`).join(', ');
//     const methodName = `${visibilitySymbol} ${method.name}(${paramStr}): ${method.returnType}`;
    
//     methods[methodId] = {
//       id: methodId,
//       name: methodName,
//       type: "ClassMethod",
//       owner: classId,
//       bounds: { x: startX + 1, y: currentY, width: 218, height: 25 }
//     };
    
//     currentY += 25;
//   });
  
//   return { methods, endY: currentY };
// };

// const createCompleteClassFromSpec = (spec: ClassSpec, position?: { x: number; y: number }) => {
//   const { classElement, classId } = createClassElement(spec, position);
  
//   const startY = classElement.bounds.y + 50;
//   const startX = classElement.bounds.x;
  
//   const { attributes, endY: attrEndY } = createAttributeElements(spec, classId, startY, startX);
//   const { methods } = createMethodElements(spec, classId, attrEndY, startX);
  
//   // Update class element with attribute and method IDs
//   classElement.attributes = Object.keys(attributes);
//   classElement.methods = Object.keys(methods);
  
//   return {
//     class: classElement,
//     attributes,
//     methods
//   };
// };

// const ChatWidgetContainer = styled.div`
//   position: fixed;
//   bottom: 20px;
//   right: 20px;
//   z-index: 1000;
// `;

// const ChatWindow = styled.div<{ isVisible: boolean }>`
//   width: 380px;
//   height: 500px;
//   background: white;
//   border-radius: 15px;
//   box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
//   display: flex;
//   flex-direction: column;
//   overflow: hidden;
//   position: absolute;
//   bottom: 70px;
//   right: 0;
//   transform: ${props => props.isVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)'};
//   opacity: ${props => props.isVisible ? '1' : '0'};
//   visibility: ${props => props.isVisible ? 'visible' : 'hidden'};
//   transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
// `;

// const ChatHeader = styled.div`
//   background: linear-gradient(135deg, #34a4bd, #2980b9);
//   color: white;
//   padding: 15px 20px;
//   font-weight: 600;
//   font-size: 16px;
//   display: flex;
//   align-items: center;
//   justify-content: space-between;
  
//   .header-content {
//     display: flex;
//     align-items: center;
//     gap: 10px;
    
//     .agent-logo {
//       width: 24px;
//       height: 24px;
//       border-radius: 50%;
//       object-fit: cover;
//     }
//   }
  
//   .status-indicator {
//     width: 8px;
//     height: 8px;
//     background: #2ecc71;
//     border-radius: 50%;
//     margin-left: 10px;
//   }
// `;

// const ChatMessages = styled.div`
//   flex: 1;
//   padding: 20px;
//   overflow-y: auto;
//   background: #f8f9fa;
  
//   &::-webkit-scrollbar {
//     width: 6px;
//   }
  
//   &::-webkit-scrollbar-track {
//     background: #f1f1f1;
//     border-radius: 3px;
//   }
  
//   &::-webkit-scrollbar-thumb {
//     background: #bbb;
//     border-radius: 3px;
//   }
// `;

// const ChatInput = styled.div`
//   padding: 20px;
//   background: white;
//   border-top: 1px solid #e9ecef;
//   display: flex;
//   gap: 10px;
  
//   input {
//     flex: 1;
//     padding: 12px 15px;
//     border: 1px solid #ddd;
//     border-radius: 25px;
//     outline: none;
//     font-size: 14px;
    
//     &:focus {
//       border-color: #34a4bd;
//       box-shadow: 0 0 0 2px rgba(52, 164, 189, 0.2);
//     }
//   }
  
//   button {
//     padding: 12px 20px;
//     background: linear-gradient(135deg, #34a4bd, #2980b9);
//     color: white;
//     border: none;
//     border-radius: 25px;
//     cursor: pointer;
//     font-weight: 600;
//     transition: all 0.2s;
    
//     &:hover {
//       transform: translateY(-1px);
//       box-shadow: 0 4px 15px rgba(52, 164, 189, 0.3);
//     }
    
//     &:active {
//       transform: translateY(0);
//     }
//   }
// `;

// const CircleButton = styled.button<{ isOpen: boolean }>`
//     width: 60px;
//     height: 60px;
//     border-radius: 50%;
//     background: url('/img/agent_logo.jpeg') no-repeat center center;
//     background-size: cover;
//     border: none;
//     cursor: pointer;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     box-shadow: 0 4px 20px rgba(52, 164, 189, 0.4);
//     transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
//     transform: ${props => props.isOpen ? 'rotate(45deg)' : 'rotate(0deg)'};
    
//     &:hover {
//         transform: ${props => props.isOpen ? 'rotate(45deg) scale(1.1)' : 'rotate(0deg) scale(1.1)'};
//         box-shadow: 0 6px 25px rgba(52, 164, 189, 0.5);
//     }
    
//     svg {
//         display: none;
//     }
// `;

// const Message = styled.div<{ isUser: boolean }>`
//   margin-bottom: 15px;
//   display: flex;
//   justify-content: ${props => props.isUser ? 'flex-end' : 'flex-start'};
//   align-items: flex-end;
//   gap: 8px;
  
//   .avatar {
//     width: 32px;
//     height: 32px;
//     border-radius: 50%;
//     background: #34a4bd;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     font-size: 12px;
//     font-weight: bold;
//     color: white;
//     flex-shrink: 0;
    
//     img {
//       width: 100%;
//       height: 100%;
//       border-radius: 50%;
//       object-fit: cover;
//     }
//   }
  
//   .message-content {
//     max-width: 70%;
//     padding: 12px 16px;
//     border-radius: 18px;
//     font-size: 14px;
//     line-height: 1.4;
//     background: ${props => props.isUser ? 'linear-gradient(135deg, #34a4bd, #2980b9)' : '#ffffff'};
//     color: ${props => props.isUser ? 'white' : '#333'};
//     box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
//     border: ${props => props.isUser ? 'none' : '1px solid #e9ecef'};
    
//     pre {
//       background: rgba(0, 0, 0, 0.1);
//       padding: 10px;
//       border-radius: 8px;
//       overflow-x: auto;
//       margin: 8px 0;
//       font-size: 12px;
//     }
    
//     .model-import-button {
//       background: rgba(255, 255, 255, 0.2);
//       border: 1px solid rgba(255, 255, 255, 0.3);
//       color: white;
//       padding: 8px 16px;
//       border-radius: 15px;
//       cursor: pointer;
//       margin-top: 10px;
//       font-size: 12px;
//       transition: all 0.2s;
      
//       &:hover {
//         background: rgba(255, 255, 255, 0.3);
//       }
//     }
//   }
// `;

// const TypingIndicator = styled.div`
//   display: flex;
//   align-items: center;
//   gap: 8px;
//   margin-bottom: 15px;
  
//   .avatar {
//     width: 32px;
//     height: 32px;
//     border-radius: 50%;
//     background: #34a4bd;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     font-size: 12px;
//     font-weight: bold;
//     color: white;
//     flex-shrink: 0;
    
//     img {
//       width: 100%;
//       height: 100%;
//       border-radius: 50%;
//       object-fit: cover;
//     }
//   }
  
//   .typing-content {
//     background: #ffffff;
//     border: 1px solid #e9ecef;
//     border-radius: 18px;
//     padding: 12px 16px;
//     display: flex;
//     align-items: center;
//     gap: 8px;
//     box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    
//     .typing-text {
//       font-size: 14px;
//       color: #666;
//       font-style: italic;
//     }
    
//     .typing-dots {
//       width: 50px;
//       height: 20px;
//       background-image: url('/img/typing_dots.gif');
//       background-size: contain;
//       background-repeat: no-repeat;
//       background-position: center;
//     }
//   }
// `;

// interface ChatMessage {
//   id: string;
//   action: string;
//   message: string | object;
//   isUser: boolean;
//   timestamp: Date;
// }

// export const UMLBotWidget: React.FC = () => {
//   const [isVisible, setIsVisible] = useState(false);
//   const [messages, setMessages] = useState<ChatMessage[]>([]);
//   const [inputValue, setInputValue] = useState('');
//   const [isConnected, setIsConnected] = useState(false);
//   const [isTyping, setIsTyping] = useState(false);
//   const [ws, setWs] = useState<WebSocket | null>(null);
//   const [pendingUpdates, setPendingUpdates] = useState<any[]>([]); // Store updates waiting for editor
//   const [hasShownWelcome, setHasShownWelcome] = useState(false); // Track welcome message
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const { editor } = useContext(ApollonEditorContext);
//   const dispatch = useAppDispatch();
//   const currentDiagram = useAppSelector(state => state.diagram);

//   // Monitor editor availability and apply pending updates
//   useEffect(() => {
//     if (editor && pendingUpdates.length > 0) {
//       console.log(`🔄 Editor became available! Applying ${pendingUpdates.length} pending updates...`);
      
//       pendingUpdates.forEach((update, index) => {
//         try {
//           editor.model = { ...update } as any;
//           console.log(`✅ Applied pending update ${index + 1}/${pendingUpdates.length}`);
//         } catch (error) {
//           console.log(`❌ Failed to apply pending update ${index + 1}:`, error);
//         }
//       });
      
//       // Clear pending updates
//       setPendingUpdates([]);
//       console.log('🎯 All pending updates applied and cleared');
//     }
//   }, [editor, pendingUpdates]);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   useEffect(() => {
//     // Initialize WebSocket connection
//     const connectWebSocket = () => {
//       const websocket = new WebSocket('ws://localhost:8765');
      
//       websocket.onopen = () => {
//         console.log('Connected to UML Bot WebSocket');
//         setIsConnected(true);
        
//         // Send welcome message only if not shown before
//         if (!hasShownWelcome) {
//           addMessage({
//             id: generateMessageId(),
//             action: 'agent_reply_str',
//             message: "Hello! I'm your UML Assistant! 🎨 I can help you create classes, complete systems, and relationships. What would you like to build?",
//             isUser: false,
//             timestamp: new Date()
//           });
//           setHasShownWelcome(true);
//         }
//       };

//       websocket.onclose = () => {
//         console.log('Disconnected from UML Bot WebSocket');
//         setIsConnected(false);
//         // Attempt to reconnect after 3 seconds
//         setTimeout(connectWebSocket, 3000);
//       };

//       websocket.onerror = (error) => {
//         console.error('WebSocket error:', error);
//         setIsConnected(false);
//       };

//       websocket.onmessage = (event) => {
//         try {
//           const payload = JSON.parse(event.data);
          
//           // Hide typing indicator when we receive any response
//           setIsTyping(false);
          
//           // Check if this is an automatic injection request
//           if (payload.action === 'agent_reply_str') {
//             console.log('🔍 Received agent reply:', payload.message);
            
//             // Check if the message is a JSON string
//             if (typeof payload.message === 'string' && payload.message.trim().startsWith('{')) {
//               try {
//                 const responseData = JSON.parse(payload.message);
//                 console.log('🎯 Parsed response data:', responseData);
                
//                 if (responseData.action === 'inject_element') {
//                   console.log('✅ Injection command detected! Element:', responseData.element);
                  
//                   // Check if this is a simple class specification
//                   if (responseData.element && responseData.element.className) {
//                     console.log('🔧 Simple class specification detected, processing...');
//                     const success = processSimpleClassSpec(responseData.element as ClassSpec);
                    
//                     if (success) {
//                       // Add the success message to chat
//                       addMessage({
//                         id: generateMessageId(),
//                         action: 'agent_reply_str',
//                         message: responseData.message || `✅ Successfully added ${responseData.element.className} class to your diagram! 🎯`,
//                         isUser: false,
//                         timestamp: new Date()
//                       });
//                     } else {
//                       // Add error message to chat
//                       addMessage({
//                         id: generateMessageId(),
//                         action: 'agent_reply_str',
//                         message: `❌ Failed to create ${responseData.element.className} class. Please try again.`,
//                         isUser: false,
//                         timestamp: new Date()
//                       });
//                     }
//                   } else {
//                     // Traditional Apollon format - use existing injection
//                     injectElementToEditor(responseData.element);
                    
//                     // Add the success message to chat
//                     addMessage({
//                       id: generateMessageId(),
//                       action: 'agent_reply_str',
//                       message: responseData.message,
//                       isUser: false,
//                       timestamp: new Date()
//                     });
//                   }
//                   return;
//                 } else if (responseData.action === 'inject_complete_system') {
//                   console.log('🏗️ Complete system injection detected!');
                  
//                   // Check if this is a simplified system specification
//                   if (responseData.systemSpec) {
//                     console.log('🔧 Simplified system specification detected, processing...', responseData.systemSpec);
//                     const success = processSimpleSystemSpec(responseData.systemSpec);
                    
//                     if (success) {
//                       // Add the success message to chat
//                       addMessage({
//                         id: generateMessageId(),
//                         action: 'agent_reply_str',
//                         message: responseData.message || `✅ Successfully injected complete system into your diagram! 🎯`,
//                         isUser: false,
//                         timestamp: new Date()
//                       });
//                     } else {
//                       // Add error message to chat
//                       addMessage({
//                         id: generateMessageId(),
//                         action: 'agent_reply_str',
//                         message: `❌ Failed to inject complete system. Please try again.`,
//                         isUser: false,
//                         timestamp: new Date()
//                       });
//                     }
//                   } else {
//                     // Traditional full model format (legacy)
//                     console.log('🔄 Full model detected, using direct injection');
//                     const success = injectCompleteSystemToEditor(responseData.model);
                    
//                     if (success) {
//                       addMessage({
//                         id: generateMessageId(),
//                         action: 'agent_reply_str',
//                         message: responseData.message || `✅ Successfully injected complete system into your diagram! 🎯`,
//                         isUser: false,
//                         timestamp: new Date()
//                       });
//                     } else {
//                       addMessage({
//                         id: generateMessageId(),
//                         action: 'agent_reply_str',
//                         message: `❌ Failed to inject complete system. Please try again.`,
//                         isUser: false,
//                         timestamp: new Date()
//                       });
//                     }
//                   }
//                   return;
//                 }
//               } catch (e) {
//                 console.log('❌ Failed to parse as JSON injection command:', e);
//                 // If it's not a JSON response, treat as normal message
//               }
//             } else {
//               // Not a JSON string, treat as normal message
//               console.log('📝 Received plain text message');
//             }
//           }
          
//           // Handle normal messages
//           addMessage({
//             id: generateMessageId(),
//             action: payload.action,
//             message: payload.message,
//             isUser: false,
//             timestamp: new Date()
//           });
//         } catch (error) {
//           console.error('Error parsing message:', error);
//         }
//       };

//       setWs(websocket);
//     };

//     connectWebSocket();

//     return () => {
//       if (ws) {
//         ws.close();
//       }
//     };
//   }, []);

//   const addMessage = (message: ChatMessage) => {
//     setMessages(prev => [...prev, message]);
//   };

//   const sendMessage = () => {
//     if (!inputValue.trim() || !ws || ws.readyState !== WebSocket.OPEN) return;

//     // Add user message
//     const userMessage: ChatMessage = {
//       id: generateMessageId(),
//       action: 'user_message',
//       message: inputValue,
//       isUser: true,
//       timestamp: new Date()
//     };
    
//     addMessage(userMessage);

//     // Show typing indicator
//     setIsTyping(true);

//     // Send to WebSocket
//     ws.send(JSON.stringify({
//       action: 'user_message',
//       message: inputValue
//     }));

//     setInputValue('');
//   };

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter') {
//       sendMessage();
//     }
//   };

//   const importModelToEditor = (modelJson: string) => {
//     try {
//       const model = JSON.parse(modelJson);
      
//       if (editor && model) {
//         // Update the editor with the new model
//         editor.model = model;
        
//         // Also update the Redux store
//         dispatch(updateDiagramThunk({
//           model,
//           lastUpdate: new Date().toISOString()
//         }));
        
//         // Show success message
//         addMessage({
//           id: generateMessageId(),
//           action: 'agent_reply_str',
//           message: "✅ Model imported successfully into your editor!",
//           isUser: false,
//           timestamp: new Date()
//         });
//       }
//     } catch (error) {
//       console.error('Error importing model:', error);
//       addMessage({
//         id: generateMessageId(),
//         action: 'agent_reply_str',
//         message: "❌ Error importing model. Please check the model format.",
//         isUser: false,
//         timestamp: new Date()
//       });
//     }
//   };

//   const injectCompleteSystemToEditor = (systemModel: any) => {
//     console.log('🏗️ Starting complete system injection...', systemModel);
//     console.log('🔍 Editor available?', !!editor);
//     console.log('🔍 System model available?', !!systemModel);
    
//     try {
//       if (systemModel && systemModel.elements) {
//         console.log('✅ System model data available, proceeding with injection');
        
//         // Get current model from Redux store or editor or create default
//         let currentModel;
//         if (currentDiagram && currentDiagram.diagram && currentDiagram.diagram.model) {
//           currentModel = currentDiagram.diagram.model;
//           console.log('📊 Using Redux store model as base');
//         } else if (editor && editor.model) {
//           currentModel = editor.model;
//           console.log('📊 Using editor model as base');
//         } else {
//           // Use the system model as the base
//           currentModel = {
//             version: "3.0.0",
//             type: "ClassDiagram", 
//             size: { width: 1400, height: 740 },
//             elements: {}, 
//             relationships: {},
//             interactive: { elements: {}, relationships: {} },
//             assessments: {}
//           };
//           console.log('📊 Using default model structure as base');
//         }
        
//         // Merge the new system elements with existing elements
//         const updatedElements = {
//           ...currentModel.elements,
//           ...systemModel.elements
//         };
        
//         // Merge the new system relationships with existing relationships
//         const updatedRelationships = {
//           ...currentModel.relationships,
//           ...systemModel.relationships
//         };
        
//         // Create the updated model
//         const updatedModel = {
//           ...currentModel,
//           elements: updatedElements,
//           relationships: updatedRelationships,
//           size: systemModel.size || currentModel.size,
//           interactive: { elements: {}, relationships: {} },
//           assessments: {}
//         };
        
//         console.log('🔄 Complete system model merged:', updatedModel);
//         console.log('📦 Total elements count:', Object.keys(updatedElements).length);
//         console.log('🔗 Total relationships count:', Object.keys(updatedRelationships).length);
        
//         // Always update the Redux store first
//         dispatch(updateDiagramThunk({
//           model: updatedModel as any,
//           lastUpdate: new Date().toISOString()
//         }));
//         console.log('✅ Redux store updated with complete system');
        
//         // Strategy 1: If editor is available, update it immediately
//         if (editor) {
//           try {
//             editor.model = { ...updatedModel } as any;
//             console.log('✅ Editor updated directly with complete system');
//           } catch (error) {
//             console.log('⚠️ Direct editor update failed:', error);
//             // Add to pending updates as fallback
//             setPendingUpdates(prev => [...prev, updatedModel]);
//           }
//         } else {
//           console.log('⚠️ Editor not available, adding complete system to pending updates queue');
//           // Add the model update to pending updates - will be applied when editor becomes available
//           setPendingUpdates(prev => [...prev, updatedModel]);
          
//           // Also try alternative refresh strategies
//           setTimeout(() => {
//             setMessages(prev => [...prev]); // Force component re-render
//             console.log('🔄 Forced component re-render to trigger editor refresh');
//           }, 100);
//         }
        
//         console.log(`✅ Successfully injected complete system!`);
//         return true;
//       } else {
//         console.log('❌ System model or elements not available');
//         return false;
//       }
//     } catch (error) {
//       console.error('❌ Error injecting complete system:', error);
//       return false;
//     }
//   };

//   const processSimpleSystemSpec = (systemSpec: SystemSpec) => {
//     console.log('🏗️ Processing simplified system specification:', systemSpec);
    
//     try {
//       const allElements: Record<string, any> = {};
//       const allRelationships: Record<string, any> = {};
//       const classIdMap: Record<string, string> = {}; // Map class names to IDs
      
//       // Track positions to avoid overlap
//       const positions = [
//         { x: 100, y: 100 }, { x: 400, y: 100 }, { x: 700, y: 100 },
//         { x: 100, y: 350 }, { x: 400, y: 350 }, { x: 700, y: 350 }
//       ];
      
//       // Process each class in the system
//       systemSpec.classes.forEach((classSpec, index) => {
//         const position = positions[index] || { 
//           x: 100 + (index % 3) * 300, 
//           y: 100 + Math.floor(index / 3) * 250 
//         };
        
//         // Create complete class from specification
//         const completeElement = createCompleteClassFromSpec(classSpec, position);
        
//         // Store class ID mapping
//         classIdMap[classSpec.className] = completeElement.class.id;
        
//         // Add class and its components to elements
//         allElements[completeElement.class.id] = completeElement.class;
//         Object.assign(allElements, completeElement.attributes);
//         Object.assign(allElements, completeElement.methods);
//       });
      
//       // Process relationships
//       systemSpec.relationships.forEach((rel, index) => {
//         const sourceId = classIdMap[rel.sourceClass];
//         const targetId = classIdMap[rel.targetClass];
        
//         if (sourceId && targetId) {
//           const relId = generateUniqueId('rel');
          
//           // Map relationship types to correct Apollon format
//           let relationshipType = 'ClassBidirectional'; // Default to association
//           switch (rel.type.toLowerCase()) {
//             case 'association':
//               relationshipType = 'ClassBidirectional';
//               break;
//             case 'inheritance':
//             case 'extends':
//               relationshipType = 'ClassInheritance';
//               break;
//             case 'composition':
//               relationshipType = 'ClassComposition';
//               break;
//             case 'aggregation':
//               relationshipType = 'ClassAggregation';
//               break;
//             default:
//               relationshipType = 'ClassBidirectional';
//           }
          
//           allRelationships[relId] = {
//             id: relId,
//             type: relationshipType,
//             source: { 
//               element: sourceId,
//               direction: 'Left',
//               multiplicity: rel.sourceMultiplicity || '1',
//               role: '',
//               bounds: { x: 0, y: 0, width: 0, height: 0 }
//             },
//             target: { 
//               element: targetId,
//               direction: 'Right', 
//               multiplicity: rel.targetMultiplicity || '1',
//               role: rel.name || '',
//               bounds: { x: 0, y: 0, width: 0, height: 0 }
//             },
//             bounds: { x: 0, y: 0, width: 0, height: 0 },
//             name: rel.name || '',
//             path: [
//               { x: 100, y: 10 },
//               { x: 0, y: 10 }
//             ],
//             isManuallyLayouted: false
//           };
//         }
//       });
      
//       console.log('✅ Generated complete system:', {
//         elements: allElements,
//         relationships: allRelationships
//       });
      
//       // Create the complete system structure
//       const completeSystem = {
//         version: "3.0.0",
//         type: "ClassDiagram",
//         size: { width: 1400, height: 740 },
//         elements: allElements,
//         relationships: allRelationships,
//         interactive: { elements: {}, relationships: {} },
//         assessments: {}
//       };
      
//       // Inject the complete system
//       return injectCompleteSystemToEditor(completeSystem);
      
//     } catch (error) {
//       console.error('❌ Error processing simplified system spec:', error);
//       return false;
//     }
//   };

//   const processSimpleClassSpec = (simpleSpec: ClassSpec) => {
//     console.log('🔧 Processing simple class specification:', simpleSpec);
    
//     try {
//       // Create complete UML elements from simple specification
//       const completeElement = createCompleteClassFromSpec(simpleSpec);
      
//       console.log('✅ Generated complete UML element:', completeElement);
      
//       // Inject using our existing injection logic
//       injectElementToEditor(completeElement);
      
//       return true;
//     } catch (error) {
//       console.error('❌ Error processing simple class spec:', error);
//       return false;
//     }
//   };

//   const injectElementToEditor = (elementData: any) => {
//     console.log('🚀 Starting injection process...', elementData);
//     console.log('🔍 Editor available?', !!editor);
//     console.log('🔍 Element data available?', !!elementData);
//     console.log('🔍 Current diagram from Redux:', currentDiagram);
    
//     try {
//       if (elementData) {
//         console.log('✅ Element data available, proceeding with injection');
        
//         // Get current model from Redux store or editor or create default
//         let currentModel;
//         if (currentDiagram && currentDiagram.diagram && currentDiagram.diagram.model) {
//           currentModel = currentDiagram.diagram.model;
//           console.log('📊 Using Redux store model:', currentModel);
//           console.log('📊 Current elements count:', Object.keys(currentModel.elements || {}).length);
//         } else if (editor && editor.model) {
//           currentModel = editor.model;
//           console.log('📊 Using editor model:', currentModel);
//         } else {
//           // Fallback: create a default model structure
//           currentModel = { 
//             version: "3.0.0",
//             type: "ClassDiagram", 
//             size: { width: 1400, height: 740 },
//             elements: {}, 
//             relationships: {},
//             interactive: { elements: {}, relationships: {} },
//             assessments: {}
//           };
//           console.log('📊 Using default model structure');
//         }
        
//         // Check if we have the new Apollon format
//         if (elementData.class) {
//           console.log('🎯 New Apollon format detected');
          
//           const classElement = elementData.class;
//           const attributes = elementData.attributes || {};
//           const methods = elementData.methods || {};
          
//           console.log('📝 Class element:', classElement);
//           console.log('📋 Attributes:', attributes);
//           console.log('⚡ Methods:', methods);
          
//           // Add the class to elements
//           const updatedElements: any = {
//             ...currentModel.elements,
//             [classElement.id]: classElement
//           };
          
//           // Add attributes to elements
//           Object.keys(attributes).forEach(attrId => {
//             updatedElements[attrId] = (attributes as any)[attrId];
//           });
          
//           // Add methods to elements  
//           Object.keys(methods).forEach(methodId => {
//             updatedElements[methodId] = (methods as any)[methodId];
//           });
          
//           // Update the model
//           const updatedModel = {
//             ...currentModel,
//             elements: updatedElements
//           };
          
//           console.log('🔄 Updated model:', updatedModel);
//           console.log('📦 Updated elements count:', Object.keys(updatedElements).length);
          
//           // Update the editor if available
//           if (editor) {
//             editor.model = updatedModel as any;
//             console.log('✅ Editor model updated');
//           } else {
//             console.log('⚠️ Editor not available, updating only Redux store');
//           }
          
//           // Always update the Redux store first
//           dispatch(updateDiagramThunk({
//             model: updatedModel as any,
//             lastUpdate: new Date().toISOString()
//           }));
//           console.log('✅ Redux store updated');
          
//           // Strategy 1: If editor is available, update it immediately
//           if (editor) {
//             try {
//               editor.model = { ...updatedModel } as any;
//               console.log('✅ Editor updated directly');
//             } catch (error) {
//               console.log('⚠️ Direct editor update failed:', error);
//               // Add to pending updates as fallback
//               setPendingUpdates(prev => [...prev, updatedModel]);
//             }
//           } else {
//             console.log('⚠️ Editor not available, adding to pending updates queue');
//             // Add the model update to pending updates - will be applied when editor becomes available
//             setPendingUpdates(prev => [...prev, updatedModel]);
            
//             // Also try alternative refresh strategies
//             setTimeout(() => {
//               setMessages(prev => [...prev]); // Force component re-render
//               console.log('� Forced component re-render to trigger editor refresh');
//             }, 100);
//           }
          
//           console.log(`✅ Successfully injected ${classElement.name} class!`);
//         } else {
//           // Fallback for old format (not used currently)
//           console.log('🔄 Using fallback format for old element structure');
          
//           const updatedModel = {
//             ...currentModel,
//             elements: {
//               ...currentModel.elements,
//               [elementData.id]: elementData
//             }
//           };
          
//           if (editor) {
//             editor.model = updatedModel as any;
//           }
          
//           dispatch(updateDiagramThunk({
//             model: updatedModel as any,
//             lastUpdate: new Date().toISOString()
//           }));
          
//           console.log(`✅ Successfully injected ${elementData.name} class!`);
//         }
//       } else {
//         console.log('❌ Editor or element data not available');
//         console.log('Editor:', editor);
//         console.log('Element data:', elementData);
//       }
//     } catch (error) {
//       console.error('❌ Error injecting element:', error);
//       addMessage({
//         id: generateMessageId(),
//         action: 'agent_reply_str',
//         message: "❌ Error injecting element. Please try again.",
//         isUser: false,
//         timestamp: new Date()
//       });
//     }
//   };

//   const renderMessage = (message: ChatMessage) => {
//     let content = message.message;
    
//     if (typeof content === 'string') {
//       // Check if message contains JSON model
//       const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
//       if (jsonMatch) {
//         const modelJson = jsonMatch[1];
//         return (
//           <div>
//             {content.split('```json')[0]}
//             <pre>{jsonMatch[1]}</pre>
//             <button
//               className="model-import-button"
//               onClick={() => importModelToEditor(modelJson)}
//             >
//               📥 Import to Editor
//             </button>
//             {content.split('```')[2] || ''}
//           </div>
//         );
//       }
//     }
    
//     return typeof content === 'string' ? content : JSON.stringify(content);
//   };

//   return (
//     <ChatWidgetContainer>
//       <ChatWindow isVisible={isVisible}>
//         <ChatHeader>
//           <div className="header-content">
//             <img src="/img/agent_logo.jpeg" alt="Agent" className="agent-logo" />
//             UML Assistant
//           </div>
//           <div className="status-indicator" style={{ 
//             background: isConnected ? '#2ecc71' : '#e74c3c' 
//           }} />
//         </ChatHeader>
        
//         <ChatMessages>
//           {messages.map((message) => (
//             <Message key={message.id} isUser={message.isUser}>
//               {!message.isUser && (
//                 <div className="avatar">
//                   <img src="/img/agent_logo.jpeg" alt="Bot" />
//                 </div>
//               )}
//               <div className="message-content">
//                 {renderMessage(message)}
//               </div>
//               {message.isUser && (
//                 <div className="avatar">
//                   U
//                 </div>
//               )}
//             </Message>
//           ))}
          
//           {isTyping && (
//             <TypingIndicator>
//               <div className="avatar">
//                 <img src="/img/agent_logo.jpeg" alt="Bot" />
//               </div>
//               <div className="typing-content">
//                 <span className="typing-text">Assistant is typing</span>
//                 <div className="typing-dots"></div>
//               </div>
//             </TypingIndicator>
//           )}
          
//           <div ref={messagesEndRef} />
//         </ChatMessages>
        
//         <ChatInput>
//           <input
//             type="text"
//             value={inputValue}
//             onChange={(e) => setInputValue(e.target.value)}
//             onKeyPress={handleKeyPress}
//             placeholder="Ask me to create UML models..."
//             disabled={!isConnected}
//           />
//           <button onClick={sendMessage} disabled={!isConnected}>
//             Send
//           </button>
//         </ChatInput>
//       </ChatWindow>
      
//       <CircleButton isOpen={isVisible} onClick={() => setIsVisible(!isVisible)}>
//         {isVisible ? (
//           <svg viewBox="0 0 24 24">
//             <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
//           </svg>
//         ) : (
//           <svg viewBox="0 0 24 24">
//             <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
//           </svg>
//         )}
//       </CircleButton>
//     </ChatWidgetContainer>
//   );
// };
