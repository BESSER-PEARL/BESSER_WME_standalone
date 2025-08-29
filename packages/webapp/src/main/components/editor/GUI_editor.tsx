import { Editor, Frame, Element } from '@craftjs/core';
import { createTheme, ThemeProvider } from '@mui/material';

import { Viewport, RenderNode } from '.';
import { Container, Text} from './selectors';
import { Button } from './selectors/Button';
import { Video } from './selectors/Video';
import { LineChart } from './selectors/Graph/LineChart';
import { BarChart } from './selectors/Graph/BarChart';
import { PieChart } from './selectors/Graph/PieChart';
import { RadarChart } from './selectors/Graph/RadarChart';
import { RadialBarChart } from './selectors/Graph/RadialBarChart';
import { WorldMap } from './selectors/Map/WorldMap';
import { LocationMap } from './selectors/Map/LocationMap';
import { UICanvas } from './selectors/UICanvas';

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
        >
          <Viewport>
            <Frame>
              <Element
                canvas
                is={UICanvas}
                width="900px"
                height="1000px"
                background={{ r: 255, g: 255, b: 255, a: 1 }}
                custom={{ displayName: 'Canvas' }}
              >

              </Element>
            </Frame>
          </Viewport>
        </Editor>
      </div>
    </ThemeProvider>
  );
}