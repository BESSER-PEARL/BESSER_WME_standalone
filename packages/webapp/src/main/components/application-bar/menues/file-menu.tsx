import React, { useContext } from 'react';
import { Dropdown, NavDropdown } from 'react-bootstrap';
import { ApollonEditorContext } from '../../apollon-editor-component/apollon-editor-context';
import { ModalContentType } from '../../modals/application-modal-types';

import { useAppDispatch, useAppSelector } from '../../store/hooks';

import { showModal } from '../../../services/modal/modalSlice';
import { useExportJSON } from '../../../services/export/useExportJson';
import { useExportPDF } from '../../../services/export/useExportPdf';
import { useExportPNG } from '../../../services/export/useExportPng';
import { useExportSVG } from '../../../services/export/useExportSvg';
import { useExportBUML } from '../../../services/export/useExportBuml';
import { toast } from 'react-toastify';
import { importProject } from '../../../services/import/useImportProject';

export const FileMenu: React.FC = () => {
  const apollonEditor = useContext(ApollonEditorContext);
  const dispatch = useAppDispatch();
  const editor = apollonEditor?.editor;
  const diagram = useAppSelector((state) => state.diagram.diagram);
  const exportAsSVG = useExportSVG();
  const exportAsPNG = useExportPNG();
  const exportAsPDF = useExportPDF();
  const exportAsJSON = useExportJSON();
  const exportAsBUML = useExportBUML();

  const exportDiagram = async (exportType: 'PNG' | 'PNG_WHITE' | 'SVG' | 'JSON' | 'PDF' | 'BUML'): Promise<void> => {
    if (!editor || !diagram?.title) {
      toast.error('No diagram available to export');
      return;
    }

    try {
      switch (exportType) {
        case 'SVG':
          await exportAsSVG(editor, diagram.title);
          break;
        case 'PNG_WHITE':
          await exportAsPNG(editor, diagram.title, true);
          break;
        case 'PNG':
          await exportAsPNG(editor, diagram.title, false);
          break;
        case 'PDF':
          await exportAsPDF(editor, diagram.title);
          break;
        case 'JSON':
          await exportAsJSON(editor, diagram);
          break;
        case 'BUML':
          await exportAsBUML(editor, diagram.title);
          break;
      }
    } catch (error) {
      console.error('Error in exportDiagram:', error);
      // toast.error('Export failed. Check console for details.');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to export as BUML: ${errorMessage}`);
    }
  };

  // Placeholder handlers for project actions
  const handleNewProject = () => dispatch(showModal({ type: ModalContentType.CreateProjectModal }));
  const handleImportProject = () => dispatch(showModal({ type: ModalContentType.ImportProjectModal }));
  // const handleLoadProject = () => {
  //   // Open the Home modal to let users select from existing projects
  //   if (onOpenHome) {
  //     onOpenHome();
  //   }
  // };
  const handleLoadTemplate = () => dispatch(showModal({ type: ModalContentType.CreateDiagramFromTemplateModal }));
  const handleExportProject = () => dispatch(showModal({ type: ModalContentType.ExportProjectModal }));

  return (
    <NavDropdown id="file-menu-item" title="File" className="pt-0 pb-0">
      {/* New */}
      <NavDropdown.Item onClick={handleNewProject}>
        New Project
      </NavDropdown.Item>

      {/* Import */}
      <NavDropdown.Item onClick={handleImportProject}>
        Import Project
      </NavDropdown.Item>

      {/* Load */}
      {/* <NavDropdown.Item onClick={handleLoadProject}>
        Load Project
      </NavDropdown.Item> */}

      {/* <NavDropdown.Divider /> */}

      {/* Load Template */}
      <NavDropdown.Item onClick={handleLoadTemplate}>
        Load Template
      </NavDropdown.Item>

      {/* <NavDropdown.Divider /> */}

      {/* Export */}
      <NavDropdown.Item onClick={handleExportProject}>
        Export Project
      </NavDropdown.Item>

    </NavDropdown>
  );
};
