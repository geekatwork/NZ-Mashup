import { expect } from 'chai';

// Example test: check landing page loads and has correct title
describe('Landing Page', () => {
  it('should load and display the app title', async () => {
    await browser.url('http://localhost:5173/');
    const title = await $('h1');
    expect(await title.getText()).to.include('OSM Map Viewer');
  });
});

// Example test: check navigation to About page
describe('About Page', () => {
  it('should navigate to About and show about content', async () => {
    await browser.url('http://localhost:5173/about');
    const aboutHeader = await $('h1');
    expect(await aboutHeader.getText()).to.include('About OSM Map Viewer');
  });
});

// Example test: check map page loads
describe('Map Page', () => {
  it('should load the map page and show the map container', async () => {
    await browser.url('http://localhost:5173/map');
    const map = await $('.leaflet-container');
    expect(await map.isExisting()).to.be.true;
  });
});
