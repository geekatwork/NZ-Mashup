import PropTypes from 'prop-types';

export default function SidePanel({
  panelOpen,
  setPanelOpen,
  layers,
  overlayLayers = [], // new prop for cadastral overlays
  activeLayer,
  setActiveLayer,
  zonesCollapsed,
  setZonesCollapsed,
  filteredZones,
  zoneFilter,
  setZoneFilter,
  zoneNames,
  showSchoolZones, // add this prop
  schoolZonesDisabled = false, // new prop, default false
}) {
  return (
    <div
      className={`sidepanel-root${panelOpen ? ' open' : ''}`}
      style={{
        width: panelOpen ? 220 : 48,
        background: panelOpen ? '#f8fafc' : '#fff',
        boxShadow: '0 4px 16px 0 rgba(0,0,0,0.10)',
        borderRadius: panelOpen ? 14 : '0 14px 14px 0',
        zIndex: 1000,
        transition: 'width 0.2s, background 0.2s, border-radius 0.2s, box-shadow 0.2s',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        margin: 12,
        minHeight: 'calc(100vh - 24px)',
        position: 'relative', // add relative for absolute child
      }}
    >
      <style>{`
        @media (max-width: 900px) {
          .sidepanel-root {
            margin: 0 !important;
            min-height: 100vh !important;
            border-radius: 0 !important;
            width: 48px !important;
            max-width: 320px;
          }
          .sidepanel-root .sidepanel-toggle-btn {
            left: 0;
            right: auto;
          }
        }
        @media (max-width: 600px) {
          .sidepanel-root {
            position: absolute;
            left: 0;
            top: 0;
            height: 100vh;
            width: 48px !important;
            max-width: 100vw;
            min-width: 48px;
            background: #fff;
            box-shadow: 2px 0 8px rgba(0,0,0,0.07);
            border-radius: 0 !important;
            margin: 0 !important;
            z-index: 2000;
          }
          .sidepanel-root.open {
            width: 85vw !important;
          }
          .sidepanel-root .sidepanel-toggle-btn {
            left: 0;
            right: auto;
            top: 8px;
            z-index: 3001;
          }
          .sidepanel-root button, .sidepanel-root label, .sidepanel-root input, .sidepanel-root span {
            font-size: 18px !important;
            min-height: 36px;
            touch-action: manipulation;
          }
          .zone-list-transition label {
            font-size: 16px !important;
            min-height: 32px;
          }
        }
        @media (max-width: 900px), (max-width: 600px) {
          .leaflet-control-container .leaflet-top.leaflet-left {
            left: 56px !important;
          }
        }
        /* Touch-friendly Leaflet map controls */
        .leaflet-control {
          min-width: 44px;
          min-height: 44px;
          margin: 8px;
          touch-action: manipulation;
        }
        .leaflet-control a, .leaflet-control button {
          min-width: 44px;
          min-height: 44px;
          font-size: 20px;
          line-height: 44px;
          touch-action: manipulation;
        }
        .modern-toggle {
          position: relative;
          display: inline-block;
          width: 48px;
          height: 28px;
          vertical-align: middle;
          touch-action: manipulation;
        }
        .modern-toggle input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .modern-toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background: #d1d5db;
          border-radius: 28px;
          transition: background 0.2s;
        }
        .modern-toggle input:checked + .modern-toggle-slider {
          background: #4a90e2;
        }
        .modern-toggle-slider:before {
          position: absolute;
          content: '';
          height: 22px;
          width: 22px;
          left: 3px;
          bottom: 3px;
          background: #fff;
          border-radius: 50%;
          transition: transform 0.2s;
          box-shadow: 0 1px 4px rgba(0,0,0,0.10);
        }
        .modern-toggle input:checked + .modern-toggle-slider:before {
          transform: translateX(20px);
        }
        .modern-checkbox {
          accent-color: #4a90e2;
          width: 20px;
          height: 20px;
          transition: box-shadow 0.2s;
          touch-action: manipulation;
        }
        .modern-checkbox:focus {
          box-shadow: 0 0 0 2px #4a90e233;
        }
        .sidepanel-fade {
          transition: opacity 0.3s, filter 0.3s;
        }
        .sidepanel-fade-exit {
          opacity: 0.2;
          filter: blur(2px);
        }
        .zone-list-transition {
          transition: max-height 0.3s cubic-bezier(.4,0,.2,1), opacity 0.3s;
          overflow-y: auto;
          overflow-x: hidden;
        }
        .zone-list-collapsed {
          max-height: 0 !important;
          opacity: 0.2;
        }
        .zone-list-expanded {
          max-height: none;
          opacity: 1;
        }
      `}</style>
      {/* Close/Open button inside panel, top right */}
      <button
        className="sidepanel-toggle-btn"
        aria-label={panelOpen ? 'Close layer panel' : 'Open layer panel'}
        onClick={() => setPanelOpen((p) => !p)}
        style={{
          background: '#4a90e2',
          border: 'none',
          padding: 12,
          fontSize: 20,
          cursor: 'pointer',
          color: '#fff',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
          position: 'absolute',
          top: 8,
          right: panelOpen ? 13 : 8, // 5px left when open, flush when closed
          left: 'auto',
          zIndex: 3001,
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {panelOpen ? '←' : '☰'}
      </button>
      {panelOpen && (
        <div style={{ padding: 12, overflowY: 'auto', maxHeight: 'calc(100vh - 48px)' }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Map Layers</div>
          {layers.map((layer) => (
            <label key={layer.id} style={{ display: 'block', marginBottom: 8 }}>
              <input
                type="radio"
                name="layer"
                checked={activeLayer === layer.id}
                onChange={() => setActiveLayer(layer.id)}
                style={{ marginRight: 8 }}
              />
              {layer.name}
            </label>
          ))}
          
          {/* Cadastral Data Information */}
          {overlayLayers.length > 0 && (
            <>
              <hr style={{ margin: '16px 0' }} />
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Cadastral Data</div>
              <div style={{ fontSize: 13, color: '#666', marginBottom: 12, lineHeight: 1.4 }}>
                Use the layers control (top-right) to toggle:
              </div>
              <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13, color: '#555' }}>
                {overlayLayers.map((layer) => (
                  <li key={layer.id} style={{ marginBottom: 4 }}>
                    <strong>{layer.name}</strong>
                  </li>
                ))}
              </ul>
              <div style={{ fontSize: 12, color: '#888', marginTop: 8, lineHeight: 1.3 }}>
                Data courtesy of Land Information New Zealand (LINZ)
              </div>
            </>
          )}
          
          <hr style={{ margin: '16px 0' }} />
          <div style={{ borderTop: '1px solid #e0e0e0', margin: '16px 0 12px 0' }} />
          <div
            style={{
              fontWeight: 600,
              marginBottom: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              userSelect: 'none',
              cursor: showSchoolZones ? 'default' : 'pointer',
              opacity: schoolZonesDisabled ? 0.5 : 1,
            }}
            onClick={
              schoolZonesDisabled
                ? undefined
                : showSchoolZones
                  ? undefined
                  : () => setZonesCollapsed((z) => !z)
            }
            aria-label={
              showSchoolZones
                ? 'School zones expanded'
                : zonesCollapsed
                  ? 'Expand school zones'
                  : 'Collapse school zones'
            }
            tabIndex={schoolZonesDisabled ? -1 : showSchoolZones ? -1 : 0}
            onKeyDown={
              schoolZonesDisabled
                ? undefined
                : showSchoolZones
                  ? undefined
                  : (e) => {
                      if (e.key === 'Enter' || e.key === ' ') setZonesCollapsed((z) => !z);
                    }
            }
            role="button"
          >
            <span>School Zones in View</span>
            {!showSchoolZones && (
              <button
                aria-label={zonesCollapsed ? 'Expand school zones' : 'Collapse school zones'}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!schoolZonesDisabled) setZonesCollapsed((z) => !z);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 16,
                  cursor: schoolZonesDisabled ? 'not-allowed' : 'pointer',
                  marginLeft: 8,
                  padding: 0,
                  lineHeight: 1,
                }}
                disabled={schoolZonesDisabled}
              >
                {zonesCollapsed ? '▶' : '▼'}
              </button>
            )}
          </div>
          <div
            className={`zone-list-transition ${showSchoolZones ? 'zone-list-expanded' : zonesCollapsed ? 'zone-list-collapsed' : 'zone-list-expanded'}`}
            style={{
              pointerEvents: schoolZonesDisabled ? 'none' : 'auto',
              opacity: schoolZonesDisabled ? 0.5 : 1,
            }}
          >
            {(showSchoolZones || !zonesCollapsed) && (
              <>
                {filteredZones && filteredZones.features.length === 0 && (
                  <div style={{ color: '#888' }}>No zones in view</div>
                )}
                {filteredZones && filteredZones.features.length > 0 && zoneNames.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <button
                      type="button"
                      style={{
                        flex: 1,
                        padding: '4px 8px',
                        fontSize: 13,
                        borderRadius: 4,
                        border: '1px solid #4a90e2',
                        background: '#f0f6ff',
                        color: '#2563eb',
                        cursor: schoolZonesDisabled ? 'not-allowed' : 'pointer',
                      }}
                      onClick={() => !schoolZonesDisabled && setZoneFilter(zoneNames)}
                      disabled={schoolZonesDisabled}
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      style={{
                        flex: 1,
                        padding: '4px 8px',
                        fontSize: 13,
                        borderRadius: 4,
                        border: '1px solid #e74c3c',
                        background: '#fff5f5',
                        color: '#e74c3c',
                        cursor: schoolZonesDisabled ? 'not-allowed' : 'pointer',
                        fontWeight: 500,
                      }}
                      onClick={() => !schoolZonesDisabled && setZoneFilter([])}
                      disabled={schoolZonesDisabled}
                    >
                      Clear All
                    </button>
                  </div>
                )}
                {filteredZones &&
                  filteredZones.features.length > 0 &&
                  zoneNames.length > 0 &&
                  zoneNames.map((name) => (
                    <label
                      key={name}
                      style={{
                        display: 'block',
                        marginBottom: 6,
                        fontSize: 14,
                        opacity: schoolZonesDisabled ? 0.5 : 1,
                      }}
                    >
                      <input
                        type="checkbox"
                        className="modern-checkbox"
                        checked={zoneFilter.includes(name)}
                        onChange={(e) => {
                          if (schoolZonesDisabled) return;
                          setZoneFilter((f) =>
                            e.target.checked ? [...f, name] : f.filter((n) => n !== name)
                          );
                        }}
                        style={{ marginRight: 8 }}
                        disabled={schoolZonesDisabled}
                      />
                      {name}
                    </label>
                  ))}
                {filteredZones && filteredZones.features.length > 0 && zoneNames.length === 0 && (
                  <div style={{ color: '#888' }}>No zone names found</div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

SidePanel.propTypes = {
  panelOpen: PropTypes.bool.isRequired,
  setPanelOpen: PropTypes.func.isRequired,
  layers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      url: PropTypes.string,
      attribution: PropTypes.string,
    })
  ).isRequired,
  overlayLayers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      url: PropTypes.string,
      attribution: PropTypes.string,
      opacity: PropTypes.number,
    })
  ),
  activeLayer: PropTypes.string.isRequired,
  setActiveLayer: PropTypes.func.isRequired,
  zonesCollapsed: PropTypes.bool.isRequired,
  setZonesCollapsed: PropTypes.func.isRequired,
  filteredZones: PropTypes.object,
  zoneFilter: PropTypes.arrayOf(PropTypes.string).isRequired,
  setZoneFilter: PropTypes.func.isRequired,
  zoneNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  showSchoolZones: PropTypes.bool.isRequired,
  schoolZonesDisabled: PropTypes.bool,
};
