import {
  SoftwarePatternCategory,
  SoftwarePatternTemplate,
  SoftwarePatternType,
} from './software-pattern/software-pattern-types';
import { UMLDiagramType } from '@besser/wme';
import libraryModel from '../../../templates/pattern/structural/Library.json';
import teamOclModel from '../../../templates/pattern/structural/team_player_ocl.json';
import bridgeModel from '../../../templates/pattern/structural/bridge.json';
import commandModel from '../../../templates/pattern/behavioral/command.json';
import factoryModel from '../../../templates/pattern/creational/factory.json';
import observerModel from '../../../templates/pattern/behavioral/observer.json';

// Could also be a static method on Template, which would be nicer.
// However, because of circular dependency we decided to create a separate factory instead
export class TemplateFactory {
  static createSoftwarePattern(softwarePatternType: SoftwarePatternType): SoftwarePatternTemplate {
    switch (softwarePatternType) {
      case SoftwarePatternType.LIBRARY:
        return new SoftwarePatternTemplate(
          softwarePatternType,
          UMLDiagramType.ClassDiagram,
          libraryModel as any,
          SoftwarePatternCategory.STRUCTURAL,
        );
      case SoftwarePatternType.TEAMOCL:
        return new SoftwarePatternTemplate(
          softwarePatternType,
          UMLDiagramType.ClassDiagram,
          teamOclModel as any,
          SoftwarePatternCategory.STRUCTURAL,
        );
      case SoftwarePatternType.BRIDGE:
        return new SoftwarePatternTemplate(
          softwarePatternType,
          UMLDiagramType.ClassDiagram,
          bridgeModel as any,
          SoftwarePatternCategory.STRUCTURAL,
        );
      case SoftwarePatternType.COMMAND:
        return new SoftwarePatternTemplate(
          softwarePatternType,
          UMLDiagramType.ClassDiagram,
          commandModel as any,
          SoftwarePatternCategory.BEHAVIORAL,
        );
      case SoftwarePatternType.FACTORY:
        return new SoftwarePatternTemplate(
          softwarePatternType,
          UMLDiagramType.ClassDiagram,
          factoryModel as any,
          SoftwarePatternCategory.CREATIONAL,
        );
      case SoftwarePatternType.OBSERVER:
        return new SoftwarePatternTemplate(
          softwarePatternType,
          UMLDiagramType.ClassDiagram,
          observerModel as any,
          SoftwarePatternCategory.BEHAVIORAL,
        );
      default:
        throw Error(`Cannot create SoftwarePatternTemplate for type ${softwarePatternType}`);
    }
  }
}
