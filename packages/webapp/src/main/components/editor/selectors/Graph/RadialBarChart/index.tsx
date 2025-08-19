import { UserComponent } from '@craftjs/core';
import {
  RadialBarChart as RechartsRadialBarChart,
  RadialBar,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { RadialBarChartSettings } from './RadialBarChartSettings';
import { DraggableResizableWrapper } from '../../DragResizableWrapper';

export type RadialBarChartProps = {
  data: { name: string; value: number; fill: string }[];
  innerRadius: string | number;
  outerRadius: string | number;
  startAngle: number;
  endAngle: number;
  showLegend: boolean;
  showTooltip: boolean;
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  isDragging?: boolean;
};

export const RadialBarChart: UserComponent<Partial<RadialBarChartProps>> = (props) => {
  const {
    data = [
      { name: '18-24 years', value: 25.0, fill: '#8884d8' },
      { name: '25-34 years', value: 30.0, fill: '#83a6ed' },
      { name: '35-44 years', value: 20.0, fill: '#8dd1e1' },
      { name: '45-54 years', value: 12.0, fill: '#82ca9d' },
      { name: '55-64 years', value: 8.0, fill: '#a4de6c' },
      { name: '65+ years', value: 5.0, fill: '#ffc658' },
    ],
    innerRadius = 10,
    outerRadius = 80,
    startAngle = 180,
    endAngle = -180,
    showLegend = true,
    showTooltip = true,
    legendPosition = 'right',
    width,
    height,
    x,
    y,
  } = props;

  return (
    <DraggableResizableWrapper x={x} y={y} width={width} height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadialBarChart
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          data={data}
        >
          <RadialBar
            label={{ position: 'insideStart', fill: '#fff', style: { fontSize: '12px' }, }}
            background
            dataKey="value"
          />
          {showLegend && (
            <Legend
              iconSize={10}
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
    data : [
      { name: '18-24 years', value: 25.0, fill: '#8884d8' },
      { name: '25-34 years', value: 30.0, fill: '#83a6ed' },
      { name: '35-44 years', value: 20.0, fill: '#8dd1e1' },
      { name: '45-54 years', value: 12.0, fill: '#82ca9d' },
      { name: '55-64 years', value: 8.0, fill: '#a4de6c' },
      { name: '65+ years', value: 5.0, fill: '#ffc658' },
    ],
    innerRadius: 10,
    outerRadius: 100,
    startAngle: 180,
    endAngle: -180,
    showLegend: true,
    showTooltip: true,
    legendPosition: 'right',
    x: 100,
    y: 100,
    width: 300,
    height: 300,
    isDragging: false,
  },
  related: {
    toolbar: RadialBarChartSettings,
  },
};
