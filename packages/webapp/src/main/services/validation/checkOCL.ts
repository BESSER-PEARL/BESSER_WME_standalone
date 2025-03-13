import { toast } from 'react-toastify';
import { validateDiagram } from './diagramValidation';
import { BACKEND_URL } from '../../constant';

export async function checkOclConstraints(diagramData: any) {
  try {
    // Validate the diagram first
    const validationResult = validateDiagram(diagramData);
    if (!validationResult.isValid) {
      toast.error(`Cannot check OCL constraints: ${validationResult.message}`);
      return;
    } 


    const response = await fetch(`${BACKEND_URL}/check-ocl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        elements: diagramData.model
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

    const result = await response.json();
    
    // Show the result in a toast notification
    if (result.success) {
      toast.success(result.message, {
        position: "top-right",
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        style: {
          fontSize: "18px",
          padding: "20px",
          width: "350px"
        }
      });

      toast.success(validationResult.message, {
        position: "top-right",
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark"
      });
      
    } else {
      toast.error(result.message);
    }

    return result;
  } catch (error: unknown) {
    console.error('Error during OCL check:', error);
    toast.error(`${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}
