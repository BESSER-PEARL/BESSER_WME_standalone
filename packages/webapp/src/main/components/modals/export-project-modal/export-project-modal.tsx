import React, { useContext } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { ModalContentProps } from '../application-modal-types';
import { useExportPNG } from '../../../services/export/useExportPng';
import { useExportSVG } from '../../../services/export/useExportSvg';
import { useAppSelector } from '../../store/hooks';
import { toast } from 'react-toastify';
import { ApollonEditorContext } from '../../apollon-editor-component/apollon-editor-context';
import { exportProjectAsBUMLZip } from '../../../services/export/useExportProjectBUML';
import { getLastProjectFromLocalStorage } from '../../project/ProjectSettingsScreen';
import { exportProjectById } from '../../../services/export/useExportProjectJSON';

const exportFormats = [
  { label: 'JSON', value: 'JSON' },
  { label: 'B-UML', value: 'BUML' },
  { label: 'SVG', value: 'SVG' },
  { label: 'PNG (White Background)', value: 'PNG_WHITE' },
  { label: 'PNG (Transparent Background)', value: 'PNG' },
];

export const ExportProjectModal: React.FC<ModalContentProps> = ({ close }) => {
  const apollonEditor = useContext(ApollonEditorContext);
  const editor = apollonEditor?.editor;
  const diagram = useAppSelector((state) => state.diagram.diagram);

  const exportAsSVG = useExportSVG();
  const exportAsPNG = useExportPNG();

  const handleExport = async (format: string) => {
    if (!editor || !diagram?.title) {
      toast.error('No diagram available to export');
      return;
    }
    const currentProject = getLastProjectFromLocalStorage();
    if (!currentProject) {
      toast.error('No project available to export as BUML');
      return;
    }
    try {
      switch (format) {
        case 'SVG':
          await exportAsSVG(editor, diagram.title);
          break;
        case 'PNG_WHITE':
          await exportAsPNG(editor, diagram.title, true);
          break;
        case 'PNG':
          await exportAsPNG(editor, diagram.title, false);
          break;
        case 'JSON':
          await exportProjectById(currentProject);
          break;
        case 'BUML':
          await exportProjectAsBUMLZip(currentProject);
          break;
        default:
          toast.error('Unknown export format.');
          return;
      }
      close();
    } catch (error) {
      toast.error('Export failed.');
    }
  };

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>Export Project</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {exportFormats.map((fmt) => (
          <Button
            key={fmt.value}
            className="mb-2 w-100 text-start export-btn"
            variant="outline-primary"
            onClick={() => handleExport(fmt.value)}
          >
            {fmt.label}
          </Button>
        ))}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={close}>
          Close
        </Button>
      </Modal.Footer>
    </>
  );
};
