import React from 'react';
import ReactDOM from 'react-dom/client';
import StudioEditor from '@grapesjs/studio-sdk/react';
import '@grapesjs/studio-sdk/style';
import { canvasAbsoluteMode } from '@grapesjs/studio-sdk-plugins';
import { LineChartComponent } from './LineChartComponent';
import { getClassOptions, getAttributeOptionsByClassId, getEndsByClassId } from './diagram-helpers';
import { BarChartComponent } from './BarChartComponent';
import { PieChartComponent } from './PieChartComponent';
import { RadarChartComponent } from './RadarChartComponent';
import { RadialBarChartComponent } from './RadialBarChartComponent';
import { MapComponent } from './MapComponent';

// Chart configuration interface
interface ChartTrait {
  type: string;
  label: string;
  name: string;
  value: any;
  changeProp: number;
  options?: { value: string; label: string }[];
}

interface ChartConfig {
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
const chartConfigs: ChartConfig[] = [
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
    icon: '<svg viewBox="0 0 24 24" width="100%" height="100%" <g fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="3"/></g></svg>',
    traits: [
      { type: 'text', label: 'Chart Title', name: 'chart-title', value: 'Customer Satisfaction', changeProp: 1 },
      { type: 'select', label: 'Data Source', name: 'data-source', value: '', options: getClassOptions(), changeProp: 1 },
      { type: 'select', label: 'Categories', name: 'label_field', value: '', options: [], changeProp: 1 },
      { type: 'select', label: 'Values', name: 'data_field', value: '', options: [], changeProp: 1 },
    ],
  },
];

// Map configuration
const mapConfig = {
  id: 'map',
  label: 'Map',
  component: MapComponent,
  defaultTitle: 'Location Map',
  defaultLatitude: 40.7128,
  defaultLongitude: -74.0060,
  icon: '<svg viewBox="0 0 24 24" width="100%" height="100%"><path fill="currentColor" d="M15,19L9,16.89V5L15,7.11M20.5,3C20.44,3 20.39,3 20.34,3L15,5.1L9,3L3.36,4.9C3.15,4.97 3,5.15 3,5.38V20.5A0.5,0.5 0 0,0 3.5,21C3.55,21 3.61,21 3.66,20.97L9,18.9L15,21L20.64,19.1C20.85,19 21,18.85 21,18.62V3.5A0.5,0.5 0 0,0 20.5,3Z"/></svg>',
  traits: [
    { type: 'text', label: 'Title', name: 'map-title', value: 'Location Map', changeProp: 1 },
    { type: 'number', label: 'Latitude', name: 'map-latitude', value: 40.7128, changeProp: 1 },
    { type: 'number', label: 'Longitude', name: 'map-longitude', value: -74.0060, changeProp: 1 },
    { type: 'number', label: 'Zoom', name: 'map-zoom', value: 12, changeProp: 1 },
  ],
};

export const GrapesJsStudioEditor: React.FC = () => {
  const handleEditorReady = (editor: any) => {
    console.log('Editor is ready:', editor);
    console.log("hello");
    console.log("Classes: ", getClassOptions());

    // Register all chart components
    chartConfigs.forEach((config) => {
      registerChartComponent(editor, config);
    });

    // Register map component
    registerMapComponent(editor, mapConfig);

    console.log('All chart and map components added to Studio Editor');
  };

  // Helper function to register chart components
  const registerChartComponent = (editor: any, config: ChartConfig) => {
    editor.Components.addType(config.id, {
      model: {
        defaults: {
          tagName: 'div',
          draggable: true,
          droppable: false,
          attributes: { class: `${config.id}-component` },
          style: {
            width: '100%',
            'min-height': '400px',
          },
          'chart-color': config.defaultColor,
          'chart-title': config.defaultTitle,
        },
        init(this: any) {
          const traits = this.get('traits');
          traits.reset(config.traits);
          this.on('change:chart-color change:chart-title', this.renderReactChart);

          // Helper to update label_field and data_field options
          const updateFieldOptions = (classId: string) => {
            const attrOptions = getAttributeOptionsByClassId(classId);
            const relOptions = getEndsByClassId(classId);
            const allOptions = [...attrOptions, ...relOptions];
            const labelTrait = traits.where({ name: 'label_field' })[0];
            const dataTrait = traits.where({ name: 'data_field' })[0];
            if (labelTrait) labelTrait.set('options', allOptions);
            if (dataTrait) dataTrait.set('options', allOptions);
          };

          // On init, if a class is already selected, set the options
          const selectedClass = this.get('data-source');
          if (selectedClass) {
            updateFieldOptions(selectedClass);
          }

          // Listen for changes to data-source (class selection) to update attribute/relationship options
          this.on('change:data-source', () => {
            const classId = this.get('data-source');
            updateFieldOptions(classId);
          });
        },
        renderReactChart(this: any) {
          const color = this.get('chart-color') || config.defaultColor;
          const title = this.get('chart-title') || config.defaultTitle;
          
          const view = this.getView();
          if (view && view.el) {
            const container = view.el;
            container.innerHTML = '';
            
            const root = ReactDOM.createRoot(container);
            const props: any = { title };
            if (color) props.color = color;
            
            root.render(React.createElement(config.component, props));
          }
        },
      },
      view: {
        onRender({ el, model }: any) {
          const color = model.get('chart-color') || config.defaultColor;
          const title = model.get('chart-title') || config.defaultTitle;
          
          const root = ReactDOM.createRoot(el);
          const props: any = { title };
          if (color) props.color = color;
          
          root.render(React.createElement(config.component, props));
        },
      },
      isComponent: (el: any) => {
        if (el.classList && el.classList.contains(`${config.id}-component`)) {
          return { type: config.id };
        }
      },
    });

    // Add block to Block Manager
    editor.BlockManager.add(config.id, {
      label: config.label,
      category: 'Charts',
      content: { type: config.id },
      media: config.icon,
    });
  };

  // Helper function to register map component
  const registerMapComponent = (editor: any, config: typeof mapConfig) => {
    editor.Components.addType(config.id, {
      model: {
        defaults: {
          tagName: 'div',
          draggable: true,
          droppable: false,
          attributes: { class: `${config.id}-component` },
          style: {
            width: '100%',
            'min-height': '450px',
          },
          'map-title': config.defaultTitle,
          'map-latitude': config.defaultLatitude,
          'map-longitude': config.defaultLongitude,
          'map-zoom': 12,
        },
        init(this: any) {
          const traits = this.get('traits');
          traits.reset(config.traits);
          this.on('change:map-title change:map-latitude change:map-longitude change:map-zoom', this.renderReactMap);
        },
        renderReactMap(this: any) {
          const title = this.get('map-title') || config.defaultTitle;
          const latitude = parseFloat(this.get('map-latitude')) || config.defaultLatitude;
          const longitude = parseFloat(this.get('map-longitude')) || config.defaultLongitude;
          const zoom = parseInt(this.get('map-zoom')) || 12;
          
          const view = this.getView();
          if (view && view.el) {
            const container = view.el;
            container.innerHTML = '';
            
            const root = ReactDOM.createRoot(container);
            root.render(
              React.createElement(config.component, {
                title,
                latitude,
                longitude,
                zoom,
              })
            );
          }
        },
      },
      view: {
        onRender({ el, model }: any) {
          const title = model.get('map-title') || config.defaultTitle;
          const latitude = parseFloat(model.get('map-latitude')) || config.defaultLatitude;
          const longitude = parseFloat(model.get('map-longitude')) || config.defaultLongitude;
          const zoom = parseInt(model.get('map-zoom')) || 12;
          
          const root = ReactDOM.createRoot(el);
          root.render(
            React.createElement(config.component, {
              title,
              latitude,
              longitude,
              zoom,
            })
          );
        },
      },
      isComponent: (el: any) => {
        if (el.classList && el.classList.contains(`${config.id}-component`)) {
          return { type: config.id };
        }
      },
    });

    // Add block to Block Manager
    editor.BlockManager.add(config.id, {
      label: config.label,
      category: 'Maps',
      content: { type: config.id },
      media: config.icon,
    });
  };

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <StudioEditor
        onEditor={handleEditorReady}
        options={{
          license: 'demo', // Use 'demo' for testing, get your license key from GrapesJS
          height: '100vh',
          storageManager: {
            type: 'local',
            autosave: true,
            autoload: true,
          },
          plugins: [
            canvasAbsoluteMode.init({
          globalAbsolute: false,
    
          // This is the default behavior when globalAbsolute is false
          enableAbsolute: ({ component }) => {
            const cmpEl = component.getEl();
            if (cmpEl && getComputedStyle(cmpEl).position === 'absolute') {
              return true;
            }
            return false;
          }
        })
          ],
          devices: {
            default: [
              { id: 'desktop', name: 'Desktop', width: '' },
              { id: 'tablet', name: 'Tablet', width: '768px' },
              { id: 'mobile', name: 'Mobile', width: '375px' },
            ]
          },
          project: {
            type: 'web',
            default: {
              pages: [
                {
                  name: 'Home',
                  component: `
                    <div style="padding: 40px; text-align: center; font-family: Arial, sans-serif;">
                      <h1 style="color: #333; margin-bottom: 20px; font-size: 48px;">Welcome to GrapesJS Studio</h1>
                      <p style="color: #666; margin-bottom: 30px; font-size: 18px;">Build beautiful multi-page websites with drag and drop!</p>
                      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 12px; color: white; max-width: 800px; margin: 0 auto;">
                        <h2 style="margin-bottom: 20px;">Getting Started</h2>
                        <p style="margin: 10px 0; font-size: 16px;">📦 1. Select blocks from the panel</p>
                        <p style="margin: 10px 0; font-size: 16px;">🖱️ 2. Drag them into the canvas</p>
                        <p style="margin: 10px 0; font-size: 16px;">📄 3. Switch between pages using the pages panel</p>
                        <p style="margin: 10px 0; font-size: 16px;">✏️ 4. Click to edit and style</p>
                      </div>
                    </div>
                  `,
                },
                {
                  name: 'About',
                  component: `
                    <div style="padding: 80px 40px; text-align: center; font-family: Arial, sans-serif; background: #ecf0f1; min-height: 100vh;">
                      <h1 style="color: #2c3e50; font-size: 48px; margin-bottom: 20px;">About Us</h1>
                      <p style="color: #34495e; font-size: 20px; max-width: 800px; margin: 0 auto 40px;">
                        This is the About page. You can edit this content and add your own components.
                      </p>
                      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px; max-width: 1200px; margin: 0 auto;">
                        <div style="padding: 30px; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                          <h3 style="color: #3498db; margin-bottom: 15px;">Mission</h3>
                          <p style="color: #555;">Our mission is to empower creators</p>
                        </div>
                        <div style="padding: 30px; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                          <h3 style="color: #e74c3c; margin-bottom: 15px;">Vision</h3>
                          <p style="color: #555;">Building the future of web design</p>
                        </div>
                        <div style="padding: 30px; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                          <h3 style="color: #2ecc71; margin-bottom: 15px;">Values</h3>
                          <p style="color: #555;">Innovation, quality, and user experience</p>
                        </div>
                      </div>
                    </div>
                  `,
                },
                {
                  name: 'Contact',
                  component: `
                    <div style="padding: 80px 40px; text-align: center; font-family: Arial, sans-serif; background: #34495e; color: white; min-height: 100vh;">
                      <h1 style="font-size: 48px; margin-bottom: 20px;">Contact Us</h1>
                      <p style="font-size: 20px; margin-bottom: 40px;">Get in touch with our team</p>
                      <div style="background: rgba(255,255,255,0.1); padding: 40px; border-radius: 12px; max-width: 600px; margin: 0 auto; backdrop-filter: blur(10px);">
                        <p style="margin: 20px 0; font-size: 18px;">📧 Email: hello@example.com</p>
                        <p style="margin: 20px 0; font-size: 18px;">📱 Phone: (555) 123-4567</p>
                        <p style="margin: 20px 0; font-size: 18px;">📍 Location: New York, NY</p>
                        <div style="margin-top: 40px;">
                          <button style="padding: 15px 40px; background: #3498db; color: white; border: none; border-radius: 8px; font-size: 18px; cursor: pointer; font-weight: bold;">
                            Send Message
                          </button>
                        </div>
                      </div>
                    </div>
                  `,
                },
                {
                  name: 'Presentation',
                  component: `
                    <div style="position: relative; width: 800px; height: 500px; margin: 70px auto 0; background: linear-gradient(135deg, #f5f7fa, #c3cfe2); color: #1a1a1a; border-radius: 12px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); overflow: hidden;">
                      <div style="position: absolute; top: 0; left: 550px; width: 300px; height: 100%; background-color: #baccec; transform: skewX(-12deg)"></div>
        
                      <h1 style="position: absolute; top: 40px; left: 40px; font-size: 50px; margin: 0; font-weight: 700;">
                        Absolute Mode
                      </h1>
        
                      <p style="position: absolute; top: 135px; left: 40px; font-size: 22px; max-width: 450px; line-height: 1.5; color: #333;">
                        Enable free positioning for your elements — perfect for fixed layouts like presentations, business cards, or print-ready designs.
                      </p>
        
                      <ul data-gjs-type="text" style="position: absolute; top: 290px; left: 40px; font-size: 18px; line-height: 2; list-style: none; padding: 0;">
                        <li>🎯 Drag & place elements anywhere</li>
                        <li>🧲 Smart snapping & axis locking</li>
                        <li>⚙️ Your custom logic</li>
                      </ul>
        
                      <div style="position: absolute; left: 540px; top: 100px; width: 200px; height: 200px; background: rgba(255, 255, 255, 0.3); border-radius: 20px; backdrop-filter: blur(10px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; font-size: 80px;">
                        📐
                      </div>
        
                      <div style="position: absolute; top: 405px; left: 590px; font-size: 14px; color: #555;">
                        Studio SDK · GrapesJS
                      </div>
                    </div>
        
                    <style>
                      body {
                        position: relative;
                        background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
                        font-family: system-ui;
                        overflow: hidden;
                      }
                    </style>
                  `,
                },
              ],
            },
          },
        }}
      />
    </div>
  );
};
