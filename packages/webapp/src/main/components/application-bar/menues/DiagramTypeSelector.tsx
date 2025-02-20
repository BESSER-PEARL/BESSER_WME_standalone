import React from 'react';
import { NavDropdown } from 'react-bootstrap';
import { UMLDiagramType } from '@besser/wme';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { 
  changeDiagramType, 
  setCreateNewEditor,
  loadDiagram,
  createDiagram 
} from '../../../services/diagram/diagramSlice';
import { LocalStorageRepository } from '../../../services/local-storage/local-storage-repository';

const formatDiagramType = (type: string): string => {
  return type.replace(/([A-Z])/g, ' $1').trim();
};

// Define allowed diagram types
const ALLOWED_DIAGRAM_TYPES = [
  UMLDiagramType.ClassDiagram,
  UMLDiagramType.StateMachineDiagram
];

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
      title={formatDiagramType(currentType)}
      style={{ paddingTop: 0, paddingBottom: 0 }}
    >
      {ALLOWED_DIAGRAM_TYPES.map((type) => (
        <NavDropdown.Item
          key={type}
          onClick={() => handleTypeChange(type)}
          active={currentType === type}
        >
          {formatDiagramType(type)}
        </NavDropdown.Item>
      ))}
    </NavDropdown>
  );
};
