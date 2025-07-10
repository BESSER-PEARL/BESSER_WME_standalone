import { useCallback } from 'react';
import { useAppDispatch } from '../../components/store/hooks';
import { uuid } from '../../utils/uuid';
import { Diagram, loadImportedDiagram } from '../diagram/diagramSlice';
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
