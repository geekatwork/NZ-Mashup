import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div style={{ textAlign: 'center', padding: '64px 16px' }}>
      <h1>OSM Map Viewer</h1>
      <p style={{ fontSize: 18, maxWidth: 480, margin: '16px auto' }}>
        Welcome! This app lets you explore OpenStreetMap data interactively, including school and loading zones, using a modern React + Leaflet interface.
      </p>
      <Link to="/map" style={{
        display: 'inline-block',
        marginTop: 32,
        padding: '12px 32px',
        background: '#4a90e2',
        color: '#fff',
        borderRadius: 6,
        fontSize: 18,
        textDecoration: 'none',
        fontWeight: 500
      }}>
        Go to Map
      </Link>
    </div>
  );
}
