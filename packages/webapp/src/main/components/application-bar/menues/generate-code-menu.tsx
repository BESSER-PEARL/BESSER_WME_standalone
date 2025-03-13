import React, { useContext, useState } from 'react';
import { Dropdown, NavDropdown, Modal, Form, Button } from 'react-bootstrap';
import { ApollonEditorContext } from '../../apollon-editor-component/apollon-editor-context';
import { useGenerateCode, DjangoConfig, SQLConfig } from '../../../services/generate-code/useGenerateCode';
import { useAppSelector } from '../../store/hooks';
import { toast } from 'react-toastify';

export const GenerateCodeMenu: React.FC = () => {
  const [showDjangoConfig, setShowDjangoConfig] = useState(false);
  const [showSqlConfig, setShowSqlConfig] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [appName, setAppName] = useState('');
  const [useDocker, setUseDocker] = useState(false);
  const [sqlDialect, setSqlDialect] = useState<'standard' | 'postgresql' | 'mysql'>('standard');

  const apollonEditor = useContext(ApollonEditorContext);
  const generateCode = useGenerateCode();
  const diagram = useAppSelector((state) => state.diagram.diagram);
  const editor = apollonEditor?.editor;

  const handleGenerateCode = async (generatorType: string) => {
    if (!editor || !diagram?.title) {
      toast.error('No diagram available to generate code from');
      return;
    }

    if (generatorType === 'django') {
      setShowDjangoConfig(true);
      return;
    }

    if (generatorType === 'sql') {
      setShowSqlConfig(true);
      return;
    }

    try {
      await generateCode(editor, generatorType, diagram.title);
    } catch (error) {
      console.error('Error in code generation:', error);
      toast.error('Code generation failed. Check console for details.');
    }
  };

  const validateDjangoName = (name: string): boolean => {
    // Django project/app name requirements:
    // - Can't start with a number
    // - Can only contain letters, numbers, and underscores
    const pattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    return pattern.test(name);
  };

  const handleDjangoGenerate = async () => {
    if (!projectName || !appName) {
      toast.error('Project and app names are required');
      return;
    }

    if (projectName === appName) {
      toast.error('Project and app names must be different');
      return;
    }

    if (!validateDjangoName(projectName) || !validateDjangoName(appName)) {
      toast.error('Names must start with a letter/underscore and contain only letters, numbers, and underscores');
      return;
    }

    try {
      const djangoConfig: DjangoConfig = {
        project_name: projectName,
        app_name: appName,
        containerization: useDocker
      };
      await generateCode(editor!, 'django', diagram.title, djangoConfig);
      setShowDjangoConfig(false);
    } catch (error) {
      console.error('Error in Django code generation:', error);
      toast.error('Django code generation failed');
    }
  };

  const handleSqlGenerate = async () => {
    try {
      const sqlConfig: SQLConfig = {
        dialect: sqlDialect
      };
      await generateCode(editor!, 'sql', diagram.title, sqlConfig);
      setShowSqlConfig(false);
    } catch (error) {
      console.error('Error in SQL code generation:', error);
      toast.error('SQL code generation failed');
    }
  };

  return (
    <>
      <NavDropdown title="Generate Code" className="pt-0 pb-0">
        <Dropdown drop="end">
          <Dropdown.Toggle
            id="dropdown-basic"
            split
            className="bg-transparent w-100 text-start ps-3 d-flex align-items-center"
          >
            <span className="flex-grow-1">Python</span>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => handleGenerateCode('python')}>Python Classes</Dropdown.Item>
            <Dropdown.Item onClick={() => handleGenerateCode('django')}>Django Project</Dropdown.Item>
            <Dropdown.Item onClick={() => handleGenerateCode('pydantic')}>Pydantic Models</Dropdown.Item>
            <Dropdown.Item onClick={() => handleGenerateCode('sqlalchemy')}>SQLAlchemy DDL</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Dropdown.Item onClick={() => handleGenerateCode('sql')}>SQL DDL</Dropdown.Item>
        <Dropdown.Item onClick={() => handleGenerateCode('backend')}>Full Backend</Dropdown.Item>
        <Dropdown.Item onClick={() => handleGenerateCode('java')}>Java Classes</Dropdown.Item>
      </NavDropdown>

      {/* Django Configuration Modal */}
      <Modal show={showDjangoConfig} onHide={() => setShowDjangoConfig(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Django Project Configuration</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Project Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="my_django_project"
                value={projectName}
                onChange={(e) => {
                  const value = e.target.value.replace(/\s/g, '_');
                  if (value === '' || validateDjangoName(value)) {
                    setProjectName(value);
                  }
                }}
                isInvalid={projectName !== '' && !validateDjangoName(projectName)}
              />
              <Form.Text className="text-muted">
                Must start with a letter/underscore and contain only letters, numbers, and underscores
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>App Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="my_app"
                value={appName}
                onChange={(e) => {
                  const value = e.target.value.replace(/\s/g, '_');
                  if (value === '' || validateDjangoName(value)) {
                    setAppName(value);
                  }
                }}
                isInvalid={appName !== '' && !validateDjangoName(appName)}
              />
              <Form.Text className="text-muted">
                Must start with a letter/underscore and contain only letters, numbers, and underscores
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Include Docker containerization"
                checked={useDocker}
                onChange={(e) => setUseDocker(e.target.checked)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDjangoConfig(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleDjangoGenerate}>
            Generate
          </Button>
        </Modal.Footer>
      </Modal>

      {/* SQL Configuration Modal */}
      <Modal show={showSqlConfig} onHide={() => setShowSqlConfig(false)}>
        <Modal.Header closeButton>
          <Modal.Title>SQL Dialect Selection</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Select SQL Dialect</Form.Label>
              <Form.Select 
                value={sqlDialect} 
                onChange={(e) => setSqlDialect(e.target.value as 'standard' | 'postgresql' | 'mysql')}
              >
                <option value="standard">Standard SQL</option>
                <option value="postgresql">PostgreSQL</option>
                <option value="mysql">MySQL</option>
              </Form.Select>
              <Form.Text className="text-muted">
                Choose the SQL dialect for your generated DDL statements
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSqlConfig(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSqlGenerate}>
            Generate
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};