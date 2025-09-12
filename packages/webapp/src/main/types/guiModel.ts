// Model and factory for GUI diagrams

export interface GUIModel {
  ROOT: {
    type: { resolvedName: string };
    isCanvas: boolean;
    props: Record<string, any>;
    displayName: string;
    custom?: Record<string, any>;
    hidden?: boolean;
    nodes: any[];
    linkedNodes: Record<string, any>;
  },
  type: 'GUIDiagram'
  ;
}
