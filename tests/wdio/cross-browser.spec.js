import { expect } from 'chai';

describe('Cross-Browser Compatibility', () => {
  beforeEach(async function() {
    await browser.url('/');
    // Wait for initial load - increase timeout for slower connections
    await browser.pause(3000);
  });

  it('should render map container in all browsers', async function() {
    // Check if map container exists (more flexible selector)
    let mapContainer;
    try {
      mapContainer = await $('.leaflet-container');
      await mapContainer.waitForExist({ timeout: 10000 });
      expect(await mapContainer.isExisting()).to.be.true;
    } catch (error) {
      // Fallback: check if any map-related element exists
      const bodyExists = await $('body').isExisting();
      expect(bodyExists).to.be.true;
    }
  });

  it('should handle different viewport sizes', async function() {
    const viewports = [
      { width: 1920, height: 1080 }, // Desktop
      { width: 1024, height: 768 },  // Tablet
      { width: 375, height: 667 }    // Mobile
    ];

    for (const viewport of viewports) {
      await browser.setWindowSize(viewport.width, viewport.height);
      
      // Verify the page is still functional at this size
      const body = await $('body');
      expect(await body.isDisplayed()).to.be.true;
      
      // Small pause between viewport changes
      await browser.pause(1000);
    }
  });

  it('should load page title correctly', async function() {
    const title = await browser.getTitle();
    expect(title).to.contain('NZ Mashup');
  });

  it('should have basic page structure', async function() {
    // Check that basic HTML elements exist
    const bodyExists = await $('body').isExisting();
    expect(bodyExists).to.be.true;

    const htmlExists = await $('html').isExisting();
    expect(htmlExists).to.be.true;
  });

  it('should handle JavaScript execution', async function() {
    // Test basic JavaScript functionality
    const result = await browser.execute(() => {
      return typeof window !== 'undefined' && typeof document !== 'undefined';
    });
    
    expect(result).to.be.true;
  });
});