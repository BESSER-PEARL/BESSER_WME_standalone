/**
 * Get page options dynamically from the editor
 * @param editor - GrapesJS editor instance
 * @returns Array of page options for select dropdown
 */
export const getPageOptions = (editor: any) => {
  const pages = editor.Pages.getAll();
  const options = [
    { value: '', label: '-- Select Page --' },
    { value: 'custom', label: 'Custom URL' },
  ];
  
  pages.forEach((page: any) => {
    const pageName = page.getName();
    const pageId = page.getId();
    options.push({ 
      value: `page:${pageId}`, 
      label: `📄 ${pageName}` 
    });
  });
  
  return options;
};
