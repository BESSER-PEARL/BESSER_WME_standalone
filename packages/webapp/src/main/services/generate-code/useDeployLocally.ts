import { useCallback } from 'react';
import { ApollonEditor } from '@besser/wme';
import { toast } from 'react-toastify';
import { validateDiagram } from '../validation/diagramValidation';
import { BACKEND_URL } from '../../constant';

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

export const useDeployLocally = () => {
  const deployLocally = useCallback(
    async (editor: ApollonEditor, generatorType: string, diagramTitle: string, config?: GeneratorConfig[keyof GeneratorConfig]): Promise<void> => {
      
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
        // Show loading toast
        toast.info('Deployement, please wait...');

        const response = await fetch(`${BACKEND_URL}/deploy-app`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/plain, */*',
          },
          body: JSON.stringify({
            diagramTitle: diagramTitle,
            elements: editor.model,
            generator: generatorType,
            config: config
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(e => ({ detail: 'Could not parse error response' }));
          console.error('Response not OK:', response.status, errorData);
          
          if (response.status === 400 && errorData.detail) {
            toast.error(`${errorData.detail}`);
            return;
          }
          
          if (response.status === 500 && errorData.detail) {
            toast.error(`${errorData.detail}`);
            return;
          }

          toast.error(`HTTP error! status: ${response.status}`);
          return;
        }

        toast.success('Local Deployement completed successfully');
      } catch (error) {
        let errorMessage = 'Unknown error occurred during code generation';
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        toast.error(`${errorMessage}`);
      }
    },
    []
  );

  return deployLocally;
};
