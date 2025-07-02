import React, { useState } from 'react';
import { Button, FormControl, InputGroup, Modal, Form, Row, Col, Card, Badge } from 'react-bootstrap';
import { ModalContentProps } from '../application-modal-types';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { uuid } from '../../../utils/uuid';
import { UMLDiagramType } from '@besser/wme';
import { createDiagram, Diagram } from '../../../services/diagram/diagramSlice';
import { LocalStorageRepository } from '../../../services/local-storage/local-storage-repository';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { 
  Diagram3, 
  Diagram2, 
  Robot, 
  ArrowRepeat, 
  Check2Circle,
  InfoCircle,
  Person,
  FileText,
  Tag
} from 'react-bootstrap-icons';
import { saveProjectToLocalStorage } from '../../../utils/localStorage';

// Project type definition
export interface BesserProject {
  id: string;
  type: 'Project';
  name: string;
  description: string;
  owner: string;
  createdAt: string;
  models: string[];
  settings?: {
    defaultDiagramType?: UMLDiagramType;
    autoSave?: boolean;
    collaborationEnabled?: boolean;
  };
}


const getBlankModel = (type: UMLDiagramType) => ({
  version: '3.0.0' as const,
  type,
  size: { width: 1400, height: 740 },
  elements: {},
  relationships: {},
  interactive: { elements: {}, relationships: {} },
  assessments: {},
});

const DIAGRAM_ICONS = {
  [UMLDiagramType.ClassDiagram]: Diagram3,
  [UMLDiagramType.ObjectDiagram]: Diagram2,
  [UMLDiagramType.AgentDiagram]: Robot,
  [UMLDiagramType.StateMachineDiagram]: ArrowRepeat,
};

export const CreateProjectModal: React.FC<ModalContentProps> = ({ close }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    owner: '',
    template: 'blank',
    defaultDiagramType: UMLDiagramType.ClassDiagram,
    createSampleDiagrams: true,
  });
  const [selectedTemplate, setSelectedTemplate] = useState('blank');
  const [selectedDiagrams, setSelectedDiagrams] = useState<UMLDiagramType[]>([UMLDiagramType.ClassDiagram]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleInputChange = (field: string, value: string | boolean | UMLDiagramType) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateProject = async () => {
    if (!formData.name.trim()) {
      toast.error('Project name is required');
      return;
    }

    setIsLoading(true);
    
    try {
      const projectId = uuid();
      const diagramIds: string[] = [];

      // Create initial diagrams if requested
      // Commented out sample diagrams creation - always create just one diagram of default type
      /* if (formData.createSampleDiagrams) {
        const diagramTypes = [
          UMLDiagramType.ClassDiagram,
          UMLDiagramType.ObjectDiagram,
          UMLDiagramType.StateMachineDiagram,
          UMLDiagramType.AgentDiagram,
        ];

        for (const type of diagramTypes) {
          const diagramId = uuid();
          const diagram: Diagram = {
            id: diagramId,
            title: `${type.replace('Diagram', ' Diagram')}`,
            model: getBlankModel(type),
            lastUpdate: new Date().toISOString(),
          };
          
          LocalStorageRepository.storeDiagram(diagram);
          diagramIds.push(diagramId);
        }
      } else { */
        // Create at least one diagram of the default type
        const diagramId = uuid();
        const diagram: Diagram = {
          id: diagramId,
          title: `New ${formData.defaultDiagramType}`,
          model: getBlankModel(formData.defaultDiagramType),
          lastUpdate: new Date().toISOString(),
        };
        
        LocalStorageRepository.storeDiagram(diagram);
        diagramIds.push(diagramId);
      // }

      // Create the project
      const project: BesserProject = {
        id: projectId,
        type: 'Project',
        name: formData.name.trim(),
        description: formData.description.trim(),
        owner: formData.owner.trim(),
        createdAt: new Date().toISOString(),
        models: diagramIds,
        settings: {
          defaultDiagramType: formData.defaultDiagramType,
          autoSave: true,
          collaborationEnabled: false,
        },
      };

      saveProjectToLocalStorage(project);

      // Create the first diagram in the editor
      dispatch(createDiagram({
        title: `New ${formData.defaultDiagramType}`,
        diagramType: formData.defaultDiagramType,
      }));

      toast.success(`Project "${formData.name}" created successfully!`);
      close();
      navigate('/editor');
      
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>Create New Project</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Project Name *</Form.Label>
                <FormControl
                  type="text"
                  placeholder="Enter project name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Owner</Form.Label>
                <FormControl
                  type="text"
                  placeholder="Project owner"
                  value={formData.owner}
                  onChange={(e) => handleInputChange('owner', e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <FormControl
              as="textarea"
              rows={3}
              placeholder="Project description (optional)"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Default Diagram Type</Form.Label>
                <Form.Select
                  value={formData.defaultDiagramType}
                  onChange={(e) => handleInputChange('defaultDiagramType', e.target.value as UMLDiagramType)}
                >
                  <option value={UMLDiagramType.ClassDiagram}>Class Diagram</option>
                  <option value={UMLDiagramType.ObjectDiagram}>Object Diagram</option>
                  <option value={UMLDiagramType.StateMachineDiagram}>State Machine Diagram</option>
                  <option value={UMLDiagramType.AgentDiagram}>Agent Diagram</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <div className="mt-4">
                  {/* Commented out for now - Create sample diagrams option */}
                  {/* <Form.Check
                    type="checkbox"
                    label="Create sample diagrams for all types"
                    checked={formData.createSampleDiagrams}
                    onChange={(e) => handleInputChange('createSampleDiagrams', e.target.checked)}
                  /> */}
                </div>
              </Form.Group>
            </Col>
          </Row>

          <div className="bg-light p-3 rounded">
            <small className="text-muted">
              <strong>Note:</strong> This will create a new project with one {formData.defaultDiagramType.replace('Diagram', ' diagram')}. 
              You can add more diagrams later from the project workspace.
            </small>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={close} disabled={isLoading}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleCreateProject} 
          disabled={!formData.name.trim() || isLoading}
        >
          {isLoading ? 'Creating...' : 'Create Project'}
        </Button>
      </Modal.Footer>
    </>
  );
};
