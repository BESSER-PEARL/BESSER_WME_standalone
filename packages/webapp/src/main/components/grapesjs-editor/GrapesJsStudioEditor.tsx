import React, { useEffect, useRef } from 'react';
import grapesjs, { Editor } from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import gjsPresetWebpage from 'grapesjs-preset-webpage';
import gjsCustomCode from 'grapesjs-custom-code';
import gjsStyleBg from 'grapesjs-style-bg';
import './grapesjs-styles.css';
import { getClassOptions } from './diagram-helpers';
import { chartConfigs } from './configs/chartConfigs';
import { mapConfig } from './configs/mapConfig';
import { registerChartComponent } from './component-registrars/registerChartComponent';
import { registerMapComponent } from './component-registrars/registerMapComponent';
import { registerButtonComponent } from './component-registrars/registerButtonComponent';
import { setupPageSystem, loadDefaultPages } from './setup/setupPageSystem';
import { setupLayoutBlocks } from './setup/setupLayoutBlocks';

export const GrapesJsStudioEditor: React.FC = () => {
  const editorRef = useRef<Editor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize GrapesJS editor with default UI
    const editor = grapesjs.init({
      container: containerRef.current,
      height: '100vh',
      width: 'auto',
      fromElement: false,
      
      // Storage configuration
      storageManager: {
        type: 'local',
        autosave: true,
        autoload: true,
        stepsBeforeSave: 1,
        options: {
          local: {
            key: 'gjsProject'
          }
        }
      },

      // Plugins
      plugins: [gjsPresetWebpage as any, gjsCustomCode as any, gjsStyleBg as any],
      pluginsOpts: {
        'grapesjs-preset-webpage': {
          modalImportTitle: 'Import Template',
          modalImportLabel: '<div style="margin-bottom: 10px; font-size: 13px;">Paste here your HTML/CSS and click Import</div>',
          modalImportContent: function(editor: Editor) {
            return editor.getHtml() + '<style>' + editor.getCss() + '</style>';
          },
          filestackOpts: null,
          aviaryOpts: false,
          blocksBasicOpts: {
            blocks: ['column1', 'column2', 'column3', 'column3-7', 'text', 'link', 'image', 'video', 'map'],
            flexGrid: true,
          },
          customStyleManager: [],
        },
        'grapesjs-custom-code': {},
        'grapesjs-style-bg': {},
      },

      // Show borders by default
      showOffsets: true,
    });

    // Store editor reference
    editorRef.current = editor;
    (window as any).editor = editor;

    // Setup absolute positioning support
    setupAbsolutePositioning(editor);

    // Setup custom commands (export, JSON)
    setupCommands(editor);

    // Setup page management system
    setupPageSystem(editor);
    
    // Setup context menu
    setupContextMenu(editor);
    
    // Setup layout blocks
    setupLayoutBlocks(editor);

    // Register custom components
    chartConfigs.forEach((config) => {
      registerChartComponent(editor, config);
    });

    // Register map component
    registerMapComponent(editor, mapConfig);

    // Register button component with link functionality
    registerButtonComponent(editor);

    // Cleanup on unmount
    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
      }
    };
  }, []);

  return (
    <div ref={containerRef} id="gjs"></div>
  );
};

// Helper: Setup absolute positioning support
function setupAbsolutePositioning(editor: Editor) {
  // Enable absolute positioning for components
  editor.on('component:selected', (component: any) => {
    const toolbar = component.get('toolbar');
    const commandExists = toolbar.some((item: any) => item.command === 'tlb-move-absolute');
    
    if (!commandExists) {
      toolbar.unshift({
        attributes: { class: 'fa fa-arrows', title: 'Enable Absolute Position' },
        command: 'tlb-move-absolute',
      });
    }
  });

  // Add command for absolute positioning
  editor.Commands.add('tlb-move-absolute', {
    run(editor: Editor, sender: any, opts: any) {
      const component = opts.component || editor.getSelected();
      if (component) {
        const currentPosition = component.getStyle().position;
        if (currentPosition === 'absolute') {
          // Disable absolute positioning
          component.setStyle({ 
            position: 'relative', 
            top: 'auto', 
            left: 'auto',
            right: 'auto',
            bottom: 'auto'
          });
        } else {
          // Enable absolute positioning - preserve current visual position
          const el = component.getEl();
          if (el) {
            const rect = el.getBoundingClientRect();
            const parent = el.parentElement;
            if (parent) {
              const parentRect = parent.getBoundingClientRect();
              const top = rect.top - parentRect.top;
              const left = rect.left - parentRect.left;
              component.setStyle({ 
                position: 'absolute', 
                top: `${top}px`, 
                left: `${left}px` 
              });
            } else {
              component.setStyle({ 
                position: 'absolute', 
                top: '0px', 
                left: '0px' 
              });
            }
          } else {
            component.setStyle({ 
              position: 'absolute', 
              top: '0px', 
              left: '0px' 
            });
          }
        }
        
        // Update the view
        component.view.render();
      }
    },
  });
  
  // Make wrapper support absolute positioning
  editor.on('load', () => {
    const wrapper = editor.getWrapper();
    if (wrapper) {
      wrapper.setStyle({ 
        position: 'relative',
        minHeight: '100vh'
      });
    }
  });
  
  // Add CSS for better absolute positioning support
  const absPositionStyle = document.createElement('style');
  absPositionStyle.textContent = `
    /* Ensure canvas frame supports absolute positioning */
    .gjs-cv-canvas__frames > iframe {
      min-height: 100vh;
    }
    
    /* Better visual feedback for absolute positioned elements */
    .gjs-cv-canvas [data-gjs-type] {
      position: relative;
    }
    
    /* Show positioning handles when element is absolute */
    .gjs-selected[style*="position: absolute"]::before,
    .gjs-selected[style*="position:absolute"]::before {
      content: "📐 Absolute Position";
      position: absolute;
      top: -25px;
      left: 0;
      background: #667eea;
      color: white;
      padding: 2px 8px;
      border-radius: 3px;
      font-size: 11px;
      font-weight: bold;
      z-index: 9999;
      white-space: nowrap;
    }
  `;
  document.head.appendChild(absPositionStyle);
}

// Helper: Setup custom commands (export and JSON only)
function setupCommands(editor: Editor) {
  // Export template command
  editor.Commands.add('export-template', {
    run(editor: Editor) {
      const html = editor.getHtml();
      const css = editor.getCss();
      const fullCode = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>${css}</style>
</head>
<body>
${html}
</body>
</html>`;
      
      editor.Modal.setTitle('Export Template')
        .setContent(`<textarea style="width:100%; height: 400px; font-family: monospace; font-size: 12px;">${fullCode}</textarea>`)
        .open();
    },
  });

  // Show JSON command
  editor.Commands.add('show-json', {
    run(editor: Editor) {
      editor.Modal.setTitle('Project JSON')
        .setContent(`<textarea style="width:100%; height: 250px;">${JSON.stringify(editor.getProjectData(), null, 2)}</textarea>`)
        .open();
    },
  });
}

// Setup context menu (right-click menu)
function setupContextMenu(editor: Editor) {
  // Add context menu on right-click
  editor.on('canvas:drop', (dataTransfer: any, component: any) => {
    // Context menu logic here
  });
  
  // Context menu styling
  const style = document.createElement('style');
  style.textContent = `
    .context-menu {
      position: absolute;
      background: white;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      padding: 8px 0;
      z-index: 99999;
      min-width: 160px;
    }
    .context-menu-item {
      padding: 8px 16px;
      cursor: pointer;
      font-size: 13px;
      transition: background 0.2s;
    }
    .context-menu-item:hover {
      background: #f0f0f0;
    }
    .context-menu-divider {
      height: 1px;
      background: #ddd;
      margin: 4px 0;
    }
  `;
  document.head.appendChild(style);
}
