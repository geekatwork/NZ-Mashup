import { renderHook } from '@testing-library/react';
import { jest } from '@jest/globals';
import useMapFilteredZones from '../useMapFilteredZones';

// Mock react-leaflet useMap hook
const mockMap = {
  getBounds: jest.fn(() => ({
    getWest: () => -180,
    getSouth: () => -90,
    getEast: () => 180,
    getNorth: () => 90,
  })),
  on: jest.fn(),
  off: jest.fn(),
};

jest.mock('react-leaflet', () => ({
  useMap: jest.fn(() => mockMap),
}));

// Mock @turf/bbox
jest.mock('@turf/bbox', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock @turf/helpers
jest.mock('@turf/helpers', () => ({
  featureCollection: jest.fn((features) => ({
    type: 'FeatureCollection',
    features: features,
  })),
}));

describe('useMapFilteredZones', () => {
  let mockSetFiltered;
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockSetFiltered = jest.fn();
    
    // Setup default bbox mock
    const bboxMock = require('@turf/bbox').default;
    bboxMock.mockReturnValue([-1, -1, 1, 1]); // Feature within bounds
  });

  it('does nothing when allGeoJson is null', () => {
    renderHook(() => useMapFilteredZones(null, mockSetFiltered));
    
    expect(mockSetFiltered).not.toHaveBeenCalled();
    expect(mockMap.on).not.toHaveBeenCalled();
  });

  it('filters features within map bounds', () => {
    const mockGeoJson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [0, 0] },
          properties: { name: 'Feature 1' },
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [0, 0] },
          properties: { name: 'Feature 2' },
        },
      ],
    };

    renderHook(() => useMapFilteredZones(mockGeoJson, mockSetFiltered));

    // Should call setFiltered with filtered features
    expect(mockSetFiltered).toHaveBeenCalledWith({
      type: 'FeatureCollection',
      features: mockGeoJson.features,
    });

    // Should set up map event listener
    expect(mockMap.on).toHaveBeenCalledWith('moveend', expect.any(Function));
  });

  it('excludes features outside map bounds', () => {
    const bboxMock = require('@turf/bbox').default;
    // Mock feature to be outside bounds
    bboxMock.mockReturnValue([200, 200, 300, 300]); // Feature outside bounds

    const mockGeoJson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [250, 250] },
          properties: { name: 'Outside Feature' },
        },
      ],
    };

    renderHook(() => useMapFilteredZones(mockGeoJson, mockSetFiltered));

    // Should call setFiltered with empty features array
    expect(mockSetFiltered).toHaveBeenCalledWith({
      type: 'FeatureCollection',
      features: [],
    });
  });

  it('handles features without geometry', () => {
    const mockGeoJson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: null,
          properties: { name: 'No Geometry' },
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [0, 0] },
          properties: { name: 'With Geometry' },
        },
      ],
    };

    renderHook(() => useMapFilteredZones(mockGeoJson, mockSetFiltered));

    // Should exclude the feature without geometry
    expect(mockSetFiltered).toHaveBeenCalledWith({
      type: 'FeatureCollection',
      features: [mockGeoJson.features[1]], // Only the second feature
    });
  });

  it('handles bbox calculation errors', () => {
    const bboxMock = require('@turf/bbox').default;
    // Mock bbox to throw an error
    bboxMock.mockImplementation(() => {
      throw new Error('Bbox calculation failed');
    });

    const mockGeoJson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [0, 0] },
          properties: { name: 'Error Feature' },
        },
      ],
    };

    renderHook(() => useMapFilteredZones(mockGeoJson, mockSetFiltered));

    // Should call setFiltered with empty features array due to error
    expect(mockSetFiltered).toHaveBeenCalledWith({
      type: 'FeatureCollection',
      features: [],
    });
  });

  it('sets up and cleans up map event listeners', () => {
    const mockGeoJson = {
      type: 'FeatureCollection',
      features: [],
    };

    const { unmount } = renderHook(() => useMapFilteredZones(mockGeoJson, mockSetFiltered));

    // Should set up event listener
    expect(mockMap.on).toHaveBeenCalledWith('moveend', expect.any(Function));

    // Unmount should clean up event listener
    unmount();
    expect(mockMap.off).toHaveBeenCalledWith('moveend', expect.any(Function));
  });

  it('re-filters when map moves', () => {
    const mockGeoJson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [0, 0] },
          properties: { name: 'Feature' },
        },
      ],
    };

    renderHook(() => useMapFilteredZones(mockGeoJson, mockSetFiltered));

    // Get the moveend callback
    const moveendCallback = mockMap.on.mock.calls.find(call => call[0] === 'moveend')[1];

    // Clear previous calls
    mockSetFiltered.mockClear();

    // Simulate map move
    moveendCallback();

    // Should re-filter features
    expect(mockSetFiltered).toHaveBeenCalledWith({
      type: 'FeatureCollection',
      features: mockGeoJson.features,
    });
  });
});