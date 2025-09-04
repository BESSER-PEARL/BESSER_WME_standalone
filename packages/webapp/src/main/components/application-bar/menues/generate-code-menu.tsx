import React, { useContext, useState } from 'react';
import { Dropdown, NavDropdown, Modal, Form, Button } from 'react-bootstrap';
import { ApollonEditorContext } from '../../apollon-editor-component/apollon-editor-context';
import { useGenerateCode, DjangoConfig, SQLConfig, SQLAlchemyConfig, JSONSchemaConfig } from '../../../services/generate-code/useGenerateCode';
import { useDeployLocally } from '../../../services/generate-code/useDeployLocally';
import { useAppSelector } from '../../store/hooks';
import { toast } from 'react-toastify';
import { BACKEND_URL } from '../../../constant';
import { UMLDiagramType } from '@besser/wme';

export const GenerateCodeMenu: React.FC = () => {
  const [showDjangoConfig, setShowDjangoConfig] = useState(false);
  const [showSqlConfig, setShowSqlConfig] = useState(false);
  const [showSqlAlchemyConfig, setShowSqlAlchemyConfig] = useState(false);
  const [showJsonSchemaConfig, setShowJsonSchemaConfig] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [appName, setAppName] = useState('');
  const [useDocker, setUseDocker] = useState(false);
  const [sqlDialect, setSqlDialect] = useState<'sqlite' | 'postgresql' | 'mysql' | 'mssql' | 'mariadb'>('sqlite');
  const [sqlAlchemyDbms, setSqlAlchemyDbms] = useState<'sqlite' | 'postgresql' | 'mysql' | 'mssql' | 'mariadb'>('sqlite');
  const [jsonSchemaMode, setJsonSchemaMode] = useState<'regular' | 'smart_data'>('regular');

  const apollonEditor = useContext(ApollonEditorContext);
  const generateCode = useGenerateCode();
  const deployLocally = useDeployLocally();
  const diagram = useAppSelector((state) => state.diagram.diagram);
  const currentDiagramType = useAppSelector((state) => state.diagram.editorOptions.type);
  const editor = apollonEditor?.editor;

  // Check if we're running locally (not on AWS)
  const isLocalEnvironment = BACKEND_URL === undefined || 
                            (BACKEND_URL ?? '').includes('localhost') || 
                            (BACKEND_URL ?? '').includes('127.0.0.1');

  const handleGenerateCode = async (generatorType: string) => {
    if (!editor) {
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

    if (generatorType === 'sqlalchemy') {
      setShowSqlAlchemyConfig(true);
      return;
    }

    if (generatorType === 'jsonschema') {
      setShowJsonSchemaConfig(true);
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

  const handleDjangoDeployLocally = async () => {
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
      // Close the modal first, then start deployment
      setShowDjangoConfig(false);
      await deployLocally(editor!, 'django', diagram.title, djangoConfig);
    } catch (error) {
      console.error('Error in Django local deployment:', error);
      toast.error('Django local deployment failed');
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

  const handleSqlAlchemyGenerate = async () => {
    try {
      const sqlAlchemyConfig: SQLAlchemyConfig = {
        dbms: sqlAlchemyDbms
      };
      await generateCode(editor!, 'sqlalchemy', diagram.title, sqlAlchemyConfig);
      setShowSqlAlchemyConfig(false);
    } catch (error) {
      console.error('Error in SQLAlchemy code generation:', error);
      toast.error('SQLAlchemy code generation failed');
    }
  };

  const handleJsonSchemaGenerate = async () => {
    try {
      const jsonSchemaConfig: JSONSchemaConfig = {
        mode: jsonSchemaMode
      };
      await generateCode(editor!, 'jsonschema', diagram.title, jsonSchemaConfig);
      setShowJsonSchemaConfig(false);
    } catch (error) {
      console.error('Error in JSON Schema code generation:', error);
      toast.error('JSON Schema code generation failed');
    }
  };

  const isAgentDiagram = currentDiagramType === UMLDiagramType.AgentDiagram;

  return (
    <>
      <NavDropdown title="Generate" className="pt-0 pb-0">
      {isAgentDiagram ? (
        // Agent Diagram: Only show agent generation option
        <Dropdown.Item onClick={() => handleGenerateCode('agent')}>BESSER Agent</Dropdown.Item>
      ) : currentDiagramType === UMLDiagramType.ClassDiagram ? (
        // Class Diagram: Show all other options
        <>
          {/* Web Dropdown */}
          <Dropdown drop="end">
            <Dropdown.Toggle
              id="dropdown-basic"
              split
              className="bg-transparent w-100 text-start ps-3 d-flex align-items-center"
            >
              <span className="flex-grow-1">Web</span>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => handleGenerateCode('django')}>Django Project</Dropdown.Item>
              <Dropdown.Item onClick={() => handleGenerateCode('backend')}>Full Backend</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          {/* Database Dropdown */}
          <Dropdown drop="end">
            <Dropdown.Toggle
              id="dropdown-basic"
              split
              className="bg-transparent w-100 text-start ps-3 d-flex align-items-center"
            >
              <span className="flex-grow-1">Database</span>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => handleGenerateCode('sql')}>SQL DDL</Dropdown.Item>
              <Dropdown.Item onClick={() => handleGenerateCode('sqlalchemy')}>SQLAlchemy DDL</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          {/* OOP Dropdown */}
          <Dropdown drop="end">
            <Dropdown.Toggle
              id="dropdown-basic"
              split
              className="bg-transparent w-100 text-start ps-3 d-flex align-items-center"
            >
              <span className="flex-grow-1">OOP</span>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => handleGenerateCode('python')}>Python Classes</Dropdown.Item>
              <Dropdown.Item onClick={() => handleGenerateCode('java')}>Java Classes</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          {/* Schema Dropdown */}
          <Dropdown drop="end">
            <Dropdown.Toggle
              id="dropdown-basic"
              split
              className="bg-transparent w-100 text-start ps-3 d-flex align-items-center"
            >
              <span className="flex-grow-1">Schema</span>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => handleGenerateCode('pydantic')}>Pydantic Models</Dropdown.Item>
              <Dropdown.Item onClick={() => handleGenerateCode('jsonschema')}>JSON Schema</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </>
      ) : (
        // Not yet available
        <Dropdown.Item disabled>Not yet available</Dropdown.Item>
      )}
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
          {isLocalEnvironment && (
            <Button variant="success" onClick={handleDjangoDeployLocally}>
              Deploy
            </Button>
          )}
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
                onChange={(e) => setSqlDialect(e.target.value as 'sqlite' | 'postgresql' | 'mysql'| 'mssql' | 'mariadb')}
              >
                <option value="sqlite">SQLite</option>
                <option value="postgresql">PostgreSQL</option>
                <option value="mysql">MySQL</option>
                <option value="mssql">MS SQL Server</option>
                <option value="mariadb">MariaDB</option>;
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

      {/* SQLAlchemy Configuration Modal */}
      <Modal show={showSqlAlchemyConfig} onHide={() => setShowSqlAlchemyConfig(false)}>
        <Modal.Header closeButton>
          <Modal.Title>SQLAlchemy DBMS Selection</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Select Database System</Form.Label>
              <Form.Select 
                value={sqlAlchemyDbms} 
                onChange={(e) => setSqlAlchemyDbms(e.target.value as 'sqlite' | 'postgresql' | 'mysql' | 'mssql' | 'mariadb')}
              >
                <option value="sqlite">SQLite</option>
                <option value="postgresql">PostgreSQL</option>
                <option value="mysql">MySQL</option>
                <option value="mssql">MS SQL Server</option>
                <option value="mariadb">MariaDB</option>
              </Form.Select>
              <Form.Text className="text-muted">
                Choose the database system for your generated SQLAlchemy code
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSqlAlchemyConfig(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSqlAlchemyGenerate}>
            Generate
          </Button>
        </Modal.Footer>
      </Modal>

      {/* JSON Schema Configuration Modal */}
      <Modal show={showJsonSchemaConfig} onHide={() => setShowJsonSchemaConfig(false)}>
        <Modal.Header closeButton>
          <Modal.Title>JSON Schema Mode Selection</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Schema Generation Mode</Form.Label>
              <Form.Select
                value={jsonSchemaMode}
                onChange={(e) => setJsonSchemaMode(e.target.value as 'regular' | 'smart_data')}
              >
                <option value="regular">Regular JSON Schema</option>
                <option value="smart_data">Smart Data Models</option>
              </Form.Select>
              <Form.Text className="text-muted">
                Regular mode generates a standard JSON schema. 
                Smart Data mode generates NGSI-LD compatible schemas for each class.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowJsonSchemaConfig(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleJsonSchemaGenerate}>
            Generate
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};