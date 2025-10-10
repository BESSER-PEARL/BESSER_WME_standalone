import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChartConfig } from '../configs/chartConfigs';
import { getAttributeOptionsByClassId, getEndsByClassId, getClassOptions } from '../diagram-helpers';

/**
 * Register a chart component in the GrapesJS editor
 * @param editor - GrapesJS editor instance
 * @param config - Chart configuration
 */
export const registerChartComponent = (editor: any, config: ChartConfig) => {
  // Build trait values inside the attributes object
  const traitAttributes: Record<string, any> = { class: `${config.id}-component` };
  if (Array.isArray(config.traits)) {
    config.traits.forEach(trait => {
      traitAttributes[trait.name] = trait.value !== undefined && trait.value !== null ? trait.value : '';
    });
  }
  const baseDefaults = {
    tagName: 'div',
    draggable: true,
    droppable: false,
    attributes: traitAttributes,
    style: {
      width: '100%',
      'min-height': '400px',
    },
  };
  editor.Components.addType(config.id, {
    model: {
      defaults: baseDefaults,
      init(this: any) {
        const traits = this.get('traits');
        traits.reset(config.traits);
        // Ensure all trait values are set as attributes if not already present
        if (Array.isArray(config.traits)) {
          config.traits.forEach(trait => {
            if (this.get(trait.name) === undefined) {
              this.set(trait.name, trait.value !== undefined && trait.value !== null ? trait.value : '');
            }
          });
        }
        this.on('change:chart-color change:chart-title', this.renderReactChart);

        // Update data-source trait with fresh class options (called dynamically when component is initialized)
        const dataSourceTrait = traits.where({ name: 'data-source' })[0];
        if (dataSourceTrait) {
          const classOptions = getClassOptions();
          console.log('📊 Chart Component - Loading class options:', classOptions);
          dataSourceTrait.set('options', classOptions);
        }

        // Helper to update label-field and data-field options
        const updateFieldOptions = (classId: string) => {
          const attrOptions = getAttributeOptionsByClassId(classId);
          const relOptions = getEndsByClassId(classId);
          const allOptions = [...attrOptions, ...relOptions];
          const labelTrait = traits.where({ name: 'label-field' })[0];
          const dataTrait = traits.where({ name: 'data-field' })[0];
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
