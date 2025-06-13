import { useCallback } from 'react';
import { useAppDispatch } from '../../components/store/hooks';
import { uuid } from '../../utils/uuid';
import { Diagram, loadDiagram } from '../diagram/diagramSlice';
import { displayError } from '../error-management/errorManagementSlice';
import { useNavigate } from 'react-router-dom';
import { diagramBridge } from '@besser/wme';

export const useImportDiagram = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const importDiagram = useCallback((stringifiedJson: string) => {
    try {
      const diagram: Diagram = JSON.parse(stringifiedJson);
      diagram.id = uuid();

      // If importing an ObjectDiagram with embedded class diagram data
      if (diagram.model?.type === 'ObjectDiagram' && diagram.model?.referenceDiagramData) {
        // Set the class diagram data in the bridge service
        diagramBridge.setClassDiagramData(diagram.model.referenceDiagramData);

        // Remove from model before loading (keep the model clean)
        const cleanModel = { ...diagram.model };
        delete cleanModel.referenceDiagramData;
        diagram.model = cleanModel;
      }

      dispatch(loadDiagram(diagram));
      navigate('/', { relative: 'path' });
    } catch {
      dispatch(
        displayError('Import failed', 'Could not import selected file. Are you sure it contains a diagram.json?'),
      );
    }
  }, [dispatch, navigate]);

  return importDiagram;
};
