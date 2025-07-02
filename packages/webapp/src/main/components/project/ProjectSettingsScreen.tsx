import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Badge, ListGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { Download, Trash, Plus } from 'react-bootstrap-icons';
import styled from 'styled-components';
import { UMLDiagramType } from '@besser/wme';
import { BesserProject } from '../modals/create-project-modal/CreateProjectModal';
import { exportProjectById } from '../../services/export/useExportProjectJSON';
import { exportProjectAsBUMLZip } from '../../services/export/useExportProjectBUML';
import { saveProjectToLocalStorage } from '../../utils/localStorage';

const PageContainer = styled.div`
  padding: 40px 20px;
  min-height: calc(100vh - 60px);
  background-color: var(--apollon-background);
  display: flex;
  justify-content: center;
  align-items: flex-start;
`;

const ProjectCard = styled(Card)`
  width: 100%;
  max-width: 900px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--apollon-switch-box-border-color);
  border-radius: 16px;
  overflow: hidden;
  background-color: var(--apollon-background);
`;

const CardHeader = styled(Card.Header)`
  background: var(--apollon-primary);
  color: var(--apollon-primary-contrast);
  border: none;
  padding: 24px 32px;
  
  h3 {
    margin: 0;
    font-weight: 600;
    font-size: 1.5rem;
    color: var(--apollon-primary-contrast);
  }
`;

const CardBody = styled(Card.Body)`
  padding: 32px;
  background-color: var(--apollon-background);
  color: var(--apollon-primary-contrast);
`;

const SectionTitle = styled.h5`
  color: var(--apollon-primary-contrast);
  margin-bottom: 20px;
  font-weight: 600;
  border-bottom: 2px solid var(--apollon-switch-box-border-color);
  padding-bottom: 8px;
`;

const ActionButton = styled(Button)`
  border-radius: 8px;
  font-weight: 500;
  padding: 8px 16px;
  
  &.btn-outline-danger:hover {
    background-color: #dc3545;
    border-color: #dc3545;
  }
`;

const DiagramItem = styled(ListGroup.Item)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 8px;
  margin-bottom: 8px;
  border: 1px solid var(--apollon-switch-box-border-color);
  background-color: var(--apollon-list-group-color);
  color: var(--apollon-primary-contrast);
  
  &:hover {
    background-color: var(--apollon-background-variant);
  }
`;

// Utility functions
const getLastProjectFromLocalStorage = (): BesserProject | null => {
  const latestProjectId = localStorage.getItem('besser_latest_project');
  if (latestProjectId) {
    const projectData = localStorage.getItem(`besser_project_${latestProjectId}`);
    if (projectData) {
      try {
        return JSON.parse(projectData);
      } catch {
        return null;
      }
    }
  }
  return null;
};

const exportProjectAsJson = (project: BesserProject) => {
  const dataStr = JSON.stringify(project, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `${project.name || 'project'}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

const getDiagramTypeColor = (type: string): string => {
  const colors: { [key: string]: string } = {
    'ClassDiagram': 'primary',
    'ObjectDiagram': 'success',
    'StateMachineDiagram': 'warning',
    'AgentDiagram': 'info',
  };
  return colors[type] || 'secondary';
};

export const ProjectSettingsScreen: React.FC = () => {
  const [project, setProject] = useState<BesserProject | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [diagrams, setDiagrams] = useState<any[]>([]);

  useEffect(() => {
    loadProject();
  }, []);

  const loadProject = () => {
    const currentProject = getLastProjectFromLocalStorage();
    if (currentProject) {
      setProject(currentProject);
      loadProjectDiagrams(currentProject);
    }
  };

  const loadProjectDiagrams = (proj: BesserProject) => {
    if (!proj.models) return;
    
    const loadedDiagrams = proj.models
      .map(id => {
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
    
    setDiagrams(loadedDiagrams);
  };

  const handleProjectUpdate = (field: string, value: string) => {
    if (!project) return;
    
    const updatedProject = { ...project, [field]: value };
    setProject(updatedProject);
  };

  const handleSaveProject = async () => {
    if (!project) return;
    
    setIsLoading(true);
    try {
      saveProjectToLocalStorage(project);
      toast.success('Project settings saved successfully!');
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Failed to save project settings');
    } finally {
      setIsLoading(false);
    }
  };
  const handleExportProject = async () => {
    if (!project) return;
    
    try {
      await exportProjectById(project);
      toast.success('Project exported successfully!');
    } catch (error) {
      console.error('Error exporting project:', error);
      toast.error('Failed to export project');
    }
  };

  const handleExportProjectBUML = async () => {
    if (!project) {
      toast.error('No project loaded');
      return;
    }
    
    try {
      await exportProjectAsBUMLZip(project);
    } catch (error) {
      console.error('Error exporting project as BUML:', error);
      toast.error('Failed to export project as BUML');
    }
  };

  const handleDeleteDiagram = (diagramId: string) => {
    if (!project) return;
    
    if (window.confirm('Are you sure you want to delete this diagram? This action cannot be undone.')) {
      // Remove from localStorage
      localStorage.removeItem(`besser_diagram_${diagramId}`);
      
      // Update project
      const updatedProject = {
        ...project,
        models: project.models.filter(id => id !== diagramId)
      };
      
      setProject(updatedProject);
      saveProjectToLocalStorage(updatedProject);
      loadProjectDiagrams(updatedProject);
      
      toast.success('Diagram deleted successfully');
    }
  };

  if (!project) {
    return (
      <PageContainer>
        <ProjectCard>
          <CardHeader>
            <h3>Project Settings</h3>
          </CardHeader>
          <CardBody>
            <div className="text-center text-muted">
              <p>No project found. Please create a new project first.</p>
            </div>
          </CardBody>
        </ProjectCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ProjectCard>
        <CardHeader>
          <h3>Project Settings</h3>
        </CardHeader>
        <CardBody>
          <Form>
            <SectionTitle>General Information</SectionTitle>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Project Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={project.name}
                    onChange={(e) => handleProjectUpdate('name', e.target.value)}
                    placeholder="Enter project name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Owner</Form.Label>
                  <Form.Control
                    type="text"
                    value={project.owner}
                    onChange={(e) => handleProjectUpdate('owner', e.target.value)}
                    placeholder="Project owner"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={project.description}
                onChange={(e) => handleProjectUpdate('description', e.target.value)}
                placeholder="Project description"
              />
            </Form.Group>

            <SectionTitle>Project Diagrams ({diagrams.length})</SectionTitle>
            {diagrams.length > 0 ? (
              <ListGroup className="mb-4">
                {diagrams.map((diagram) => (
                  <DiagramItem key={diagram.id}>
                    <div>
                      <strong>{diagram.title}</strong>
                      <div className="small text-muted">
                        Last updated: {new Date(diagram.lastUpdate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <Badge bg={getDiagramTypeColor(diagram.model?.type)}>
                        {diagram.model?.type?.replace('Diagram', '') || 'Unknown'}
                      </Badge>
                      <ActionButton
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteDiagram(diagram.id)}
                        title="Delete diagram"
                      >
                        <Trash size={16} />
                      </ActionButton>
                    </div>
                  </DiagramItem>
                ))}
              </ListGroup>
            ) : (
              <div className="text-center text-muted mb-4">
                <p>No diagrams in this project yet.</p>
              </div>
            )}

            <SectionTitle>Project Information</SectionTitle>
            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <strong>Created:</strong> {new Date(project.createdAt).toLocaleDateString()}
                </div>
                <div className="mb-3">
                  <strong>Project ID:</strong> <code>{project.id}</code>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <strong>Diagrams Count:</strong> {diagrams.length}
                </div>
                <div className="mb-3">
                  <strong>Auto Save:</strong> {project.settings?.autoSave ? 'Enabled' : 'Disabled'}
                </div>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-3 mt-4">
              <ActionButton
                variant="outline-secondary"
                onClick={handleExportProjectBUML}
                className="d-flex align-items-center gap-2"
              >
                <Download size={16} />
                Export B-UML
              </ActionButton>
              <ActionButton
                variant="outline-primary"
                onClick={handleExportProject}
                className="d-flex align-items-center gap-2"
              >
                <Download size={16} />
                Export Project
              </ActionButton>
              <ActionButton
                variant="primary"
                onClick={handleSaveProject}
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </ActionButton>
            </div>
          </Form>
        </CardBody>
      </ProjectCard>
    </PageContainer>
  );
};
