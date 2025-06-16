import { useCallback } from 'react';
import { ApollonEditor, diagramBridge, UMLDiagramType } from '@besser/wme';
import { useFileDownload } from '../file-download/useFileDownload';
import { Diagram } from '../diagram/diagramSlice';
import { LocalStorageRepository } from '../local-storage/local-storage-repository';

export const useExportJSON = () => {
  const downloadFile = useFileDownload();
  const exportJSON = useCallback(
    (editor: ApollonEditor, diagram: Diagram) => {
      const fileName = `${diagram.title}.json`;
      const diagramData: Diagram = { ...diagram, model: editor.model };
      
      // If it's an ObjectDiagram, include the class diagram data
      if (editor.model.type === 'ObjectDiagram') {
        const classDiagramData = diagramBridge.getClassDiagramData();
        if (classDiagramData) {
          // Try to get the class diagram title from localStorage
          const classDiagram = LocalStorageRepository.loadDiagramByType(UMLDiagramType.ClassDiagram);
          const classDiagramTitle = classDiagram?.title || 'Class Diagram';
          
          // Add the class diagram data and title as a property to the model
          diagramData.model = {
            ...editor.model,
            referenceDiagramData: {
              ...classDiagramData,
              title: classDiagramTitle
            }
          };
        }
      }
      
      const jsonContent = JSON.stringify(diagramData, null, 2);

      const fileToDownload = new File([jsonContent], fileName, { type: 'application/json' });

      downloadFile({ file: fileToDownload, filename: fileName });
    },
    [downloadFile],
  );

  return exportJSON;
};
