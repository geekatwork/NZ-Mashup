import React from 'react';

export default function AboutPage() {
  return (
    <div style={{ maxWidth: 700, margin: '48px auto', padding: 24 }}>
      <h1>About OSM Map Viewer</h1>
      <p style={{ fontSize: 17 }}>
        OSM Map Viewer is a modern web application for exploring OpenStreetMap (OSM) data
        interactively. It features:
      </p>
      <ul style={{ fontSize: 16, lineHeight: 1.7 }}>
        <li>Interactive map with OSM and OpenTopoMap base layers</li>
        <li>School zone and loading zone overlays (GeoJSON)</li>
        <li>Zone filtering and selection by map view</li>
        <li>Built with React, Vite, and Leaflet</li>
        <li>Open source and easy to extend</li>
      </ul>
      <p style={{ marginTop: 32, color: '#888' }}>
        Map data &copy;{' '}
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">
          OpenStreetMap contributors
        </a>
        .<br />
        Source code available on{' '}
        <a href="https://github.com/your-repo" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        .
      </p>
    </div>
  );
}
