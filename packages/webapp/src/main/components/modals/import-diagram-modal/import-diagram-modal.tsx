import React, { ChangeEvent, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { ModalContentProps } from '../application-modal-types';
import { useImportDiagram } from '../../../services/import/useImportDiagram';
import { useBumlImport } from '../../../services/import/useBumlImport';

export const ImportDiagramModal: React.FC<ModalContentProps> = ({ close }) => {
  const [selectedFile, setSelectedFile] = useState<File | undefined>();
  const importDiagram = useImportDiagram();
  const importBuml = useBumlImport();

  const importHandler = () => {
    if (!selectedFile) return;

    const isJsonFile = selectedFile.name.toLowerCase().endsWith('.json');
    const isPythonFile = selectedFile.name.toLowerCase().endsWith('.py');

    if (!isJsonFile && !isPythonFile) {
      alert('Please select a .json or .py file');
      return;
    }

    if (isJsonFile) {
      new Promise((resolve: (value: string) => void, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const target: any = event.target;
          resolve(target.result);
        };
        reader.readAsText(selectedFile);
      }).then((content: string) => {
        importDiagram(content);
      });
    } else {
      importBuml(selectedFile);
    }
    close();
  };

  const fileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>Import Diagram</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-muted mb-3">
          You can import either:
          <br />• JSON files (.json) for BESSER Web Modeling Editor diagram
          <br />• Python files (.py) for BESSER B-UML
        </p>
        <Form.Control
          className="mt-3"
          id="file-input"
          placeholder={selectedFile?.name ?? 'Select a JSON or BUML file'}
          type="file"
          accept=".json,.py"
          onChange={fileUpload}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={close}>
          Close
        </Button>
        <Button variant="primary" onClick={importHandler} disabled={!selectedFile}>
          Import
        </Button>
      </Modal.Footer>
    </>
  );
};
