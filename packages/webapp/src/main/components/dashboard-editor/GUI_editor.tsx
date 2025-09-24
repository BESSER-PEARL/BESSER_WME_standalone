import { Editor, Frame } from '@craftjs/core';
import { createTheme, ThemeProvider } from '@mui/material';

import { Viewport, RenderNode } from '.';
import { Container, Text} from './selectors';
import { Button } from './selectors/Button/Button';
import { Video } from './selectors/Video/Video';
import { LineChart } from './selectors/Graph/LineChart/LineChart';
import { BarChart } from './selectors/Graph/BarChart/BarChart';
import { PieChart } from './selectors/Graph/PieChart/PieChart';
import { RadarChart } from './selectors/Graph/RadarChart/RadarChart';
import { RadialBarChart } from './selectors/Graph/RadialBarChart/RadialBarChart';
import { WorldMap } from './selectors/Map/WorldMap/WorldMap';
import { LocationMap } from './selectors/Map/LocationMap/LocationMap';
import { UICanvas } from './selectors/UICanvas/UICanvas';
import { ProjectStorageRepository } from '../../services/storage/ProjectStorageRepository';
import { SupportedDiagramType } from '../../types/project';

const theme = createTheme({
  typography: {
    fontFamily: [
      'acumin-pro',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

export function GUI_editor() {
  // Get GUIModel from the current project (localStorage-backed)
  const currentProject = ProjectStorageRepository.getCurrentProject();
  const guiModel = currentProject?.diagrams?.GUIDiagram?.model || null;

  // Auto-save GUI diagram on editor node changes
  const handleNodesChange = (query) => {
    const guiJson = query.serialize();
    const projectId = ProjectStorageRepository.getCurrentProject()?.id;
    if (projectId) {
      ProjectStorageRepository.updateDiagram(
        projectId,
        'GUIDiagram' as SupportedDiagramType,
        {
          id: crypto.randomUUID(),
          title: 'GUI Diagram',
          model: JSON.parse(guiJson),
          lastUpdate: new Date().toISOString(),
          description: 'Stores GUI editor state',
        }
      );
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="h-full h-screen">
        <Editor
          resolver={{
            Container,
            Text,
            Button,
            Video,
            LineChart,
            BarChart,
            PieChart,
            RadarChart,
            RadialBarChart,
            WorldMap,
            LocationMap,
            UICanvas,
          }}
          enabled={false}
          onRender={RenderNode}
          onNodesChange={handleNodesChange}
        >
          <Viewport>
            <Frame data={guiModel ? JSON.stringify(guiModel) : undefined}>
              {/* The canvas and nodes will be loaded from the GUIModel, or blank if none exists */}
            </Frame>
          </Viewport>
        </Editor>
      </div>
    </ThemeProvider>
  );
}