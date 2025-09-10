/**
 * Index file for UML Bot Widget services
 * Provides easy imports for all service classes
 */

export { UMLModelingService } from './UMLModelingService';
export type { 
  ClassSpec, 
  SystemSpec, 
  ModelModification, 
  ModelUpdate, 
  ApollonModel 
} from './UMLModelingService';

export { WebSocketService } from './WebSocketService';
export type { 
  ChatMessage, 
  BotResponse, 
  InjectionCommand, 
  MessageHandler, 
  ConnectionHandler, 
  TypingHandler, 
  InjectionHandler 
} from './WebSocketService';

export { UIService } from './UIService';
export type { MessageDisplayConfig } from './UIService';

// Re-export commonly used types for convenience
export type { AppDispatch } from '../../../store/store';
