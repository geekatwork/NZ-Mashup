import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import PropTypes from 'prop-types';

export default function GravelRoadsControl({ showGravelRoads, setShowGravelRoads }) {
  const map = useMap();

  useEffect(() => {
    // Create a custom control for toggling gravel roads
    const GravelControl = L.Control.extend({
      onAdd: function() {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
        
        container.style.backgroundColor = 'white';
        container.style.width = '140px';
        container.style.padding = '5px';
        container.style.cursor = 'pointer';
        container.style.fontSize = '13px';
        container.style.border = '1px solid #ccc';
        container.style.borderRadius = '4px';
        
        const checkbox = L.DomUtil.create('input', '', container);
        checkbox.type = 'checkbox';
        checkbox.checked = showGravelRoads;
        checkbox.style.marginRight = '5px';
        
        const label = L.DomUtil.create('span', '', container);
        label.innerHTML = 'Gravel Roads';
        
        const updateUI = () => {
          checkbox.checked = showGravelRoads;
          container.style.backgroundColor = showGravelRoads ? '#e8f5e8' : 'white';
        };
        
        updateUI();
        
        // Handle click events
        L.DomEvent.on(container, 'click', function(e) {
          L.DomEvent.stopPropagation(e);
          L.DomEvent.preventDefault(e);
          setShowGravelRoads(!showGravelRoads);
        });
        
        // Prevent map drag when clicking on control
        L.DomEvent.disableClickPropagation(container);
        
        return container;
      },
      
      onRemove: function() {
        // Nothing to do here
      }
    });

    const gravelControl = new GravelControl({ position: 'topright' });
    map.addControl(gravelControl);

    return () => {
      map.removeControl(gravelControl);
    };
  }, [map, showGravelRoads, setShowGravelRoads]);

  return null;
}

GravelRoadsControl.propTypes = {
  showGravelRoads: PropTypes.bool.isRequired,
  setShowGravelRoads: PropTypes.func.isRequired,
};