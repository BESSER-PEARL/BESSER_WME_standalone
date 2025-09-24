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
import { PieChartData } from './PieChartData';
import { normalizeColor } from '../../../../../utils/charts';
import { DraggableResizableWrapper } from '../../DragResizableWrapper';
import chroma from 'chroma-js';

export const colorPalettes: Record<string, string[]> = {
  'blues': ['#cce5ff', '#66b3ff', '#3399ff', '#0066cc'],
  'warm': ['#ffcc99', '#ff9966', '#ff6633', '#cc3300'],
  'cool': ['#99ffcc', '#33ff99', '#00cc66', '#00994d'],
  'vibrant': ['#ff0080', '#ff6600', '#ffff00', '#00ff00', '#00ffff', '#8000ff'],
  'greenBlue': ['#1B4F72', '#2E86C1', '#117A65', '#1ABC9C', '#148F77'],
  'warmPro': ['#D35400', '#E67E22', '#F39C12', '#D68910', '#BA4A00'],
  'neutral': ['#34495E', '#5D6D7E', '#85929E', '#AAB7B8', '#CCD1D1'],
  'classic': ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'],
  'default': ['#8884d8', '#82ca9d', '#8B9CC5', '#89B3B2'],
};

const getColorsFromPalette = (paletteName: string, count: number) => {
  const palette = colorPalettes[paletteName] || ['#8884d8', '#82ca9d'];
  if (palette.length >= count) {
    return palette.slice(0, count);
  }
  // Interpolar si hay menos colores que slices
  return chroma.scale(palette).mode('lab').colors(count);
};

export type PieChartProps = {
  data: { name: string; value: number; color: string }[];
  paddingAngle: number;
  showLabels: boolean;
  labelColor: string;
  labelPosition: 'inside' | 'outside';
  showLegend?: boolean;
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  isDragging?: boolean;
  colorPalette?: string;
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
    data = [],
    paddingAngle = 2,
    showLabels = true,
    labelColor = '#000',
    labelPosition = 'outside',
    showLegend = true,
    legendPosition = 'left',
    width,
    height,
    x,
    y,
  } = props;

  const colors = getColorsFromPalette(props.colorPalette || 'Blues', data.length);

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
    <DraggableResizableWrapper x={x} y={y} width={width} height={height}>
      <ResponsiveContainer width="100%" height="100%">
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
            innerRadius="20%"
            outerRadius="80%"
            paddingAngle={paddingAngle}
            labelLine={labelPosition === 'outside'}
            {...pieLabelProps}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index]}
              />
            ))}
          </Pie>
        </RechartsPieChart>
      </ResponsiveContainer>
    </DraggableResizableWrapper>
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
    paddingAngle: 2,
    showLabels: true,
    labelColor: '#FFFFFF',
    labelPosition: 'inside',
    showLegend: true,
    legendPosition: 'left',
    x: 0,
    y: 0,
    width: 300,
    height: 220,
    isDragging: false,
    colorPalette: 'default',
  },
  related: {
    toolbar: PieChartSettings,
    databar: PieChartData,
  },
};
