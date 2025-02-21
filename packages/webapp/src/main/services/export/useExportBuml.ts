import { useCallback } from 'react';
import { ApollonEditor } from '@besser/wme';
import { useFileDownload } from '../file-download/useFileDownload';
import { toast } from 'react-toastify';
import { validateDiagram } from '../validation/diagramValidation';
import { BACKEND_URL } from '../../constant';

const BESSER_BACKEND_URL = BACKEND_URL || 'http://besser-wme-backend:8000';

export const useExportBUML = () => {
  const downloadFile = useFileDownload();

  const exportBUML = useCallback(
    async (editor: ApollonEditor, diagramTitle: string) => {
      console.log('Starting BUML export...'); // Debug log
      
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
        console.log('Sending request to:', BESSER_BACKEND_URL + '/export-buml'); // Debug log
        console.log('Model data:', editor.model); // Debug log

        const response = await fetch(`${BESSER_BACKEND_URL}/export-buml`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/plain, */*',
          },
          body: JSON.stringify({
            elements: editor.model,
            generator: 'buml',
          }),
        }).catch(error => {
          console.error('Fetch error:', error); // Debug log
          throw error;
        });

        if (!response.ok) {
          const errorData = await response.json().catch(e => ({ detail: 'Could not parse error response' }));
          console.error('Response not OK:', response.status, errorData); // Debug log
          if (response.status === 400 && errorData.detail) {
            toast.error(`Error: ${errorData.detail}`);
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        const filename = 'domain_model.py';

        // console.log('Download starting...'); // Debug log
        downloadFile({ file: blob, filename });
        // console.log('Download completed'); // Debug log
        toast.success('BUML export completed successfully');
      } catch (error) {
        console.error('Error during BUML export:', error);
        // toast.error('Failed to export as BUML. Check console for details.');
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        toast.error(`Failed to export as BUML: ${errorMessage}`);
        return;
      }
    },
    [downloadFile],
  );

  return exportBUML;
};