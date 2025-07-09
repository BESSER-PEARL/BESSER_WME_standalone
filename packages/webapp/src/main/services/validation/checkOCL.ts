import { toast } from 'react-toastify';
import { validateDiagram } from './diagramValidation';
import { BACKEND_URL } from '../../constant';
import { ApollonEditor, diagramBridge, UMLDiagramType } from '@besser/wme';
import { LocalStorageRepository } from '../local-storage/local-storage-repository';

export async function checkOclConstraints(editor: ApollonEditor, diagramTitle: string) {
  try {
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

      let modelData = editor.model;
        
      // If it's an ObjectDiagram, include the class diagram data
      if (editor.model.type === 'ObjectDiagram') {
        console.log('Processing ObjectDiagram'); // Debug log
        const classDiagramData = diagramBridge.getClassDiagramData();
        if (classDiagramData) {
          // Try to get the class diagram title from localStorage
          const classDiagram = LocalStorageRepository.loadDiagramByType(UMLDiagramType.ClassDiagram);
          const classDiagramTitle = classDiagram?.title || 'Class Diagram';
          
          // Add the class diagram data and title as referenceDiagramData to the model
          modelData = {
            ...editor.model,
            referenceDiagramData: {
              ...classDiagramData,
              title: classDiagramTitle
            }
          };
          console.log('Class diagram data added to model:', modelData); // Debug log
        }
      }

    const response = await fetch(`${BACKEND_URL}/check-ocl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: diagramTitle,
        model: modelData
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
    }    const result = await response.json();
    
    // Handle the separated valid and invalid constraints from backend
    if (result.valid_constraints && result.valid_constraints.length > 0) {
      const validMessage = "Valid constraints:\n" + result.valid_constraints.join("\n");
      toast.success(validMessage, {
        position: "top-right",
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        style: {
          fontSize: "16px",
          padding: "20px",
          width: "350px"
        }
      });
    }
    
    if (result.invalid_constraints && result.invalid_constraints.length > 0) {
      const invalidMessage = "Invalid constraints:\n" + result.invalid_constraints.join("\n");
      toast.error(invalidMessage, {
        position: "top-right",
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        style: {
          fontSize: "16px",
          padding: "20px",
          width: "350px"
        }
      });
    }
    
    // If no constraints were found, show the general message
    if ((!result.valid_constraints || result.valid_constraints.length === 0) && 
        (!result.invalid_constraints || result.invalid_constraints.length === 0)) {
      toast.info(result.message, {
        position: "top-right",
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        style: {
          fontSize: "16px",
          padding: "20px",
          width: "350px"
        }
      });
    }

    // Show validation result separately (only if there are validation messages to show)
    if (validationResult.message && validationResult.message.trim()) {
      if (validationResult.isValid) {
        toast.success(validationResult.message, {
          position: "top-right",
          autoClose: 10,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark"
        });
      } else {
        toast.error(validationResult.message, {
          position: "top-right",
          autoClose: 10,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark"
        });
      }
    }

    return result;
  } catch (error: unknown) {
    console.error('Error during OCL check:', error);
    toast.error(`${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}
