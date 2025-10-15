import { Dispatch } from '@reduxjs/toolkit';
import { updateDiagramThunk } from '../../../services/diagram/diagramSlice';
import type { AppDispatch } from '../../../store/store';
import { ConverterFactory, DiagramType } from './converters';
import { ModifierFactory, ModelModification } from './modifiers';

// Re-export ModelModification for backward compatibility
export type { ModelModification };

// Enhanced interfaces for better type safety
export interface ClassSpec {
  className: string;
  attributes: Array<{
    name: string;
    type: string;
    visibility: 'public' | 'private' | 'protected';
  }>;
  methods: Array<{
    name: string;
    returnType: string;
    visibility: 'public' | 'private' | 'protected';
    parameters: Array<{ name: string; type: string; }>;
  }>;
}

export interface SystemSpec {
  systemName: string;
  classes: ClassSpec[];
  relationships: Array<{
    type: 'Association' | 'Inheritance' | 'Composition' | 'Aggregation';
    sourceClass: string;
    targetClass: string;
    sourceMultiplicity?: string;
    targetMultiplicity?: string;
    name?: string;
  }>;
}

export interface ModelUpdate {
  type: 'single_element' | 'complete_system' | 'modification';
  data: any;
  message: string;
}

export interface ApollonModel {
  version: string;
  type: string; // DiagramType: ClassDiagram, ObjectDiagram, StateMachineDiagram, AgentDiagram
  size: { width: number; height: number };
  elements: Record<string, any>;
  relationships: Record<string, any>;
  interactive: { elements: Record<string, any>; relationships: Record<string, any> };
  assessments: Record<string, any>;
}

/**
 * Service class for handling UML modeling operations
 * Centralizes all model manipulation logic
 * Supports multiple diagram types: ClassDiagram, ObjectDiagram, StateMachineDiagram, AgentDiagram
 */
export class UMLModelingService {
  private editor: any;
  private dispatch: AppDispatch;
  private currentModel: ApollonModel | null = null;
  private currentDiagramType: string = 'ClassDiagram';

  constructor(editor: any, dispatch: AppDispatch) {
    this.editor = editor;
    this.dispatch = dispatch;
  }

  /**
   * Update the current model reference
   */
  updateCurrentModel(model: ApollonModel) {
    this.currentModel = model;
    this.currentDiagramType = model.type || 'ClassDiagram';
    // console.log('📊 Updated model type:', this.currentDiagramType);
  }

  /**
   * Get current diagram type
   */
  getCurrentDiagramType(): string {
    return this.currentDiagramType;
  }

  /**
   * Get the current model from editor, Redux, or create default
   */
  getCurrentModel(): ApollonModel {
    if (this.currentModel) {
      return this.currentModel;
    }

    if (this.editor?.model) {
      return this.editor.model;
    }

    // Return default model structure with current diagram type
    return {
      version: "3.0.0",
      type: this.currentDiagramType,
      size: { width: 1400, height: 740 },
      elements: {},
      relationships: {},
      interactive: { elements: {}, relationships: {} },
      assessments: {}
    };
  }

  /**
   * Process a simple class specification - now supports all diagram types
   */
  processSimpleClassSpec(spec: any, diagramType?: string): ModelUpdate {
    try {
      const type = (diagramType || this.currentDiagramType) as DiagramType;
      const converter = ConverterFactory.getConverter(type);
      const completeElement = converter.convertSingleElement(spec);
      
      return {
        type: 'single_element',
        data: completeElement,
        message: `✨ Created element in ${type}`
      };
    } catch (error) {
      // console.error('Error processing element spec:', error);
      throw new Error(`Failed to process element specification: ${error}`);
    }
  }

  /**
   * Process a complete system specification - now supports all diagram types
   */
  processSystemSpec(systemSpec: any, diagramType?: string): ModelUpdate {
    try {
      const type = (diagramType || this.currentDiagramType) as DiagramType;
      const converter = ConverterFactory.getConverter(type);
      const completeSystem = converter.convertCompleteSystem(systemSpec);
      
      return {
        type: 'complete_system',
        data: completeSystem,
        message: `✨ Created complete ${type} system`
      };
    } catch (error) {
      // console.error('Error processing system spec:', error);
      throw new Error(`Failed to process system specification: ${error}`);
    }
  }

  /**
   * Process model modifications (edit existing elements)
   * Uses ModifierFactory to delegate to diagram-specific modifiers
   */
  processModelModification(modification: ModelModification): ModelUpdate {
    try {
      const currentModel = this.getCurrentModel();
      const diagramType = this.currentDiagramType as DiagramType;
      
      // Get diagram-specific modifier
      const modifier = ModifierFactory.getModifier(diagramType);
      
      // Validate action is supported for this diagram type
      if (!modifier.canHandle(modification.action)) {
        throw new Error(
          `Action '${modification.action}' is not supported for ${diagramType} diagrams.`
        );
      }
      
      // Apply modification using diagram-specific logic
      const updatedModel = modifier.applyModification(currentModel, modification);
      
      // Generate success message
      const targetName = modification.target.className || 
                        modification.target.stateName || 
                        modification.target.objectName || 
                        'element';
      
      return {
        type: 'modification',
        data: updatedModel,
        message: `✅ Applied ${modification.action} to ${targetName} in ${diagramType}`
      };
    } catch (error) {
      // console.error('❌ Error processing model modification:', error);
      throw new Error(`Failed to apply modification: ${error instanceof Error ? error.message : error}`);
    }
  }

  /**
   * Inject model update to editor
   */
  async injectToEditor(update: ModelUpdate): Promise<boolean> {
    try {
      const currentModel = this.getCurrentModel();
      let updatedModel: ApollonModel;

      switch (update.type) {
        case 'single_element':
          updatedModel = this.mergeElementIntoModel(currentModel, update.data);
          break;
        case 'complete_system':
          updatedModel = this.mergeSystemIntoModel(currentModel, update.data);
          break;
        case 'modification':
          updatedModel = update.data;
          break;
        default:
          throw new Error(`Unknown update type: ${update.type}`);
      }

      // Update Redux store
      this.dispatch(updateDiagramThunk({
        model: updatedModel as any,
        lastUpdate: new Date().toISOString()
      }));

      // Update editor if available
      if (this.editor) {
        this.editor.model = { ...updatedModel };
      }

      // Update our current model reference
      this.updateCurrentModel(updatedModel);

      return true;
    } catch (error) {
      console.error('Error injecting to editor:', error);
      return false;
    }
  }

  /**
   * Merge single element into existing model
   */
  private mergeElementIntoModel(currentModel: ApollonModel, elementData: any): ApollonModel {
    const updatedElements = { ...currentModel.elements };
    
    // Handle different diagram types - each has different main element
    // ClassDiagram: class, attributes, methods
    // ObjectDiagram: object, attributes
    // StateMachineDiagram: state, bodies
    // AgentDiagram: state/intent, bodies
    
    // Find the main element (the one without an owner)
    const mainElement = elementData.class || elementData.object || elementData.state || 
                       elementData.intent || elementData.initialNode;
    
    if (!mainElement) {
      throw new Error('No main element found in elementData');
    }
    
    // Add main element
    updatedElements[mainElement.id] = mainElement;

    // Add child elements (attributes, methods, bodies, etc.)
    if (elementData.attributes) {
      Object.assign(updatedElements, elementData.attributes);
    }
    
    if (elementData.methods) {
      Object.assign(updatedElements, elementData.methods);
    }
    
    if (elementData.bodies) {
      Object.assign(updatedElements, elementData.bodies);
    }

    return {
      ...currentModel,
      elements: updatedElements
    };
  }

  /**
   * Merge complete system into existing model
   */
  private mergeSystemIntoModel(currentModel: ApollonModel, systemData: any): ApollonModel {
    return {
      ...currentModel,
      elements: {
        ...currentModel.elements,
        ...systemData.elements
      },
      relationships: {
        ...currentModel.relationships,
        ...systemData.relationships
      },
      size: systemData.size || currentModel.size
    };
  }

  /**
   * Generate unique ID
   */
  private generateUniqueId(prefix: string = 'id'): string {
    return `${prefix}_${Math.random().toString(36).substr(2, 9)}_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 3)}`;
  }
}
