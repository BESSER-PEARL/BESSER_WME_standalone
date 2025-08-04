import { UserComponent, useNode } from '@craftjs/core';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { PieChartSettings } from './PieChartSettings';
import { normalizeColor } from '../../../../../utils/charts';

export type PieChartProps = {
  data: { name: string; value: number; color: string }[];
  innerRadius: number;
  outerRadius: number;
  paddingAngle: number;
  showLabels: boolean;
  labelColor: string;
  labelPosition: 'inside' | 'outside';
  showLegend?: boolean;
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = (labelColor: string) => (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;

  // Factor to position the label more inside the pie slice
  const radiusFactor = 0.35;

  // Calculate the radius for label placement, closer to innerRadius to avoid overflow
  const radius = innerRadius + (outerRadius - innerRadius) * radiusFactor;

  // Calculate x, y coordinates based on the adjusted radius and midAngle
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill={labelColor}
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      style={{ pointerEvents: 'none' }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export const PieChart: UserComponent<Partial<PieChartProps>> = (props) => {
  const {
    connectors: { connect },
  } = useNode();

  const {
    data = [],
    innerRadius = 10,
    outerRadius = 80,
    paddingAngle = 2,
    showLabels = true,
    labelColor = '#000',
    labelPosition = 'outside',
    showLegend = true,
    legendPosition = 'bottom',
  } = props;

  const normalizedLabelColor = normalizeColor(labelColor, '#000');

  const pieLabelProps =
    showLabels && labelPosition === 'outside'
      ? {
          label: {
            fill: normalizedLabelColor,
            fontSize: 12,
          },
        }
      : showLabels && labelPosition === 'inside'
      ? {
          label: renderCustomizedLabel(normalizedLabelColor),
        }
      : {};

  // Determine Legend props based on legendPosition
  let verticalAlign: 'top' | 'middle' | 'bottom' = 'middle';
  let align: 'left' | 'center' | 'right' = 'center';
  let layout: 'horizontal' | 'vertical' = 'horizontal';

  switch (legendPosition) {
    case 'top':
      verticalAlign = 'top';
      align = 'center';
      layout = 'horizontal';
      break;
    case 'bottom':
      verticalAlign = 'bottom';
      align = 'center';
      layout = 'horizontal';
      break;
    case 'left':
      verticalAlign = 'middle';
      align = 'left';
      layout = 'vertical';
      break;
    case 'right':
      verticalAlign = 'middle';
      align = 'right';
      layout = 'vertical';
      break;
  }

  return (
    <div
      ref={(ref) => {
        if (ref) connect(ref);
      }}
      style={{ width: '100%', height: 300, display: 'flex', flexDirection: 'column' }}
    >
      <ResponsiveContainer>
        <RechartsPieChart>
          <Tooltip />
          {showLegend && (
            <Legend
              verticalAlign={verticalAlign}
              align={align}
              layout={layout}
              height={36}
              wrapperStyle={{ padding: 10 }}
            />
          )}
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={paddingAngle}
            labelLine={labelPosition === 'outside'}
            {...pieLabelProps}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={normalizeColor(entry.color, '#8884d8')}
              />
            ))}
          </Pie>
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};

PieChart.craft = {
  displayName: 'PieChart',
  props: {
    data: [
      { name: 'Group A', value: 400, color: '#0088FE' },
      { name: 'Group B', value: 300, color: '#00C49F' },
      { name: 'Group C', value: 300, color: '#FFBB28' },
      { name: 'Group D', value: 200, color: '#FF8042' },
    ],
    innerRadius: 10,
    outerRadius: 80,
    paddingAngle: 2,
    showLabels: true,
    labelColor: '#FFFFFF',
    labelPosition: 'inside',
    showLegend: true,
    legendPosition: 'bottom',
  },
  related: {
    toolbar: PieChartSettings,
  },
};
