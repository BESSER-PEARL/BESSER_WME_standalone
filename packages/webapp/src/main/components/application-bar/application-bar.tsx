import React, { ChangeEvent, useEffect, useState } from 'react';
import { Nav, Navbar } from 'react-bootstrap';
import { FileMenu } from './menues/file-menu';
import { HelpMenu } from './menues/help-menu';
import { ThemeSwitcherMenu } from './menues/theme-switcher-menu';
import styled from 'styled-components';
import { appVersion } from '../../application-constants';
import { APPLICATION_SERVER_VERSION, DEPLOYMENT_URL } from '../../constant';
import { ModalContentType } from '../modals/application-modal-types';
import { ConnectClientsComponent } from './connected-clients-component';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setCreateNewEditor, setDisplayUnpublishedVersion, updateDiagramThunk } from '../../services/diagram/diagramSlice';
import { showModal } from '../../services/modal/modalSlice';
import { LayoutTextSidebarReverse, Github, Share } from 'react-bootstrap-icons';
import { selectDisplaySidebar, toggleSidebar } from '../../services/version-management/versionManagementSlice';
import { DiagramTypeSelector } from './menues/DiagramTypeSelector';
import { GenerateCodeMenu } from './menues/generate-code-menu';
import { checkOclConstraints } from '../../services/validation/checkOCL';
import { UMLDiagramType } from '@besser/wme';
import { DiagramRepository } from '../../services/diagram/diagram-repository';
import { displayError } from '../../services/error-management/errorManagementSlice';
import { DiagramView } from 'shared';
import { LocalStorageRepository } from '../../services/local-storage/local-storage-repository';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const DiagramTitle = styled.input`
  font-size: x-large;
  font-weight: bold;
  color: #fff;
  background-color: transparent;
  border: none;
`;

const ApplicationVersion = styled.span`
  font-size: small;
  color: #ccc;
  margin-right: 10px;
`;

const MainContent = styled.div<{ $isSidebarOpen: boolean }>`
  transition: margin-right 0.3s ease;
  margin-right: ${(props) => (props.$isSidebarOpen ? '250px' : '0')}; /* Adjust based on sidebar width */
`;

export const ApplicationBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { diagram } = useAppSelector((state) => state.diagram);
  const [diagramTitle, setDiagramTitle] = useState<string>(diagram?.title || '');
  const isSidebarOpen = useAppSelector(selectDisplaySidebar);
  const urlPath = window.location.pathname;
  const tokenInUrl = urlPath.substring(1); // This removes the leading "/"
  const currentType = useAppSelector((state) => state.diagram.editorOptions.type);
  const navigate = useNavigate();

  useEffect(() => {
    if (diagram?.title) {
      setDiagramTitle(diagram.title);
    }
  }, [diagram?.title]);

  const changeDiagramTitlePreview = (event: ChangeEvent<HTMLInputElement>) => {
    setDiagramTitle(event.target.value);
  };

  const changeDiagramTitleApplicationState = () => {
    if (diagram) {
      dispatch(updateDiagramThunk({ title: diagramTitle }));
    }
  };

  const handleOpenModal = () => {
    dispatch(showModal({ type: ModalContentType.ShareModal, size: 'lg' }));
  };

  const handleOclCheck = async () => {
    if (diagram) {
      await checkOclConstraints(diagram);
    }
  };

  const openGitHubRepo = () => {
    window.open('https://github.com/BESSER-PEARL/BESSER', '_blank');
  };

  const handleQuickShare = async () => {
    if (!diagram || !diagram.model || Object.keys(diagram.model.elements).length === 0) {
      dispatch(
        displayError(
          'Sharing diagram failed',
          'You are trying to share an empty diagram. Please insert at least one element to the canvas before sharing.',
        ),
      );
      return;
    }

    let token = diagram.token;
    const diagramCopy = Object.assign({}, diagram);
    diagramCopy.title = 'New shared version ';
    diagramCopy.description = 'Your auto-generated version for sharing';

    try {
      const res = await DiagramRepository.publishDiagramVersionOnServer(diagramCopy, diagram.token);
      dispatch(updateDiagramThunk(res.diagram));
      dispatch(setCreateNewEditor(true));
      dispatch(setDisplayUnpublishedVersion(false));
      token = res.diagramToken;
      
      // Set collaborate view as the published type
      LocalStorageRepository.setLastPublishedType(DiagramView.COLLABORATE);
      LocalStorageRepository.setLastPublishedToken(token);
      
      // Generate and copy the link
      const link = `${DEPLOYMENT_URL}/${token}?view=${DiagramView.COLLABORATE}`;
      try {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(link);
        } else {
          const textArea = document.createElement('textarea');
          textArea.value = link;
          document.body.appendChild(textArea);
          textArea.select();
          try {
            document.execCommand('copy');
          } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
          }
          document.body.removeChild(textArea);
        }
        
        toast.success(
          'The collaboration link has been copied to your clipboard and can be shared by pasting the link.',
          {
            autoClose: 10000,
          },
        );
        
        // Close sidebar if it's open
        if (isSidebarOpen) {
          dispatch(toggleSidebar());
        }
        
        // Navigate to the collaboration view
        navigate(`/${token}?view=${DiagramView.COLLABORATE}`);
      } catch (err) {
        console.error('Failed to copy text: ', err);
        toast.error('Failed to copy to clipboard. Please try again.');
      }
    } catch (error) {
      dispatch(
        displayError('Connection failed', 'Connection to the server failed. Please try again or report a problem.'),
      );
      console.error(error);
    }
  };

  return (
    <MainContent $isSidebarOpen={isSidebarOpen}>
      <Navbar className="navbar" variant="dark" expand="lg">
        <Navbar.Brand href="https://besser-pearl.org" target="_blank" rel="noopener noreferrer">
          <img alt="" src="images/logo.png" width="124" height="33" className="d-inline-block align-top" />{' '}
        </Navbar.Brand>
        <ApplicationVersion>{appVersion}</ApplicationVersion>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <FileMenu />
            <DiagramTypeSelector />
            {currentType === UMLDiagramType.ClassDiagram && (
              <>
                <GenerateCodeMenu />
                {APPLICATION_SERVER_VERSION && (
                  <Nav.Item>
                    <Nav.Link onClick={handleOclCheck}>Quality Check</Nav.Link>
                  </Nav.Item>
                )}
              </>
            )}
            {APPLICATION_SERVER_VERSION && (
              <>
                {/* <Nav.Item>
                  <Nav.Link onClick={handleOpenModal}>Share</Nav.Link>
                </Nav.Item> */}
                <Nav.Item>
                  <Nav.Link onClick={handleQuickShare} title="Store and share your diagram into the database">
                    Save & Share
                  </Nav.Link>
                </Nav.Item>
              </>
            )}
            <HelpMenu />
            <DiagramTitle
              type="text"
              value={diagramTitle}
              onChange={changeDiagramTitlePreview}
              onBlur={changeDiagramTitleApplicationState}
            />
          </Nav>
        </Navbar.Collapse>
        <Nav.Item className="me-3">
          <Nav.Link onClick={openGitHubRepo} title="View on GitHub">
            <Github size={20} color="#FFF" />
          </Nav.Link>
        </Nav.Item>
        {tokenInUrl && <ConnectClientsComponent />}
        <ThemeSwitcherMenu />
      </Navbar>
    </MainContent>
  );
};
