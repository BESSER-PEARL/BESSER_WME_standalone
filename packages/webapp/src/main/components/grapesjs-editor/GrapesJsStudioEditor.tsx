import React from 'react';
import StudioEditor from '@grapesjs/studio-sdk/react';
import '@grapesjs/studio-sdk/style';
import { canvasAbsoluteMode } from '@grapesjs/studio-sdk-plugins';
import { getClassOptions } from './diagram-helpers';
import { chartConfigs } from './configs/chartConfigs';
import { mapConfig } from './configs/mapConfig';
import { registerChartComponent } from './component-registrars/registerChartComponent';
import { registerMapComponent } from './component-registrars/registerMapComponent';
import { registerButtonComponent } from './component-registrars/registerButtonComponent';

export const GrapesJsStudioEditor: React.FC = () => {
  const handleEditorReady = (editor: any) => {
    console.log('Editor is ready:', editor);
    console.log("Classes: ", getClassOptions());

    // Register all chart components
    chartConfigs.forEach((config) => {
      registerChartComponent(editor, config);
    });

    // Register map component
    registerMapComponent(editor, mapConfig);

    // Register button component with link functionality
    registerButtonComponent(editor);

    console.log('All chart, map, and button components added to Studio Editor');
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
                      <h1 style="color: #333; margin-bottom: 20px; font-size: 48px;">Welcome to BESSER GUI Editor</h1>
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
