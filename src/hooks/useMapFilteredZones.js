import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import bbox from '@turf/bbox';
import { featureCollection } from '@turf/helpers';

/**
 * Custom hook to filter GeoJSON features by current map bounds.
 * @param {object} allGeoJson - The full GeoJSON FeatureCollection.
 * @param {function} setFiltered - Setter for filtered FeatureCollection.
 */
export default function useMapFilteredZones(allGeoJson, setFiltered) {
  const map = useMap();

  // Initial filter when data or map changes
  useEffect(() => {
    if (!allGeoJson) return;
    // Get current map bounds as [west, south, east, north]
    const bounds = map.getBounds();
    const mapBbox = [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()];
    // Filter features that intersect the map bounds
    const filtered = allGeoJson.features.filter((f) => {
      try {
        if (!f.geometry) return false;
        // Get bounding box for each feature
        const featBbox = bbox(f);
        // Check for intersection between feature bbox and map bbox
        return !(
          featBbox[2] < mapBbox[0] || // feature east < map west
          featBbox[0] > mapBbox[2] || // feature west > map east
          featBbox[3] < mapBbox[1] || // feature north < map south
          featBbox[1] > mapBbox[3] // feature south > map north
        );
      } catch {
        // If bbox calculation fails, exclude feature
        return false;
      }
    });
    setFiltered(featureCollection(filtered));
  }, [allGeoJson, map, setFiltered]);

  // Re-filter zones whenever the map moves
  useEffect(() => {
    if (!allGeoJson) return;
    const onMove = () => {
      // Get current map bounds
      const bounds = map.getBounds();
      const mapBbox = [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()];
      // Filter features that intersect the map bounds
      const filtered = allGeoJson.features.filter((f) => {
        try {
          if (!f.geometry) return false;
          const featBbox = bbox(f);
          return !(
            featBbox[2] < mapBbox[0] ||
            featBbox[0] > mapBbox[2] ||
            featBbox[3] < mapBbox[1] ||
            featBbox[1] > mapBbox[3]
          );
        } catch {
          return false;
        }
      });
      setFiltered(featureCollection(filtered));
    };
    // Listen for map moveend event
    map.on('moveend', onMove);
    return () => map.off('moveend', onMove);
  }, [allGeoJson, map, setFiltered]);
}
