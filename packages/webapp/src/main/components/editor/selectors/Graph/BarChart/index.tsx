import { UserComponent, useNode } from '@craftjs/core';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { BarChartSettings } from './BarChartSettings';
import { normalizeColor, safeNumber, safeMargin } from '../../../../../utils/charts';
import { DraggableResizableWrapper } from '../../DragResizableWrapper';

export type BarChartProps = {
  data: { name: string; value: number }[];
  barColor: string;
  axisColor: string;
  fontSize: number;
  gridColor: string;
  margin: [number, number, number, number];
  barSize: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  isDragging?: boolean;
};

export const BarChart: UserComponent<Partial<BarChartProps>> = (props) => {
  const {
    data = [],
    barColor,
    axisColor,
    gridColor,
    fontSize,
    barSize,
    margin,
    width,
    height,
    x,
    y,
    isDragging,
  } = props;

  const finalBarColor = normalizeColor(barColor, '#8884d8');
  const finalAxisColor = normalizeColor(axisColor, '#666');
  const finalGridColor = normalizeColor(gridColor, '#e0e0e0');
  const finalFontSize = safeNumber(fontSize, 12);
  const finalBarSize = safeNumber(barSize, 30);
  const finalMargin = safeMargin(margin);

  return (
    <DraggableResizableWrapper x={x} y={y} width={width} height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          margin={{
            top: finalMargin[0],
            right: finalMargin[1],
            bottom: finalMargin[2],
            left: finalMargin[3],
          }}
          barSize={finalBarSize}
        >
          <CartesianGrid stroke={finalGridColor} strokeDasharray="3 3" />
          <XAxis dataKey="name" stroke={finalAxisColor} tick={{ fontSize: finalFontSize }} />
          <YAxis stroke={finalAxisColor} tick={{ fontSize: finalFontSize }} />
          <Tooltip />
          <Bar dataKey="value" fill={finalBarColor} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </DraggableResizableWrapper>
  );
};

BarChart.craft = {
  displayName: 'BarChart',
  props: {
    data: [
      { name: 'Jan', value: 300 },
      { name: 'Feb', value: 500 },
      { name: 'Mar', value: 400 },
      { name: 'Apr', value: 600 },
      { name: 'May', value: 700 },
      { name: 'Jun', value: 800 },
    ],
    barColor: '#8884d8',
    axisColor: '#666',
    fontSize: 12,
    gridColor: '#e0e0e0',
    margin: [20, 30, 0, 10],
    barSize: 30,
    x: 0,
    y: 0,
    width: 300,
    height: 200,
    isDragging: false,
  },
  related: {
    toolbar: BarChartSettings,
  },
};
