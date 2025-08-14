import '@testing-library/jest-dom';

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock Leaflet
jest.mock('leaflet', () => ({
  map: jest.fn(() => ({
    addControl: jest.fn(),
    removeControl: jest.fn(),
    setView: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    getZoom: jest.fn(() => 13),
    getCenter: jest.fn(() => ({ lat: -36.8485, lng: 174.7633 })),
  })),
  tileLayer: jest.fn(() => ({
    addTo: jest.fn(),
    remove: jest.fn(),
  })),
  marker: jest.fn(() => ({
    addTo: jest.fn(),
    remove: jest.fn(),
    bindPopup: jest.fn(),
  })),
  popup: jest.fn(),
  DomUtil: {
    create: jest.fn(() => ({})),
    addClass: jest.fn(),
  },
  DomEvent: {
    on: jest.fn(),
    off: jest.fn(),
    stopPropagation: jest.fn(),
    preventDefault: jest.fn(),
    disableClickPropagation: jest.fn(),
  },
  Control: {
    extend: jest.fn((options) => {
      return function() {
        return {
          onAdd: options.onAdd,
          onRemove: options.onRemove || jest.fn(),
        };
      };
    }),
  },
  geoJSON: jest.fn(() => ({
    addTo: jest.fn(),
    remove: jest.fn(),
    setStyle: jest.fn(),
  })),
}));

// Mock react-leaflet
jest.mock('react-leaflet', () => ({
  useMap: jest.fn(() => ({
    addControl: jest.fn(),
    removeControl: jest.fn(),
    setView: jest.fn(),
    getZoom: jest.fn(() => 13),
    getCenter: jest.fn(() => ({ lat: -36.8485, lng: 174.7633 })),
  })),
  MapContainer: jest.fn(({ children }) => <div data-testid="map-container">{children}</div>),
  TileLayer: jest.fn(() => <div data-testid="tile-layer" />),
  GeoJSON: jest.fn(() => <div data-testid="geojson-layer" />),
}));

// Mock environment variables
global.import = {
  meta: {
    env: {
      VITE_API_URL: 'http://localhost:4000',
      VITE_LINZ_API_KEY: 'test-key',
      VITE_COSMOS_DB_ENDPOINT: 'https://test.documents.azure.com:443/',
      VITE_COSMOS_DB_KEY: 'test-key',
      VITE_DATABASE_NAME: 'TestMappingAppDB',
      VITE_NODE_ENV: 'test'
    }
  }
};

// Mock fetch for API calls
global.fetch = jest.fn();

// Setup default fetch response
beforeEach(() => {
  fetch.mockClear();
  fetch.mockResolvedValue({
    ok: true,
    json: async () => ({ type: 'FeatureCollection', features: [] }),
  });
});