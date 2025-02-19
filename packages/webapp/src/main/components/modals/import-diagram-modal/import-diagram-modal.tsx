import React, { ChangeEvent, useState } from 'react';
import { Button, Form, Modal, Tabs, Tab } from 'react-bootstrap';
import { ModalContentProps } from '../application-modal-types';
import { useImportDiagram } from '../../../services/import/useImportDiagram';
import { useBumlImport } from '../../../services/import/useBumlImport';

export const ImportDiagramModal: React.FC<ModalContentProps> = ({ close }) => {
  const [selectedFile, setSelectedFile] = useState<File | undefined>();
  const [activeTab, setActiveTab] = useState<string>('json');
  const importDiagram = useImportDiagram();
  const importBuml = useBumlImport();

  const importHandler = () => {
    if (!selectedFile) return;

    if (activeTab === 'json') {
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
        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'json')}>
          <Tab eventKey="json" title="JSON Import">
            <Form.Control
              className="mt-3"
              id="json-file"
              placeholder={selectedFile?.name ?? 'Select Apollon-Diagram.json file'}
              type="file"
              accept=".json"
              onChange={fileUpload}
            />
          </Tab>
          <Tab eventKey="buml" title="BUML Import">
            <Form.Control
              className="mt-3"
              id="buml-file"
              placeholder={selectedFile?.name ?? 'Select BUML file'}
              type="file"
              accept=".py"
              onChange={fileUpload}
            />
          </Tab>
        </Tabs>
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
