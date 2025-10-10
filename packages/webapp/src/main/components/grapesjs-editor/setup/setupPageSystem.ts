import { Editor } from 'grapesjs';

/**
 * Setup page management system with Studio SDK styling
 */
export function setupPageSystem(editor: Editor) {
  const pagesManager = editor.Pages;
  let accordionExpanded = true;
  
  // Wait for editor to fully load
  editor.on('load', () => {
    setTimeout(() => {
      // Find the views container where Style Manager, Layers, Blocks are displayed
      const viewsContainer = document.querySelector('.gjs-pn-views-container');
      
      if (viewsContainer) {
        // Create a pages panel with EXACT Studio SDK block panel structure
        const pagesPanel = document.createElement('div');
        pagesPanel.id = 'pages-panel';
        pagesPanel.className = 'gs-studio-panel gs-panel-pages';
        pagesPanel.style.cssText = 'display: block; flex-grow: 1; border-bottom-width: 1px; overflow: hidden;';
        
        pagesPanel.innerHTML = `
          <div class="gs-block-manager gs-utl-overflow-hidden gs-utl-flex-nowrap gs-utl-gap-2 gs-utl-flex gs-utl-flex-col gs-utl-h-full gs-utl-flex-wrap">

                <button id="add-page-btn" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3); transition: all 0.2s;">
                  <svg style="width: 16px; height: 16px;" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"></path>
                  </svg>
                  New Page
                </button>
              </div>
              
              <!-- Search Row -->
              <div class="gs-utl-flex gs-utl-items-center gs-utl-gap-2" style="background: #2c2c2c; border: 1px solid #3a3a3a; border-radius: 8px; padding: 8px 12px;">
                <svg style="width: 18px; height: 18px; color: #888; flex-shrink: 0;" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"></path>
                </svg>
                <input id="pages-search-input" type="search" placeholder="Search pages..." style="flex: 1; background: transparent; border: none; color: #fff; font-size: 13px; outline: none; font-family: inherit;" />
              </div>
            </div>
            
            <!-- Pages List -->
            <div class="gs-block-manager__content gs-utl-overflow-y-auto gs-utl-overflow-x-hidden gs-utl-flex-1">
              <div id="pages-list" style="padding: 12px; display: flex; flex-direction: column; gap: 8px;"></div>
            </div>
          </div>
        `;
        
        // Insert at the beginning of the views container
        if (viewsContainer.firstChild) {
          viewsContainer.insertBefore(pagesPanel, viewsContainer.firstChild);
        } else {
          viewsContainer.appendChild(pagesPanel);
        }
        
        console.log('Pages panel created');
        
        // Search functionality
        const searchInput = document.getElementById('pages-search-input') as HTMLInputElement;
        if (searchInput) {
          searchInput.addEventListener('input', (e) => {
            const searchTerm = (e.target as HTMLInputElement).value.toLowerCase();
            const pageItems = document.querySelectorAll('.gs-page-item');
            
            pageItems.forEach((item: any) => {
              const pageName = item.querySelector('.gs-page-item-name')?.textContent?.toLowerCase() || '';
              if (pageName.includes(searchTerm)) {
                item.style.display = 'flex';
              } else {
                item.style.display = 'none';
              }
            });
          });
        }
        
        // Add click handler for add page button
        const addPageBtn = document.getElementById('add-page-btn');
        if (addPageBtn) {
          addPageBtn.addEventListener('click', () => {
            const pageName = prompt('Enter page name:');
            if (pageName) {
              const page = pagesManager.add({
                name: pageName,
                component: '<div style="padding: 50px; text-align: center;"><h1>New Page: ' + pageName + '</h1></div>',
              });
              if (page) {
                pagesManager.select(page);
                updatePagesList(editor);
              }
            }
          });
        }
        
        // Add pages button to views panel
        const panelManager = editor.Panels;
        const pagesButton = panelManager.addButton('views', {
          id: 'show-pages',
          className: 'gjs-pn-btn',
          attributes: { 
            title: 'Pages',
          },
          command: 'show-pages',
          active: true, // Make it active by default
          label: `<svg style="display: block; max-width:22px" viewBox="0 0 24 24">
            <path fill="currentColor" d="M19,5V7H15V5M9,5V11H5V5M19,13V19H15V13M9,17V19H5V17M21,3H13V9H21M11,3H3V13H11M21,11H13V21H21M11,15H3V21H11Z"></path>
          </svg>`,
        } as any);
        
        console.log('Pages button added:', pagesButton);
        
        // Trigger the command to show pages panel by default
        setTimeout(() => {
          editor.runCommand('show-pages');
          // Force update pages list to show all pages
          updatePagesList(editor);
        }, 500);
        
        // Initial update
        updatePagesList(editor);
      } else {
        console.error('Could not find views container');
      }
    }, 300);
  });

  // Command to show pages panel
  editor.Commands.add('show-pages', {
    run(editor: Editor) {
      console.log('show-pages command triggered');
      
      // Hide all other panels in views container
      const viewsContainer = document.querySelector('.gjs-pn-views-container');
      if (viewsContainer) {
        const panels = viewsContainer.querySelectorAll(':scope > div, :scope > .gjs-pn-views');
        console.log('Found panels:', panels.length);
        
        panels.forEach((panel: any) => {
          if (panel.id !== 'pages-panel') {
            panel.style.display = 'none';
            console.log('Hiding panel:', panel.id || panel.className);
          }
        });
      }
      
      // Show pages panel
      const pagesPanel = document.getElementById('pages-panel');
      console.log('Pages panel element:', pagesPanel);
      
      if (pagesPanel) {
        pagesPanel.style.display = 'block';
        console.log('Pages panel shown');
        updatePagesList(editor);
      } else {
        console.error('Pages panel not found!');
      }
    },
    stop(editor: Editor) {
      console.log('show-pages command stopped');
      // Don't hide the panel when stopped, let it stay visible
    },
  });

  // Update pages list in the panel
  function updatePagesList(editor: Editor) {
    const pagesList = document.getElementById('pages-list');
    if (!pagesList) return;

    const pages = pagesManager.getAll();
    const currentPage = pagesManager.getSelected();
    
    console.log('Updating pages list:', pages.length, 'pages');
    
    pagesList.innerHTML = '';
    
    // Show empty state if no pages
    if (pages.length === 0) {
      pagesList.innerHTML = `
        <div style="padding: 40px 20px; text-align: center; color: #999;">
          <svg style="width: 64px; height: 64px; margin: 0 auto 16px; opacity: 0.5;" viewBox="0 0 24 24">
            <path fill="currentColor" d="M19,5V7H15V5M9,5V11H5V5M19,13V19H15V13M9,17V19H5V17M21,3H13V9H21M11,3H3V13H11M21,11H13V21H21M11,15H3V21H11Z"></path>
          </svg>
          <p style="font-size: 14px; margin-bottom: 8px; font-weight: 500;">No pages yet</p>
          <p style="font-size: 12px; opacity: 0.7;">Click "Add Page" to create your first page</p>
        </div>
      `;
      return;
    }
    
    pages.forEach((page: any, index: number) => {
      const pageName = page.getName ? page.getName() : page.get('name') || 'Untitled';
      const pageId = page.id || page.getId?.() || `page-${index + 1}`;
      const isSelected = page === currentPage || page.id === currentPage?.id;
      
      const pageItem = document.createElement('div');
      pageItem.className = 'gs-block-item gs-page-item';
      pageItem.style.cssText = `
        padding: 12px 14px;
        background: ${isSelected ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#2c2c2c'};
        color: white;
        border: 2px solid ${isSelected ? '#764ba2' : '#3a3a3a'};
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: ${isSelected ? '0 4px 12px rgba(118, 75, 162, 0.3)' : '0 2px 4px rgba(0,0,0,0.2)'};
        transform: ${isSelected ? 'translateY(-2px) scale(1.02)' : 'translateY(0) scale(1)'};
      `;
      
      pageItem.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 0;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <svg style="width: 20px; height: 20px; flex-shrink: 0; opacity: ${isSelected ? '1' : '0.7'};" viewBox="0 0 24 24">
              <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"></path>
            </svg>
            <span class="gs-page-item-name" style="flex: 1; font-size: 14px; font-weight: ${isSelected ? '700' : '500'}; letter-spacing: 0.3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${pageName}</span>
            ${isSelected ? '<span style="font-size: 14px; font-weight: bold; animation: fadeIn 0.3s;">✓</span>' : ''}
          </div>
          <div style="display: flex; align-items: center; gap: 6px; padding-left: 30px;">
            <span style="font-size: 10px; opacity: 0.6; font-family: 'Courier New', monospace; text-transform: uppercase;">ID:</span>
            <span style="font-size: 10px; opacity: 0.7; font-family: 'Courier New', monospace; color: ${isSelected ? '#e0e0e0' : '#aaa'};">${pageId}</span>
          </div>
        </div>
        <button class="delete-page-btn" data-index="${index}" style="background: rgba(231, 76, 60, 0.9); color: white; border: none; padding: 6px 11px; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: bold; margin-left: 10px; opacity: 0; transition: all 0.2s; transform: scale(0.9);">×</button>
      `;
      
      // Hover effect
      pageItem.addEventListener('mouseenter', () => {
        const deleteBtn = pageItem.querySelector('.delete-page-btn') as HTMLElement;
        if (deleteBtn) {
          deleteBtn.style.opacity = '1';
          deleteBtn.style.transform = 'scale(1)';
        }
        if (!isSelected) {
          pageItem.style.background = 'linear-gradient(135deg, #3a3a3a 0%, #4a4a4a 100%)';
          pageItem.style.borderColor = '#667eea';
          pageItem.style.transform = 'translateY(-2px) scale(1.02)';
          pageItem.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.2)';
        }
      });
      
      pageItem.addEventListener('mouseleave', () => {
        const deleteBtn = pageItem.querySelector('.delete-page-btn') as HTMLElement;
        if (deleteBtn) {
          deleteBtn.style.opacity = '0';
          deleteBtn.style.transform = 'scale(0.9)';
        }
        if (!isSelected) {
          pageItem.style.background = '#2c2c2c';
          pageItem.style.borderColor = '#3a3a3a';
          pageItem.style.transform = 'translateY(0) scale(1)';
          pageItem.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        }
      });
      
      // Click to select page
      pageItem.addEventListener('click', (e: any) => {
        if (!e.target.classList.contains('delete-page-btn')) {
          console.log('Selecting page:', pageName);
          pagesManager.select(page);
          setTimeout(() => {
            editor.refresh();
            updatePagesList(editor);
          }, 50);
        }
      });
      
      // Delete button
      const deleteBtn = pageItem.querySelector('.delete-page-btn');
      if (deleteBtn) {
        deleteBtn.addEventListener('mouseenter', () => {
          (deleteBtn as HTMLElement).style.background = 'rgba(231, 76, 60, 1)';
          (deleteBtn as HTMLElement).style.transform = 'scale(1.1)';
          (deleteBtn as HTMLElement).style.boxShadow = '0 4px 12px rgba(231, 76, 60, 0.4)';
        });
        
        deleteBtn.addEventListener('mouseleave', () => {
          (deleteBtn as HTMLElement).style.background = 'rgba(231, 76, 60, 0.9)';
          (deleteBtn as HTMLElement).style.transform = 'scale(1)';
          (deleteBtn as HTMLElement).style.boxShadow = 'none';
        });
        
        deleteBtn.addEventListener('click', (e: any) => {
          e.stopPropagation();
          if (confirm(`Delete page "${pageName}"?`)) {
            pagesManager.remove(page);
            updatePagesList(editor);
          }
        });
      }
      
      pagesList.appendChild(pageItem);
    });
  }

  // Command: Add new page
  editor.Commands.add('add-page', {
    run(editor: Editor) {
      const pageName = prompt('Enter page name:');
      if (pageName) {
        const page = pagesManager.add({
          name: pageName,
          component: '<div style="padding: 50px; text-align: center;"><h1>New Page: ' + pageName + '</h1></div>',
        });
        if (page) {
          pagesManager.select(page);
          updatePagesSelect(editor);
          updatePagesList(editor);
        }
      }
    },
  });

  // Command: Reset to default pages
  editor.Commands.add('reset-pages', {
    run(editor: Editor) {
      if (confirm('This will delete all pages and load the default pages. Continue?')) {
        console.log('Resetting to default pages...');
        // Remove all pages
        const allPages = pagesManager.getAll();
        allPages.forEach((page: any) => {
          pagesManager.remove(page);
        });
        // Load defaults
        loadDefaultPages(editor);
        updatePagesSelect(editor);
        updatePagesList(editor);
      }
    },
  });

  // Command: Open pages manager
  editor.Commands.add('open-pages', {
    run(editor: Editor) {
      const pages = pagesManager.getAll();
      const currentPage = pagesManager.getSelected();
      let content = '<div style="padding: 20px;"><h3 style="margin-bottom: 20px;">Manage Pages</h3><ul style="list-style: none; padding: 0;">';
      
      pages.forEach((page: any, index: number) => {
        const pageName = page.getName ? page.getName() : page.get('name') || 'Untitled';
        const isSelected = page === currentPage || page.id === currentPage?.id;
        const bgColor = isSelected ? '#e3f2fd' : '#f5f5f5';
        const selectedLabel = isSelected ? ' <strong>(Current)</strong>' : '';
        
        content += `<li style="padding: 10px; margin: 5px 0; background: ${bgColor}; border-radius: 4px; cursor: pointer; border: ${isSelected ? '2px solid #2196f3' : '1px solid #ddd'};" 
                        onclick="(function() { 
                          var pages = window.editor.Pages.getAll(); 
                          var page = pages[${index}]; 
                          if (page) { 
                            console.log('Modal: Selecting page', page); 
                            window.editor.Pages.select(page); 
                            setTimeout(function() { window.editor.refresh(); }, 50); 
                          } 
                          window.editor.Modal.close(); 
                        })();">
                      📄 ${pageName}${selectedLabel}
                      <button style="float: right; background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;"
                              onclick="event.stopPropagation(); if(confirm('Delete page ${pageName}?')) { 
                                var pages = window.editor.Pages.getAll(); 
                                var page = pages[${index}]; 
                                if (page) { 
                                  window.editor.Pages.remove(page); 
                                } 
                                window.editor.Modal.close(); 
                              }">Delete</button>
                    </li>`;
      });
      
      content += '</ul>';
      content += '<div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">';
      content += '<button style="background: #ff9800; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; width: 100%;" onclick="window.editor.runCommand(\'reset-pages\'); window.editor.Modal.close();">🔄 Reset to Default Pages</button>';
      content += '</div></div>';
      
      editor.Modal.setTitle('Manage Pages').setContent(content).open();
    },
  });

  // Update pages select dropdown
  function updatePagesSelect(editor: Editor) {
    const select = document.getElementById('pages-select') as HTMLSelectElement;
    if (!select) {
      console.log('Select element not found');
      return;
    }

    const pages = pagesManager.getAll();
    const currentPage = pagesManager.getSelected();
    
    console.log('Updating pages dropdown:', pages.length, 'pages');
    
    select.innerHTML = '';
    pages.forEach((page: any) => {
      const option = document.createElement('option');
      const pageName = page.getName ? page.getName() : page.get('name') || 'Untitled';
      option.value = pageName;
      option.textContent = pageName;
      if (page === currentPage || page.id === currentPage?.id) {
        option.selected = true;
      }
      select.appendChild(option);
    });

    // Handle page selection - remove old listeners first
    select.onchange = null;
    select.onchange = (e: any) => {
      const selectedIndex = e.target.selectedIndex;
      const selectedPageName = e.target.value;
      console.log('Dropdown changed to:', selectedPageName, 'index:', selectedIndex);
      
      // Get the actual page object
      const targetPage = pages[selectedIndex];
      if (targetPage) {
        console.log('Selecting page object:', targetPage);
        pagesManager.select(targetPage);
        // Force editor to re-render the canvas
        setTimeout(() => {
          editor.refresh();
          const wrapper = editor.DomComponents.getWrapper();
          if (wrapper) {
            editor.select(wrapper);
            editor.select(undefined);
          }
        }, 50);
      }
    };
  }

  // Listen to page changes
  editor.on('page:select', (page: any) => {
    console.log('Page selected event:', page?.get('name'));
    setTimeout(() => {
      updatePagesSelect(editor);
      updatePagesList(editor);
      editor.refresh();
    }, 50);
  });

  editor.on('page:add page:remove', () => {
    console.log('Page added/removed event');
    setTimeout(() => {
      updatePagesSelect(editor);
      updatePagesList(editor);
      console.log('Updated pages list after add/remove, total pages:', editor.Pages.getAll().length);
    }, 100);
  });

  // Initialize pages after editor loads
  editor.on('load', () => {
    console.log('Editor loaded, checking pages...');
    const existingPages = pagesManager.getAll();
    console.log('Existing pages:', existingPages.length);
    
    // List existing page names
    existingPages.forEach((page: any, idx: number) => {
      const pageName = page.getName ? page.getName() : page.get('name') || `Page ${idx + 1}`;
      const components = page.getMainComponent?.() || page.get('component');
      const hasContent = components && components.components && components.components().length > 0;
      console.log(`  Page ${idx + 1}: "${pageName}" - Has content: ${hasContent}`);
    });
    
    // Check if we only have the default GrapesJS page (usually just 1 empty page)
    const hasOnlyDefaultPage = existingPages.length === 1 && !existingPages[0].get('name');
    
    // Load default pages if no pages exist OR only the default empty page exists
    if (existingPages.length === 0 || hasOnlyDefaultPage) {
      console.log('Loading default pages (Home, About, Contact)...');
      
      // Remove the default page if it exists
      if (hasOnlyDefaultPage) {
        pagesManager.remove(existingPages[0]);
      }
      
      loadDefaultPages(editor);
      
      // Force update pages list after a delay to ensure it's visible
      setTimeout(() => {
        updatePagesList(editor);
      }, 300);
    } else {
      console.log('Pages already exist, using existing pages');
      // Make sure first page is selected
      if (existingPages.length > 0 && !pagesManager.getSelected()) {
        console.log('Selecting first page');
        pagesManager.select(existingPages[0]);
      }
    }
    
    // Update dropdown
    setTimeout(() => updatePagesSelect(editor), 200);
  });
  
  // Also try immediate update after a longer delay as fallback
  setTimeout(() => updatePagesSelect(editor), 1000);
  
  // Add custom CSS animations for pages panel
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: scale(0.8);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    
    @keyframes slideIn {
      from {
        transform: translateX(-10px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    .gs-page-item {
      animation: slideIn 0.3s ease-out;
    }
    
    .gs-page-item:hover {
      z-index: 1;
    }
    
    #pages-panel {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }
    
    #pages-search-input::placeholder {
      color: #888;
    }
    
    #pages-search-input:focus {
      outline: none;
    }
    
    #add-page-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(102, 126, 234, 0.5) !important;
    }
    
    #add-page-btn:active {
      transform: translateY(0);
    }
    
    .delete-page-btn {
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Load default pages (Home, About, Contact)
 */
export function loadDefaultPages(editor: Editor) {
  console.log('Creating default pages: Home, About, Contact');
  
  const defaultPages = [
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
            <p style="margin: 10px 0; font-size: 16px;">📄 3. Switch between pages using the pages dropdown</p>
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
          </div>
        </div>
      `,
    },
  ];

  defaultPages.forEach(page => {
    const newPage = editor.Pages.add(page);
    console.log('Added page:', page.name, newPage);
  });

  // Select first page
  const allPages = editor.Pages.getAll();
  const firstPage = allPages[0];
  if (firstPage) {
    editor.Pages.select(firstPage);
    console.log('Selected first page:', firstPage.getName());
  }
}
