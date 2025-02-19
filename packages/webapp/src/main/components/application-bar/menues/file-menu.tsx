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
      toast.error('Export failed. Check console for details.');
    }
  };

  return (
    <NavDropdown id="file-menu-item" title="File" className="pt-0, pb-0">
      <NavDropdown.Item onClick={() => dispatch(showModal({ type: ModalContentType.CreateDiagramModal }))}>
        New
      </NavDropdown.Item>
      <NavDropdown.Item
        onClick={() => dispatch(showModal({ type: ModalContentType.CreateDiagramFromTemplateModal, size: 'lg' }))}
      >
        Start from Template
      </NavDropdown.Item>
      <NavDropdown.Item onClick={() => dispatch(showModal({ type: ModalContentType.LoadDiagramModal }))}>
        Load
      </NavDropdown.Item>
      <NavDropdown.Item onClick={() => dispatch(showModal({ type: ModalContentType.ImportDiagramModal }))}>
        Import
      </NavDropdown.Item>
      <Dropdown id="export-dropdown" drop="end">
        <Dropdown.Toggle
          id="dropdown-basic"
          split
          className="bg-transparent w-100 text-start ps-3 d-flex align-items-center"
        >
          <span className="flex-grow-1">Export</span>
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item onClick={() => exportDiagram('BUML')}>As BUML</Dropdown.Item>
          <Dropdown.Item onClick={() => exportDiagram('JSON')}>As JSON</Dropdown.Item>
          <Dropdown.Item onClick={() => exportDiagram('SVG')}>As SVG</Dropdown.Item>
          <Dropdown.Item onClick={() => exportDiagram('PNG_WHITE')}>As PNG (White Background)</Dropdown.Item>
          <Dropdown.Item onClick={() => exportDiagram('PNG')}>As PNG (Transparent Background)</Dropdown.Item>
          <Dropdown.Item onClick={() => exportDiagram('PDF')}>As PDF</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </NavDropdown>
  );
};
