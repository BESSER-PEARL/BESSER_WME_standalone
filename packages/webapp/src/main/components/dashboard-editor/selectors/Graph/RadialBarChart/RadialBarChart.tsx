import { UserComponent } from '@craftjs/core';
import {
  RadialBarChart as RechartsRadialBarChart,
  RadialBar,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { RadialBarChartSettings } from './RadialBarChartSettings';
import { RadialBarChartData } from './RadialBarChartData';
import { DraggableResizableWrapper } from '../../DragResizableWrapper';
import { colorPalettes } from '../PieChart/PieChart';
import chroma from 'chroma-js';

const getColorsFromPalette = (paletteName: string, count: number) => {
  const palette = colorPalettes[paletteName] || ['#8884d8', '#82ca9d'];
  if (palette.length >= count) return palette.slice(0, count);
  return chroma.scale(palette).mode('lab').colors(count);
};

export type RadialBarChartProps = {
  data: { name: string; value: number; fill?: string }[];
  startAngle: number;
  endAngle: number;
  showLegend: boolean;
  showTooltip: boolean;
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
  colorPalette?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  isDragging?: boolean;
};

export const RadialBarChart: UserComponent<Partial<RadialBarChartProps>> = (props) => {
  const {
    data = [],
    startAngle = 180,
    endAngle = -180,
    showLegend = true,
    showTooltip = true,
    legendPosition = 'right',
    colorPalette = 'blues',
    width,
    height,
    x,
    y,
  } = props;

  const colors = getColorsFromPalette(colorPalette, data.length);
  const coloredData = data.map((d, i) => ({ ...d, fill: d.fill || colors[i] }));

  return (
    <DraggableResizableWrapper x={x} y={y} width={width} height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="10%"
          outerRadius="80%"
          barSize={15}
          startAngle={startAngle}
          endAngle={endAngle}
          data={coloredData}
        >
          <RadialBar
            label={{ position: 'insideStart', fill: '#fff', style: { fontSize: '12px' } }}
            background
            dataKey="value"
          />
          {showLegend && (
            <Legend
              iconSize={7}
              layout="vertical"
              verticalAlign={
                legendPosition === 'top' || legendPosition === 'bottom'
                  ? legendPosition
                  : 'middle'
              }
              align={
                legendPosition === 'left' || legendPosition === 'right'
                  ? legendPosition
                  : 'center'
              }
            />
          )}
          {showTooltip && <Tooltip />}
        </RechartsRadialBarChart>
      </ResponsiveContainer>
    </DraggableResizableWrapper>
  );
};

RadialBarChart.craft = {
  displayName: 'RadialBarChart',
  props: {
    data: [
      { name: '25-34 years', value: 30 },
      { name: '35-44 years', value: 20 },
      { name: '45-54 years', value: 12 },
      { name: '55-64 years', value: 8 },
      { name: '65+ years', value: 5 },
    ],
    startAngle: 180,
    endAngle: -180,
    showLegend: true,
    showTooltip: true,
    legendPosition: 'right',
    colorPalette: 'default',
    x: 0,
    y: 0,
    width: 300,
    height: 300,
    isDragging: false,
  },
  related: {
    toolbar: RadialBarChartSettings,
    databar: RadialBarChartData,
  },
};