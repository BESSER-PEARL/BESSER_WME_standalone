import { UserComponent, useNode } from '@craftjs/core';
import {
  RadialBarChart as RechartsRadialBarChart,
  RadialBar,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { RadialBarChartSettings } from './RadialBarChartSettings';

export type RadialBarChartProps = {
  data: { name: string; value: number; fill: string }[];
  innerRadius: string | number;
  outerRadius: string | number;
  startAngle: number;
  endAngle: number;
  showLegend: boolean;
  showTooltip: boolean;
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
};

export const RadialBarChart: UserComponent<Partial<RadialBarChartProps>> = (props) => {
  const {
    connectors: { connect },
  } = useNode();

  const {
    data = [
      { name: '18-24 años', value: 25.0, fill: '#8884d8' },
      { name: '25-34 años', value: 30.0, fill: '#83a6ed' },
      { name: '35-44 años', value: 20.0, fill: '#8dd1e1' },
      { name: '45-54 años', value: 12.0, fill: '#82ca9d' },
      { name: '55-64 años', value: 8.0, fill: '#a4de6c' },
      { name: '65+ años', value: 5.0, fill: '#ffc658' },
    ],
    innerRadius = 10,
    outerRadius = 80,
    startAngle = 180,
    endAngle = -180,
    showLegend = true,
    showTooltip = true,
    legendPosition = 'right',
  } = props;

  return (
    <div ref={(ref) => ref && connect(ref)} style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
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
    </div>
  );
};

RadialBarChart.craft = {
  displayName: 'RadialBarChart',
  props: {
    data : [
      { name: '18-24 años', value: 25.0, fill: '#8884d8' },
      { name: '25-34 años', value: 30.0, fill: '#83a6ed' },
      { name: '35-44 años', value: 20.0, fill: '#8dd1e1' },
      { name: '45-54 años', value: 12.0, fill: '#82ca9d' },
      { name: '55-64 años', value: 8.0, fill: '#a4de6c' },
      { name: '65+ años', value: 5.0, fill: '#ffc658' },
    ],
    innerRadius: 10,
    outerRadius: 100,
    startAngle: 180,
    endAngle: -180,
    showLegend: true,
    showTooltip: true,
    legendPosition: 'right',
  },
  related: {
    toolbar: RadialBarChartSettings,
  },
};
