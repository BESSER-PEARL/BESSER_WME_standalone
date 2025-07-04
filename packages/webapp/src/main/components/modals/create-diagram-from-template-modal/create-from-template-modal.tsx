import React, { useState } from 'react';
import { Button, Col, FormControl, InputGroup, Modal, Nav, Row, Tab } from 'react-bootstrap';
import { Template, TemplateCategory } from './template-types';
import { SoftwarePatternType } from './software-pattern/software-pattern-types';
import { CreateFromSoftwarePatternModalTab } from './software-pattern/create-from-software-pattern-modal-tab';
import { TemplateFactory } from './template-factory';
import { ModalContentProps } from '../application-modal-types';
import { useProject } from '../../../hooks/useProject';
import { useNavigate } from 'react-router-dom';
import { toSupportedDiagramType } from '../../../types/project';
import { useAppDispatch } from '../../store/hooks';
import { setCreateNewEditor, loadDiagram, changeDiagramType } from '../../../services/diagram/diagramSlice';
import { uuid } from '../../../utils/uuid';

export const CreateFromTemplateModal: React.FC<ModalContentProps> = ({ close }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(
    TemplateFactory.createSoftwarePattern(SoftwarePatternType.LIBRARY),
  );
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState<TemplateCategory>(
    TemplateCategory.SOFTWARE_PATTERN,
  );

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentProject, switchDiagramType, updateCurrentDiagram } = useProject();

  const selectTemplateCategory = (templateCategory: TemplateCategory) => {
    setSelectedTemplateCategory(templateCategory);
  };

  const selectTemplate = (template: Template) => {
    setSelectedTemplate(template);
  };

  const loadTemplate = async () => {
    try {
      if (!currentProject) {
        console.error('No current project - cannot load template');
        return;
      }

      const templateDiagramType = selectedTemplate.diagramType;
      const templateModel = selectedTemplate.diagram;

      if (!templateModel) {
        console.error('Template has no diagram model');
        return;
      }

      console.log('Loading template into current project:', {
        templateType: selectedTemplate.type,
        templateDiagramType,
        currentProjectName: currentProject.name,
        currentDiagramType: currentProject.currentDiagramType
      });

      // Check if we need to switch diagram type
      const targetSupportedType = toSupportedDiagramType(templateDiagramType);
      const needsTypeSwitch = currentProject.currentDiagramType !== targetSupportedType;

      if (needsTypeSwitch) {
        console.log('Switching diagram type from', currentProject.currentDiagramType, 'to', targetSupportedType);
        await switchDiagramType(templateDiagramType);
        console.log('Diagram type switch completed');
      }

      // Update the diagram with the template
      console.log('Updating diagram with template model');
      await updateCurrentDiagram(templateModel);
      console.log('Template loaded successfully');

      // Prepare diagram for editor reload
      const newDiagramId = uuid();
      const compatibleDiagram = {
        id: newDiagramId,
        title: currentProject.diagrams[targetSupportedType].title,
        model: templateModel,
        lastUpdate: new Date().toISOString(),
      };
      
      // Close modal and navigate
      close();
      navigate('/');
      
      // Force editor reload with quick diagram type switch
      setTimeout(() => {
        // Switch to different type temporarily to force reload
        const tempType = templateDiagramType === 'ClassDiagram' ? 'ObjectDiagram' : 'ClassDiagram';
        dispatch(changeDiagramType(tempType));
        dispatch(setCreateNewEditor(true));
        
        // Switch back to correct type with template
        setTimeout(() => {
          dispatch(changeDiagramType(templateDiagramType));
          dispatch(loadDiagram(compatibleDiagram));
          dispatch(setCreateNewEditor(true));
        }, 100);
      }, 100);
      
    } catch (error) {
      console.error('Error loading template:', error);
    }
  };

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>
          Load Diagram Template
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tab.Container id="left-tabs-example" defaultActiveKey={selectedTemplateCategory}>
          <Row>
            {/* <Col sm={3} className="border-end border-secondary">
              <Nav variant="pills" className="flex-column">
                <Nav.Item>
                  <Nav.Link
                    className="text-nowrap"
                    eventKey={TemplateCategory.SOFTWARE_PATTERN}
                    onSelect={(templateCategory) =>
                      selectTemplateCategory(templateCategory as unknown as TemplateCategory)
                    }
                  >
                    {TemplateCategory.SOFTWARE_PATTERN}
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Col> */}
            <Col sm={15}>
              {/* <label htmlFor="selected-template">Selected Template</label> */}
              {/* <InputGroup className="mb-3">
                <FormControl id="selected-template" value={selectedTemplate.type} disabled />
              </InputGroup> */}
              <Tab.Content>
                <Tab.Pane eventKey={TemplateCategory.SOFTWARE_PATTERN}>
                  <CreateFromSoftwarePatternModalTab
                    selectedTemplate={selectedTemplate}
                    selectTemplate={selectTemplate}
                  />
                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={close}>
          Close
        </Button>
        <Button variant="primary" onClick={loadTemplate} disabled={!selectedTemplate}>
          Load Template
        </Button>
      </Modal.Footer>
    </>
  );
};
