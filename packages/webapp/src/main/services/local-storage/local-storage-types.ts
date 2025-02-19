import { UMLDiagramType } from '@besser/besser-wme';

export type LocalStorageDiagramListItem = {
  id: string;
  title: string;
  type: UMLDiagramType;
  lastUpdate: string;
};
