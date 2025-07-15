import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import PropTypes from 'prop-types';

// Component to add NZ cadastral data as WMS overlay
export default function NZCadastralLayer({ visible = false, layerType = 'property-boundaries' }) {
  const map = useMap();
  const [wmsLayer, setWmsLayer] = useState(null);

  useEffect(() => {
    if (!map) return;

    // LINZ WMS endpoints that might work without authentication
    const wmsConfigs = {
      'property-boundaries': {
        url: 'https://data.linz.govt.nz/services/wms/layer-50804-changeset',
        layers: 'layer-50804-changeset',
        name: 'NZ Property Boundaries',
      },
      'road-centrelines': {
        url: 'https://data.linz.govt.nz/services/wms/layer-50329-changeset',
        layers: 'layer-50329-changeset',
        name: 'NZ Road Centrelines',
      },
      'building-outlines': {
        url: 'https://data.linz.govt.nz/services/wms/layer-101290-changeset',
        layers: 'layer-101290-changeset',
        name: 'NZ Building Outlines',
      },
    };

    const config = wmsConfigs[layerType];
    if (!config) return;

    // Create WMS layer
    const layer = L.tileLayer.wms(config.url, {
      layers: config.layers,
      format: 'image/png',
      transparent: true,
      version: '1.1.1',
      crs: L.CRS.EPSG3857,
      opacity: 0.7,
      attribution: 'CC BY 4.0 <a href="https://www.linz.govt.nz">Land Information New Zealand</a>',
    });

    setWmsLayer(layer);

    return () => {
      if (layer && map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    };
  }, [map, layerType]);

  useEffect(() => {
    if (!wmsLayer || !map) return;

    if (visible) {
      if (!map.hasLayer(wmsLayer)) {
        map.addLayer(wmsLayer);
      }
    } else {
      if (map.hasLayer(wmsLayer)) {
        map.removeLayer(wmsLayer);
      }
    }
  }, [visible, wmsLayer, map]);

  return null;
}

NZCadastralLayer.propTypes = {
  visible: PropTypes.bool,
  layerType: PropTypes.oneOf(['property-boundaries', 'road-centrelines', 'building-outlines']),
};
