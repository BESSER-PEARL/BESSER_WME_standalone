import { getPageOptions } from '../utils/pageUtils';

/**
 * Register the button component with link/page navigation functionality
 * @param editor - GrapesJS editor instance
 */
export const registerButtonComponent = (editor: any) => {
  editor.Components.addType('link-button', {
    model: {
      defaults: {
        tagName: 'a',
        draggable: true,
        droppable: false,
        attributes: { 
          class: 'link-button-component',
          href: '#',
          'data-page-id': ''
        },
        style: {
          display: 'inline-block',
          padding: '12px 24px',
          background: '#3498db',
          color: '#ffffff',
          'text-decoration': 'none',
          'border-radius': '6px',
          'font-size': '16px',
          'font-weight': 'bold',
          cursor: 'pointer',
          border: 'none',
          transition: 'all 0.3s ease',
        },
        content: 'Button',
        'button-text': 'Button',
        'button-link-type': '',
        'button-link': '#',
        'button-target': '_self',
        'button-bg-color': '#3498db',
        'button-text-color': '#ffffff',
      },
      init(this: any) {
        const traits = this.get('traits');
        const pageOptions = getPageOptions(editor);
        
        traits.reset([
          {
            type: 'text',
            label: 'Button Text',
            name: 'button-text',
            value: 'Button',
            changeProp: 1,
          },
          {
            type: 'select',
            label: 'Link Type',
            name: 'button-link-type',
            value: '',
            changeProp: 1,
            options: pageOptions,
          },
          {
            type: 'text',
            label: 'Custom URL',
            name: 'button-link',
            value: '#',
            changeProp: 1,
            placeholder: 'https://example.com or #section-id',
          },
          {
            type: 'select',
            label: 'Open In',
            name: 'button-target',
            value: '_self',
            changeProp: 1,
            options: [
              { value: '_self', label: 'Same Tab' },
              { value: '_blank', label: 'New Tab' },
            ],
          },
          {
            type: 'color',
            label: 'Background Color',
            name: 'button-bg-color',
            value: '#3498db',
            changeProp: 1,
          },
          {
            type: 'color',
            label: 'Text Color',
            name: 'button-text-color',
            value: '#ffffff',
            changeProp: 1,
          },
        ]);

        this.on('change:button-text change:button-link-type change:button-link change:button-target change:button-bg-color change:button-text-color', 
          this.updateButton);
      },
      updateButton(this: any) {
        const text = this.get('button-text') || 'Button';
        const linkType = this.get('button-link-type') || '';
        const customLink = this.get('button-link') || '#';
        const target = this.get('button-target') || '_self';
        const bgColor = this.get('button-bg-color') || '#3498db';
        const textColor = this.get('button-text-color') || '#ffffff';
        
        let finalLink = '#';
        let pageId = '';
        
        // Determine the final link based on link type
        if (linkType.startsWith('page:')) {
          // Extract page ID
          pageId = linkType.replace('page:', '');
          
          // Get the page name for the final link
          const page = editor.Pages.get(pageId);
          const pageName = page ? page.getName().toLowerCase().replace(/\s+/g, '-') : pageId;
          
          // For page navigation: use page name for exported site
          // Format: pagename.html (for multi-page export)
          finalLink = `${pageName}.html`;
          
          // Add click handler for page navigation (works in both editor and export)
          this.addAttributes({ 
            href: finalLink,
            target: '_self',
            'data-page-id': pageId,
            'data-page-name': pageName,
            'onclick': `event.preventDefault(); if (window.editor) { const page = window.editor.Pages.get('${pageId}'); if (page) { window.editor.Pages.select(page); } } else { window.location.href = '${finalLink}'; }`,
          });
        } else if (linkType === 'custom') {
          // Use custom URL
          finalLink = customLink;
          this.addAttributes({ 
            href: finalLink,
            target: target,
            'data-page-id': '',
            'onclick': '',
          });
        } else {
          // Default or empty
          finalLink = '#';
          this.addAttributes({ 
            href: finalLink,
            target: '_self',
            'data-page-id': '',
            'onclick': '',
          });
        }
        
        this.set('content', text);
        this.setStyle({
          background: bgColor,
          color: textColor,
        });
      },
    },
    view: {
      onRender({ model, el }: any) {
        // Store editor globally for page navigation
        (window as any).editor = editor;
        
        // Handle page navigation in editor
        el.addEventListener('click', (e: Event) => {
          e.preventDefault();
          const pageId = model.getAttributes()['data-page-id'];
          
          if (pageId) {
            // Navigate to the page in the editor
            const page = editor.Pages.get(pageId);
            if (page) {
              editor.Pages.select(page);
              console.log(`Navigating to page: ${page.getName()}`);
            }
          }
        });
      },
    },
    isComponent: (el: any) => {
      if (el.classList && el.classList.contains('link-button-component')) {
        return { type: 'link-button' };
      }
    },
  });

  // Add block to Block Manager
  editor.BlockManager.add('link-button', {
    label: '🔗 Link Button',
    category: 'Basic',
    content: { type: 'link-button' },
    media: '<svg viewBox="0 0 24 24" width="100%" height="100%"><path fill="currentColor" d="M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2C6.47,2 2,6.47 2,12C2,17.53 6.47,22 12,22C17.53,22 22,17.53 22,12C22,6.47 17.53,2 12,2M10,9.5H14V12.5H10V9.5Z"/></svg>',
  });
};
