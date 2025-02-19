import { toast } from 'react-toastify';
import { validateDiagram } from './diagramValidation';

export async function checkOclConstraints(diagramData: any) {
  try {
    // Validate the diagram first
    const validationResult = validateDiagram(diagramData);
    if (!validationResult.isValid) {
        toast.error(`Cannot check OCL constraints: ${validationResult.message}`);
        return;
        }

    const response = await fetch('http://localhost:8000/check-ocl', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        elements: diagramData.model
      }),
    });
    console.log(diagramData);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
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
        theme: "dark"
        });
    } else {
      toast.error(result.message, {
        position: "top-right",
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark"
        });;
    }

    return result;
  } catch (error: unknown) {
    console.error('Error during OCL check:', error);
    toast.error(`Error checking OCL constraints: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}
