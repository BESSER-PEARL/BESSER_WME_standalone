import React, { useRef, useState, useEffect } from 'react';
import { Nav, Badge } from 'react-bootstrap';
import { Upload, CheckCircle, XCircle } from 'react-bootstrap-icons';
import { diagramBridge, UMLDiagramType } from '@besser/wme';
import { useAppSelector } from '../../../store/hooks';
import { LocalStorageRepository } from '../../../services/local-storage/local-storage-repository';
import { toast } from 'react-toastify';
import styled from 'styled-components';

const ClassDiagramInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9em;
  color: #ccc;
  margin-right: 15px;
`;

const ImportButton = styled(Nav.Link)`
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  
  &:hover {
    color: #fff !important;
  }
`;

const StatusIndicator = styled.div<{ $hasData: boolean }>`
  display: flex;
  align-items: center;
  gap: 5px;
  color: ${props => props.$hasData ? '#28a745' : '#dc3545'};
`;

export const ClassDiagramImporter: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasClassData, setHasClassData] = useState(false);
  const [classDiagramTitle, setClassDiagramTitle] = useState<string>('');
  const currentType = useAppSelector((state) => state.diagram.editorOptions.type);

  // Check for class diagram data on component mount and when diagram type changes
  useEffect(() => {
    updateClassDiagramStatus();
  }, [currentType]);

  const updateClassDiagramStatus = () => {
    const hasData = diagramBridge.hasClassDiagramData();
    setHasClassData(hasData);

    if (hasData) {
      // Try to get the class diagram title from localStorage
      const classDiagram = LocalStorageRepository.loadDiagramByType(UMLDiagramType.ClassDiagram);
      if (classDiagram?.title) {
        setClassDiagramTitle(classDiagram.title);      } else {
        // Fallback: use default title since class diagram data doesn't contain title
        setClassDiagramTitle('Class Diagram');
      }
    } else {
      setClassDiagramTitle('');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;    try {
      const fileContent = await file.text();
      const diagramData = JSON.parse(fileContent);

      // Validate that this is a class diagram
      // Check both the root level type and model.type for compatibility
      const diagramType = diagramData.type || diagramData.model?.type;
      if (diagramType !== UMLDiagramType.ClassDiagram) {
        toast.error('Please select a valid Class Diagram file');
        return;
      }

      // Store the class diagram in localStorage for persistence
      LocalStorageRepository.storeDiagramByType(UMLDiagramType.ClassDiagram, diagramData);

      // Update the bridge service
      if (diagramData.model) {
        diagramBridge.setClassDiagramData(diagramData.model);
        setClassDiagramTitle(diagramData.title || 'Imported Class Diagram');
        setHasClassData(true);
        
        toast.success(`Class diagram "${diagramData.title || 'Untitled'}" imported successfully!`);
      } else {
        toast.error('Invalid class diagram format');
      }
    } catch (error) {
      console.error('Error importing class diagram:', error);
      toast.error('Failed to import class diagram. Please check the file format.');
    }

    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearClassDiagram = () => {
    diagramBridge.clearDiagramData();
    LocalStorageRepository.removeDiagramByType(UMLDiagramType.ClassDiagram);
    setHasClassData(false);
    setClassDiagramTitle('');
    toast.info('Class diagram data cleared');
  };

  // Only show when working with object diagrams
  if (currentType !== UMLDiagramType.ObjectDiagram) {
    return null;
  }

  return (
    <>
      <Nav.Item>
        <ImportButton onClick={handleImportClick} title="Import Class Diagram for Object Modeling">
          <Upload size={16} />
          Import Class
        </ImportButton>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleFileImport}
        />
      </Nav.Item>
      
      {hasClassData && (
        <ClassDiagramInfo>
          <StatusIndicator $hasData={hasClassData}>
            <CheckCircle size={16} />
            <span>Class: {classDiagramTitle}</span>
          </StatusIndicator>
          <Badge 
            bg="secondary" 
            style={{ cursor: 'pointer' }}
            onClick={clearClassDiagram}
            title="Clear class diagram data"
          >
            ×
          </Badge>
        </ClassDiagramInfo>
      )}
      
      {!hasClassData && currentType === UMLDiagramType.ObjectDiagram && (
        <ClassDiagramInfo>
          <StatusIndicator $hasData={false}>
            <XCircle size={16} />
            <span>No Class Diagram</span>
          </StatusIndicator>
        </ClassDiagramInfo>
      )}
    </>
  );
};
