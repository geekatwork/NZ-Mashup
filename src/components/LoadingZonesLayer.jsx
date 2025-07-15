import PropTypes from 'prop-types';
import { GeoJSON } from 'react-leaflet';
import { featureCollection } from '@turf/helpers';
import L from 'leaflet';

const truckIcon = new L.Icon({
  iconUrl: '/truck.svg',
  iconSize: [32, 32],
  iconAnchor: [16, 28],
  popupAnchor: [0, -28],
  tooltipAnchor: [0, -20],
  className: 'leaflet-loadingzone-icon',
});

export function onEachLoadingZone(feature, layer) {
  const id = feature.properties?.OBJECTID || 'Unknown';
  const metered = feature.properties?.METERED || '';
  const bay = feature.properties?.BAY_LOCATION || '';
  const tooltip = `Loading Zone${id !== 'Unknown' ? ' #' + id : ''}${metered ? ', Metered: ' + metered : ''}${bay ? ', ' + bay : ''}`;
  layer.bindTooltip(tooltip, { direction: 'top', sticky: true });

  // Only apply hover to markers (point features)
  if (layer instanceof L.Marker) {
    layer.on('mouseover', function () {
      layer.setIcon(
        new L.Icon({
          iconUrl: '/truck.svg',
          iconSize: [40, 40],
          iconAnchor: [20, 36],
          popupAnchor: [0, -36],
          tooltipAnchor: [0, -28],
          className: 'leaflet-loadingzone-icon-hover',
        })
      );
    });
    layer.on('mouseout', function () {
      layer.setIcon(
        new L.Icon({
          iconUrl: '/truck.svg',
          iconSize: [32, 32],
          iconAnchor: [16, 28],
          popupAnchor: [0, -28],
          tooltipAnchor: [0, -20],
          className: 'leaflet-loadingzone-icon',
        })
      );
    });
  }
  layer.on('click', function () {
    layer.setStyle &&
      layer.setStyle({
        color: '#2980b9',
        weight: 2,
        fillOpacity: 0.7,
      });
  });
}

export function getLoadingZoneIds(loadingZones) {
  return loadingZones && loadingZones.features.length > 0
    ? Array.from(new Set(loadingZones.features.map((f) => f.properties?.OBJECTID || 'Unknown')))
    : [];
}

export function filterGeoJsonByLoadingZoneIds(allLoadingZones, idFilter) {
  return allLoadingZones
    ? featureCollection(
        allLoadingZones.features.filter((f) =>
          idFilter.includes(f.properties?.OBJECTID || 'Unknown')
        )
      )
    : featureCollection([]);
}

export function syncLoadingZoneFilter(idFilter, idList) {
  return idFilter.filter((id) => idList.includes(id));
}

export default function LoadingZonesLayer({ data }) {
  if (!data || !data.features || data.features.length === 0) return null;
  return (
    <GeoJSON
      data={data}
      pointToLayer={(feature, latlng) => L.marker(latlng, { icon: truckIcon })}
      onEachFeature={onEachLoadingZone}
    />
  );
}

LoadingZonesLayer.propTypes = {
  data: PropTypes.object,
};
