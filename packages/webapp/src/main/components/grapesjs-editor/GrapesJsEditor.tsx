import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import styled from 'styled-components';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import grapesJsBlocksBasic from 'grapesjs-blocks-basic';
import { LineChartComponent } from './LineChartComponent';

const GrapesJsContainer = styled.div`
  width: 100%;
  height: calc(100vh - 60px);
  position: relative;
  overflow: hidden;
  border: 3px solid #444;
  
  .gjs-cv-canvas {
    width: 100%;
    height: 100%;
  }
`;

const EditorContainer = styled.div`
  display: flex;
  height: 100%;
  gap: 0;
  
  .gjs-editor {
    width: 100%;
    height: 100%;
  }
`;

const LeftSidebar = styled.div`
  flex: 0 0 230px;
  background-color: #3d3d3d;
  border-right: 1px solid #555;
  overflow-y: auto;
  color: #fff;
`;

const MainArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  background-color: #3d3d3d;
  border-bottom: 1px solid #555;
  padding: 8px;
  gap: 8px;
  
  button {
    background: #444;
    border: 1px solid #666;
    color: #fff;
    padding: 6px 12px;
    cursor: pointer;
    border-radius: 3px;
    font-size: 14px;
    
    &:hover {
      background: #555;
    }
  }
`;

const CanvasArea = styled.div`
  flex: 1;
  overflow: hidden;
  position: relative;
`;

const RightSidebar = styled.div`
  flex: 0 0 250px;
  background-color: #3d3d3d;
  border-left: 1px solid #555;
  overflow-y: auto;
  color: #fff;
  display: flex;
  flex-direction: column;
`;

const BlocksSection = styled.div`
  padding: 10px;
  
  h3 {
    margin: 0 0 10px 0;
    font-size: 14px;
    font-weight: bold;
    color: #ddd;
  }
`;

const StylesSection = styled.div`
  padding: 10px;
  border-top: 1px solid #555;
  flex: 1;
  overflow-y: auto;
  
  h3 {
    margin: 0 0 10px 0;
    font-size: 14px;
    font-weight: bold;
    color: #ddd;
  }
`;

const LayersSection = styled.div`
  padding: 10px;
  
  h3 {
    margin: 0 0 10px 0;
    font-size: 14px;
    font-weight: bold;
    color: #ddd;
  }
`;

export const GrapesJsEditor: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!editorRef.current || editorInstanceRef.current) return;

    // Initialize GrapesJS
    const editor = grapesjs.init({
      container: editorRef.current,
      height: '100%',
      width: 'auto',
      storageManager: {
        type: 'local',
        autosave: true,
        autoload: true,
      },
      plugins: [grapesJsBlocksBasic as any],
      pluginsOpts: {
        'grapesjs-blocks-basic': {
          blocks: ['column1', 'column2', 'column3', 'column3-7', 'text', 'link', 'image', 'video', 'map'],
          flexGrid: true,
          category: 'Basic',
        },
      },
      deviceManager: {
        devices: [
          { name: 'Desktop', width: '' },
          { name: 'Tablet', width: '768px' },
          { name: 'Mobile landscape', width: '568px' },
          { name: 'Mobile portrait', width: '320px' },
        ],
      },
      panels: { defaults: [] },
    } as any);

    editorInstanceRef.current = editor;

    // Define custom Line Chart component type using Recharts
    // @ts-ignore - GrapesJS types don't fully support custom component extensions
    (editor as any).DomComponents.addType('line-chart', {
      isComponent: (el: any) => {
        if (el && el.classList && el.classList.contains('line-chart-container')) {
          return { type: 'line-chart' };
        }
      },
      model: {
        defaults: {
          tagName: 'div',
          attributes: { class: 'line-chart-container', 'data-gjs-type': 'line-chart' },
          droppable: false,
          'chart-color': '#4CAF50',
          'chart-title': 'Sales Over Time',
        },
        init() {
          // @ts-ignore
          this.on('change:chart-color', this.renderReactChart);
          // @ts-ignore
          this.on('change:chart-title', this.renderReactChart);
          
          // Setup traits
          // @ts-ignore
          const traits = this.get('traits');
          traits.reset([
            {
              type: 'text',
              name: 'id',
              label: 'ID',
            },
            {
              type: 'text',
              name: 'chart-title',
              label: 'Chart Title',
              changeProp: true,
            },
            {
              type: 'color',
              name: 'chart-color',
              label: 'Line Color',
              changeProp: true,
            },
                        {
              type: '1',
              name: 'chart-color',
              label: '15 minutes',
              changeProp: true,
            }
          ]);
        },
        renderReactChart() {
          // @ts-ignore
          const color = this.get('chart-color') || '#4CAF50';
          // @ts-ignore
          const title = this.get('chart-title') || 'Sales Over Time';
          // @ts-ignore
          const el = this.view?.el;
          
          if (el) {
            // Clear existing content
            el.innerHTML = '';
            
            // Render React component
            const root = ReactDOM.createRoot(el);
            root.render(
              React.createElement(LineChartComponent, {
                color: color,
                title: title,
              })
            );
          }
        },
      },
      view: {
        onRender() {
          // @ts-ignore
          const model = this.model;
          setTimeout(() => {
            model.renderReactChart();
          }, 100);
        },
      },
    });

    // Add custom blocks BEFORE rendering managers
    (editor as any).BlockManager.add('section', {
      label: 'Section',
      content: `<section style="padding: 20px;">
        <h1>Section Title</h1>
        <p>Section content goes here</p>
      </section>`,
      category: 'Custom',
    });

    (editor as any).BlockManager.add('container', {
      label: 'Container',
      content: '<div style="padding: 20px; min-height: 100px; border: 1px dashed #ccc;">Container</div>',
      category: 'Custom',
    });

    // Add Line Chart Component using Recharts
    (editor as any).BlockManager.add('line-chart', {
      label: '📈 Line Chart',
      content: {
        type: 'line-chart',
        'chart-color': '#4CAF50',
        'chart-title': 'Sales Over Time',
      },
      category: 'Charts',
      attributes: { class: 'fa fa-line-chart' }
    });

    // Define custom Button component type with advanced options
    (editor as any).DomComponents.addType('custom-button', {
      isComponent: (el: any) => {
        if (el && el.tagName === 'A' && el.classList && el.classList.contains('custom-button')) {
          return { type: 'custom-button' };
        }
      },
      model: {
        defaults: {
          tagName: 'a',
          attributes: { 
            class: 'custom-button',
            href: '#',
          },
          content: 'Click Me',
          style: {
            'display': 'inline-block',
            'padding': '12px 24px',
            'background-color': '#007bff',
            'color': '#ffffff',
            'text-decoration': 'none',
            'border-radius': '4px',
            'font-family': 'Arial, sans-serif',
            'font-size': '16px',
            'font-weight': 'bold',
            'text-align': 'center',
            'cursor': 'pointer',
            'border': 'none',
            'transition': 'background-color 0.3s ease',
          },
        },
        init() {
          // @ts-ignore
          const traits = this.get('traits');
          traits.reset([
            {
              type: 'text',
              name: 'id',
              label: 'ID',
            },
            {
              type: 'text',
              name: 'content',
              label: 'Button Text',
              changeProp: true,
            },
            {
              type: 'text',
              name: 'href',
              label: 'Link URL',
              placeholder: 'https://example.com or #section-id',
            },
            {
              type: 'select',
              name: 'target',
              label: 'Link Target',
              options: [
                { value: '_self', name: 'Same Window' },
                { value: '_blank', name: 'New Window' },
              ],
            },
            {
              type: 'color',
              name: 'background-color',
              label: 'Background Color',
              changeProp: true,
            },
            {
              type: 'color',
              name: 'text-color',
              label: 'Text Color',
              changeProp: true,
            },
            {
              type: 'select',
              name: 'button-size',
              label: 'Button Size',
              changeProp: true,
              options: [
                { value: 'small', name: 'Small' },
                { value: 'medium', name: 'Medium' },
                { value: 'large', name: 'Large' },
              ],
            },
            {
              type: 'select',
              name: 'position',
              label: 'Alignment',
              changeProp: true,
              options: [
                { value: 'left', name: 'Left' },
                { value: 'center', name: 'Center' },
                { value: 'right', name: 'Right' },
              ],
            },
          ]);

          // @ts-ignore
          this.on('change:content', this.updateContent);
          // @ts-ignore
          this.on('change:background-color', this.updateBackgroundColor);
          // @ts-ignore
          this.on('change:text-color', this.updateTextColor);
          // @ts-ignore
          this.on('change:button-size', this.updateButtonSize);
          // @ts-ignore
          this.on('change:position', this.updatePosition);
        },
        updateContent() {
          // @ts-ignore
          const content = this.get('content') || 'Click Me';
          // @ts-ignore
          const el = this.view?.el;
          if (el) el.textContent = content;
        },
        updateBackgroundColor() {
          // @ts-ignore
          const color = this.get('background-color') || '#007bff';
          // @ts-ignore
          this.addStyle({ 'background-color': color });
        },
        updateTextColor() {
          // @ts-ignore
          const color = this.get('text-color') || '#ffffff';
          // @ts-ignore
          this.addStyle({ 'color': color });
        },
        updateButtonSize() {
          // @ts-ignore
          const size = this.get('button-size') || 'medium';
          const sizes = {
            small: { padding: '8px 16px', 'font-size': '14px' },
            medium: { padding: '12px 24px', 'font-size': '16px' },
            large: { padding: '16px 32px', 'font-size': '18px' },
          };
          // @ts-ignore
          this.addStyle(sizes[size] || sizes.medium);
        },
        updatePosition() {
          // @ts-ignore
          const position = this.get('position') || 'left';
          // @ts-ignore
          const parent = this.parent();
          if (parent) {
            const parentEl = parent.view?.el;
            if (parentEl) {
              parentEl.style.textAlign = position;
            }
          }
        },
      },
    });

    // Add Button Component Block
    (editor as any).BlockManager.add('custom-button', {
      label: '🔘 Button',
      content: {
        type: 'custom-button',
        content: 'Click Me',
      },
      category: 'Basic',
      attributes: { class: 'fa fa-square' }
    });

    // Configure managers - Render them into custom containers
    setTimeout(() => {
      const blocksContainer = document.getElementById('blocks');
      if (blocksContainer) {
        const blockManagerEl = (editor as any).BlockManager.render();
        blocksContainer.appendChild(blockManagerEl);
      }
      const stylesContainer = document.getElementById('styles-container');
      if (stylesContainer) {
        stylesContainer.appendChild((editor as any).StyleManager.render());
      }
      const layersContainer = document.getElementById('layers-container');
      if (layersContainer) {
        layersContainer.appendChild((editor as any).LayerManager.render());
      }
      const traitsContainer = document.getElementById('traits-container');
      if (traitsContainer) {
        traitsContainer.appendChild((editor as any).TraitManager.render());
      }
    }, 100);

    // Add device commands
    (editor as any).Commands.add('set-device-desktop', (editor: any) => editor.setDevice('Desktop'));
    (editor as any).Commands.add('set-device-tablet', (editor: any) => editor.setDevice('Tablet'));
    (editor as any).Commands.add('set-device-mobile', (editor: any) => editor.setDevice('Mobile landscape'));

    // Add initial content with sections and navigation
    (editor as any).addComponents(`
      <!-- Navigation Section -->
      <div id="navigation" style="padding: 20px; background: #2c3e50; text-align: center; font-family: Arial, sans-serif; position: sticky; top: 0; z-index: 1000;">
        <h2 style="color: #fff; margin-bottom: 15px;">Navigation Menu</h2>
        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
          <a href="#home" class="custom-button" style="display: inline-block; padding: 12px 24px; background-color: #3498db; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold;">Home</a>
          <a href="#about" class="custom-button" style="display: inline-block; padding: 12px 24px; background-color: #e74c3c; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold;">About</a>
          <a href="#services" class="custom-button" style="display: inline-block; padding: 12px 24px; background-color: #2ecc71; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold;">Services</a>
          <a href="#contact" class="custom-button" style="display: inline-block; padding: 12px 24px; background-color: #f39c12; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold;">Contact</a>
        </div>
      </div>

      <!-- Home Section -->
      <div id="home" style="padding: 80px 40px; text-align: center; font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; min-height: 400px; display: flex; flex-direction: column; justify-content: center;">
        <h1 style="font-size: 48px; margin-bottom: 20px;">Welcome to GrapesJS Editor</h1>
        <p style="font-size: 20px; margin-bottom: 30px;">Build beautiful pages with drag and drop!</p>
        <div style="text-align: center;">
          <a href="#about" class="custom-button" style="display: inline-block; padding: 16px 32px; background-color: #ffffff; color: #667eea; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 18px;">Learn More</a>
        </div>
      </div>

      <!-- About Section -->
      <div id="about" style="padding: 80px 40px; text-align: center; font-family: Arial, sans-serif; background: #ecf0f1; min-height: 400px;">
        <h2 style="color: #2c3e50; font-size: 36px; margin-bottom: 20px;">About Section</h2>
        <p style="color: #34495e; font-size: 18px; max-width: 800px; margin: 0 auto 30px;">This is an example about section. You can edit any text, add images, or drag new components here.</p>
        <div style="background: white; padding: 30px; border-radius: 8px; max-width: 700px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h3 style="color: #2c3e50; margin-bottom: 15px;">Key Features</h3>
          <p style="margin: 10px 0;">✅ Drag and drop components</p>
          <p style="margin: 10px 0;">✅ Customize colors and styles</p>
          <p style="margin: 10px 0;">✅ Link between sections easily</p>
          <p style="margin: 10px 0;">✅ Export your design</p>
        </div>
        <div style="margin-top: 30px;">
          <a href="#services" class="custom-button" style="display: inline-block; padding: 12px 24px; background-color: #2ecc71; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold;">View Services</a>
        </div>
      </div>

      <!-- Services Section -->
      <div id="services" style="padding: 80px 40px; text-align: center; font-family: Arial, sans-serif; background: #ffffff; min-height: 400px;">
        <h2 style="color: #2c3e50; font-size: 36px; margin-bottom: 20px;">Our Services</h2>
        <p style="color: #7f8c8d; font-size: 18px; margin-bottom: 40px;">Explore what we offer</p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px; max-width: 1200px; margin: 0 auto;">
          <div style="padding: 30px; background: #3498db; color: white; border-radius: 8px;">
            <h3 style="margin-bottom: 15px;">Web Design</h3>
            <p>Beautiful, responsive websites</p>
          </div>
          <div style="padding: 30px; background: #e74c3c; color: white; border-radius: 8px;">
            <h3 style="margin-bottom: 15px;">Development</h3>
            <p>Custom web applications</p>
          </div>
          <div style="padding: 30px; background: #2ecc71; color: white; border-radius: 8px;">
            <h3 style="margin-bottom: 15px;">Consulting</h3>
            <p>Expert advice and strategy</p>
          </div>
        </div>
        <div style="margin-top: 40px;">
          <a href="#contact" class="custom-button" style="display: inline-block; padding: 12px 24px; background-color: #f39c12; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold;">Get in Touch</a>
        </div>
      </div>

      <!-- Contact Section -->
      <div id="contact" style="padding: 80px 40px; text-align: center; font-family: Arial, sans-serif; background: #34495e; color: white; min-height: 400px;">
        <h2 style="font-size: 36px; margin-bottom: 20px;">Contact Us</h2>
        <p style="font-size: 18px; margin-bottom: 30px;">Have questions? Reach out to us!</p>
        <div style="background: rgba(255,255,255,0.1); padding: 30px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
          <p style="margin: 15px 0; font-size: 18px;">📧 Email: hello@example.com</p>
          <p style="margin: 15px 0; font-size: 18px;">📱 Phone: (555) 123-4567</p>
          <p style="margin: 15px 0; font-size: 18px;">📍 Location: New York, NY</p>
        </div>
        <div style="margin-top: 30px;">
          <a href="#home" class="custom-button" style="display: inline-block; padding: 12px 24px; background-color: #3498db; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold;">Back to Top</a>
        </div>
      </div>
    `);

    // Store globally for toolbar access
    (window as any).grapesEditor = editor;

    // Cleanup
    return () => {
      if (editorInstanceRef.current) {
        editorInstanceRef.current.destroy();
        editorInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <GrapesJsContainer>
      <EditorContainer>
        <LeftSidebar>
          <LayersSection>
            <h3>Layers</h3>
            <div id="layers-container"></div>
          </LayersSection>
          <div style={{ borderTop: '1px solid #555', paddingTop: '10px' }}>
            <LayersSection>
              <h3>Traits</h3>
              <div id="traits-container"></div>
            </LayersSection>
          </div>
        </LeftSidebar>
        
        <MainArea>
          <TopBar>
            <button onClick={() => {
              const editor = (window as any).grapesEditor;
              if (editor) editor.runCommand('set-device-desktop');
            }}>
              🖥️ Desktop
            </button>
            <button onClick={() => {
              const editor = (window as any).grapesEditor;
              if (editor) editor.runCommand('set-device-tablet');
            }}>
              📱 Tablet
            </button>
            <button onClick={() => {
              const editor = (window as any).grapesEditor;
              if (editor) editor.runCommand('set-device-mobile');
            }}>
              📱 Mobile
            </button>
            <button onClick={() => {
              const editor = (window as any).grapesEditor;
              if (editor) editor.runCommand('core:component-outline');
            }}>
              🔲 Borders
            </button>
            <button onClick={() => {
              const editor = (window as any).grapesEditor;
              if (editor) {
                // Get project data as JSON
                const projectData = editor.getProjectData();
                const jsonString = JSON.stringify(projectData, null, 2);
                
                // Download JSON file
                const blob = new Blob([jsonString], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'page-design.json';
                a.click();
                URL.revokeObjectURL(url);
                
                console.log('JSON Export:', jsonString);
                alert('JSON file downloaded! Check your downloads folder.');
              }
            }}>
              📦 Export JSON
            </button>
            <button onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.json';
              input.onchange = (e: any) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event: any) => {
                    try {
                      const jsonData = JSON.parse(event.target.result);
                      const editor = (window as any).grapesEditor;
                      if (editor) {
                        editor.loadProjectData(jsonData);
                        alert('Design loaded successfully!');
                      }
                    } catch (error) {
                      alert('Error loading JSON file. Please check the file format.');
                      console.error('Import error:', error);
                    }
                  };
                  reader.readAsText(file);
                }
              };
              input.click();
            }}>
              📥 Import JSON
            </button>
            <button onClick={() => {
              const editor = (window as any).grapesEditor;
              if (editor) {
                const html = editor.getHtml();
                const css = editor.getCss();
                console.log('HTML:', html);
                console.log('CSS:', css);
                
                // Create complete HTML document
                const code = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Page</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; }
${css}
  </style>
</head>
<body>
${html}
</body>
</html>`;
                
                // Download HTML file
                const blob = new Blob([code], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'page.html';
                a.click();
                URL.revokeObjectURL(url);
                
                alert('HTML file downloaded! Check your downloads folder.');
              }
            }}>
              � Export HTML
            </button>
            <button onClick={() => {
              const editor = (window as any).grapesEditor;
              if (editor) {
                if (confirm('Are you sure you want to clear the canvas? This cannot be undone.')) {
                  editor.runCommand('core:canvas-clear');
                }
              }
            }}>
              🗑️ Clear
            </button>
          </TopBar>
          
          <CanvasArea>
            <div ref={editorRef} style={{ height: '100%', width: '100%' }}></div>
          </CanvasArea>
        </MainArea>
        
        <RightSidebar>
          <BlocksSection>
            <h3>Blocks</h3>
            <div id="blocks"></div>
          </BlocksSection>
          
          <StylesSection>
            <h3>Styles</h3>
            <div id="styles-container"></div>
          </StylesSection>
        </RightSidebar>
      </EditorContainer>
    </GrapesJsContainer>
  );
};
