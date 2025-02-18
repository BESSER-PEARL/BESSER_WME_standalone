import React from 'react';
import { NavDropdown } from 'react-bootstrap';
import { UMLDiagramType } from '@besser/besser-wme';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { 
  changeDiagramType, 
  setCreateNewEditor,
  loadDiagram,
  createDiagram 
} from '../../../services/diagram/diagramSlice';
import { LocalStorageRepository } from '../../../services/local-storage/local-storage-repository';

export const DiagramTypeSelector: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentType = useAppSelector((state) => state.diagram.editorOptions.type);
  const currentDiagram = useAppSelector((state) => state.diagram.diagram);

  const handleTypeChange = (type: UMLDiagramType) => {
    if (type !== currentType) {
      // Save current diagram state with its type
      if (currentDiagram && currentDiagram.model) {
        LocalStorageRepository.storeDiagramByType(currentType, currentDiagram);
      }

      // Load previously saved diagram of selected type
      const savedDiagram = LocalStorageRepository.loadDiagramByType(type);
      
      if (savedDiagram) {
        dispatch(loadDiagram(savedDiagram));
      } else {
        // If no saved diagram exists for this type, create a new one
        dispatch(createDiagram({
          title: `New ${type}`,
          diagramType: type
        }));
      }
      
      dispatch(changeDiagramType(type));
      dispatch(setCreateNewEditor(true));
    }
  };

  return (
    <NavDropdown 
      id="diagram-type-menu" 
      title="Diagram Type" 
      style={{ paddingTop: 0, paddingBottom: 0 }}
    >
      {Object.values(UMLDiagramType).map((type) => (
        <NavDropdown.Item
          key={type}
          onClick={() => handleTypeChange(type)}
          active={currentType === type}
        >
          {type.replace(/([A-Z])/g, ' $1').trim()}
        </NavDropdown.Item>
      ))}
    </NavDropdown>
  );
};
