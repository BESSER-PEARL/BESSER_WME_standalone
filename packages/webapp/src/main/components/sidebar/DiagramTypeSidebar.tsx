import React, { useEffect, useRef } from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { 
  Diagram3, 
  Diagram2, 
  Robot, 
  ArrowRepeat, 
  Gear,
  House
} from 'react-bootstrap-icons';
import { UMLDiagramType, diagramBridge } from '@besser/wme';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  changeDiagramType, 
  setCreateNewEditor, 
  loadDiagram, 
  createDiagram 
} from '../../services/diagram/diagramSlice';
import { LocalStorageRepository } from '../../services/local-storage/local-storage-repository';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { getLastProjectFromLocalStorage, saveProjectToLocalStorage } from '../../utils/localStorage';
import { uuid } from '../../utils/uuid';

const SidebarContainer = styled.div`
  width: 60px;
  background: var(--apollon-background);
  border-right: 1px solid var(--apollon-switch-box-border-color);
  min-height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  position: fixed;
  left: 0;
  top: 60px;
  z-index: 100;
  backdrop-filter: blur(10px);
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
`;

const SidebarButton = styled(Button)<{ $isActive: boolean }>`
  margin-bottom: 8px;
  border: none;
  border-radius: 12px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.2s ease;
  
  background-color: ${props => props.$isActive 
    ? 'var(--apollon-primary)' 
    : 'transparent'};
  color: ${props => props.$isActive ? 'var(--apollon-background)' : 'var(--apollon-secondary)'};
  
  &:hover {
    background-color: ${props => props.$isActive 
      ? 'var(--apollon-primary)' 
      : 'var(--apollon-background-variant)'};
    color: ${props => props.$isActive ? 'var(--apollon-background)' : 'var(--apollon-primary-contrast)'};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  &:active, &:focus {
    background-color: ${props => props.$isActive 
      ? 'var(--apollon-primary)' 
      : 'var(--apollon-background-variant)'};
    border: none;
    box-shadow: none;
  }
`;

const Divider = styled.hr`
  width: 30px;
  border: 0;
  border-top: 1px solid var(--apollon-switch-box-border-color);
  margin: 12px 0;
`;

type SidebarItemType = UMLDiagramType | 'home' | 'settings';

interface SidebarItem {
  type: SidebarItemType;
  label: string;
  icon: React.ReactNode;
  path?: string;
}

const sidebarItems: SidebarItem[] = [
  { type: 'home', label: 'Home', icon: <House size={20} />, path: '/' },
  { type: UMLDiagramType.ClassDiagram, label: 'Class Diagram', icon: <Diagram3 size={20} /> },
  { type: UMLDiagramType.ObjectDiagram, label: 'Object Diagram', icon: <Diagram2 size={20} /> },
  { type: UMLDiagramType.StateMachineDiagram, label: 'State Machine', icon: <ArrowRepeat size={20} /> },
  { type: UMLDiagramType.AgentDiagram, label: 'Agent Diagram', icon: <Robot size={20} /> },
  { type: 'settings', label: 'Project Settings', icon: <Gear size={20} />, path: '/project-settings' },
];

export const DiagramTypeSidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentType = useAppSelector((state) => state.diagram.editorOptions.type);
  const currentDiagram = useAppSelector((state) => state.diagram.diagram);
  const navigate = useNavigate();
  const location = useLocation();
  const pendingDiagramAdd = useRef<boolean>(false);

  // Watch for new diagram creation and add to project
  useEffect(() => {
    if (pendingDiagramAdd.current && currentDiagram && currentDiagram.id) {
      const currentProject = getLastProjectFromLocalStorage();
      if (currentProject && !currentProject.models.includes(currentDiagram.id)) {
        // Add the new diagram ID to the project's models array
        const updatedProject = {
          ...currentProject,
          models: [...(currentProject.models || []), currentDiagram.id]
        };
        
        // Save the updated project
        saveProjectToLocalStorage(updatedProject);
      }
      pendingDiagramAdd.current = false;
    }
  }, [currentDiagram]);

  const handleItemClick = (item: SidebarItem) => {
    // Handle navigation items (home, settings)
    if (item.path) {
      navigate(item.path);
      return;
    }

    // This should not happen with current setup, but let's be safe
    if (item.type === 'home' || item.type === 'settings') {
      return;
    }

    const diagramType = item.type as UMLDiagramType;
    
    // If we're not on the editor page, navigate there first
    if (location.pathname !== '/editor') {
      navigate('/editor');
    }

    // If it's the same type, don't do anything
    if (diagramType === currentType) {
      return;
    }

    // Save current diagram if it exists
    if (currentDiagram && currentDiagram.model) {
      LocalStorageRepository.storeDiagramByType(currentType, currentDiagram);
      
      // Object Diagram Bridge Service
      // If we're switching FROM a class diagram, update the bridge service
      if (currentType === UMLDiagramType.ClassDiagram) {
        diagramBridge.setClassDiagramData(currentDiagram.model);
      }
    }

    // If we're switching TO an object diagram, ensure bridge has class data
    if (diagramType === UMLDiagramType.ObjectDiagram) {
      // Try to get the latest class diagram data if bridge doesn't have it
      if (!diagramBridge.hasClassDiagramData()) {
        const classDiagram = LocalStorageRepository.loadDiagramByType(UMLDiagramType.ClassDiagram);
        if (classDiagram && classDiagram.model) {
          diagramBridge.setClassDiagramData(classDiagram.model);
        }
      }
    }

    // Try to load existing diagram of the selected type
    const project = getLastProjectFromLocalStorage();
    let diagramToLoad = null;

    if (project && Array.isArray(project.models)) {
      // Find diagrams from the current project
      const allDiagrams = project.models
        .map((id: string) => {
          const diagramData = localStorage.getItem(`besser_diagram_${id}`);
          if (diagramData) {
            try {
              return JSON.parse(diagramData);
            } catch {
              return null;
            }
          }
          return null;
        })
        .filter(Boolean);

      diagramToLoad = allDiagrams.find((d: any) => d.model?.type === diagramType);
    }

    if (diagramToLoad) {
      dispatch(loadDiagram(diagramToLoad));
    } else {
      // Mark that we're about to create a new diagram that should be added to the project
      pendingDiagramAdd.current = true;
      
      // Create a new diagram of the selected type
      dispatch(createDiagram({
        title: `New ${diagramType.replace('Diagram', ' Diagram')}`,
        diagramType: diagramType,
      }));
    }

    dispatch(changeDiagramType(diagramType));
    dispatch(setCreateNewEditor(true));
  };

  const isItemActive = (item: SidebarItem): boolean => {
    if (item.path) {
      return location.pathname === item.path;
    }
    
    if (item.type === 'home') {
      return location.pathname === '/';
    }
    
    if (location.pathname === '/editor' && item.type === currentType) {
      return true;
    }
    
    return false;
  };

  return (
    <SidebarContainer>
      {sidebarItems.map((item, index) => {
        const isActive = isItemActive(item);
        const isDividerAfter = index === 0 || index === sidebarItems.length - 2;
        
        return (
          <React.Fragment key={item.type}>
            <OverlayTrigger
              placement="right"
              overlay={
                <Tooltip id={`tooltip-${item.type}`}>
                  {item.label}
                </Tooltip>
              }
            >
              <SidebarButton
                variant="link"
                $isActive={isActive}
                onClick={() => handleItemClick(item)}
                title={item.label}
              >
                {item.icon}
              </SidebarButton>
            </OverlayTrigger>
            {isDividerAfter && <Divider />}
          </React.Fragment>
        );
      })}
    </SidebarContainer>
  );
};
