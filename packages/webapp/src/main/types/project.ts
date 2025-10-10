import { UMLDiagramType, UMLModel } from '@besser/wme';

// Supported diagram types in projects
export type SupportedDiagramType = 'ClassDiagram' | 'ObjectDiagram' | 'StateMachineDiagram' | 'AgentDiagram' | 'GUINoCodeDiagram';

// GrapesJS project data structure
export interface GrapesJSProjectData {
  pages: any[];
  styles: any[];
  assets: any[];
  symbols: any[];
  version: string;
}

// Diagram structure within a project
export interface ProjectDiagram {
  id: string;
  title: string;
  model?: UMLModel;
  grapesJsData?: GrapesJSProjectData; // For GUI/No-Code diagram
  lastUpdate: string;
  description?: string;
}

// New centralized project structure
export interface BesserProject {
  id: string;
  type: 'Project';
  name: string;
  description: string;
  owner: string;
  createdAt: string;
  currentDiagramType: SupportedDiagramType; // Which diagram is currently active
  diagrams: {
    ClassDiagram: ProjectDiagram;
    ObjectDiagram: ProjectDiagram;
    StateMachineDiagram: ProjectDiagram;
    AgentDiagram: ProjectDiagram;
    GUINoCodeDiagram: ProjectDiagram;
  };
  settings: {
    defaultDiagramType: SupportedDiagramType;
    autoSave: boolean;
    collaborationEnabled: boolean;
  };
}

// Helper to convert UMLDiagramType to SupportedDiagramType
export const toSupportedDiagramType = (type: UMLDiagramType): SupportedDiagramType => {
  switch (type) {
    case UMLDiagramType.ClassDiagram:
      return 'ClassDiagram';
    case UMLDiagramType.ObjectDiagram:
      return 'ObjectDiagram';
    case UMLDiagramType.StateMachineDiagram:
      return 'StateMachineDiagram';
    case UMLDiagramType.AgentDiagram:
      return 'AgentDiagram';
    default:
      return 'ClassDiagram'; // fallback
  }
};

// Helper to convert SupportedDiagramType to UMLDiagramType
export const toUMLDiagramType = (type: SupportedDiagramType): UMLDiagramType | null => {
  switch (type) {
    case 'ClassDiagram':
      return UMLDiagramType.ClassDiagram;
    case 'ObjectDiagram':
      return UMLDiagramType.ObjectDiagram;
    case 'StateMachineDiagram':
      return UMLDiagramType.StateMachineDiagram;
    case 'AgentDiagram':
      return UMLDiagramType.AgentDiagram;
    case 'GUINoCodeDiagram':
      return null; // GUINoCodeDiagram doesn't have a UML diagram type
    default:
      return null;
  }
};

// Default diagram factory
export const createEmptyDiagram = (title: string, type: UMLDiagramType | null): ProjectDiagram => {
  // For GUI/No-Code diagram
  if (type === null) {
    return {
      id: crypto.randomUUID(),
      title,
      grapesJsData: {
        pages: [
          {
            name: 'Home',
            styles: '',
            component: '',
          },
        ],
        styles: [],
        assets: [],
        symbols: [],
        version: '0.21.13',
      },
      lastUpdate: new Date().toISOString(),
    };
  }
  
  // For UML diagrams
  return {
    id: crypto.randomUUID(),
    title,
    model: {
      version: '3.0.0' as const,
      type,
      size: { width: 1400, height: 740 },
      elements: {},
      relationships: {},
      interactive: { elements: {}, relationships: {} },
      assessments: {},
    },
    lastUpdate: new Date().toISOString(),
  };
};

// Default project factory
export const createDefaultProject = (
  name: string, 
  description: string, 
  owner: string
): BesserProject => {
  const projectId = crypto.randomUUID();
  
  return {
    id: projectId,
    type: 'Project',
    name,
    description,
    owner,
    createdAt: new Date().toISOString(),
    currentDiagramType: 'ClassDiagram',
    diagrams: {
      ClassDiagram: createEmptyDiagram('Class Diagram', UMLDiagramType.ClassDiagram),
      ObjectDiagram: createEmptyDiagram('Object Diagram', UMLDiagramType.ObjectDiagram),
      StateMachineDiagram: createEmptyDiagram('State Machine Diagram', UMLDiagramType.StateMachineDiagram),
      AgentDiagram: createEmptyDiagram('Agent Diagram', UMLDiagramType.AgentDiagram),
      GUINoCodeDiagram: createEmptyDiagram('GUI / No-Code Editor', null),
    },
    settings: {
      defaultDiagramType: 'ClassDiagram',
      autoSave: true,
      collaborationEnabled: false,
    },
  };
};

// Type guards
export const isProject = (obj: any): obj is BesserProject => {
  return obj && 
         typeof obj === 'object' && 
         obj.type === 'Project' && 
         obj.diagrams && 
         typeof obj.diagrams === 'object' &&
         obj.currentDiagramType &&
         obj.diagrams.ClassDiagram &&
         obj.diagrams.ObjectDiagram &&
         obj.diagrams.StateMachineDiagram &&
         obj.diagrams.AgentDiagram &&
         obj.diagrams.GUINoCodeDiagram;
};
