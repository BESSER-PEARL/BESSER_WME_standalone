import { Template, TemplateType } from '../template-types';
import { UMLDiagramType, UMLModel } from '@besser/wme';

export enum SoftwarePatternCategory {
  CREATIONAL = 'Creational',
  STRUCTURAL = 'Structural',
  BEHAVIORAL = 'Behavioral',
}

export enum SoftwarePatternType {
  // Structural patterns
  LIBRARY = 'Library',
  BRIDGE = 'Bridge',
  // Behavioral pattern
  COMMAND = 'Command',
  OBSERVER = 'Observer',
  // Creational patterns
  FACTORY = 'Factory',
}

export class SoftwarePatternTemplate extends Template {
  softwarePatternCategory: SoftwarePatternCategory;

  /**
   * Should only be called from TemplateFactory. Do not call this method!
   * @param templateCategory
   * @param templateType
   * @param diagramType
   * @param diagram
   * @param patternCategory
   */
  constructor(
    templateType: TemplateType,
    diagramType: UMLDiagramType,
    diagram: UMLModel,
    patternCategory: SoftwarePatternCategory,
  ) {
    super(templateType, diagramType, diagram);
    this.softwarePatternCategory = patternCategory;
  }
}
