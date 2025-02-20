import { useCallback } from 'react';
import { useAppDispatch } from '../../components/store/hooks';
import { displayError } from '../error-management/errorManagementSlice';
import { createDiagram } from '../diagram/diagramSlice';
import { UMLDiagramType, UMLModel } from '@besser/wme';

const BESSER_BACKEND_URL = 'http://localhost:8000';

export const useBumlImport = () => {
  const dispatch = useAppDispatch();

  const importBuml = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append('buml_file', file);

    try {
      const response = await fetch(`${BESSER_BACKEND_URL}/get-json-model`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const modelType = data.model.type === 'StateMachine' ? 
        UMLDiagramType.StateMachineDiagram :// UMLDiagramType.StateMachineDiagram : 
        UMLDiagramType.ClassDiagram;
      
      // Create template model with proper type
      const template: UMLModel = {
        ...data.model,
        type: modelType
      };

      dispatch(createDiagram({
        title: data.title,
        template: template,
        diagramType: modelType
      }));

    } catch (error) {
      console.error('Error importing BUML:', error);
      dispatch(displayError('Import failed', 'Could not import BUML file. Please check the file format.'));
    }
  }, [dispatch]);

  return importBuml;
};
