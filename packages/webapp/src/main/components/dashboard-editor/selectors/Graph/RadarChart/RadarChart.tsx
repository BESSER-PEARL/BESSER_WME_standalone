import { UserComponent } from '@craftjs/core';
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
import { RadarChartData } from './RadarChartData';
import { normalizeColor } from '../../../../../utils/charts';
import { DraggableResizableWrapper } from '../../DragResizableWrapper';

export type RadarChartProps = {
  data: { subject: string; A: number }[];
  borderColor: string;
  fillColor: string;
  showGrid: boolean;
  showTooltip: boolean;
  showRadiusAxis: boolean;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  isDragging?: boolean;
};

export const RadarChart: UserComponent<Partial<RadarChartProps>> = (props) => {
  const {
    data = [
      { subject: 'Math', A: 120 },
      { subject: 'Chinese', A: 98 },
      { subject: 'English', A: 86 },
      { subject: 'Geography', A: 99 },
      { subject: 'Physics', A: 85 },
      { subject: 'History', A: 65 },
    ],
    borderColor = '#8884d8',
    fillColor = '#8884d8',
    showGrid = true,
    showTooltip = true,
    showRadiusAxis = true,
    width,
    height,
    x,
    y,
  } = props;

  const finalBorderColor = normalizeColor(borderColor, '#8884d8');
  const finalFillColor = normalizeColor(fillColor, '#8884d8');

  return (
    <DraggableResizableWrapper x={x} y={y} width={width} height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart data={data}>
          {showGrid && <PolarGrid />}
          <PolarAngleAxis dataKey="subject" />
          {showRadiusAxis && <PolarRadiusAxis />}
          {showTooltip && <Tooltip />}
          <Radar
            name="A"
            dataKey="A"
            stroke={finalBorderColor}
            fill={finalFillColor}
            fillOpacity={0.6}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </DraggableResizableWrapper>
  );
};

RadarChart.craft = {
  displayName: 'RadarChart',
  props: {
    data: [
      { subject: 'Math', A: 120 },
      { subject: 'Chinese', A: 98 },
      { subject: 'English', A: 86 },
      { subject: 'Geography', A: 99 },
      { subject: 'Physics', A: 85 },
      { subject: 'History', A: 65 },
    ],
    borderColor: '#8884d8',
    fillColor: '#8884d8',
    showGrid: true,
    showTooltip: true,
    showRadiusAxis: true,
    x: 0,
    y: 0,
    width: 300,
    height: 200,
    isDragging: false,
  },
  related: {
    toolbar: RadarChartSettings,
    databar: RadarChartData,
  },
};
