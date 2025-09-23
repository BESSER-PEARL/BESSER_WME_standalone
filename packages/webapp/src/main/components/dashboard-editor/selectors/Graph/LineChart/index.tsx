import { UserComponent, useNode } from '@craftjs/core';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { LineChartSettings } from './LineChartSettings';
import { LineChartData } from './LineChartData';
import { normalizeColor, safeNumber, safeMargin } from '../../../../../utils/charts';
import { DraggableResizableWrapper } from '../../DragResizableWrapper';

export type LineChartProps = {
  data: { name: string; value: number }[];
  lineColor: string;
  axisColor: string;
  fontSize: number;
  gridColor: string;
  lineWidth: number;
  margin: [number, number, number, number];
  x: number;
  y: number;
  width: number;
  height: number;
};

export const LineChart: UserComponent<Partial<LineChartProps>> = (props) => {
  const {
    data = [],
    lineColor,
    axisColor,
    gridColor,
    fontSize,
    lineWidth,
    margin,
    x = 0,
    y = 0,
    width = 300,
    height = 200,
  } = props;

  const finalLineColor = normalizeColor(lineColor, '#8884d8');
  const finalAxisColor = normalizeColor(axisColor, '#666');
  const finalGridColor = normalizeColor(gridColor, '#e0e0e0');
  const finalFontSize = safeNumber(fontSize, 12);
  const finalLineWidth = safeNumber(lineWidth, 2);
  const finalMargin = safeMargin(margin);

  return (
    <DraggableResizableWrapper x={x} y={y} width={width} height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={data}
          margin={{
            top: finalMargin[0],
            right: finalMargin[1],
            bottom: finalMargin[2],
            left: finalMargin[3],
          }}
        >
          <CartesianGrid stroke={finalGridColor} strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            stroke={finalAxisColor}
            tick={{ fontSize: finalFontSize }}
          />
          <YAxis
            stroke={finalAxisColor}
            tick={{ fontSize: finalFontSize }}
          />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke={finalLineColor}
            strokeWidth={finalLineWidth}
            dot={{ r: 4 }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </DraggableResizableWrapper>
  );
};

LineChart.craft = {
  displayName: 'LineChart',
  props: {
    data: [
      { name: 'Jan', value: 320 },
      { name: 'Feb', value: 450 },
      { name: 'Mar', value: 380 },
      { name: 'Apr', value: 520 },
      { name: 'May', value: 610 },
      { name: 'Jun', value: 720 },
      { name: 'Jul', value: 690 },
      { name: 'Aug', value: 750 },
    ],
    lineColor: '#8884d8',
    axisColor: '#666666',
    fontSize: 12,
    gridColor: '#e0e0e0',
    lineWidth: 2,
    margin: [20, 30, 0, 10],
    x: 0,
    y: 0,
    width: 300,
    height: 200,
  },
  related: {
    toolbar: LineChartSettings,
    databar: LineChartData,
  },
};
