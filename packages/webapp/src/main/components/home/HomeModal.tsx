import React, { useState, useEffect } from 'react';
import { Button, Card, Modal } from 'react-bootstrap';
import { useAppDispatch } from '../store/hooks';
import { showModal } from '../../services/modal/modalSlice';
import { ModalContentType } from '../modals/application-modal-types';
import { 
  PlusCircle, 
  Upload, 
  Diagram3,
  Clock,
  Folder,
  Trash,
  ChevronDown,
  ChevronUp,
  X
} from 'react-bootstrap-icons';
import styled from 'styled-components';
import { 
  getLastProjectFromLocalStorage, 
  getAllProjectsFromLocalStorage, 
  BesserProject, 
  removeProjectFromLocalStorage,
  clearProjectContext,
  setProjectContext 
} from '../../utils/localStorage';
import { toast } from 'react-toastify';

interface HomeModalProps {
  show: boolean;
  onHide: () => void;
}

// Styled Components
const StyledModal = styled(Modal)`
  .modal-dialog {
    max-width: 75vw;
    width: 100%;
    margin: 1.5rem auto;
  }
  
  .modal-content {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    color: white;
  }
  
  /* Dark mode adaptation */
  [data-theme="dark"] & .modal-content {
    background: linear-gradient(135deg, #4a5eba 0%, #5a3b82 100%);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
  }
  
  .modal-body {
    padding: 0;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
`;

const WelcomeSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const LogoImage = styled.img`
  height: 40px;
  width: auto;
  filter: brightness(0) invert(1);
`;

const ModalTitle = styled.h2`
  color: white;
  margin: 0;
  font-weight: 700;
`;

const CloseButton = styled(Button)`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

const ContentContainer = styled.div`
  padding: 1.5rem;
  color: white;
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ActionCard = styled(Card)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
  height: 100%;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    background: rgba(255, 255, 255, 1);
  }
`;

const ActionIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 0.75rem;
  font-size: 1.3rem;
  color: white;
`;

const ActionTitle = styled.h4`
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #333;
  text-align: center;
`;

const ActionDescription = styled.p`
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.4;
  text-align: center;
  font-size: 0.9rem;
`;

const QuickStartButton = styled(Button)`
  width: 100%;
  padding: 10px;
  font-weight: 600;
  border-radius: 12px;
  border: none;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }
`;

const ProjectsSection = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 1.5rem;
  margin-top: 1.5rem;
`;

const ProjectCard = styled(Card)`
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }
`;

const ProjectInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ProjectDetails = styled.div`
  flex: 1;
`;

const ProjectName = styled.h6`
  font-weight: 700;
  color: #333;
  margin-bottom: 0.25rem;
`;

const ProjectMeta = styled.div`
  color: #666;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ToggleButton = styled(Button)`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  border-radius: 15px;
  padding: 8px 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

const AllProjectsList = styled.div`
  margin-top: 1rem;
  max-height: 200px;
  overflow-y: auto;
`;

export const HomeModal: React.FC<HomeModalProps> = ({ show, onHide }) => {
  const dispatch = useAppDispatch();
  const [recentProject, setRecentProject] = useState<BesserProject | null>(null);
  const [allProjects, setAllProjects] = useState<BesserProject[]>([]);
  const [showAllProjects, setShowAllProjects] = useState(false);

  useEffect(() => {
    if (show) {
      const project = getLastProjectFromLocalStorage();
      const projects = getAllProjectsFromLocalStorage();
      setRecentProject(project);
      setAllProjects(projects);
    }
  }, [show]);

  const handleCreateProject = () => {
    dispatch(showModal({ type: ModalContentType.CreateProjectModal }));
    onHide();
  };

  const handleImportProject = () => {
    dispatch(showModal({ type: ModalContentType.ImportProjectModal }));
    onHide();
  };

  const handleCreateDiagram = () => {
    // Clear project context since this is a standalone diagram
    clearProjectContext();
    dispatch(showModal({ type: ModalContentType.CreateDiagramModal }));
    onHide();
  };

  const handleOpenSpecificProject = (project: BesserProject) => {
    // Set project context
    setProjectContext(project.id);
    localStorage.setItem('besser_latest_project', project.id);
    onHide();
    // Refresh the editor
    window.location.reload();
  };

  const handleDeleteSpecificProject = async (project: BesserProject, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the project "${project.name}"? This action cannot be undone.`
    );
    
    if (confirmDelete) {
      try {
        if (project.models) {
          project.models.forEach(diagramId => {
            localStorage.removeItem(`besser_diagram_${diagramId}`);
          });
        }
        
        removeProjectFromLocalStorage(project.id);
        
        const updatedProjects = getAllProjectsFromLocalStorage();
        setAllProjects(updatedProjects);
        
        if (recentProject?.id === project.id) {
          setRecentProject(updatedProjects.length > 0 ? updatedProjects[0] : null);
        }
        
        toast.success('Project deleted successfully!');
      } catch (error) {
        console.error('Error deleting project:', error);
        toast.error('Failed to delete project');
      }
    }
  };

  return (
    <StyledModal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Body>
        <ModalHeader>
          <WelcomeSection>
            <LogoImage src="images/logo.png" alt="BESSER Logo" />
            <ModalTitle>Welcome to BESSER</ModalTitle>
          </WelcomeSection>
          <CloseButton onClick={onHide}>
            <X size={18} />
          </CloseButton>
        </ModalHeader>
        
        <ContentContainer>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '1rem', opacity: 0.9, maxWidth: '500px', margin: '0 auto' }}>
              Transform your ideas into reality with our comprehensive low-code platform for UML modeling.
            </p>
          </div>

          <ActionGrid>
            <ActionCard onClick={handleCreateProject}>
              <ActionIcon style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                <PlusCircle />
              </ActionIcon>
              <ActionTitle>Create Project</ActionTitle>
              <ActionDescription>
                Start a new project with multiple UML diagrams
              </ActionDescription>
              <QuickStartButton variant="primary">
                Get Started
              </QuickStartButton>
            </ActionCard>

            <ActionCard onClick={handleImportProject}>
              <ActionIcon style={{ background: 'linear-gradient(135deg, #28a745, #20c997)' }}>
                <Upload />
              </ActionIcon>
              <ActionTitle>Import Project</ActionTitle>
              <ActionDescription>
                Import existing projects or diagrams
              </ActionDescription>
              <QuickStartButton variant="success">
                Import Now
              </QuickStartButton>
            </ActionCard>

            <ActionCard onClick={handleCreateDiagram}>
              <ActionIcon style={{ background: 'linear-gradient(135deg, #fd7e14, #e83e8c)' }}>
                <Diagram3 />
              </ActionIcon>
              <ActionTitle>Quick Diagram</ActionTitle>
              <ActionDescription>
                Create a single diagram quickly
              </ActionDescription>
              <QuickStartButton variant="warning">
                Start Modeling
              </QuickStartButton>
            </ActionCard>
          </ActionGrid>

          {(recentProject || allProjects.length > 0) && (
            <ProjectsSection>
              <h4 style={{ color: 'white', marginBottom: '1.25rem', textAlign: 'center' }}>
                Your Projects
              </h4>
              
              {recentProject && (
                <div style={{ marginBottom: '1rem' }}>
                  <h6 style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '0.5rem' }}>Recent Project:</h6>
                  <ProjectCard onClick={() => handleOpenSpecificProject(recentProject)}>
                    <ProjectInfo>
                      <ProjectDetails>
                        <ProjectName>{recentProject.name}</ProjectName>
                        <ProjectMeta>
                          <span>
                            <Clock size={12} style={{ marginRight: '0.25rem' }} />
                            {new Date(recentProject.createdAt).toLocaleDateString()}
                          </span>
                          <span>
                            <Folder size={12} style={{ marginRight: '0.25rem' }} />
                            {recentProject.models?.length || 0} diagrams
                          </span>
                        </ProjectMeta>
                      </ProjectDetails>
                      <div>
                        <Button variant="outline-primary" size="sm">
                          Open
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm" 
                          className="ms-2"
                          onClick={(e) => handleDeleteSpecificProject(recentProject, e)}
                        >
                          <Trash size={12} />
                        </Button>
                      </div>
                    </ProjectInfo>
                  </ProjectCard>
                </div>
              )}

              {allProjects.filter(p => p.id !== recentProject?.id).length > 0 && (
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <ToggleButton 
                    onClick={() => setShowAllProjects(!showAllProjects)}
                    className="d-flex align-items-center justify-content-center"
                  >
                    {showAllProjects ? (
                      <>
                        <ChevronUp className="me-1" size={14} />
                        Hide Others
                      </>
                    ) : (
                      <>
                        <ChevronDown className="me-1" size={14} />
                        Show All ({allProjects.filter(p => p.id !== recentProject?.id).length})
                      </>
                    )}
                  </ToggleButton>

                  {showAllProjects && (
                    <AllProjectsList>
                      {allProjects
                        .filter(project => project.id !== recentProject?.id)
                        .map(project => (
                          <ProjectCard 
                            key={project.id} 
                            onClick={() => handleOpenSpecificProject(project)}
                          >
                            <ProjectInfo>
                              <ProjectDetails>
                                <ProjectName>{project.name}</ProjectName>
                                <ProjectMeta>
                                  <span>
                                    <Clock size={12} style={{ marginRight: '0.25rem' }} />
                                    {new Date(project.createdAt).toLocaleDateString()}
                                  </span>
                                  <span>
                                    <Folder size={12} style={{ marginRight: '0.25rem' }} />
                                    {project.models?.length || 0} diagrams
                                  </span>
                                </ProjectMeta>
                              </ProjectDetails>
                              <div>
                                <Button variant="outline-primary" size="sm">
                                  Open
                                </Button>
                                <Button 
                                  variant="outline-danger" 
                                  size="sm" 
                                  className="ms-2"
                                  onClick={(e) => handleDeleteSpecificProject(project, e)}
                                >
                                  <Trash size={12} />
                                </Button>
                              </div>
                            </ProjectInfo>
                          </ProjectCard>
                        ))
                      }
                    </AllProjectsList>
                  )}
                </div>
              )}
            </ProjectsSection>
          )}
        </ContentContainer>
      </Modal.Body>
    </StyledModal>
  );
};
