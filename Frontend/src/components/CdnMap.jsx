import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Maximize2, Minimize2, CheckSquare, Square, Layers, MapPin } from 'lucide-react';
import { getApiUrl, safeJsonParse } from '../utils/api';
import './CdnMap.css';

// Carto Tile Configuration - strictly no place names/labels, pure dark aesthetic
const getTileConfig = (apiKey = '') => {
  const cleanKey = (apiKey || import.meta.env.VITE_CARTO_API_KEY || '').trim();
  const keyParam = cleanKey ? `?key=${cleanKey}` : '';

  // dark_nolabels strips all place names, city labels, and roads
  return {
    name: 'Carto Dark Minimal (No Labels)',
    url: `https://{s}.basemaps.cartocdn.com/rastertiles/dark_nolabels/{z}/{x}/{y}{r}.png${keyParam}`,
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap'
  };
};

// Generate curved Bezier arc coordinates between two [lat, lng] points
function createCurvedArc([srcLat, srcLng], [destLat, destLng], numPoints = 40) {
  const points = [];
  const lngDiff = destLng - srcLng;
  const midLat = (srcLat + destLat) / 2 + Math.min(10, Math.max(-10, Math.abs(lngDiff) * 0.035));
  const midLng = (srcLng + destLng) / 2;

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const lat = (1 - t) * (1 - t) * srcLat + 2 * (1 - t) * t * midLat + t * t * destLat;
    const lng = (1 - t) * (1 - t) * srcLng + 2 * (1 - t) * t * midLng + t * t * destLng;
    points.push([lat, lng]);
  }
  return points;
}

export default function CdnMap({
  servers,
  clients,
  selectedClient,
  cdnEnabled,
  weather,
  overload,
  originOverloaded,
  loadFluctuations,
  simResults,
  simProgress,
  isSimulating,
  inspectNodeId,
  setInspectNodeId,
  highlightOnlyActive,
  setHighlightOnlyActive,
  isMapMaximized,
  setIsMapMaximized
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const layersGroupRef = useRef(null);
  const packetLayerRef = useRef(null);

  const [mapTheme, setMapTheme] = useState('stealth'); // Default strictly to 'stealth' (black stealth map)
  const [zoomLevel, setZoomLevel] = useState(2);
  const [continuousT, setContinuousT] = useState(0);
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_CARTO_API_KEY || '');

  // Securely retrieve Carto Map API key from backend if not pre-injected by Vite
  useEffect(() => {
    if (!apiKey) {
      fetch(getApiUrl('/api/config/maps'))
        .then(res => res.ok ? safeJsonParse(res) : null)
        .then(data => {
          if (data?.cartoApiKey) {
            setApiKey(data.cartoApiKey);
          }
        })
        .catch(() => {
          // Graceful fallback to open Carto tile servers
        });
    }
  }, [apiKey]);

  // Background packet animation loop
  useEffect(() => {
    let animId;
    let start;
    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      setContinuousT((elapsed % 1800) / 1800);
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Global window handler for custom marker clicks
  useEffect(() => {
    window.__netriumCdnSelect = (id) => {
      if (setInspectNodeId) setInspectNodeId(id);
    };
    return () => {
      delete window.__netriumCdnSelect;
    };
  }, [setInspectNodeId]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [22, 20],
      zoom: 2,
      minZoom: 1.5,
      maxZoom: 8,
      zoomControl: false,
      attributionControl: false
    });

    // Add Tile Layer with Carto API Key (strictly dark_nolabels - zero place names)
    const tileConfig = getTileConfig(apiKey);
    const tileLayer = L.tileLayer(tileConfig.url, {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: tileConfig.attribution
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Feature Groups
    layersGroupRef.current = L.layerGroup().addTo(map);
    packetLayerRef.current = L.layerGroup().addTo(map);

    map.on('zoomend', () => {
      setZoomLevel(map.getZoom());
    });

    mapInstanceRef.current = map;

    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleResize);

    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    const resizeTimer = setTimeout(handleResize, 200);

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      clearTimeout(resizeTimer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer URL when API key resolves
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const tileConfig = getTileConfig(apiKey);
    tileLayerRef.current.setUrl(tileConfig.url);
  }, [apiKey]);

  // Handle Resize on Maximize/Minimize
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const timer = setTimeout(() => {
      mapInstanceRef.current.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [isMapMaximized]);

  // Draw Map Elements (Markers, Arcs, Coverage Circles, Packet Streams)
  useEffect(() => {
    if (!mapInstanceRef.current || !layersGroupRef.current || !packetLayerRef.current) return;

    const layersGroup = layersGroupRef.current;
    const packetGroup = packetLayerRef.current;
    layersGroup.clearLayers();
    packetGroup.clearLayers();

    const clientObj = clients[selectedClient] || clients.srinagar;
    const clientLatLng = [clientObj.lat, clientObj.lon];
    const activeServerId = simResults ? simResults.selectedServerId : (cdnEnabled ? inspectNodeId : 'origin');
    const markerScale = Math.max(0.4, Math.min(1.15, Math.pow(zoomLevel / 2.5, 0.75)));

    // 1. Draw Geographic Coverage Circles
    Object.keys(servers).forEach(id => {
      const s = servers[id];
      const isOrigin = id === 'origin';
      const isTarget = activeServerId === id;
      const isFocused = !highlightOnlyActive || isTarget || isOrigin;

      const circle = L.circle([s.lat, s.lon], {
        radius: isOrigin ? 550000 : 240000,
        color: s.color || '#00bf63',
        fillColor: s.color || '#00bf63',
        fillOpacity: isFocused ? 0.14 : 0.02,
        weight: 1,
        dashArray: '4,4'
      });

      circle.on('click', () => {
        if (setInspectNodeId) setInspectNodeId(id);
      });

      layersGroup.addLayer(circle);
    });

    // 2. Draw Curved Connection Arcs
    Object.keys(servers).forEach(id => {
      if (id === 'origin') return;
      const s = servers[id];
      const sLatLng = [s.lat, s.lon];
      const isTarget = activeServerId === id;
      const isFocused = !highlightOnlyActive || isTarget;

      const clientToPopArc = createCurvedArc(clientLatLng, sLatLng);
      const popToOriginArc = createCurvedArc(sLatLng, [servers.origin.lat, servers.origin.lon]);

      const clientLine = L.polyline(clientToPopArc, {
        color: isTarget ? '#00bf63' : '#38bdf8',
        weight: isTarget ? 2.5 : 1,
        dashArray: isTarget ? '6,6' : '3,3',
        opacity: isFocused ? (isTarget ? 0.9 : 0.45) : 0.08
      });

      const originLine = L.polyline(popToOriginArc, {
        color: isTarget ? '#ef4444' : '#27272a',
        weight: isTarget ? 2 : 0.8,
        dashArray: '4,4',
        opacity: isFocused ? 0.65 : 0.06
      });

      layersGroup.addLayer(clientLine);
      layersGroup.addLayer(originLine);
    });

    // 3. Draw Edge Server & Origin Markers
    Object.keys(servers).forEach(id => {
      const s = servers[id];
      const isOrigin = id === 'origin';
      const isSelected = inspectNodeId === id;
      const isTarget = activeServerId === id;
      const isOver = isOrigin ? originOverloaded : overload[id];
      const hasStorm = weather[id];
      const nodeLoad = isOver ? 100 : (s.baseLoad + (loadFluctuations?.[id] || 0));
      const color = isOver ? '#ef4444' : (s.color || '#00bf63');
      const isFocused = !highlightOnlyActive || isTarget || isOrigin;

      const html = `
        <div onclick="event.stopPropagation(); window.__netriumCdnSelect && window.__netriumCdnSelect('${id}')" style="
          box-sizing: border-box; width: 100%; height: 100%;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          opacity: ${isFocused ? '1' : '0.15'}; transition: opacity 0.3s, transform 0.2s ease-out;
          transform: scale(${markerScale}); transform-origin: center center; cursor: pointer;
        ">
          ${hasStorm ? `
            <div style="margin-bottom: -4px;">
              <svg width="24" height="14" viewBox="0 0 24 16">
                <path d="M 5 11 C 3 11 2 9 2 7 C 2 5 4 4 6 4 C 7 2 9 1 12 1 C 15 1 17 3 18 5 C 22 11 19 11 17 11 Z" fill="#0c1018" stroke="#38bdf8" stroke-width="1.5" />
              </svg>
            </div>
          ` : ''}

          <!-- Server Node Icon -->
          <div style="
            box-sizing: border-box; width: ${isOrigin ? '30px' : '24px'}; height: ${isOrigin ? '30px' : '26px'};
            background: #080a10; border: 2px solid ${color};
            border-radius: ${isOrigin ? '50%' : '5px'}; display: flex; flex-direction: column; justify-content: space-evenly; align-items: center;
            padding: 2px; box-shadow: ${(isSelected || isTarget) ? `0 0 14px ${color}` : 'none'};
          ">
            ${isOrigin ? `
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2">
                <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
              </svg>
            ` : `
              <div style="height: 2px; background: ${color}; width: 12px; border-radius: 1px;"></div>
              <div style="height: 2px; background: ${color}; width: 12px; border-radius: 1px;"></div>
              <div style="height: 2px; background: ${color}; width: 12px; border-radius: 1px;"></div>
            `}
          </div>

          <!-- CPU Bar -->
          <div style="width: 32px; background: #18181b; height: 3px; border-radius: 2px; margin-top: 2px; overflow: hidden;">
            <div style="width: ${Math.min(100, nodeLoad)}%; background: ${isOver ? '#ef4444' : '#00bf63'}; height: 100%;"></div>
          </div>

          <!-- Label -->
          <div style="font-size: 8px; font-family: monospace; font-weight: bold; color: #ffffff; margin-top: 1px; white-space: nowrap; text-shadow: 0 1px 4px #000;">
            ${isOrigin ? 'ORIGIN (SF)' : id.toUpperCase()}
          </div>
        </div>
      `;

      const icon = L.divIcon({
        html,
        className: 'cdn-custom-server-marker',
        iconSize: [46, 56],
        iconAnchor: [23, 28]
      });

      const marker = L.marker([s.lat, s.lon], { icon });
      marker.on('click', () => {
        if (setInspectNodeId) setInspectNodeId(id);
      });
      layersGroup.addLayer(marker);
    });

    // 4. Draw Client User Pin
    const clientHtml = `
      <div style="
        box-sizing: border-box; width: 100%; height: 100%;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        transform: scale(${markerScale}); transform-origin: center center;
      ">
        <div style="
          width: 18px; height: 18px; border-radius: 50%; background: #38bdf8;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid #ffffff; box-shadow: 0 0 12px #38bdf8;
        ">
          <div style="width: 5px; height: 5px; border-radius: 50%; background: #000000;"></div>
        </div>
        <div style="font-size: 7.5px; font-family: monospace; font-weight: bold; color: #38bdf8; margin-top: 2px; white-space: nowrap; text-shadow: 0 1px 4px #000;">
          CLIENT (${selectedClient.toUpperCase()})
        </div>
      </div>
    `;

    const clientIcon = L.divIcon({
      html: clientHtml,
      className: 'cdn-custom-client-marker',
      iconSize: [46, 42],
      iconAnchor: [23, 21]
    });

    layersGroup.addLayer(L.marker(clientLatLng, { icon: clientIcon }));

    // 5. Draw Animated In-Flight Packets
    const popLatLng = servers[activeServerId] ? [servers[activeServerId].lat, servers[activeServerId].lon] : [servers.origin.lat, servers.origin.lon];
    const originLatLng = [servers.origin.lat, servers.origin.lon];

    if (isSimulating && simResults) {
      if (simResults.cacheHit) {
        // Cache Hit: POP -> Client
        const arc = createCurvedArc(popLatLng, clientLatLng);
        const idx = Math.floor(simProgress * (arc.length - 1));
        const pos = arc[Math.min(idx, arc.length - 1)];
        if (pos) {
          const packetCircle = L.circleMarker(pos, {
            radius: 5,
            color: '#00bf63',
            fillColor: '#ffffff',
            fillOpacity: 1,
            weight: 2
          });
          packetGroup.addLayer(packetCircle);
        }
      } else {
        // Cache Miss: Origin -> POP -> Client
        if (simProgress <= 0.5) {
          const segT = simProgress * 2;
          const arc = createCurvedArc(originLatLng, popLatLng);
          const idx = Math.floor(segT * (arc.length - 1));
          const pos = arc[Math.min(idx, arc.length - 1)];
          if (pos) {
            packetGroup.addLayer(L.circleMarker(pos, {
              radius: 5,
              color: '#ef4444',
              fillColor: '#ffffff',
              fillOpacity: 1,
              weight: 2
            }));
          }
        } else {
          const segT = (simProgress - 0.5) * 2;
          const arc = createCurvedArc(popLatLng, clientLatLng);
          const idx = Math.floor(segT * (arc.length - 1));
          const pos = arc[Math.min(idx, arc.length - 1)];
          if (pos) {
            packetGroup.addLayer(L.circleMarker(pos, {
              radius: 5,
              color: '#38bdf8',
              fillColor: '#ffffff',
              fillOpacity: 1,
              weight: 2
            }));
          }
        }
      }
    } else if (cdnEnabled) {
      // Continuous ping pulse
      const arc = createCurvedArc(popLatLng, clientLatLng);
      const idx = Math.floor(continuousT * (arc.length - 1));
      const pos = arc[Math.min(idx, arc.length - 1)];
      if (pos) {
        packetGroup.addLayer(L.circleMarker(pos, {
          radius: 3.5,
          color: '#00bf63',
          fillColor: '#00bf63',
          fillOpacity: 0.8,
          weight: 1
        }));
      }
    }
  }, [
    servers,
    clients,
    selectedClient,
    cdnEnabled,
    weather,
    overload,
    originOverloaded,
    loadFluctuations,
    simResults,
    simProgress,
    isSimulating,
    inspectNodeId,
    highlightOnlyActive,
    zoomLevel,
    continuousT,
    mapTheme
  ]);

  return (
    <div className={`cdn-map-wrapper ${isMapMaximized ? 'maximized' : ''} theme-${mapTheme}`}>
      {/* Top Map Action HUD Bar */}
      <div className="cdn-map-hud">
        <div className="hud-left">
          <span className="hud-badge key-badge">
            <MapPin size={11} />
            <span>CARTO Global Mesh Active</span>
          </span>
          <button
            type="button"
            className="hud-btn"
            onClick={() => setMapTheme(mapTheme === 'contrast' ? 'stealth' : 'contrast')}
            title="Toggle between Black & White borders and stealth dark"
          >
            <Layers size={12} />
            <span>Map: {mapTheme === 'stealth' ? 'Stealth Black' : 'White Borders'}</span>
          </button>
        </div>

        <div className="hud-right">
          <button
            type="button"
            className={`hud-btn ${highlightOnlyActive ? 'active' : ''}`}
            onClick={() => setHighlightOnlyActive(!highlightOnlyActive)}
          >
            {highlightOnlyActive ? <CheckSquare size={12} /> : <Square size={12} />}
            <span>Focus Active Path</span>
          </button>
          <button
            type="button"
            className="hud-btn"
            onClick={() => setIsMapMaximized(!isMapMaximized)}
          >
            {isMapMaximized ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
        </div>
      </div>

      {/* Leaflet Map Target DOM */}
      <div 
        id="cdn-google-map" 
        ref={mapContainerRef} 
        className="cdn-leaflet-map-stage"
      />
    </div>
  );
}
