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
  removeProjectFromLocalStorage
} from '../../utils/localStorage';
import { BesserProject } from '../../types/project';
import { ProjectStorageRepository } from '../../services/storage/ProjectStorageRepository';
import { toast } from 'react-toastify';
import { useProject } from '../../hooks/useProject';
import { loadDiagram } from '../../services/diagram/diagramSlice';

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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
    color: white;
  }
  
  &:focus {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
    color: white;
    box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.25);
  }
`;

const AllProjectsList = styled.div`
  margin-top: 1rem;
  max-height: 200px;
  overflow-y: auto;
  text-align: left;
`;

export const HomeModal: React.FC<HomeModalProps> = ({ show, onHide }) => {
  const dispatch = useAppDispatch();
  const { loadProject, currentProject } = useProject();
  const [allProjects, setAllProjects] = useState<Array<Pick<BesserProject, 'id' | 'name' | 'description' | 'owner' | 'createdAt'>>>([]);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [deletedCurrentProjectId, setDeletedCurrentProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (show) {
      const projects = ProjectStorageRepository.getAllProjects();
      setAllProjects(projects);
      
      // Si il n'y a pas de projet actuel mais qu'il y a des projets, afficher automatiquement la liste
      if (!currentProject && projects.length > 0) {
        setShowAllProjects(true);
      }
    }
  }, [show, currentProject]);

  const handleCreateProject = () => {
    dispatch(showModal({ type: ModalContentType.CreateProjectModal }));
  };

  const handleImportProject = () => {
    dispatch(showModal({ type: ModalContentType.ImportProjectModal }));
  };

  const handleOpenSpecificProject = async (projectMeta: Pick<BesserProject, 'id' | 'name' | 'description' | 'owner' | 'createdAt'>) => {
    try {
      // Load the full project using the project system
      const loadedProject = await loadProject(projectMeta.id);
      
      // Load the current diagram into the editor
      const currentDiagram = loadedProject.diagrams[loadedProject.currentDiagramType];
      if (currentDiagram?.model) {
        // Convert to legacy Diagram format for compatibility with current editor
        const legacyDiagram = {
          id: currentDiagram.id,
          title: currentDiagram.title,
          model: currentDiagram.model,
          lastUpdate: currentDiagram.lastUpdate,
          description: currentDiagram.description,
        };
        dispatch(loadDiagram(legacyDiagram));
      }
      
      // Close the modal and show success message
      onHide();
      toast.success(`Project "${projectMeta.name}" loaded successfully!`);
      
    } catch (error) {
      console.error('Error loading project:', error);
      toast.error(`Failed to load project "${projectMeta.name}". Please try again.`);
    }
  };

  const handleDeleteSpecificProject = async (project: Pick<BesserProject, 'id' | 'name' | 'description' | 'owner' | 'createdAt'>, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the project "${project.name}"? This action cannot be undone.`
    );
    
    if (confirmDelete) {
      try {
        ProjectStorageRepository.deleteProject(project.id);
        
        const updatedProjects = ProjectStorageRepository.getAllProjects();
        setAllProjects(updatedProjects);
        
        // If the deleted project is the current one, mark it as deleted
        if (currentProject && currentProject.id === project.id) {
          setDeletedCurrentProjectId(project.id);
        }
        
        toast.success('Project deleted successfully!');
      } catch (error) {
        console.error('Error deleting project:', error);
        toast.error('Failed to delete project');
      }
    }
  };

  return (
    <StyledModal 
      show={show} 
      onHide={currentProject ? onHide : () => {}} 
      centered 
      backdrop={currentProject ? true : "static"}
      keyboard={currentProject ? true : false}
    >
      <Modal.Body>
        <ModalHeader>
          <WelcomeSection>
            <LogoImage src="images/logo.png" alt="BESSER Logo" />
            <ModalTitle>Welcome to BESSER</ModalTitle>
          </WelcomeSection>
          {/* Afficher le bouton fermer seulement s'il y a un projet actuel */}
          {currentProject && (
            <CloseButton onClick={onHide}>
              <X size={18} />
            </CloseButton>
          )}
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

            {/* Quick Diagram option removed as we focus on project-based workflow */}
            {/* 
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
            */}
          </ActionGrid>

          {((currentProject && currentProject.id !== deletedCurrentProjectId) || allProjects.length > 0) && (
            <ProjectsSection>
              <h4 style={{ color: 'white', marginBottom: '1.25rem', textAlign: 'center' }}>
                Your Projects
              </h4>
              
              {currentProject && currentProject.id !== deletedCurrentProjectId && (
                <div style={{ marginBottom: '1rem' }}>
                  <h6 style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '0.5rem' }}>Current Project:</h6>
                  <ProjectCard onClick={() => handleOpenSpecificProject(currentProject)}>
                    <ProjectInfo>
                      <ProjectDetails>
                        <ProjectName>{currentProject.name}</ProjectName>
                        <ProjectMeta>
                          <span>
                            <Clock size={12} style={{ marginRight: '0.25rem' }} />
                            {new Date(currentProject.createdAt).toLocaleDateString()}
                          </span>
                          <span>
                            <Folder size={12} style={{ marginRight: '0.25rem' }} />
                            {Object.keys(currentProject.diagrams).length} diagrams
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
                          onClick={(e) => handleDeleteSpecificProject(currentProject, e)}
                        >
                          <Trash size={12} />
                        </Button>
                      </div>
                    </ProjectInfo>
                  </ProjectCard>
                </div>
              )}

              {/* Si pas de projet actuel, montrer le dernier projet créé en haut */}
              {!currentProject && allProjects.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <h6 style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '0.5rem' }}>Recent Project:</h6>
                  <ProjectCard onClick={() => handleOpenSpecificProject(allProjects[allProjects.length - 1])}>
                    <ProjectInfo>
                      <ProjectDetails>
                        <ProjectName>{allProjects[allProjects.length - 1].name}</ProjectName>
                        <ProjectMeta>
                          <span>
                            <Clock size={12} style={{ marginRight: '0.25rem' }} />
                            {new Date(allProjects[allProjects.length - 1].createdAt).toLocaleDateString()}
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
                          onClick={(e) => handleDeleteSpecificProject(allProjects[allProjects.length - 1], e)}
                        >
                          <Trash size={12} />
                        </Button>
                      </div>
                    </ProjectInfo>
                  </ProjectCard>
                </div>
              )}

              {/* Afficher les autres projets seulement s'il y en a plus d'un */}
              {((currentProject && allProjects.filter(p => p.id !== currentProject?.id).length > 0) || 
                (!currentProject && allProjects.length > 1)) && (
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <ToggleButton 
                    onClick={() => setShowAllProjects(!showAllProjects)}
                  >
                    {showAllProjects ? (
                      <>
                        <ChevronUp size={14} />
                        Hide Others
                      </>
                    ) : (
                      <>
                        <ChevronDown size={14} />
                        Show All ({currentProject ? 
                          allProjects.filter(p => p.id !== currentProject?.id).length :
                          allProjects.length - 1
                        })
                      </>
                    )}
                  </ToggleButton>

                  {showAllProjects && (
                    <AllProjectsList>
                      {allProjects
                        .filter(project => currentProject ? 
                          project.id !== currentProject?.id : 
                          project.id !== allProjects[allProjects.length - 1].id
                        )
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
