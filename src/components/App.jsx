import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import PropTypes from 'prop-types';
import SchoolZonesLayer, { useSchoolZoneFilter } from '@components/SchoolZonesLayer';
import LoadingZonesLayer from '@components/LoadingZonesLayer';
import GravelRoadsOverlay from '@components/GravelRoadsOverlay';
import GravelRoadsControl from '@components/GravelRoadsControl';
import GravelRoadsWrapper from '@components/GravelRoadsWrapper';
import SidePanel from '@components/SidePanel';
import useGeoJsonData from '@hooks/useGeoJsonData';
import useMapFilteredZones from '@hooks/useMapFilteredZones';
import ErrorBoundary from '@components/ErrorBoundary';

// Helper function to create LINZ API URLs with environment variable
const createLinzUrl = (layerId) => {
  const apiKey = import.meta.env.VITE_LINZ_API_KEY;
  if (!apiKey) {
    console.warn('VITE_LINZ_API_KEY not found in environment variables');
    return `https://data.linz.govt.nz/services;key=MISSING_API_KEY/tiles/v4/layer=${layerId}/EPSG:3857/{z}/{x}/{y}.png`;
  }
  return `https://data.linz.govt.nz/services;key=${apiKey}/tiles/v4/layer=${layerId}/EPSG:3857/{z}/{x}/{y}.png`;
};

const layers = [
  {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    id: 'osm',
  },
  {
    name: 'OpenTopoMap',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="https://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)',
    id: 'topo',
  },
  {
    name: 'Satellite (Esri)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution:
      'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    id: 'satellite',
  },
  {
    name: 'Satellite (Google)',
    url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    attribution: '&copy; Google',
    id: 'google-satellite',
  },
  {
    name: 'Hybrid (Google)',
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    attribution: '&copy; Google',
    id: 'google-hybrid',
  },
  {
    name: 'CartoDB Positron',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    id: 'carto-positron',
  },
  {
    name: 'CartoDB Dark Matter',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    id: 'carto-dark',
  },
  {
    name: 'Stamen Terrain',
    url: 'https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}.png?api_key=demo',
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://stamen.com/">Stamen Design</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a>',
    id: 'stamen-terrain',
  },
  {
    name: 'NZ Topo50 Map',
    url: createLinzUrl('50767'),
    attribution: 'CC BY 4.0 <a href="https://www.linz.govt.nz">Land Information New Zealand</a>',
    id: 'nz-topo50',
  },
];

// Cadastral and Paper Road overlay layers
// Using LINZ Data Service with official API key for authentic NZ cadastral data
const overlayLayers = [
  {
    name: 'NZ Property Boundaries',
    url: createLinzUrl('50804'),
    attribution: 'CC BY 4.0 <a href="https://www.linz.govt.nz">Land Information New Zealand</a>',
    id: 'property-boundaries',
    opacity: 0.7,
  },
  {
    name: 'NZ Building Outlines',
    url: createLinzUrl('101290'),
    attribution: 'CC BY 4.0 <a href="https://www.linz.govt.nz">Land Information New Zealand</a>',
    id: 'building-outlines',
    opacity: 0.8,
  },
  {
    name: 'NZ Road Centrelines',
    url: createLinzUrl('50329'),
    attribution: 'CC BY 4.0 <a href="https://www.linz.govt.nz">Land Information New Zealand</a>',
    id: 'road-centrelines',
    opacity: 0.6,
  },
  {
    name: 'NZ Railway Centrelines',
    url: createLinzUrl('50319'),
    attribution: 'CC BY 4.0 <a href="https://www.linz.govt.nz">Land Information New Zealand</a>',
    id: 'railway-centrelines',
    opacity: 0.8,
  },
  {
    name: 'NZ Hydrographic Polygons',
    url: createLinzUrl('50293'),
    attribution: 'CC BY 4.0 <a href="https://www.linz.govt.nz">Land Information New Zealand</a>',
    id: 'hydrographic-polygons',
    opacity: 0.6,
  },
  {
    name: 'NZ Road Types',
    url: createLinzUrl('53383'),
    attribution: 'CC BY 4.0 <a href="https://www.linz.govt.nz">Land Information New Zealand</a>',
    id: 'road-types',
    opacity: 0.8,
  },
];

// Filter school zones by map bounds
function MapFilterLogic({ allSchoolZones, setFilteredZones }) {
  useMapFilteredZones(allSchoolZones, setFilteredZones);
  return null;
}

MapFilterLogic.propTypes = {
  allSchoolZones: PropTypes.object,
  setFilteredZones: PropTypes.func.isRequired,
};

export default function App() {
  const [activeLayer, setActiveLayer] = useState(layers[0].id);
  const [panelOpen, setPanelOpen] = useState(true);
  const [filteredZones, setFilteredZones] = useState(null);
  const [showSchoolZones, setShowSchoolZones] = useState(false); // default to false for LayersControl
  const [zonesCollapsed, setZonesCollapsed] = useState(true); // start collapsed
  const [showLoadingZones, setShowLoadingZones] = useState(false); // default to false for LayersControl
  const [showGravelRoads, setShowGravelRoads] = useState(false); // default to false for LayersControl

  // Use custom hook for GeoJSON data
  const [allSchoolZones, schoolZonesError, schoolZonesLoading] = useGeoJsonData(
    '/data/NZ_School_Zone_boundaries_-3237969722482012343.geojson'
  );
  const [allLoadingZones, loadingZonesError, loadingZonesLoading] = useGeoJsonData(
    '/data/PNCC_Loading_Zones.geojson'
  );

  // School zone filter logic (zoneNames, zoneFilter, setZoneFilter, filteredGeoJson)
  const { zoneNames, zoneFilter, setZoneFilter, filteredGeoJson } = useSchoolZoneFilter(
    filteredZones,
    allSchoolZones
  );
  // Sort zoneNames alphabetically (case-insensitive)
  const sortedZoneNames = React.useMemo(
    () =>
      (zoneNames || [])
        .slice()
        .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })),
    [zoneNames]
  );

  const currentLayer = layers.find((l) => l.id === activeLayer);
  const mapRef = useRef();

  // When the School Zones overlay is ticked, select all schools in view
  const handleShowSchoolZones = useCallback((checked) => {
    setShowSchoolZones(checked);
    if (checked) {
      if (filteredZones && filteredZones.features && filteredZones.features.length > 0) {
        const namesInView = filteredZones.features
          .map((f) => f.properties?.School_name || 'Unknown')
          .filter(Boolean);
        setZoneFilter(namesInView);
      }
      // Do not clear zoneFilter if filteredZones is not ready
    } else {
      setZoneFilter([]); // Only clear when overlay is toggled OFF
      setZonesCollapsed(true); // Collapse the school zones in view section
    }
  }, [filteredZones, setZoneFilter, setZonesCollapsed]);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    function onOverlayAdd(e) {
      if (e.name === 'School Zones') {
        handleShowSchoolZones(true); // Use handler for logging and logic
      }
      if (e.name === 'Loading Zones') {
        setShowLoadingZones(true);
      }
      if (e.name === 'Gravel Roads') {
        setShowGravelRoads(true);
      }
    }
    function onOverlayRemove(e) {
      if (e.name === 'School Zones') {
        handleShowSchoolZones(false); // Use handler for logging and logic
      }
      if (e.name === 'Loading Zones') {
        setShowLoadingZones(false);
      }
      if (e.name === 'Gravel Roads') {
        setShowGravelRoads(false);
      }
    }
    map.on('overlayadd', onOverlayAdd);
    map.on('overlayremove', onOverlayRemove);
    return () => {
      map.off('overlayadd', onOverlayAdd);
      map.off('overlayremove', onOverlayRemove);
    };
  }, [filteredZones, handleShowSchoolZones]);

  // Fallback: Listen for overlayadd/overlayremove events if onChange is not supported
  useEffect(() => {
    // Wait until the map is available
    const mapElem = document.querySelector('.leaflet-container');
    if (!mapElem) return;
    // Find the Leaflet map instance
    const leafletMap = mapElem._leaflet_map;
    if (!leafletMap) return;

    function onOverlayAdd(e) {
      if (e.name === 'School Zones') {
        handleShowSchoolZones(true); // Use handler for logging and logic
      }
      if (e.name === 'Loading Zones') {
        setShowLoadingZones(true);
      }
      if (e.name === 'Gravel Roads') {
        setShowGravelRoads(true);
      }
    }
    function onOverlayRemove(e) {
      if (e.name === 'School Zones') {
        handleShowSchoolZones(false); // Use handler for logging and logic
      }
      if (e.name === 'Loading Zones') {
        setShowLoadingZones(false);
      }
      if (e.name === 'Gravel Roads') {
        setShowGravelRoads(false);
      }
    }
    leafletMap.on('overlayadd', onOverlayAdd);
    leafletMap.on('overlayremove', onOverlayRemove);
    return () => {
      leafletMap.off('overlayadd', onOverlayAdd);
      leafletMap.off('overlayremove', onOverlayRemove);
    };
  }, [filteredZones, handleShowSchoolZones]);

  // Show loading or error states for school zones or loading zones
  if (schoolZonesLoading || loadingZonesLoading)
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: '#f4f6fa',
        }}
      >
        <style>{`
        .spinner {
          width: 44px;
          height: 44px;
          border: 5px solid #e0e7ef;
          border-top: 5px solid #4a90e2;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px auto' }} />
          <div style={{ color: '#4a90e2', fontWeight: 500, fontSize: 18 }}>
            {schoolZonesLoading ? 'Loading school zones…' : 'Loading loading zones…'}
          </div>
        </div>
      </div>
    );
  if (schoolZonesError || loadingZonesError)
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: '#f4f6fa',
        }}
      >
        <div style={{ textAlign: 'center', color: '#e74c3c', fontWeight: 500, fontSize: 18 }}>
          {schoolZonesError && (
            <div>
              Error loading school zones: {schoolZonesError.message || String(schoolZonesError)}
            </div>
          )}
          {loadingZonesError && (
            <div>
              Error loading loading zones: {loadingZonesError.message || String(loadingZonesError)}
            </div>
          )}
        </div>
      </div>
    );

  return (
    <ErrorBoundary>
      <div
        style={{
          display: 'flex',
          height: '100vh',
          width: '100vw',
          overflow: 'hidden',
          background: '#f4f6fa',
        }}
      >
        {/* Side panel */}
        <SidePanel
          panelOpen={panelOpen}
          setPanelOpen={setPanelOpen}
          layers={layers}
          overlayLayers={overlayLayers}
          activeLayer={activeLayer}
          setActiveLayer={setActiveLayer}
          zonesCollapsed={zonesCollapsed}
          setZonesCollapsed={setZonesCollapsed}
          filteredZones={filteredZones}
          zoneFilter={zoneFilter}
          setZoneFilter={setZoneFilter}
          zoneNames={sortedZoneNames}
          showSchoolZones={showSchoolZones} // pass to SidePanel
          schoolZonesDisabled={!showSchoolZones} // disable when overlay is off
        />
        {/* Map */}
        <div style={{ flex: 1, minWidth: 0, background: '#e9eef5' }}>
          <MapContainer
            center={[-40.355, 175.611]}
            zoom={13}
            style={{ height: '100vh', width: '100%' }}
            ref={mapRef}
          >
            <MapFilterLogic allSchoolZones={allSchoolZones} setFilteredZones={setFilteredZones} />
            <TileLayer attribution={currentLayer.attribution} url={currentLayer.url} />
            
            {/* Real gravel roads overlay with OSM data */}
            <GravelRoadsOverlay visible={showGravelRoads} />
            
            {/* Custom control for gravel roads */}
            <GravelRoadsControl 
              showGravelRoads={showGravelRoads} 
              setShowGravelRoads={setShowGravelRoads} 
            />
            
            <LayersControl position="topleft" key="layers-control">
              {/* Data Overlays */}
              <LayersControl.Overlay
                key="school-zones"
                name="School Zones"
                checked={showSchoolZones}
                onChange={(e) => handleShowSchoolZones(e.target.checked)}
              >
                <SchoolZonesLayer data={filteredGeoJson} />
              </LayersControl.Overlay>
              <LayersControl.Overlay
                key="loading-zones"
                name="Loading Zones"
                checked={showLoadingZones}
                onChange={(e) => setShowLoadingZones(e.target.checked)}
              >
                {allLoadingZones && <LoadingZonesLayer data={allLoadingZones} />}
              </LayersControl.Overlay>
              <LayersControl.Overlay 
                key="gravel-roads-backup"
                name="Gravel Roads (LayersControl)"
                checked={showGravelRoads}
                onChange={(e) => setShowGravelRoads(e.target.checked)}
              >
                <GravelRoadsWrapper visible={showGravelRoads} />
              </LayersControl.Overlay>
              
              {/* LINZ Cadastral and Infrastructure Overlays */}
              {overlayLayers.map((layer) => (
                <LayersControl.Overlay key={layer.id} name={layer.name}>
                  <TileLayer
                    url={layer.url}
                    attribution={layer.attribution}
                    opacity={layer.opacity || 1}
                  />
                </LayersControl.Overlay>
              ))}
            </LayersControl>
          </MapContainer>
        </div>
        {/* Mobile styles */}
        <style>{`
          @media (max-width: 600px) {
            div[style*='display: flex'] > div:first-child {
              position: absolute;
              left: 0;
              top: 0;
              height: 100vh;
              width: ${panelOpen ? '80vw' : '48px'};
              max-width: 320px;
              min-width: 48px;
              background: #fff;
              box-shadow: 2px 0 8px rgba(0,0,0,0.07);
              transition: width 0.2s;
            }
          }
        `}</style>
      </div>
    </ErrorBoundary>
  );
}
