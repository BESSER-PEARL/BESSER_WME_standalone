import { LineChartComponent } from '../widgets/LineChartComponent';
import { BarChartComponent } from '../widgets/BarChartComponent';
import { PieChartComponent } from '../widgets/PieChartComponent';
import { RadarChartComponent } from '../widgets/RadarChartComponent';
import { RadialBarChartComponent } from '../widgets/RadialBarChartComponent';
import { getClassOptions } from '../diagram-helpers';

// Chart configuration interface
export interface ChartTrait {
  type: string;
  label: string;
  name: string;
  value: any;
  changeProp: number;
  options?: { value: string; label: string }[];
}

export interface ChartConfig {
  id: string;
  label: string;
  component: React.FC<any>;
  defaultColor: string;
  defaultTitle: string;
  dataSource: string;
  icon: string;
  traits: ChartTrait[];
}

// Centralized chart configurations
export const chartConfigs: ChartConfig[] = [
  {
    id: 'line-chart',
    label: '📈 Line Chart',
    component: LineChartComponent,
    defaultColor: '#4CAF50',
    defaultTitle: 'Sales Over Time',
    dataSource: '',
    icon: '<svg viewBox="0 0 24 24" width="100%" height="100%"><path fill="currentColor" d="M3,13.5L2.25,12H7.5L6.9,10.5H9L11,16L13.5,2L15.5,10.5H22.5L23.25,12H17.5L16,8L14,16L12.5,10.5H10.5L9.5,13.5H3Z"/></svg>',
    traits: [
      { type: 'color', label: 'Chart Color', name: 'chart-color', value: '#4CAF50', changeProp: 1 },
      { type: 'text', label: 'Chart Title', name: 'chart-title', value: 'Sales Over Time', changeProp: 1 },
      { type: 'select', label: 'Data Source', name: 'data-source', value: '', options: getClassOptions(), changeProp: 1 },
      { type: 'select', label: 'Categories', name: 'label_field', value: '', options: [], changeProp: 1 },
      { type: 'select', label: 'Values', name: 'data_field', value: '', options: [], changeProp: 1 },
    ],
  },
  {
    id: 'bar-chart',
    label: '📊 Bar Chart',
    component: BarChartComponent,
    defaultColor: '#3498db',
    defaultTitle: 'Revenue by Category',
    dataSource: '',
    icon: '<svg viewBox="0 0 24 24" width="100%" height="100%"><path fill="currentColor" d="M22,21H2V3H4V19H6V10H10V19H12V6H16V19H18V14H22V21Z"/></svg>',
    traits: [
      { type: 'color', label: 'Chart Color', name: 'chart-color', value: '#3498db', changeProp: 1 },
      { type: 'text', label: 'Chart Title', name: 'chart-title', value: 'Revenue by Category', changeProp: 1 },
      { type: 'select', label: 'Data Source', name: 'data-source', value: '', options: getClassOptions(), changeProp: 1 },
      { type: 'select', label: 'Categories', name: 'label_field', value: '', options: [], changeProp: 1 },
      { type: 'select', label: 'Values', name: 'data_field', value: '', options: [], changeProp: 1 },
    ],
  },
  {
    id: 'pie-chart',
    label: '🥧 Pie Chart',
    component: PieChartComponent,
    defaultColor: '',
    defaultTitle: 'Traffic Distribution',
    dataSource: '',
    icon: '<svg viewBox="0 0 24 24" width="100%" height="100%"><path fill="currentColor" d="M11,2V22C5.9,21.5 2,17.2 2,12C2,6.8 5.9,2.5 11,2M13,2V11H22C21.5,6.2 17.8,2.5 13,2M13,13V22C17.7,21.5 21.5,17.8 22,13H13Z"/></svg>',
    traits: [
      { type: 'text', label: 'Chart Title', name: 'chart-title', value: 'Traffic Distribution', changeProp: 1 },
      { type: 'select', label: 'Data Source', name: 'data-source', value: '', options: getClassOptions(), changeProp: 1 },
      { type: 'select', label: 'Categories', name: 'label_field', value: '', options: [], changeProp: 1 },
      { type: 'select', label: 'Values', name: 'data_field', value: '', options: [], changeProp: 1 },
    ],
  },
  {
    id: 'radar-chart',
    label: '🎯 Radar Chart',
    component: RadarChartComponent,
    defaultColor: '#8884d8',
    defaultTitle: 'Performance Metrics',
    dataSource: '',
    icon: '<svg viewBox="0 0 24 24" width="100%" height="100%"><path fill="currentColor" d="M12,2L14.5,9.5L22,12L14.5,14.5L12,22L9.5,14.5L2,12L9.5,9.5L12,2M12,5.5L10.6,10.6L5.5,12L10.6,13.4L12,18.5L13.4,13.4L18.5,12L13.4,10.6L12,5.5Z"/></svg>',
    traits: [
      { type: 'color', label: 'Chart Color', name: 'chart-color', value: '#8884d8', changeProp: 1 },
      { type: 'text', label: 'Chart Title', name: 'chart-title', value: 'Performance Metrics', changeProp: 1 },
      { type: 'select', label: 'Data Source', name: 'data-source', value: '', options: getClassOptions(), changeProp: 1 },
      { type: 'select', label: 'Categories', name: 'label_field', value: '', options: [], changeProp: 1 },
      { type: 'select', label: 'Values', name: 'data_field', value: '', options: [], changeProp: 1 },
    ],
  },
  {
    id: 'radial-bar-chart',
    label: '⭕ Radial Bar Chart',
    component: RadialBarChartComponent,
    defaultColor: '',
    defaultTitle: 'Customer Satisfaction',
    dataSource: '',
    icon: '<svg viewBox="0 0 24 24" width="100%" height="100%"><path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6Z"/></svg>',
    traits: [
      { type: 'text', label: 'Chart Title', name: 'chart-title', value: 'Customer Satisfaction', changeProp: 1 },
      { type: 'select', label: 'Data Source', name: 'data-source', value: '', options: getClassOptions(), changeProp: 1 },
      { type: 'select', label: 'Categories', name: 'label_field', value: '', options: [], changeProp: 1 },
      { type: 'select', label: 'Values', name: 'data_field', value: '', options: [], changeProp: 1 },
    ],
  },
];
