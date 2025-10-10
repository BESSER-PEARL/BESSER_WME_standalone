import React, { useEffect, useRef } from 'react';
import grapesjs, { Editor } from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import gjsPresetWebpage from 'grapesjs-preset-webpage';
import gjsStyleBg from 'grapesjs-style-bg';
// @ts-ignore
import gjsBlocksBasic from 'grapesjs-blocks-basic';
// @ts-ignore
import gjsNavbar from 'grapesjs-navbar';
// @ts-ignore
import gjsTabs from 'grapesjs-tabs';
// @ts-ignore
import gjsTooltip from 'grapesjs-tooltip';
// @ts-ignore
import gjsPluginForms from 'grapesjs-plugin-forms';
// @ts-ignore
import gjsTuiImageEditor from 'grapesjs-tui-image-editor';
import './grapesjs-styles.css';
import { getClassOptions } from './diagram-helpers';
import { chartConfigs } from './configs/chartConfigs';
import { mapConfig } from './configs/mapConfig';
import { registerChartComponent } from './component-registrars/registerChartComponent';
import { registerMapComponent } from './component-registrars/registerMapComponent';
import { registerButtonComponent } from './component-registrars/registerButtonComponent';
import { setupPageSystem, loadDefaultPages } from './setup/setupPageSystem';
import { setupLayoutBlocks } from './setup/setupLayoutBlocks';
import { ProjectStorageRepository } from '../../services/storage/ProjectStorageRepository';

export const GrapesJsEditor: React.FC = () => {
  const editorRef = useRef<Editor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize GrapesJS editor with project storage integration
    const editor = grapesjs.init({
      container: containerRef.current,
      height: '100vh',
      width: 'auto',
      fromElement: false,
      
      // Storage configuration - integrate with ProjectStorageRepository
      storageManager: {
        type: 'remote',
        autosave: true,
        autoload: true,
        stepsBeforeSave: 1,
      },

      // Plugins
      plugins: [
        gjsPresetWebpage as any, 
        gjsStyleBg as any,
        gjsBlocksBasic as any,
        gjsNavbar as any,
        gjsTabs as any,
        gjsTooltip as any,
        gjsPluginForms as any,
        gjsTuiImageEditor as any,
      ],
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
          customStyleManager: [
            {
              name: 'Position',
              open: true,
              buildProps: ['position', 'top', 'right', 'bottom', 'left', 'z-index'],
            },
            {
              name: 'Dimension',
              open: false,
              buildProps: ['width', 'height', 'max-width', 'min-height'],
            },
          ],
        },
        'grapesjs-style-bg': {},
        'grapesjs-blocks-basic': {},
        'grapesjs-navbar': {},
        'grapesjs-tabs': {},
        'grapesjs-tooltip': {
          // Tooltip options
        },
        'grapesjs-plugin-forms': {
          // Form plugin options
        },
        'grapesjs-tui-image-editor': {
          config: {
            includeUI: {
              initMenu: 'filter',
            },
          },
        },
      },

      // Show borders by default
      showOffsets: true,
    });

    // Store editor reference
    editorRef.current = editor;
    (window as any).editor = editor;

    // Setup custom storage manager to use ProjectStorageRepository
    setupProjectStorageIntegration(editor);

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

    // ✅ NOW load storage - after everything is initialized
    editor.on('load', () => {
      console.log('🚀 Editor loaded, now loading stored data...');
      editor.StorageManager.load((data: any) => {
        if (data && Object.keys(data).length > 0) {
          console.log('📦 Stored data loaded successfully');
        } else {
          console.log('📦 No stored data, editor will use default pages');
        }
      });
    });

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

// Helper: Setup ProjectStorageRepository integration
function setupProjectStorageIntegration(editor: Editor) {
  const sm = editor.StorageManager;
  
  // Custom storage implementation
  sm.add('remote', {
    async load() {
      try {
        const project = ProjectStorageRepository.getCurrentProject();
        if (project && project.diagrams.GUINoCodeDiagram.grapesJsData) {
          console.log('📦 Loading GrapesJS data from project storage');
          const data = project.diagrams.GUINoCodeDiagram.grapesJsData;
          
          // Check if the loaded data has pages, if not, don't load it
          // This prevents overwriting default pages with empty data
          if (data.pages && Array.isArray(data.pages) && data.pages.length > 0) {
            return data;
          } else {
            console.log('📦 Stored data has no pages, keeping default pages');
            return {}; // Return empty to keep default pages
          }
        }
        console.log('📦 No existing GrapesJS data found, starting fresh');
        return {};
      } catch (error) {
        console.error('Error loading from project storage:', error);
        return {};
      }
    },
    
    async store(data: any) {
      try {
        const project = ProjectStorageRepository.getCurrentProject();
        if (project) {
          // Update the GUINoCodeDiagram with GrapesJS data
          const updated = ProjectStorageRepository.updateDiagram(
            project.id,
            'GUINoCodeDiagram',
            {
              ...project.diagrams.GUINoCodeDiagram,
              grapesJsData: data,
              lastUpdate: new Date().toISOString(),
            }
          );
          
          if (updated) {
            console.log('💾 GrapesJS data saved to project storage');
          } else {
            console.error('Failed to save GrapesJS data');
          }
        } else {
          console.warn('No active project found, cannot save GrapesJS data');
        }
      } catch (error) {
        console.error('Error saving to project storage:', error);
      }
    },
  });
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
