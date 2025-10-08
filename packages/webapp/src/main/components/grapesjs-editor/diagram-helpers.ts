import { ProjectStorageRepository } from '../../services/storage/ProjectStorageRepository';

export function getClassOptions(): { value: string; label: string }[] {
  const currentProject = ProjectStorageRepository.getCurrentProject();
  const classDiagram = currentProject?.diagrams?.ClassDiagram?.model || null;
  if (!classDiagram || !classDiagram.elements) return [];
  return Object.values(classDiagram.elements)
    .filter((element: any) => element.type === 'Class')
    .map((element: any) => ({ value: element.id, label: element.name }));
}

export function getAttributeOptionsByClassId(classId: string): { value: string; label: string }[] {
  const currentProject = ProjectStorageRepository.getCurrentProject();
  const classDiagram = currentProject?.diagrams?.ClassDiagram?.model || null;
  if (!classDiagram || !classDiagram.elements) return [];
  return Object.values(classDiagram.elements)
    .filter((element: any) => element.type === 'ClassAttribute' && element.owner === classId)
    .map((attr: any) => ({ value: attr.id, label: attr.name }));
}

export function getEndsByClassId(classId: string): { value: string; label: string }[] {
  const currentProject = ProjectStorageRepository.getCurrentProject();
  const classDiagram = currentProject?.diagrams?.ClassDiagram?.model || null;
  if (!classDiagram || !classDiagram.relationships) return [];
  return Object.values(classDiagram.relationships)
    .map((relationship: any) => {
      if (relationship.source?.element === classId) {
        // classId is source, return target's role and id
        return { value: relationship.target.element, label: relationship.target.role };
      } else if (relationship.target?.element === classId) {
        // classId is target, return source's role and id
        return { value: relationship.source.element, label: relationship.source.role };
      }
      return null;
    })
    .filter((end) => end !== null);
}

export function getElementNameById(elementId: string): string | null {
  const currentProject = ProjectStorageRepository.getCurrentProject();
  const classDiagram = currentProject?.diagrams?.ClassDiagram?.model || null;

  if (!classDiagram || !classDiagram.elements) return null;
  const element = Object.values(classDiagram.elements)
    .find((el: any) => el.id === elementId);
  return element ? (element as any).name : null;
}