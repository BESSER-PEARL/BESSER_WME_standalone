import { useCallback } from 'react';
import { ApollonEditor } from '@besser/wme';
import { useFileDownload } from '../file-download/useFileDownload';
import { toast } from 'react-toastify';
import { validateDiagram } from '../validation/diagramValidation';
import { BACKEND_URL } from '../../constant';


export const useExportBUML = () => {
  const downloadFile = useFileDownload();

  const exportBUML = useCallback(
    async (editor: ApollonEditor, diagramTitle: string) => {

      // Add validation before export
      const validationResult = validateDiagram(editor);
      if (!validationResult.isValid) {
        toast.error(validationResult.message);
        return;
      }

      if (!editor || !editor.model) {
        console.error('No editor or model available'); // Debug log
        toast.error('No diagram to export');
        return;
      }

      try {
        const response = await fetch(`${BACKEND_URL}/export-buml`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/plain, */*',
          },
          body: JSON.stringify({
            elements: editor.model,
            generator: 'buml',
            diagramTitle: diagramTitle
          }),
        }).catch(error => {
          console.error('Fetch error:', error); // Debug log
          throw error;
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
        const filename = 'domain_model.py';

        downloadFile({ file: blob, filename });
        toast.success('BUML export completed successfully');
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

  return exportBUML;
};