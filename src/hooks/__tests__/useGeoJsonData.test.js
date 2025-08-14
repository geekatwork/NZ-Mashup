import { renderHook, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import useGeoJsonData from '../useGeoJsonData';

describe('useGeoJsonData', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('returns initial state correctly', () => {
    const { result } = renderHook(() => useGeoJsonData(''));

    expect(result.current[0]).toBeNull(); // data
    expect(result.current[1]).toBeNull(); // error
    expect(result.current[2]).toBe(true); // loading
  });

  it('does not fetch when url is empty', () => {
    renderHook(() => useGeoJsonData(''));

    expect(fetch).not.toHaveBeenCalled();
  });

  it('fetches data successfully', async () => {
    const mockData = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: 'Test Feature' },
          geometry: { type: 'Point', coordinates: [174.7633, -36.8485] }
        }
      ]
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const { result } = renderHook(() => useGeoJsonData('https://api.example.com/geojson'));

    // Initially loading
    expect(result.current[2]).toBe(true);

    await waitFor(() => {
      expect(result.current[2]).toBe(false); // loading finished
    });

    expect(result.current[0]).toEqual(mockData); // data loaded
    expect(result.current[1]).toBeNull(); // no error
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('https://api.example.com/geojson');
  });

  it('handles fetch errors', async () => {
    const errorMessage = 'Failed to fetch: 500';
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useGeoJsonData('https://api.example.com/error'));

    await waitFor(() => {
      expect(result.current[2]).toBe(false); // loading finished
    });

    expect(result.current[0]).toBeNull(); // no data
    expect(result.current[1]).toEqual(expect.any(Error)); // error occurred
    expect(result.current[1].message).toBe(errorMessage);
  });

  it('handles network errors', async () => {
    const networkError = new Error('Network error');
    fetch.mockRejectedValueOnce(networkError);

    const { result } = renderHook(() => useGeoJsonData('https://api.example.com/network-error'));

    await waitFor(() => {
      expect(result.current[2]).toBe(false); // loading finished
    });

    expect(result.current[0]).toBeNull(); // no data
    expect(result.current[1]).toBe(networkError); // error occurred
  });

  it('refetches when url changes', async () => {
    const mockData1 = { type: 'FeatureCollection', features: [] };
    const mockData2 = { type: 'FeatureCollection', features: [{ type: 'Feature' }] };

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockData1,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockData2,
      });

    const { result, rerender } = renderHook(
      ({ url }) => useGeoJsonData(url),
      { initialProps: { url: 'https://api.example.com/data1' } }
    );

    await waitFor(() => {
      expect(result.current[2]).toBe(false);
    });

    expect(result.current[0]).toEqual(mockData1);

    // Change URL
    rerender({ url: 'https://api.example.com/data2' });

    // Should be loading again
    expect(result.current[2]).toBe(true);

    await waitFor(() => {
      expect(result.current[2]).toBe(false);
    });

    expect(result.current[0]).toEqual(mockData2);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('clears error on successful refetch', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ type: 'FeatureCollection', features: [] }),
      });

    const { result, rerender } = renderHook(
      ({ url }) => useGeoJsonData(url),
      { initialProps: { url: 'https://api.example.com/error' } }
    );

    // Wait for error
    await waitFor(() => {
      expect(result.current[1]).not.toBeNull();
    });

    // Refetch with successful response
    rerender({ url: 'https://api.example.com/success' });

    await waitFor(() => {
      expect(result.current[2]).toBe(false);
    });

    expect(result.current[1]).toBeNull(); // error cleared
    expect(result.current[0]).not.toBeNull(); // data loaded
  });
});