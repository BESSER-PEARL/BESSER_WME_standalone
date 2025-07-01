import { BACKEND_URL } from '../../constant';
import JSZip from 'jszip';
import { toast } from 'react-toastify';
import { BesserProject } from '../../components/modals/create-project-modal/CreateProjectModal';
import { ApollonEditor, diagramBridge, UMLDiagramType } from '@besser/wme';
import { validateDiagram } from '../validation/diagramValidation';
import { LocalStorageRepository } from '../local-storage/local-storage-repository';

async function convertDiagramModelToBUML(diagram: any, diagramTitle: string): Promise<string> {
  // Create a mock editor object to use with validateDiagram
  const mockEditor = {
    model: diagram
  } as ApollonEditor;

  // Add validation before export
  const validationResult = validateDiagram(mockEditor);
  if (!validationResult.isValid) {
    toast.error(validationResult.message);
    throw new Error(validationResult.message);
  }

  if (!diagram) {
    console.error('No diagram model available');
    toast.error('No diagram to export');
    throw new Error('No diagram to export');
  }

  // Prepare the model data - include referenceDiagramData for ObjectDiagrams
  let modelData = diagram;
  
  // If it's an ObjectDiagram, include the class diagram data
  if (diagram.type === 'ObjectDiagram') {
    const classDiagramData = diagramBridge.getClassDiagramData();
    if (classDiagramData) {
      // Try to get the class diagram title from localStorage
      const classDiagram = LocalStorageRepository.loadDiagramByType(UMLDiagramType.ClassDiagram);
      const classDiagramTitle = classDiagram?.title || 'Class Diagram';
      
      // Add the class diagram data and title as referenceDiagramData to the model
      modelData = {
        ...diagram,
        referenceDiagramData: {
          ...classDiagramData,
          title: classDiagramTitle
        }
      };
    }
  }

  console.log('Sending model data to backend:', modelData); // Debug log

  const response = await fetch(`${BACKEND_URL}/export-buml`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/plain, application/zip, */*',
    },
    body: JSON.stringify({
      elements: modelData,
      generator: 'buml',
      diagramTitle,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }

  const bumlContent = await response.text();
  return bumlContent;
}

// Helper function for exporting project data
async function useExportProjectBUML(project: BesserProject): Promise<string> {

  const response = await fetch(`${BACKEND_URL}/export-project`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/plain, application/zip, */*',
    },
    body: JSON.stringify({
      elements: {
        ...project,
        type: 'Project'
      },
      generator: 'buml',
      diagramTitle: project.name || 'project'
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }

  const bumlContent = await response.text();
  return bumlContent;
}

export async function exportProjectAsBUMLZip(project: BesserProject) {
  const { models, name } = project;
  const zip = new JSZip();
  let exportedCount = 0;

  // Export each diagram as .py
  const exportPromises = models.map(async (diagramId: string) => {
    const diagramStr = localStorage.getItem(`besser_diagram_${diagramId}`);
    if (diagramStr) {
      try {
        const diagram = JSON.parse(diagramStr);
        const bumlContent = await convertDiagramModelToBUML(diagram.model, diagram.title || diagram.model?.type || diagramId);
        const fileName = `${diagram.model?.type || diagramId}.py`;
        zip.file(fileName, bumlContent);
        exportedCount++;
      } catch (e) {
        console.warn(`Failed to export diagram ${diagramId}:`, e);
      }
    }
  });

  // Export the project itself as project.py
  const exportProjectPromise = (async () => {
    try {
      const projectBuml = await useExportProjectBUML(project);
      zip.file('project.py', projectBuml);
    } catch (e) {
      console.warn('Failed to export project as BUML:', e);
    }
  })();

  await Promise.all([...exportPromises, exportProjectPromise]);

  if (exportedCount === 0) {
    toast.error('No diagrams found to export.');
    return;
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name || 'project'}-buml.zip`;
  a.click();
  window.URL.revokeObjectURL(url);

  toast.success('BUML export completed!');
}
