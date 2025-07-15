import { useState, useEffect } from 'react';

/**
 * Custom hook to fetch and return GeoJSON data from a given URL.
 * @param {string} url - The URL to fetch the GeoJSON from.
 * @returns {[data, error, loading]} - The GeoJSON data, error, and loading state.
 */
export default function useGeoJsonData(url) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!url) return;
    setLoading(true);
    setError(null);
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        return res.json();
      })
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url]);

  return [data, error, loading];
}
