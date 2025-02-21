import { useCallback } from 'react';
import { ApollonEditor } from '@besser/wme';
import { useFileDownload } from '../file-download/useFileDownload';
import { toast } from 'react-toastify';
import { validateDiagram } from '../validation/diagramValidation';
import { BACKEND_URL } from '../../constant';

const BESSER_BACKEND_URL = BACKEND_URL || 'http://besser-wme-backend:8000';


// Add type definitions
export interface DjangoConfig {
  project_name: string;  // Changed from projectName
  app_name: string;      // Changed from appName
  containerization: boolean;  // Changed from useDocker
}

export type GeneratorConfig = {
  django: DjangoConfig;
  [key: string]: any;
};

export const useGenerateCode = () => {
  const downloadFile = useFileDownload();

  const generateCode = useCallback(
    async (editor: ApollonEditor, generatorType: string, config?: GeneratorConfig[keyof GeneratorConfig]) => {
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
        const response = await fetch(`${BESSER_BACKEND_URL}/generate-output`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/plain, */*',
          },
          body: JSON.stringify({
            elements: editor.model,
            generator: generatorType,
            config: config // Add configuration object
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(e => ({ detail: 'Could not parse error response' }));
          if (response.status === 400 && errorData.detail) {
            toast.error(`Error: ${errorData.detail}`);
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
        console.error('Error during code generation:', error);
        // toast.error('Failed to generate code. Check console for details.');
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        toast.error(`Failed to export as BUML: ${errorMessage}`);
        return;
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