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
    label: 'Line Chart',
    component: LineChartComponent,
    defaultColor: '#4CAF50',
    defaultTitle: 'Sales Over Time',
    dataSource: '',
    icon: '<svg viewBox="0 0 24 24" width="100%" height="100%"><path fill="currentColor" d="M3 3v18h18v-2H5V3H3zm2 12l3-4 3 3 5-6 4 5v2l-4-5-5 6-3-3-3 4z"/></svg>',
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
    label: 'Bar Chart',
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
    label: 'Pie Chart',
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
    label: 'Radar Chart',
    component: RadarChartComponent,
    defaultColor: '#8884d8',
    defaultTitle: 'Performance Metrics',
    dataSource: '',
    icon: '<svg viewBox="0 0 24 24" width="100%" height="100%"><g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="12" x2="12" y2="3"/><line x1="12" y1="12" x2="20" y2="8"/><line x1="12" y1="12" x2="17" y2="20"/><line x1="12" y1="12" x2="7" y2="20"/><line x1="12" y1="12" x2="4" y2="8"/><polygon points="12,6 17.5,9.5 15,16 9,16 6.5,9.5"/></g></svg>',
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
    label: 'Radial Bar Chart',
    component: RadialBarChartComponent,
    defaultColor: '',
    defaultTitle: 'Customer Satisfaction',
    dataSource: '',
    icon: '<svg viewBox="0 0 24 24" width="100%" height="100%"><g fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="3"/></g></svg>',
    traits: [
      { type: 'text', label: 'Chart Title', name: 'chart-title', value: 'Customer Satisfaction', changeProp: 1 },
      { type: 'select', label: 'Data Source', name: 'data-source', value: '', options: getClassOptions(), changeProp: 1 },
      { type: 'select', label: 'Categories', name: 'label_field', value: '', options: [], changeProp: 1 },
      { type: 'select', label: 'Values', name: 'data_field', value: '', options: [], changeProp: 1 },
    ],
  },
];
