import { useCallback } from 'react';
import { useAppDispatch } from '../../components/store/hooks';
import { uuid } from '../../utils/uuid';
import { Diagram, loadDiagram } from '../diagram/diagramSlice';
import { displayError } from '../error-management/errorManagementSlice';
import { useNavigate } from 'react-router-dom';
import { diagramBridge, UMLDiagramType } from '@besser/wme';
import { LocalStorageRepository } from '../local-storage/local-storage-repository';

export const useImportDiagram = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const importDiagram = useCallback((stringifiedJson: string) => {
    try {
      const diagram: Diagram = JSON.parse(stringifiedJson);
      diagram.id = uuid();      // If importing an ObjectDiagram with embedded class diagram data
      if (diagram.model?.type === UMLDiagramType.ObjectDiagram && diagram.model?.referenceDiagramData) {
        const referenceDiagramData = diagram.model.referenceDiagramData;
        
        // Set the class diagram data in the bridge service
        diagramBridge.setClassDiagramData(referenceDiagramData);

        // If the reference diagram has a title, create a class diagram entry in localStorage
        if (referenceDiagramData.title) {
          const classDiagramForStorage: Diagram = {
            id: uuid(),
            title: referenceDiagramData.title,
            model: referenceDiagramData,
            lastUpdate: new Date().toISOString()
          };
          LocalStorageRepository.storeDiagramByType(UMLDiagramType.ClassDiagram, classDiagramForStorage);
        }

        // Remove from model before loading (keep the model clean)
        const cleanModel = { ...diagram.model };
        delete cleanModel.referenceDiagramData;
        diagram.model = cleanModel;
      }

      dispatch(loadDiagram(diagram));
      navigate('/editor', { relative: 'path' });
    } catch {
      dispatch(
        displayError('Import failed', 'Could not import selected file. Are you sure it contains a diagram.json?'),
      );
    }
  }, [dispatch, navigate]);

  return importDiagram;
};
