import React, { ChangeEvent, useEffect, useState } from 'react';
import { Nav, Navbar } from 'react-bootstrap';
import { FileMenu } from './menues/file-menu';
import { HelpMenu } from './menues/help-menu';
import { ThemeSwitcherMenu } from './menues/theme-switcher-menu';
import styled from 'styled-components';
import { appVersion } from '../../application-constants';
import { APPLICATION_SERVER_VERSION } from '../../constant';
import { ModalContentType } from '../modals/application-modal-types';
import { ConnectClientsComponent } from './connected-clients-component';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateDiagramThunk } from '../../services/diagram/diagramSlice';
import { showModal } from '../../services/modal/modalSlice';
import { LayoutTextSidebarReverse } from 'react-bootstrap-icons';
import { selectDisplaySidebar, toggleSidebar } from '../../services/version-management/versionManagementSlice';
import { DiagramTypeSelector } from './menues/DiagramTypeSelector';
import { GenerateCodeMenu } from './menues/generate-code-menu';
import { checkOclConstraints } from '../../services/validation/checkOCL';
import { UMLDiagramType } from '@besser/wme';

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

  return (
    <MainContent $isSidebarOpen={isSidebarOpen}>
      <Navbar className="navbar" variant="dark" expand="lg">
        <Navbar.Brand href="https://besser-pearl.org" target="_blank" rel="noopener noreferrer">
          <img alt="" src="images/logo.png" width="124" height="33" className="d-inline-block align-top" />{' '}
          {/* <span className="fw-bold ms-2">BESSER</span> */}
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
                    <Nav.Link onClick={handleOclCheck}>Diagram Verification</Nav.Link>
                  </Nav.Item>
                )}
              </>
            )}
            {APPLICATION_SERVER_VERSION && (
              <Nav.Item>
                <Nav.Link onClick={handleOpenModal}>Share</Nav.Link>
              </Nav.Item>
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
        {!tokenInUrl && (
          <Nav.Item
            onClick={() => {
              dispatch(toggleSidebar());
            }}
          >
            <div className="sidebar-toggle me-lg-4">
              <LayoutTextSidebarReverse size={20} color="#AEB1B5" />
            </div>
          </Nav.Item>
        )}
        {tokenInUrl && <ConnectClientsComponent />}
        <ThemeSwitcherMenu />
      </Navbar>
    </MainContent>
  );
};
