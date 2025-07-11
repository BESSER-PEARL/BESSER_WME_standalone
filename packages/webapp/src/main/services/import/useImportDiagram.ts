import { useCallback } from 'react';
import { useAppDispatch } from '../../components/store/hooks';
import { uuid } from '../../utils/uuid';
import { Diagram, loadImportedDiagram } from '../diagram/diagramSlice';
import { displayError } from '../error-management/errorManagementSlice';
import { useNavigate } from 'react-router-dom';
import { diagramBridge, UMLDiagramType } from '@besser/wme';
import { LocalStorageRepository } from '../local-storage/local-storage-repository';
import { ProjectStorageRepository } from '../storage/ProjectStorageRepository';
import { toSupportedDiagramType } from '../../types/project';

export const useImportDiagram = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const importDiagram = useCallback((stringifiedJson: string) => {
    try {
      const diagram: Diagram = JSON.parse(stringifiedJson);
      diagram.id = uuid();

      dispatch(loadImportedDiagram(diagram));
      navigate('/', { relative: 'path' });
    } catch {
      dispatch(
        displayError('Import failed', 'Could not import selected file. Are you sure it contains a diagram.json?'),
      );
    }
  }, [dispatch, navigate]);

  return importDiagram;
};

// Helper function to import a single diagram JSON and add it to the current project
export const useImportDiagramToProject = () => {
  const dispatch = useAppDispatch();
  
  const importDiagramToProject = useCallback((stringifiedJson: string) => {
    try {
      const diagram: Diagram = JSON.parse(stringifiedJson);
      
      // Validate that it's a valid diagram
      if (!diagram.model || !diagram.model.type) {
        throw new Error('Invalid diagram format: missing model or type');
      }

      // Get the current project
      const currentProject = ProjectStorageRepository.getCurrentProject();
      if (!currentProject) {
        throw new Error('No project is currently open. Please create or open a project first.');
      }

      // Convert UMLDiagramType to SupportedDiagramType
      const diagramType = toSupportedDiagramType(diagram.model.type);
      
      // Generate new ID for the imported diagram to avoid conflicts
      const newId = uuid();
      const importedDiagram: Diagram = {
        ...diagram,
        id: newId,
        title: `${diagram.title}`,
        lastUpdate: new Date().toISOString()
      };

      // Update the corresponding diagram in the project
      const updatedProject = {
        ...currentProject,
        diagrams: {
          ...currentProject.diagrams,
          [diagramType]: {
            id: newId,
            title: importedDiagram.title,
            model: importedDiagram.model,
            lastUpdate: importedDiagram.lastUpdate,
            description: importedDiagram.description || `Imported ${diagramType} diagram`
          }
        }
      };

      // Save the updated project
      ProjectStorageRepository.saveProject(updatedProject);

      // If the imported diagram is the same type as the current diagram, load it immediately
      if (diagramType === currentProject.currentDiagramType) {
        dispatch(loadImportedDiagram(importedDiagram));
      }

      return {
        success: true,
        diagramType,
        diagramTitle: importedDiagram.title,
        message: `${diagramType} diagram imported successfully and added to project "${currentProject.name}". This diagram has been converted from the old format to the new project format.`
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred during import';
      dispatch(
        displayError('Import failed', `Could not import diagram: ${errorMessage}`)
      );
      throw error;
    }
  }, [dispatch]);

  return importDiagramToProject;
};

// Helper function to trigger file selection for importing diagrams to project
export function selectDiagramFileForProject(): Promise<File> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
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

// Complete workflow function for importing a diagram to the current project
export const useImportDiagramToProjectWorkflow = () => {
  const importDiagramToProject = useImportDiagramToProject();
  
  const handleImportDiagramToProject = useCallback(async () => {
    try {
      // Select the file
      const file = await selectDiagramFileForProject();
      
      // Read the file content
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      });
      
      // Import the diagram to the project
      const result = await importDiagramToProject(fileContent);
      
      return result;
    } catch (error) {
      console.error('Failed to import diagram to project:', error);
      throw error;
    }
  }, [importDiagramToProject]);
  
  return handleImportDiagramToProject;
};
