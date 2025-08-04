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
import {
  normalizeColor,
  safeNumber,
  safeMargin,
} from '../../../../../utils/charts';
import { Resizer } from '../../Resizer';

export type LineChartProps = {
  data: { name: string; value: number }[];
  color: string;
  axisColor: string;
  fontSize: number;
  gridColor: string;
  lineWidth: number;
  margin: [number, number, number, number];
  width: string;
  height: string;
};

export const LineChart: UserComponent<Partial<LineChartProps>> = (props) => {
  const {
    connectors: { connect },
  } = useNode();

  const {
    data = [],
    color,
    axisColor,
    gridColor,
    fontSize,
    lineWidth,
    margin,
    width = '100%',
    height = '300px',
  } = props;

  const finalColor = normalizeColor(color, '#8884d8');
  const finalAxisColor = normalizeColor(axisColor, '#666');
  const finalGridColor = normalizeColor(gridColor, '#e0e0e0');
  const finalFontSize = safeNumber(fontSize, 12);
  const finalLineWidth = safeNumber(lineWidth, 2);
  const finalMargin = safeMargin(margin);

  return (
    <Resizer
      propKey={{ width: 'width', height: 'height' }}
      ref={(ref) => ref && connect(ref)}
      style={{
        width,
        height,
        position: 'relative',
      }}
    >
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
            stroke={finalColor}
            strokeWidth={finalLineWidth}
            dot={{ r: 4 }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </Resizer>
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
    color: '#8884d8',
    axisColor: '#666',
    fontSize: 12,
    gridColor: '#e0e0e0',
    lineWidth: 2,
    margin: [20, 30, 0, 10],
    width: '100%',
    height: '300px',
  },
  related: {
    toolbar: LineChartSettings,
  },
};
