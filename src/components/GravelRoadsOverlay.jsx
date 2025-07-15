import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import PropTypes from 'prop-types';

export default function GravelRoadsOverlay({ visible = true }) {
  const map = useMap();
  const [gravelLayer, setGravelLayer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingControl, setLoadingControl] = useState(null);

  const fetchGravelRoads = async (bounds) => {
    setLoading(true);
    setError(null);
    
    try {
      // Get current map bounds
      const bbox = `${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`;
      
      // Overpass API query for unsealed/gravel roads with public access in New Zealand
      const query = `
        [out:json][timeout:25];
        (
          way["highway"]["surface"~"^(gravel|dirt|earth|grass|sand|unpaved|compacted)$"]["access"!="private"]["access"!="no"](${bbox});
          way["highway"~"^(track|path)$"]["surface"!="paved"]["surface"!="asphalt"]["surface"!="concrete"]["access"!="private"]["access"!="no"](${bbox});
          way["highway"="track"]["access"!="private"]["access"!="no"](${bbox});
          way["highway"="unclassified"]["surface"~"^(gravel|dirt|earth|grass|sand|unpaved|compacted)$"]["access"!="private"]["access"!="no"](${bbox});
        );
        out geom;
      `;

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(query)}`,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Convert OSM data to GeoJSON
      const geojson = {
        type: 'FeatureCollection',
        features: data.elements
          .filter(element => element.type === 'way' && element.geometry)
          .map(way => ({
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: way.geometry.map(node => [node.lon, node.lat]),
            },
            properties: {
              id: way.id,
              highway: way.tags?.highway || 'unknown',
              surface: way.tags?.surface || 'unknown',
              name: way.tags?.name || way.tags?.ref || `Road ${way.id}`,
              tracktype: way.tags?.tracktype || null,
            },
          }))
      };

      return geojson;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!visible) {
      // Remove layer when not visible
      if (gravelLayer) {
        if (map.hasLayer(gravelLayer)) {
          map.removeLayer(gravelLayer);
        }
        setGravelLayer(null); // Clear the layer state
      }
      return;
    }

    const loadGravelRoads = async () => {
      try {
        const bounds = map.getBounds();
        const geojson = await fetchGravelRoads(bounds);
        
        if (!geojson || geojson.features.length === 0) {
          return;
        }

        // Remove existing layer first
        if (gravelLayer) {
          if (map.hasLayer(gravelLayer)) {
            map.removeLayer(gravelLayer);
          }
        }

        // Create new layer
        const layer = L.geoJSON(geojson, {
          style: (feature) => {
            const surface = feature.properties.surface;
            const highway = feature.properties.highway;
            const tracktype = feature.properties.tracktype;
            
            let color = '#8B4513'; // Default brown
            let weight = 3;
            let dashArray = null;
            
            // Color based on surface type
            if (surface === 'gravel') {
              color = '#8B4513'; // Saddle brown
            } else if (surface === 'dirt' || surface === 'earth') {
              color = '#A0522D'; // Sienna
            } else if (surface === 'grass') {
              color = '#6B8E23'; // Olive drab
            } else if (surface === 'sand') {
              color = '#F4A460'; // Sandy brown
            } else if (highway === 'track') {
              color = '#CD853F'; // Peru
              dashArray = '5, 5';
            } else if (highway === 'path') {
              color = '#DEB887'; // Burlywood
              weight = 2;
              dashArray = '2, 3';
            }
            
            // Adjust style based on track type
            if (tracktype) {
              if (tracktype === 'grade1') {
                weight = 4; // Better quality track
              } else if (tracktype === 'grade5') {
                weight = 2; // Poor quality track
                dashArray = '3, 7';
              }
            }
            
            return {
              color: color,
              weight: weight,
              opacity: 0.8,
              dashArray: dashArray,
            };
          },
          // ESLint disable for dynamic OSM data properties
          /* eslint-disable react/prop-types */
          onEachFeature: (feature, layer) => {
            const props = feature.properties;
            const surface = props.surface !== 'unknown' ? props.surface : 'unsealed';
            const highway = props.highway;
            const tracktype = props.tracktype ? ` (${props.tracktype})` : '';
            
            layer.bindPopup(`
              <div style="font-size: 12px;">
                <strong>${props.name}</strong><br/>
                <strong>Type:</strong> ${highway}${tracktype}<br/>
                <strong>Surface:</strong> ${surface}<br/>
                <strong>OSM ID:</strong> ${props.id}
              </div>
            `);
          },
          /* eslint-enable react/prop-types */
        });

        setGravelLayer(layer);
        map.addLayer(layer);
        
      } catch (err) {
        setError(err.message);
      }
    };

    // Load gravel roads when visible
    if (visible && map.getZoom() >= 12) {
      loadGravelRoads();
    } else if (visible && map.getZoom() < 12) {
      // Zoom level too low for data loading
    }

    // Reload when map moves (but debounce it)
    let moveTimeout;
    const onMapMove = () => {
      if (!visible || map.getZoom() < 12) return;
      
      clearTimeout(moveTimeout);
      moveTimeout = setTimeout(() => {
        loadGravelRoads();
      }, 1000);
    };

    if (visible) {
      map.on('moveend', onMapMove);
      map.on('zoomend', onMapMove);
    }

    return () => {
      clearTimeout(moveTimeout);
      map.off('moveend', onMapMove);
      map.off('zoomend', onMapMove);
    };
  }, [map, visible, gravelLayer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gravelLayer && map.hasLayer(gravelLayer)) {
        map.removeLayer(gravelLayer);
      }
    };
  }, [map, gravelLayer]);

  // Show loading/error indicators in the corner
  useEffect(() => {
    // Remove existing loading control first
    if (loadingControl) {
      try {
        map.removeControl(loadingControl);
      } catch (e) {
        // Control might already be removed, ignore error
        console.debug('Control removal failed:', e.message);
      }
      setLoadingControl(null);
    }

    if (!visible) return;
    
    if (loading) {
      const indicator = L.control({ position: 'bottomleft' });
      indicator.onAdd = () => {
        const div = L.DomUtil.create('div', 'info');
        div.style.background = 'rgba(255,255,255,0.9)';
        div.style.padding = '5px 10px';
        div.style.borderRadius = '5px';
        div.style.fontSize = '12px';
        div.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        div.innerHTML = '🔄 Loading gravel roads...';
        return div;
      };
      indicator.addTo(map);
      setLoadingControl(indicator);
    } else if (error) {
      const indicator = L.control({ position: 'bottomleft' });
      indicator.onAdd = () => {
        const div = L.DomUtil.create('div', 'info');
        div.style.background = 'rgba(255,0,0,0.1)';
        div.style.padding = '5px 10px';
        div.style.borderRadius = '5px';
        div.style.fontSize = '12px';
        div.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        div.innerHTML = `⚠️ Error: ${error}`;
        return div;
      };
      indicator.addTo(map);
      setLoadingControl(indicator);
      
      // Remove error after 3 seconds
      setTimeout(() => {
        try {
          if (indicator) {
            map.removeControl(indicator);
            setLoadingControl(null);
          }
        } catch (error) {
          // Control might already be removed, ignore error
          console.debug('Error control removal failed:', error.message);
        }
      }, 3000);
    }
  }, [map, loading, error, visible]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Separate cleanup effect
  useEffect(() => {
    return () => {
      if (loadingControl) {
        try {
          map.removeControl(loadingControl);
        } catch (error) {
          // Control might already be removed, ignore error
          console.debug('Cleanup control removal failed:', error.message);
        }
        setLoadingControl(null);
      }
    };
  }, [map, loadingControl]); // Keep loadingControl only in cleanup effect

  return null;
}

GravelRoadsOverlay.propTypes = {
  visible: PropTypes.bool,
};
