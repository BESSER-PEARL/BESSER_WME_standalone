import { Editor, Frame, Element } from '@craftjs/core';
import { createTheme, ThemeProvider } from '@mui/material';

import { Viewport, RenderNode } from '.';
import { Container, Text} from './selectors';
import { Button } from './selectors/Button';
import { Custom1, OnlyButtons } from './selectors/Custom1';
import { Custom2, Custom2VideoDrop } from './selectors/Custom2';
import { Custom3, Custom3BtnDrop } from './selectors/Custom3';
import { Video } from './selectors/Video';
import { LineChart } from './selectors/Graph/LineChart';
import { BarChart } from './selectors/Graph/BarChart';
import { PieChart } from './selectors/Graph/PieChart';
import { RadarChart } from './selectors/Graph/RadarChart';
import { RadialBarChart } from './selectors/Graph/RadialBarChart';
import { WorldMap } from './selectors/Map/WorldMap';
import { LocationMap } from './selectors/Map/LocationMap';
import { GridContainer } from './selectors/GridContainer';
import { FreeElement } from './selectors/FreeElement';
import { Grid } from 'react-bootstrap-icons';

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
            Custom1,
            Custom2,
            Custom2VideoDrop,
            Custom3,
            Custom3BtnDrop,
            OnlyButtons,
            Button,
            Video,
            LineChart,
            BarChart,
            PieChart,
            RadarChart,
            RadialBarChart,
            WorldMap,
            LocationMap,
            GridContainer,
            FreeElement,
          }}
          enabled={false}
          onRender={RenderNode}
        >
          <Viewport>
            <Frame>
              <Element
                canvas
                is={Container}
                width="800px"
                height="auto"
                background={{ r: 255, g: 255, b: 255, a: 1 }}
                padding={['40', '40', '40', '40']}
                custom={{ displayName: 'App' }}
              >
                      <Custom3
                        background={{
                          r: 134,
                          g: 187,
                          b: 201,
                          a: 1,
                        }}
                        height="auto"
                        width="100%"
                        padding={['20', '20', '20', '20']}
                        margin={['20', '0', '0', '0']}
                        shadow={40}
                        flexDirection="column"
                      />

              </Element>
            </Frame>
          </Viewport>
        </Editor>
      </div>
    </ThemeProvider>
  );
}