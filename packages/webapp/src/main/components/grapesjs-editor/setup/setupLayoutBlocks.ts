import { Editor } from 'grapesjs';

/**
 * Setup layout blocks (containers, grids, flexbox, sections)
 */
export function setupLayoutBlocks(editor: Editor) {
  const bm = editor.BlockManager;
  
  // Container Block
  bm.add('container', {
    label: 'Container',
    category: 'Layout',
    content: `
      <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 20px;">
        <p>Container - drag content here</p>
      </div>
    `,
    attributes: { class: 'fa fa-square-o' }
  });
  
  // Section Block
  bm.add('section', {
    label: 'Section',
    category: 'Layout',
    content: `
      <section style="padding: 60px 0; background: #f5f5f5;">
        <div style="max-width: 1200px; margin: 0 auto; padding: 0 20px;">
          <h2>Section Title</h2>
          <p>Section content goes here</p>
        </div>
      </section>
    `,
    attributes: { class: 'fa fa-bars' }
  });
  
  // 2 Column Grid
  bm.add('grid-2col', {
    label: '2 Columns',
    category: 'Layout',
    content: `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding: 20px;">
        <div style="padding: 20px; background: #f0f0f0; border: 2px dashed #ccc; min-height: 100px;">
          <p>Column 1</p>
        </div>
        <div style="padding: 20px; background: #f0f0f0; border: 2px dashed #ccc; min-height: 100px;">
          <p>Column 2</p>
        </div>
      </div>
    `,
    attributes: { class: 'fa fa-columns' }
  });
  
  // 3 Column Grid
  bm.add('grid-3col', {
    label: '3 Columns',
    category: 'Layout',
    content: `
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; padding: 20px;">
        <div style="padding: 20px; background: #f0f0f0; border: 2px dashed #ccc; min-height: 100px;">
          <p>Column 1</p>
        </div>
        <div style="padding: 20px; background: #f0f0f0; border: 2px dashed #ccc; min-height: 100px;">
          <p>Column 2</p>
        </div>
        <div style="padding: 20px; background: #f0f0f0; border: 2px dashed #ccc; min-height: 100px;">
          <p>Column 3</p>
        </div>
      </div>
    `,
    attributes: { class: 'fa fa-th' }
  });
  
  // 4 Column Grid
  bm.add('grid-4col', {
    label: '4 Columns',
    category: 'Layout',
    content: `
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; padding: 20px;">
        <div style="padding: 20px; background: #f0f0f0; border: 2px dashed #ccc; min-height: 100px;">
          <p>Col 1</p>
        </div>
        <div style="padding: 20px; background: #f0f0f0; border: 2px dashed #ccc; min-height: 100px;">
          <p>Col 2</p>
        </div>
        <div style="padding: 20px; background: #f0f0f0; border: 2px dashed #ccc; min-height: 100px;">
          <p>Col 3</p>
        </div>
        <div style="padding: 20px; background: #f0f0f0; border: 2px dashed #ccc; min-height: 100px;">
          <p>Col 4</p>
        </div>
      </div>
    `,
    attributes: { class: 'fa fa-th-large' }
  });
  
  // Flexbox Row
  bm.add('flex-row', {
    label: 'Flex Row',
    category: 'Layout',
    content: `
      <div style="display: flex; flex-direction: row; gap: 20px; padding: 20px; align-items: stretch;">
        <div style="flex: 1; padding: 20px; background: #e3f2fd; border: 2px dashed #2196f3; min-height: 100px;">
          <p>Flex Item 1</p>
        </div>
        <div style="flex: 1; padding: 20px; background: #e3f2fd; border: 2px dashed #2196f3; min-height: 100px;">
          <p>Flex Item 2</p>
        </div>
      </div>
    `,
    attributes: { class: 'fa fa-arrows-h' }
  });
  
  // Flexbox Column
  bm.add('flex-column', {
    label: 'Flex Column',
    category: 'Layout',
    content: `
      <div style="display: flex; flex-direction: column; gap: 20px; padding: 20px;">
        <div style="padding: 20px; background: #fff3e0; border: 2px dashed #ff9800; min-height: 80px;">
          <p>Flex Item 1</p>
        </div>
        <div style="padding: 20px; background: #fff3e0; border: 2px dashed #ff9800; min-height: 80px;">
          <p>Flex Item 2</p>
        </div>
      </div>
    `,
    attributes: { class: 'fa fa-arrows-v' }
  });
  
  // Hero Section
  bm.add('hero-section', {
    label: 'Hero Section',
    category: 'Layout',
    content: `
      <section style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 100px 20px; text-align: center;">
        <div style="max-width: 1200px; margin: 0 auto;">
          <h1 style="font-size: 48px; margin-bottom: 20px; font-weight: bold;">Welcome to Our Website</h1>
          <p style="font-size: 20px; margin-bottom: 30px; opacity: 0.9;">Create amazing experiences with our powerful tools</p>
          <button style="background: white; color: #667eea; border: none; padding: 15px 40px; font-size: 16px; border-radius: 50px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">Get Started</button>
        </div>
      </section>
    `,
    attributes: { class: 'fa fa-header' }
  });
  
  // Card Layout
  bm.add('card', {
    label: 'Card',
    category: 'Layout',
    content: `
      <div style="background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); padding: 30px; margin: 20px;">
        <h3 style="margin-top: 0; color: #333;">Card Title</h3>
        <p style="color: #666; line-height: 1.6;">This is a card component. Add your content here. Cards are great for organizing information.</p>
        <button style="background: #2196f3; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin-top: 15px;">Learn More</button>
      </div>
    `,
    attributes: { class: 'fa fa-id-card-o' }
  });
  
  // Split Section (50/50)
  bm.add('split-section', {
    label: 'Split Section',
    category: 'Layout',
    content: `
      <section style="display: grid; grid-template-columns: 1fr 1fr; min-height: 400px;">
        <div style="background: #f0f0f0; padding: 60px 40px; display: flex; flex-direction: column; justify-content: center;">
          <h2 style="margin-top: 0; color: #333;">Left Content</h2>
          <p style="color: #666; line-height: 1.8;">Add your text, images, or any content here. This split layout is perfect for showcasing features.</p>
        </div>
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 60px 40px; display: flex; flex-direction: column; justify-content: center; color: white;">
          <h2 style="margin-top: 0;">Right Content</h2>
          <p style="opacity: 0.9; line-height: 1.8;">This side has a gradient background. Customize it to match your brand colors.</p>
        </div>
      </section>
    `,
    attributes: { class: 'fa fa-pause' }
  });
  
  // Header/Navbar
  bm.add('navbar', {
    label: 'Navigation Bar',
    category: 'Layout',
    content: `
      <nav style="background: #333; color: white; padding: 15px 30px; display: flex; justify-content: space-between; align-items: center;">
        <div style="font-size: 24px; font-weight: bold;">Logo</div>
        <div style="display: flex; gap: 30px;">
          <a href="#" style="color: white; text-decoration: none;">Home</a>
          <a href="#" style="color: white; text-decoration: none;">About</a>
          <a href="#" style="color: white; text-decoration: none;">Services</a>
          <a href="#" style="color: white; text-decoration: none;">Contact</a>
        </div>
      </nav>
    `,
    attributes: { class: 'fa fa-navicon' }
  });
  
  // Footer
  bm.add('footer', {
    label: 'Footer',
    category: 'Layout',
    content: `
      <footer style="background: #2c3e50; color: white; padding: 40px 20px; margin-top: 60px;">
        <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px;">
          <div>
            <h4 style="margin-top: 0;">About Us</h4>
            <p style="opacity: 0.8; line-height: 1.6;">Your company description goes here.</p>
          </div>
          <div>
            <h4 style="margin-top: 0;">Quick Links</h4>
            <ul style="list-style: none; padding: 0; opacity: 0.8;">
              <li style="margin: 8px 0;"><a href="#" style="color: white; text-decoration: none;">Home</a></li>
              <li style="margin: 8px 0;"><a href="#" style="color: white; text-decoration: none;">Services</a></li>
              <li style="margin: 8px 0;"><a href="#" style="color: white; text-decoration: none;">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 style="margin-top: 0;">Contact</h4>
            <p style="opacity: 0.8;">Email: info@example.com<br>Phone: (123) 456-7890</p>
          </div>
        </div>
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); opacity: 0.7;">
          © 2025 Your Company. All rights reserved.
        </div>
      </footer>
    `,
    attributes: { class: 'fa fa-minus' }
  });
  
  // Spacer
  bm.add('spacer', {
    label: 'Spacer',
    category: 'Layout',
    content: `
      <div style="height: 50px; background: transparent;"></div>
    `,
    attributes: { class: 'fa fa-arrows-v' }
  });
  
  // Divider
  bm.add('divider', {
    label: 'Divider',
    category: 'Layout',
    content: `
      <hr style="border: none; border-top: 2px solid #ddd; margin: 30px 0;">
    `,
    attributes: { class: 'fa fa-minus' }
  });
}
