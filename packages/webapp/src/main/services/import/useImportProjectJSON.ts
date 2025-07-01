import { BesserProject } from '../../components/modals/create-project-modal/CreateProjectModal';
import { Diagram } from '../diagram/diagramSlice';
import { saveProjectToLocalStorage } from '../../utils/localStorage';

// Dynamic import for JSZip
async function loadJSZip() {
  const JSZip = (await import('jszip')).default;
  return JSZip;
}

// Interface for import validation
interface ImportData {
  project: BesserProject;
  diagrams: Diagram[];
  exportedAt?: string;
  version?: string;
}

// Validate imported project structure
function validateImportData(data: any): data is ImportData {
  return (
    data &&
    typeof data === 'object' &&
    data.project &&
    Array.isArray(data.diagrams) &&
    typeof data.project.id === 'string' &&
    typeof data.project.name === 'string'
  );
}

// Generate new IDs to avoid conflicts
function generateNewIds(data: ImportData): ImportData {
  const idMapping = new Map<string, string>();
  
  // Generate new project ID
  const newProjectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  idMapping.set(data.project.id, newProjectId);
  
  // Generate new diagram IDs
  const newDiagrams = data.diagrams.map(diagram => {
    const newDiagramId = `diagram_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    idMapping.set(diagram.id, newDiagramId);
    
    return {
      ...diagram,
      id: newDiagramId,
      title: diagram.title || `Imported Diagram ${new Date().toLocaleDateString()}`
    };
  });
  
  // Update project with new IDs
  const updatedProject: BesserProject = {
    ...data.project,
    id: newProjectId,
    name: `${data.project.name} (Imported)`,
    createdAt: new Date().toISOString(),
    models: newDiagrams.map(d => d.id)
  };
  
  return {
    ...data,
    project: updatedProject,
    diagrams: newDiagrams
  };
}

// Store imported data in localStorage
function storeImportedData(data: ImportData): void {
  // Store project using the centralized utility
  saveProjectToLocalStorage(data.project);
  
  // Store diagrams
  data.diagrams.forEach(diagram => {
    localStorage.setItem(`besser_diagram_${diagram.id}`, JSON.stringify(diagram));
  });
}

// Import from JSON file
export async function importProjectFromJson(file: File): Promise<BesserProject> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        
        if (!validateImportData(jsonData)) {
          throw new Error('Invalid project file format');
        }
        
        const dataWithNewIds = generateNewIds(jsonData);
        storeImportedData(dataWithNewIds);
        
        console.log(`Project "${dataWithNewIds.project.name}" imported successfully`);
        resolve(dataWithNewIds.project);
        
      } catch (error) {
        console.error('JSON import failed:', error);
        reject(new Error('Failed to import project: Invalid JSON format'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

// Import from ZIP file
export async function importProjectFromZip(file: File): Promise<BesserProject> {
  try {
    const JSZip = await loadJSZip();
    const zip = await JSZip.loadAsync(file);
    
    // Read project.json
    const projectFile = zip.file('project.json');
    if (!projectFile) {
      throw new Error('No project.json found in ZIP file');
    }
    
    const projectData = JSON.parse(await projectFile.async('text'));
    
    // Read diagrams from diagrams folder
    const diagrams: Diagram[] = [];
    const diagramsFolder = zip.folder('diagrams');
    
    if (diagramsFolder) {
      const diagramFiles = Object.keys(zip.files).filter(path => 
        path.startsWith('diagrams/') && path.endsWith('.json')
      );
      
      for (const diagramPath of diagramFiles) {
        const diagramFile = zip.file(diagramPath);
        if (diagramFile) {
          try {
            const diagramData = JSON.parse(await diagramFile.async('text'));
            diagrams.push(diagramData);
          } catch (error) {
            console.warn(`Failed to parse diagram file ${diagramPath}:`, error);
          }
        }
      }
    }
    
    const importData: ImportData = {
      project: projectData,
      diagrams: diagrams
    };
    
    if (!validateImportData(importData)) {
      throw new Error('Invalid project structure in ZIP file');
    }
    
    const dataWithNewIds = generateNewIds(importData);
    storeImportedData(dataWithNewIds);
    
    console.log(`Project "${dataWithNewIds.project.name}" imported successfully from ZIP`);
    return dataWithNewIds.project;
    
  } catch (error) {
    console.error('ZIP import failed:', error);
    throw new Error('Failed to import project from ZIP file');
  }
}

// Main import function that handles both JSON and ZIP files
export async function importProject(file: File): Promise<BesserProject> {
  const fileExtension = file.name.toLowerCase().split('.').pop();
  
  switch (fileExtension) {
    case 'json':
      return await importProjectFromJson(file);
    case 'zip':
      return await importProjectFromZip(file);
    default:
      throw new Error('Unsupported file format. Please select a .json or .zip file.');
  }
}

// Helper function to trigger file selection
export function selectImportFile(): Promise<File> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.zip';
    input.multiple = false;
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        resolve(file);
      } else {
        reject(new Error('No file selected'));
      }
    };
    
    input.oncancel = () => {
      reject(new Error('File selection cancelled'));
    };
    
    input.click();
  });
}

// Complete import workflow
export async function handleImportProject(): Promise<BesserProject> {
  try {
    const file = await selectImportFile();
    const importedProject = await importProject(file);
    
    // Trigger a storage event to update UI
    window.dispatchEvent(new Event('storage'));
    
    return importedProject;
  } catch (error) {
    console.error('Import process failed:', error);
    throw error;
  }
}
