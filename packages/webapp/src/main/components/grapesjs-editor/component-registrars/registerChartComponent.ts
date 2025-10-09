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
        // ✅ Initialize trait values as component attributes (for serialization)
        'data-source': '',
        'label_field': '',
        'data_field': '',
      },
      init(this: any) {
        const traits = this.get('traits');
        traits.reset(config.traits);
        this.on('change:chart-color change:chart-title', this.renderReactChart);

        // Update data-source trait with fresh class options (called dynamically when component is initialized)
        const dataSourceTrait = traits.where({ name: 'data-source' })[0];
        if (dataSourceTrait) {
          const classOptions = getClassOptions();
          console.log('📊 Chart Component - Loading class options:', classOptions);
          dataSourceTrait.set('options', classOptions);
        }

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
