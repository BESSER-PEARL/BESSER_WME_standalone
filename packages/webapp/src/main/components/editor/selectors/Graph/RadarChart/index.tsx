import { UserComponent, useNode } from '@craftjs/core';
import {
  RadarChart as RechartsRadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { RadarChartSettings } from './RadarChartSettings';
import { normalizeColor } from '../../../../../utils/charts';

export type RadarChartProps = {
  data: { subject: string; A: number; B: number }[];
  strokeColor: string;
  fillColor: string;
  showGrid: boolean;
  showTooltip: boolean;
};

export const RadarChart: UserComponent<Partial<RadarChartProps>> = (props) => {
  const {
    connectors: { connect },
  } = useNode();

  const {
    data = [
      { subject: 'Math', A: 120, B: 110 },
      { subject: 'Chinese', A: 98, B: 130 },
      { subject: 'English', A: 86, B: 130 },
      { subject: 'Geography', A: 99, B: 100 },
      { subject: 'Physics', A: 85, B: 90 },
      { subject: 'History', A: 65, B: 85 },
    ],
    strokeColor = '#8884d8',
    fillColor = '#8884d8',
    showGrid = true,
    showTooltip = true,
  } = props;

  const finalStrokeColor = normalizeColor(strokeColor, '#8884d8');
  const finalFillColor = normalizeColor(fillColor, '#8884d8');

  return (
    <div ref={(ref) => ref && connect(ref)} style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <RechartsRadarChart data={data}>
          {showGrid && <PolarGrid />}
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis />
          {showTooltip && <Tooltip />}
          <Radar
            name="A"
            dataKey="A"
            stroke={finalStrokeColor}
            fill={finalFillColor}
            fillOpacity={0.6}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
};

RadarChart.craft = {
  displayName: 'RadarChart',
  props: {
    data: [
      { subject: 'Math', A: 120, B: 110 },
      { subject: 'Chinese', A: 98, B: 130 },
      { subject: 'English', A: 86, B: 130 },
      { subject: 'Geography', A: 99, B: 100 },
      { subject: 'Physics', A: 85, B: 90 },
      { subject: 'History', A: 65, B: 85 },
    ],
    strokeColor: '#8884d8',
    fillColor: '#8884d8',
    showGrid: true,
    showTooltip: true,
  },
  related: {
    toolbar: RadarChartSettings,
  },
};
