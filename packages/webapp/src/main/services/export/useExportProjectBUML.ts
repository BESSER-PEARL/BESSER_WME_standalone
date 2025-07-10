import { BACKEND_URL } from '../../constant';
import JSZip from 'jszip';
import { toast } from 'react-toastify';
import { BesserProject, SupportedDiagramType } from '../../types/project';
import { ApollonEditor, diagramBridge, UMLDiagramType } from '@besser/wme';
import { validateDiagram } from '../validation/diagramValidation';
import { toUMLDiagramType } from '../../types/project';

async function convertDiagramModelToBUML(diagram: any, diagramTitle: string, project?: BesserProject): Promise<string> {
  // Create a mock editor object to use with validateDiagram
  const mockEditor = {
    model: diagram
  } as ApollonEditor;

  // Add validation before export
  const validationResult = validateDiagram(mockEditor);
  if (!validationResult.isValid) {
    toast.error(validationResult.message);
    throw new Error(validationResult.message);
  }

  if (!diagram) {
    console.error('No diagram model available');
    toast.error('No diagram to export');
    throw new Error('No diagram to export');
  }

  // Prepare the model data - include referenceDiagramData for ObjectDiagrams
  let modelData = diagram;
  
  // If it's an ObjectDiagram, include the class diagram data
  if (diagram.type === 'ObjectDiagram') {
    const classDiagramData = diagramBridge.getClassDiagramData();
    if (classDiagramData) {
      // Get the actual class diagram title from the project
      const classDiagramTitle = project?.diagrams?.ClassDiagram?.title || 'Class Diagram';
      
      // Add the class diagram data as referenceDiagramData to the model
      modelData = {
        ...diagram,
        referenceDiagramData: {
          ...classDiagramData,
          title: classDiagramTitle
        }
      };
    }
  }


  try {
    const response = await fetch(`${BACKEND_URL}/export-buml`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        elements: modelData,
        diagramTitle: diagramTitle,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Backend error response:', errorData);
      throw new Error(`HTTP error! status: ${response.status} - ${errorData}`);
    }

    const data = await response.text();
    // console.log('Backend response:', data); // Debug log
    return data;
  } catch (error) {
    console.error('Error converting diagram to BUML:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Cannot connect to the conversion service. Please check if the backend is running.');
    }
    throw error;
  }
}

export async function exportProjectAsBUMLZip(project: BesserProject): Promise<void> {
  if (!project || !project.diagrams) {
    toast.error('No project or diagrams to export');
    return;
  }

  const zip = new JSZip();
  let successfulExports = 0;
  let totalExports = 0;

  try {
    // Create metadata file
    const metadata = {
      projectName: project.name,
      projectId: project.id,
      owner: project.owner,
      description: project.description,
      createdAt: project.createdAt,
      exportedAt: new Date().toISOString(),
      version: '2.0.0',
      diagramTypes: Object.keys(project.diagrams)
    };
    
    zip.file('metadata.json', JSON.stringify(metadata, null, 2));

    // Convert each diagram
    for (const [diagramType, diagram] of Object.entries(project.diagrams)) {
      if (!diagram.model) {
        console.warn(`Skipping ${diagramType}: no model available`);
        continue;
      }

      // Check if the model has any elements (not empty)
      if (!diagram.model.elements || Object.keys(diagram.model.elements).length === 0) {
        console.warn(`Skipping ${diagramType}: model is empty (no elements)`);
        continue;
      }

      totalExports++;
      
      try {
        const bumlContent = await convertDiagramModelToBUML(diagram.model, diagram.title, project);
        const filename = `${diagramType.replace('Diagram', '')}.py`;
        zip.file(filename, bumlContent);
        successfulExports++;
        
        // console.log(`Successfully converted ${diagramType} to BUML`);
      } catch (error) {
        console.error(`Failed to convert ${diagramType}:`, error);
        toast.error(`Failed to convert ${diagramType}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    if (successfulExports === 0) {
      toast.error('No diagrams could be converted to BUML');
      return;
    }

    // Add README
    const readme = `# ${project.name} - BUML Export

This ZIP file contains BUML (BESSER UML) representations of your project diagrams.

## Project Information
- **Name:** ${project.name}
- **Owner:** ${project.owner || 'Unknown'}
- **Description:** ${project.description || 'No description'}
- **Created:** ${new Date(project.createdAt).toLocaleDateString()}
- **Exported:** ${new Date().toLocaleDateString()}

## Export Results
- **Total Diagrams:** ${totalExports}
- **Successfully Exported:** ${successfulExports}
- **Format:** BUML v2.0.0

## Files
${Object.keys(project.diagrams).map(type => `- ${type.replace('Diagram', '')}.py - ${type}`).join('\n')}
- metadata.json - Project metadata
- README.md - This file

## Usage
These BUML files can be used with BESSER tools for code generation, analysis, and other model-driven engineering tasks.

Generated by BESSER Web Modeling Editor V2
`;

    zip.file('README.md', readme);

    // Generate and download
    const content = await zip.generateAsync({ type: 'blob' });
    const filename = `${project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'project'}_buml_python_export.zip`;
    
    // Download the file
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Successfully exported ${successfulExports}/${totalExports} diagrams to BUML format`);

  } catch (error) {
    console.error('Error creating BUML export:', error);
    toast.error(`Failed to create BUML export: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function exportProjectAsSingleBUMLFile(project: BesserProject): Promise<void> {
  if (!project) {
    toast.error('No project data available to export');
    return;
  }

  // Prepare a deep copy of the project to avoid mutating the original
  const projectToExport = JSON.parse(JSON.stringify(project));

  // Add referenceDiagramData to ObjectDiagram if needed
  const objectDiagram = projectToExport.diagrams?.ObjectDiagram;
  const classDiagram = projectToExport.diagrams?.ClassDiagram;
  if (objectDiagram && classDiagram && classDiagram.model) {
    objectDiagram.model.referenceDiagramData = {
      ...classDiagram.model,
      title: classDiagram.title || 'Class Diagram'
    };
  }

  try {
    const response = await fetch(`${BACKEND_URL}/export-project_as_buml`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectToExport),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const blob = await response.blob();
    
    // Get the filename from the response headers
    const contentDisposition = response.headers.get('Content-Disposition');
    const normalizedProjectName = project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    let filename = `${normalizedProjectName}_besser.py`; // Default filename
    
    if (contentDisposition) {
      // Try multiple patterns to extract filename
      const patterns = [
        /filename="([^"]+)"/,
        /filename=([^;\s]+)/, 
        /filename="?([^";\s]+)"?/ 
      ];
      for (const pattern of patterns) {
        const match = contentDisposition.match(pattern);
        if (match) {
          filename = `${normalizedProjectName}_${match[1]}`;
          break;
        }
      }
    }

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Project exported as ${filename}`);
  } catch (error) {
    console.error('Error exporting project as BUML file:', error);
    toast.error(`Failed to export project: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}