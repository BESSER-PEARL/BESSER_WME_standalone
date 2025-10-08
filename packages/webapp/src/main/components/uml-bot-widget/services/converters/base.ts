/**
 * Diagram Type Converters
 * Handles conversion from simplified specs to Apollon format for all diagram types
 */

export type DiagramType = 'ClassDiagram' | 'ObjectDiagram' | 'StateMachineDiagram' | 'AgentDiagram';

/**
 * Base interface for all diagram converters
 */
export interface DiagramConverter {
  getDiagramType(): DiagramType;
  convertSingleElement(spec: any, position?: { x: number; y: number }): any;
  convertCompleteSystem(spec: any): any;
}

/**
 * Position generator for elements
 */
export class PositionGenerator {
  private usedPositions: Set<string> = new Set();
  private readonly gridSize = 300;
  private readonly startX = 100;
  private readonly startY = 100;

  getNextPosition(index: number = 0): { x: number; y: number } {
    const x = this.startX + (index % 3) * this.gridSize;
    const y = this.startY + Math.floor(index / 3) * this.gridSize;
    
    const key = `${x},${y}`;
    if (this.usedPositions.has(key)) {
      return this.getNextPosition(index + 1);
    }
    
    this.usedPositions.add(key);
    return { x, y };
  }

  reset(): void {
    this.usedPositions.clear();
  }
}

/**
 * Generate unique ID
 */
export function generateUniqueId(prefix: string = 'id'): string {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}_${Date.now().toString(36)}`;
}
