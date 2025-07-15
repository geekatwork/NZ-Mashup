import PropTypes from 'prop-types';
import { useState } from 'react';
import { GeoJSON } from 'react-leaflet';
import { featureCollection } from '@turf/helpers';

export function onEachFeature(feature, layer) {
  const name = feature.properties?.School_name || 'Unknown';
  const institutionType = feature.properties?.Institution_type || '';
  const tooltip = institutionType ? `${name} (${institutionType})` : name;
  layer.bindTooltip(tooltip, { direction: 'top', sticky: true });

  // Use the same color logic as the GeoJSON style prop
  function getOriginalStyle() {
    return {
      color: getColorForName(name),
      weight: 2,
      fillOpacity: 0.18,
      fillColor: getColorForName(name),
    };
  }

  layer.on('mouseover', function () {
    layer.setStyle({
      color: '#c0392b',
      weight: 4,
      fillOpacity: 0.25,
    });
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
      layer.bringToFront();
    }
  });
  layer.on('mouseout', function () {
    layer.setStyle(getOriginalStyle());
  });
  layer.on('click', function () {
    layer.setStyle(getOriginalStyle());
  });
}

export function getZoneNames(filteredZones) {
  return filteredZones && filteredZones.features.length > 0
    ? Array.from(
        new Set(
          filteredZones.features.map((f) => {
            if (f.properties) {
              return f.properties.School_name || 'Unknown';
            }
            return 'No properties';
          })
        )
      )
    : [];
}

export function filterGeoJsonByZoneNames(allSchoolZones, zoneFilter) {
  return allSchoolZones
    ? featureCollection(
        allSchoolZones.features.filter((f) =>
          zoneFilter.includes(f.properties?.School_name || 'Unknown')
        )
      )
    : featureCollection([]);
}

export function syncZoneFilter(zoneFilter, zoneNames) {
  return zoneFilter.filter((name) => zoneNames.includes(name));
}

export function useSchoolZoneFilter(filteredZones, allSchoolZones) {
  const [zoneFilter, setZoneFilter] = useState([]);
  const zoneNames = getZoneNames(filteredZones);

  // Remove the effect that auto-syncs zoneFilter with zoneNames
  // (let the parent control zoneFilter when overlay is toggled)

  const filteredGeoJson = filterGeoJsonByZoneNames(allSchoolZones, zoneFilter);

  return { zoneNames, zoneFilter, setZoneFilter, filteredGeoJson };
}

// Generate a color for each school zone based on its name
function getColorForName(name) {
  // Simple hash to color: hash the name, then map to HSL
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 60%)`;
}

export default function SchoolZonesLayer({ data }) {
  // Always render the GeoJSON layer, even if empty
  return (
    <GeoJSON
      key={
        data && data.features
          ? data.features.map((f) => f.properties?.School_name).join(',')
          : 'empty'
      }
      data={data || { type: 'FeatureCollection', features: [] }}
      style={(feature) => {
        const name = feature.properties?.School_name || 'Unknown';
        return {
          color: getColorForName(name),
          weight: 2,
          fillOpacity: 0.18,
          fillColor: getColorForName(name),
        };
      }}
      onEachFeature={onEachFeature}
    />
  );
}

SchoolZonesLayer.propTypes = {
  data: PropTypes.shape({
    type: PropTypes.string.isRequired,
    features: PropTypes.arrayOf(PropTypes.object),
  }),
};
