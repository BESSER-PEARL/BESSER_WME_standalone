import { useCallback } from 'react';
import { ApollonEditor } from '@besser/wme';
import { useFileDownload } from '../file-download/useFileDownload';
import { toast } from 'react-toastify';
import { validateDiagram } from '../validation/diagramValidation';
import { BACKEND_URL } from '../../constant';

// Add type definitions
export interface DjangoConfig {
  project_name: string;  // Changed from projectName
  app_name: string;      // Changed from appName
  containerization: boolean;  // Changed from useDocker
}

export interface SQLConfig {
  dialect: 'standard' | 'postgresql' | 'mysql';
}

export interface SQLAlchemyConfig {
  dbms: 'sqlite' | 'postgresql' | 'mysql';
}

export type GeneratorConfig = {
  django: DjangoConfig;
  sql: SQLConfig;
  sqlalchemy: SQLAlchemyConfig;
  [key: string]: any;
};

export const useGenerateCode = () => {
  const downloadFile = useFileDownload();

  const generateCode = useCallback(
    async (editor: ApollonEditor, generatorType: string, diagramTitle: string, config?: GeneratorConfig[keyof GeneratorConfig]) => {
      console.log('Starting code generation...'); 
      
      // Validate diagram before generation
      const validationResult = validateDiagram(editor);
      if (!validationResult.isValid) {
        toast.error(validationResult.message);
        return;
      }

      if (!editor || !editor.model) {
        console.error('No editor or model available');
        toast.error('No diagram to generate code from');
        return;
      }

      try {
        const response = await fetch(`${BACKEND_URL}/generate-output`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/plain, */*',
          },
          body: JSON.stringify({
            diagramTitle: diagramTitle,
            elements: editor.model,
            generator: generatorType,
            config: config // Add configuration object
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(e => ({ detail: 'Could not parse error response' }));
          console.error('Response not OK:', response.status, errorData); // Debug log
          
          if (response.status === 400 && errorData.detail) {
            toast.error(`${errorData.detail}`);
            return;
          }
          

          if (response.status === 500 && errorData.detail) {
            toast.error(`${errorData.detail}`);
            return;
          }

          throw new Error(`HTTP error! status: ${response.status}`);
        }


        const blob = await response.blob();
        const filename = getFilenameForGenerator(generatorType);

        console.log('Download starting...');
        downloadFile({ file: blob, filename });
        console.log('Download completed');
        toast.success('Code generation completed successfully');
      } catch (error) {

        let errorMessage = 'Unknown error occurred';
        if (error instanceof Error) {
          errorMessage = error.message;
        }
      
        toast.error(`${errorMessage}`);
      }
    },
    [downloadFile],
  );

  return generateCode;
};

function getFilenameForGenerator(generatorType: string): string {
  switch (generatorType) {
    case 'python':
      return 'classes.py';
    case 'django':
      return 'django_project.zip';  // Changed from 'models.py' to zip
    case 'pydantic':
      return 'pydantic_classes.py';
    case 'sqlalchemy':
      return 'sql_alchemy.py';
    case 'sql':
      return 'tables.sql';
    case 'backend':
    case 'java':
      return `${generatorType}_output.zip`;
    default:
      return 'generated_code.txt';
  }
}