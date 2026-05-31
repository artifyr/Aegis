'use client';

import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import Map, { NavigationControl, Marker, Source, Layer, type MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useTacticalStore, SurveillanceNode } from '@/store/tactical-store';

// ─── Constants ────────────────────────────────────────────────────

// DESIGN.md: surface_container_lowest (#0d0e12) for global background
const DARK_STYLE = 'mapbox://styles/mapbox/dark-v11';
const SATELLITE_STYLE = 'mapbox://styles/mapbox/satellite-streets-v12';

const INITIAL_VIEW = {
  longitude: -74.006, // NYC as initial zoomed view for cameras
  latitude: 40.7128,
  zoom: 12,
  pitch: 30,
  bearing: 0,
};

const GLOBAL_SEED_CAMERAS: SurveillanceNode[] = [
  { type: 'node', id: 10001, lat: 40.7128, lon: -74.006, tags: { 'camera:mount': 'pole', 'man_made': 'surveillance' } },
  { type: 'node', id: 10002, lat: 51.5074, lon: -0.1278, tags: { 'camera:mount': 'wall', 'man_made': 'surveillance' } },
  { type: 'node', id: 10003, lat: 35.6895, lon: 139.6917, tags: { 'camera:mount': 'pole', 'man_made': 'surveillance' } },
  { type: 'node', id: 10004, lat: -33.8688, lon: 151.2093, tags: { 'camera:mount': 'wall', 'man_made': 'surveillance' } },
  { type: 'node', id: 10005, lat: -23.5505, lon: -46.6333, tags: { 'camera:mount': 'pole', 'man_made': 'surveillance' } },
  { type: 'node', id: 10006, lat: -33.9249, lon: 18.4241, tags: { 'camera:mount': 'pole', 'man_made': 'surveillance' } },
  { type: 'node', id: 10007, lat: 25.2048, lon: 55.2708, tags: { 'camera:mount': 'wall', 'man_made': 'surveillance' } },
  { type: 'node', id: 10008, lat: 48.8566, lon: 2.3522, tags: { 'camera:mount': 'pole', 'man_made': 'surveillance' } },
  { type: 'node', id: 10009, lat: 1.3521, lon: 103.8198, tags: { 'camera:mount': 'wall', 'man_made': 'surveillance' } },
  { type: 'node', id: 10010, lat: 19.4326, lon: -99.1332, tags: { 'camera:mount': 'pole', 'man_made': 'surveillance' } },
  { type: 'node', id: 10011, lat: 55.7558, lon: 37.6173, tags: { 'camera:mount': 'wall', 'man_made': 'surveillance' } },
  { type: 'node', id: 10012, lat: 39.9042, lon: 116.4074, tags: { 'camera:mount': 'pole', 'man_made': 'surveillance' } },
  { type: 'node', id: 10013, lat: -34.6037, lon: -58.3816, tags: { 'camera:mount': 'pole', 'man_made': 'surveillance' } },
  { type: 'node', id: 10014, lat: 6.5244, lon: 3.3792, tags: { 'camera:mount': 'wall', 'man_made': 'surveillance' } },
  { type: 'node', id: 10015, lat: 28.6139, lon: 77.2090, tags: { 'camera:mount': 'pole', 'man_made': 'surveillance' } },
];

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

// ─── HUD Surveillance Camera SVG ─────────────────────────────────
// DESIGN.md: 2px "corner bracket" detail in each corner, "targeting" aesthetic
function CameraMarker({
  camera,
  isSelected,
  onClick,
}: {
  camera: SurveillanceNode;
  isSelected: boolean;
  onClick: () => void;
}) {
  const size = isSelected ? 48 : 36;
  const color = '#3cdcd1'; // Teal / primary_fixed_dim for Surveillance

  return (
    <div
      onClick={onClick}
      className="absolute cursor-pointer group flex items-center justify-center"
      style={{
        transform: 'translate(-50%, -50%)',
        width: size,
        height: size,
      }}
    >
      {/* Corner bracket targeting frame - DESIGN.md HUD Coordinate Overlay */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        className="transition-all duration-150 ease-out"
      >
        {/* Top-left bracket */}
        <path d="M2 14 L2 2 L14 2" stroke={color} strokeWidth="2" fill="none" opacity={isSelected ? 1 : 0.6} />
        {/* Top-right bracket */}
        <path d="M34 2 L46 2 L46 14" stroke={color} strokeWidth="2" fill="none" opacity={isSelected ? 1 : 0.6} />
        {/* Bottom-left bracket */}
        <path d="M2 34 L2 46 L14 46" stroke={color} strokeWidth="2" fill="none" opacity={isSelected ? 1 : 0.6} />
        {/* Bottom-right bracket */}
        <path d="M34 46 L46 46 L46 34" stroke={color} strokeWidth="2" fill="none" opacity={isSelected ? 1 : 0.6} />

        {/* Surveillance Camera Icon Inside */}
        <path d="M16 21h10v6H16z" fill={color} opacity="0.8" />
        <path d="M26 22l6-3v8l-6-3" fill={color} opacity="0.8" />
        {isSelected && <circle cx="20" cy="24" r="1.5" fill="#0d0e12" />}
      </svg>

      {/* Active Track pulse ring — DESIGN.md: 2px primary_fixed_dim pulse */}
      {isSelected && (
        <span
          className="absolute rounded-full border-2 animate-ping"
          style={{
            width: size + 12,
            height: size + 12,
            left: -6,
            top: -6,
            borderColor: 'rgba(60, 220, 209, 0.35)',
          }}
        />
      )}

      {/* Glass Tooltip — DESIGN.md: 12px backdrop-blur, 40% opacity surface_variant */}
      <div
        className="absolute left-full ml-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50 whitespace-nowrap"
        style={{
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(68, 71, 78, 0.40)', // surface_variant at 40%
        }}
      >
        <div className="px-3 py-2 text-left">
          <div className="text-[9px] font-mono text-[#7bd6d1] font-bold tracking-wider mb-0.5">
            NODE: {camera.id}
          </div>
          <div className="text-[8px] font-mono text-[#bacac7] leading-relaxed">
            TAGS: SURVEILLANCE<br />
            LAT: {camera.lat.toFixed(6)}<br />
            LNG: {camera.lon.toFixed(6)}<br />
            MFR: {(camera.tags?.['camera:mount'] || 'UNKNOWN').toUpperCase()}
          </div>
        </div>
        {/* Corner brackets on tooltip too */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
          <line x1="0" y1="0" x2="8" y2="0" stroke={color} strokeWidth="1" />
          <line x1="0" y1="0" x2="0" y2="8" stroke={color} strokeWidth="1" />
          <line x1="100%" y1="0" x2="calc(100% - 8px)" y2="0" stroke={color} strokeWidth="1" />
          <line x1="100%" y1="0" x2="100%" y2="8" stroke={color} strokeWidth="1" />
        </svg>
      </div>
    </div>
  );
}

// ─── Ghost Border Grid Overlay ───────────────────────────────────
// DESIGN.md: outline (#859491) at 10% opacity
function GhostGrid({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div
      className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-500"
      style={{
        backgroundImage: `
          linear-gradient(rgba(133, 148, 145, 0.10) 1px, transparent 1px),
          linear-gradient(90deg, rgba(133, 148, 145, 0.10) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }}
    />
  );
}

// ─── Tactical Overlay Feed ───────────────────────────────────────
function TacticalVideoOverlay({ camera, onClose }: { camera: SurveillanceNode; onClose: () => void }) {
  const [streamData, setStreamData] = useState<any>(null);

  useEffect(() => {
    // Fetch live stream URL from local Next.js API
    fetch(`/api/camera/${camera.id}/stream?lat=${camera.lat}&lng=${camera.lon}`)
      .then((res) => res.json())
      .then((data) => setStreamData(data))
      .catch((err) => console.error("Stream fetch failed", err));
  }, [camera]);

  // Tactical Glass Rule: 12px backdrop-blur, 40% opacity on charcoal surface (#1f1f24 mapped to roughly rgba)
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 border border-[#3cdcd1] p-4 flex flex-col bezel-glow shadow-[0_0_20px_#3cdcd140]"
      style={{ backdropFilter: 'blur(12px)', backgroundColor: 'rgba(31, 31, 36, 0.40)' }}>
      <div className="flex justify-between items-center border-b border-[#3cdcd1]/50 pb-2 mb-4">
        <span className="font-mono text-[10px] text-[#3cdcd1] tracking-widest uppercase">LIVE FEED // NODE_{camera.id}</span>
        <button onClick={onClose} className="text-[#3cdcd1] font-mono text-xs w-6 h-6 flex items-center justify-center hover:bg-[#3cdcd1]/20 cursor-pointer transition-colors">
          ✕
        </button>
      </div>

      {/* Video Container */}
      <div className="relative w-[480px] h-[270px] bg-black flex flex-col items-center justify-center overflow-hidden border border-[#3cdcd1]/30">
        {!streamData ? (
          <>
            <div className="absolute inset-0 bg-[#3cdcd1] opacity-[0.03] animate-pulse mix-blend-overlay pointer-events-none" />
            <span className="font-mono text-[#bacac7] text-[10px] tracking-widest animate-none z-10">ESTABLISHING UPLINK...</span>
          </>
        ) : (
          <iframe
            src={`${streamData.stream_url}?autoplay=1&mute=1&playsinline=1`}
            className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
            frameBorder="0"
            allow="autoplay"
          />
        )}

        {/* Telemetry HUD explicitly overlaid on video player */}
        <div className="absolute top-2 right-2 text-[#3cdcd1] text-[10px] font-mono flex items-center gap-1.5 z-20" style={{ textShadow: "1px 1px 2px #000" }}>
          REC <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
        </div>

        <div className="absolute bottom-2 left-2 text-[#3cdcd1] text-[9px] font-mono flex flex-col z-20 leading-tight tracking-widest" style={{ textShadow: "1px 1px 2px #000" }}>
          <span>LAT: {camera.lat.toFixed(6)}</span>
          <span>LNG: {camera.lon.toFixed(6)}</span>
        </div>

        <div className="absolute bottom-2 right-2 text-[#3cdcd1] text-[9px] font-mono z-20 tracking-widest uppercase" style={{ textShadow: "1px 1px 2px #000" }}>
          SYS_HEALTH: {streamData?.uptime || "CALCULATING"}
        </div>
      </div>
    </div>
  );
}

// ─── Main Tactical Map ───────────────────────────────────────────
export function TacticalMap({
  onAssetSelect,
  selectedAssetId,
}: {
  // Relaxing typing slightly so it can take overpass nodes
  onAssetSelect?: (asset: any) => void;
  selectedAssetId?: number | string | null;
}) {
  const mapRef = useRef<MapRef>(null);
  const coordsRef = useRef<HTMLSpanElement>(null);

  // Connect to Zustand store
  const cameras = useTacticalStore(state => state.cameras);
  const setCameras = useTacticalStore(state => state.setCameras);
  const diveTarget = useTacticalStore(state => state.diveTarget);
  const selectedCamera = useTacticalStore(state => state.activeCamera);
  const setSelectedCamera = useTacticalStore(state => state.setActiveCamera);

  // New stores for Maritime and Aviation
  const flights = useTacticalStore(state => state.flights);
  const setFlights = useTacticalStore(state => state.setFlights);
  const ports = useTacticalStore(state => state.ports);
  const setPorts = useTacticalStore(state => state.setPorts);
  const chokepoints = useTacticalStore(state => state.chokepoints);
  const setChokepoints = useTacticalStore(state => state.setChokepoints);
  const layers = useTacticalStore(state => state.layers);

  const [status, setStatus] = useState('AWAITING_MAP');
  const [isDived, setIsDived] = useState(false);
  const [activeEntityId, setActiveEntityId] = useState<string | null>(null);
  const [mapStyle, setMapStyle] = useState(DARK_STYLE);
  const [bounds, setBounds] = useState<{ sw: { lat: number, lng: number }, ne: { lat: number, lng: number } } | null>(null);

  // Optimize rendering by filtering entities to current viewport and capping limits
  const visibleFlights = useMemo(() => {
    const activeFlights = flights.filter((flight) => {
      if (flight.category === 'commercial' && !layers.aviation_commercial) return false;
      if (flight.category === 'private' && !layers.aviation_private) return false;
      if (flight.category === 'jet' && !layers.aviation_jets) return false;
      if (flight.category === 'military' && !layers.aviation_military) return false;
      return true;
    });

    if (!bounds) return activeFlights;

    const filtered = activeFlights.filter(f =>
      f.lat >= bounds.sw.lat && f.lat <= bounds.ne.lat &&
      f.lng >= bounds.sw.lng && f.lng <= bounds.ne.lng
    );
    return filtered;
  }, [flights, bounds, layers.aviation_commercial, layers.aviation_private, layers.aviation_jets, layers.aviation_military]);

  // Generate GeoJSON for flights
  const flightsGeoJSON = useMemo(() => {
    return {
      type: 'FeatureCollection',
      features: visibleFlights.map(f => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [f.lng, f.lat] },
        properties: {
          icao24: f.icao24,
          category: f.category,
          true_track: f.true_track || 0
        }
      }))
    };
  }, [visibleFlights]);

  const activeFlightData = useMemo(() => {
    return flights.find(f => f.icao24 === activeEntityId);
  }, [flights, activeEntityId]);

  const visiblePorts = useMemo(() => {
    if (!bounds) return ports;
    return ports.filter(p =>
      p.lat >= bounds.sw.lat && p.lat <= bounds.ne.lat &&
      p.lng >= bounds.sw.lng && p.lng <= bounds.ne.lng
    );
  }, [ports, bounds]);

  const visibleChokepoints = useMemo(() => {
    if (!bounds) return chokepoints;
    return chokepoints.filter(c =>
      c.lat >= bounds.sw.lat && c.lat <= bounds.ne.lat &&
      c.lng >= bounds.sw.lng && c.lng <= bounds.ne.lng
    );
  }, [chokepoints, bounds]);

  // Overpass fetch hook triggering onIdle
  const fetchCamerasInView = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    setStatus('QUERYING_OVERPASS');
    const zoom = map.getZoom();
    const bounds = map.getBounds();
    if (!bounds) return;

    // Scale limits based on zoom to prevent UI congestion.
    let limit = 0;
    if (zoom >= 12) limit = 300;
    else if (zoom >= 8) limit = 10;
    else if (zoom >= 4) limit = 5;

    // Below zoom 4, we exclusively use GLOBAL_SEED_CAMERAS.
    if (limit === 0) {
      setStatus('LIVE // GLOBAL_MACRO');
      setCameras(GLOBAL_SEED_CAMERAS);
      return;
    }

    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();

    // Bbox format: south, west, north, east
    const bbox = `${sw.lat},${sw.lng},${ne.lat},${ne.lng}`;

    // Fetch Cameras via Next.js API
    fetch(`/api/cctv?bbox=${bbox}&limit=${limit}`)
      .then(res => res.json())
      .then(data => {
        // Merge the Overpass results with the global seeds if the seeds are within the current viewport
        const elements = data.elements || [];
        const inViewSeeds = GLOBAL_SEED_CAMERAS.filter(c =>
          c.lat >= sw.lat && c.lat <= ne.lat && c.lon >= sw.lng && c.lon <= ne.lng
        );

        // Remove duplicates
        const combined = [...elements, ...inViewSeeds];
        const unique = Array.from(new globalThis.Map(combined.map(c => [c.id, c])).values());

        setCameras(unique);
        setStatus('LIVE // SYNCED');
      })
      .catch(err => {
        console.error("Overpass fetch failed", err);
        setStatus('OVERPASS_ERROR');
      });

  }, []);

  // Fetch static maritime intel on mount
  useEffect(() => {
    fetch('/api/maritime')
      .then(res => res.json())
      .then(data => {
        setPorts(data.ports || []);
        setChokepoints(data.chokepoints || []);
      })
      .catch(err => console.error("Maritime fetch failed", err));
  }, [setPorts, setChokepoints]);

  // Fetch Aviation data every 5 minutes (300,000 ms)
  useEffect(() => {
    const fetchAviation = () => {
      fetch('/api/aviation')
        .then(res => res.json())
        .then(data => {
          const allFlights = [
            ...(data.commercial_flights || []),
            ...(data.private_flights || []),
            ...(data.private_jets || []),
            ...(data.military_flights || [])
          ];
          setFlights(allFlights);
        })
        .catch(err => console.error("Aviation fetch failed", err));
    };

    fetchAviation();
    const intervalId = setInterval(fetchAviation, 300000);
    return () => clearInterval(intervalId);
  }, [setFlights]);

  // Execute external dives from the Zustand store
  useEffect(() => {
    if (diveTarget && mapRef.current) {
      const map = mapRef.current.getMap();
      if (map) {
        map.setCenter([diveTarget.lng, diveTarget.lat]);
        map.setZoom(diveTarget.zoom || 17);
        map.setPitch(60);
        map.setBearing(0);
        
        setSelectedCamera(diveTarget);
        setIsDived(true);
      }
    }
  }, [diveTarget, setSelectedCamera]);

  const handleMapLoad = useCallback((e: any) => {
    const map = e.target;
    
    const addPlaneImage = (id: string, color: string) => {
      if (map.hasImage(id)) return;
      const svg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>`;
      const img = new Image(24, 24);
      img.onload = () => {
        if (!map.hasImage(id)) map.addImage(id, img);
      };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    };

    addPlaneImage('plane-commercial', '#f97316');
    addPlaneImage('plane-private', '#a855f7');
    addPlaneImage('plane-jet', '#ec4899');
    addPlaneImage('plane-military', '#ef4444');
    
    const b = map.getBounds();
    if (b) setBounds({ sw: { lat: b.getSouth(), lng: b.getWest() }, ne: { lat: b.getNorth(), lng: b.getEast() } });
  }, []);

  const handleMapClick = useCallback((e: any) => {
    console.log('Map clicked', e.features);
    if (e.features && e.features.length > 0) {
      const feature = e.features[0];
      if (feature.layer.id === 'flights-layer') {
        console.log('Setting active flight:', feature.properties.icao24);
        setActiveEntityId(feature.properties.icao24);
        return;
      }
    }
    setActiveEntityId(null);
  }, []);

  const onMouseEnter = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (map) map.getCanvas().style.cursor = 'pointer';
  }, []);

  const onMouseLeave = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (map) map.getCanvas().style.cursor = '';
  }, []);

  // ─── Camera Dive ─────────────────────────────────────────────
  // DESIGN.md: Seamless high-velocity fly-to animation
  const cameraDive = useCallback(
    (lat: number, lng: number) => {
      const map = mapRef.current?.getMap();
      if (!map) return;

      // Switch to satellite on dive
      setMapStyle(SATELLITE_STYLE);
      setIsDived(true);

      map.flyTo({
        center: [lng, lat],
        zoom: 18, // Extra tight zoom for camera view
        pitch: 60,
        bearing: -20,
        speed: 1.8,
        curve: 1.6,
        essential: true,
      });
    },
    [],
  );

  // Reset to globe view
  const cameraReset = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    setSelectedCamera(null);
    setMapStyle(DARK_STYLE);
    setIsDived(false);

    map.flyTo({
      center: [0, 20],
      zoom: 1.5,
      pitch: 0,
      bearing: 0,
      speed: 1.2,
      essential: true,
    });
  }, []);

  // Expose cameraDive via window for SideNavBar integration
  useEffect(() => {
    (window as any).__aegisCameraDive = cameraDive;
    (window as any).__aegisCameraReset = cameraReset;
    return () => {
      delete (window as any).__aegisCameraDive;
      delete (window as any).__aegisCameraReset;
    };
  }, [cameraDive, cameraReset]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-surface-container-lowest">
        <div className="text-center p-8">
          <div className="font-mono text-[10px] text-on-tertiary-container tracking-widest mb-2">⚠ MAPBOX_TOKEN NOT SET</div>
          <p className="font-mono text-[9px] text-on-surface-variant leading-relaxed max-w-sm">
            Create a <span className="text-secondary">.env.local</span> file in the project root with:<br />
            <code className="text-secondary">NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_token_here</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: 0,
          latitude: 20,
          zoom: 1.5,
          pitch: 0,
          bearing: 0,
        }}
        onIdle={fetchCamerasInView}
        onMove={(e) => {
          const b = e.target.getBounds();
          setBounds({
            sw: { lat: b.getSouth(), lng: b.getWest() },
            ne: { lat: b.getNorth(), lng: b.getEast() }
          });
        }}
        onLoad={handleMapLoad}
        onClick={handleMapClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        interactiveLayerIds={['flights-layer']}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={mapStyle}
        projection={{ name: 'globe' }}
        fog={{
          color: '#0d0e12',
          'high-color': '#0d0e12',
          'horizon-blend': 0.08,
          'space-color': '#0d0e12',
          'star-intensity': 0.3,
        }}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
      >
        <NavigationControl position="bottom-right" showCompass={false} />

        {/* High-Performance WebGL Layer for Flights */}
        {!isDived && (
          <Source id="flights-source" type="geojson" data={flightsGeoJSON as any}>
            <Layer
              id="flights-layer"
              type="symbol"
              layout={{
                'icon-image': ['concat', 'plane-', ['get', 'category']],
                'icon-rotate': ['get', 'true_track'],
                'icon-rotation-alignment': 'map',
                'icon-allow-overlap': true,
                'icon-size': 0.7
              }}
            />
          </Source>
        )}

        {/* HUD Markers projected directly onto WebGL Globe via Mapbox Marker */}
        {!isDived && layers.cctv && cameras.map((camera) => (
          <Marker key={`cam-${camera.id}`} longitude={camera.lon} latitude={camera.lat} anchor="center">
            <CameraMarker
              camera={camera}
              isSelected={selectedCamera?.id === camera.id || selectedAssetId === camera.id}
              onClick={() => {
                onAssetSelect?.(camera);
                setSelectedCamera(camera);
                cameraDive(camera.lat, camera.lon);
              }}
            />
          </Marker>
        ))}


        {!isDived && layers.maritime && visiblePorts.map((port) => {
          const isActive = activeEntityId === (port.id || port.name);
          return (
            <Marker
              key={`port-${port.id || port.name}`}
              longitude={port.lng}
              latitude={port.lat}
              anchor="center"
              style={{ zIndex: isActive ? 999999 : undefined }}
            >
              <div
                className={`w-3 h-3 rounded-full border border-black cursor-pointer shadow-[0_0_8px_currentColor] ${port.congestion === 'SEVERE' ? 'bg-red-500 text-red-500' : port.congestion === 'CONGESTED' ? 'bg-orange-500 text-orange-500' : 'bg-cyan-500 text-cyan-500'}`}
                onClick={(e) => { e.stopPropagation(); setActiveEntityId(port.id || port.name); }}
              />
              {isActive && (
                <div
                  className="absolute top-4 left-4 bg-[#0d0e12]/95 border border-slate-800/60 p-4 rounded-md shadow-2xl backdrop-blur-lg w-80 pointer-events-auto cursor-auto transition-all duration-200 z-[999999]"
                  style={{
                    boxShadow: port.congestion === 'SEVERE'
                      ? '0 10px 40px rgba(0,0,0,0.8), 0 0 0 1px rgba(239, 68, 68, 0.3)'
                      : port.congestion === 'CONGESTED'
                        ? '0 10px 40px rgba(0,0,0,0.8), 0 0 0 1px rgba(249, 115, 22, 0.3)'
                        : '0 10px 40px rgba(0,0,0,0.8), 0 0 0 1px rgba(6, 182, 212, 0.3)'
                  }}
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-1 rounded-t-md"
                    style={{
                      backgroundColor: port.congestion === 'SEVERE'
                        ? '#ef4444'
                        : port.congestion === 'CONGESTED'
                          ? '#f97316'
                          : '#06b6d4'
                    }}
                  />
                  <div className="flex justify-between items-center mb-4 mt-1">
                    <div>
                      <h3
                        className="font-headline font-bold tracking-wider text-lg uppercase truncate max-w-[200px]"
                        style={{
                          color: port.congestion === 'SEVERE'
                            ? '#ef4444'
                            : port.congestion === 'CONGESTED'
                              ? '#f97316'
                              : '#06b6d4'
                        }}
                      >
                        {port.name}
                      </h3>
                      <span className="text-slate-500 font-mono text-[10px] tracking-wider uppercase block mt-0.5">
                        {port.country ? `PORT / BASE — ${port.country}` : 'PORT / BASE'}
                      </span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setActiveEntityId(null); }}
                      className="text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 w-7 h-7 flex items-center justify-center rounded-full transition-all duration-150 border border-slate-800"
                    >
                      <span className="material-symbols-outlined text-base">close</span>
                    </button>
                  </div>
                  <div className="bg-slate-900/40 border border-slate-800/40 p-4 rounded-lg space-y-3 mb-2">
                    <div className="flex justify-between items-center border-b border-slate-800/30 pb-2">
                      <span className="text-slate-500 text-[10px] font-mono tracking-wider uppercase">VOLUME / TRAFFIC</span>
                      <span
                        className="text-sm font-mono font-bold"
                        style={{
                          color: port.congestion === 'SEVERE'
                            ? '#ef4444'
                            : port.congestion === 'CONGESTED'
                              ? '#f97316'
                              : '#06b6d4'
                        }}
                      >
                        {port.volume || port.traffic || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-800/30 pb-2">
                      <span className="text-slate-500 text-[10px] font-mono tracking-wider uppercase">CONGESTION LEVEL</span>
                      <span
                        className="text-xs font-mono font-semibold uppercase"
                        style={{
                          color: port.congestion === 'SEVERE'
                            ? '#ef4444'
                            : port.congestion === 'CONGESTED'
                              ? '#f97316'
                              : '#06b6d4'
                        }}
                      >
                        {port.congestion || 'NORMAL'}
                      </span>
                    </div>
                    {port.fleet && (
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-slate-500 text-[10px] font-mono tracking-wider uppercase">FLEET STATIONED</span>
                        <span className="text-slate-200 text-xs font-mono font-medium truncate max-w-[150px]">
                          {port.fleet}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Marker>
          );
        })}

        {!isDived && layers.maritime && visibleChokepoints.map((chokepoint) => {
          const isActive = activeEntityId === chokepoint.name;
          return (
            <Marker
              key={`chokepoint-${chokepoint.name}`}
              longitude={chokepoint.lng}
              latitude={chokepoint.lat}
              anchor="center"
              style={{ zIndex: isActive ? 999999 : undefined }}
            >
              <div
                className={`w-3 h-3 rotate-45 border border-black cursor-pointer shadow-[0_0_8px_currentColor] ${chokepoint.risk === 'CRITICAL' ? 'bg-red-600 text-red-600' : chokepoint.risk === 'HIGH' ? 'bg-orange-500 text-orange-500' : 'bg-yellow-500 text-yellow-500'}`}
                onClick={(e) => { e.stopPropagation(); setActiveEntityId(chokepoint.name); }}
              />
              {isActive && (
                <div
                  className="absolute top-4 left-4 bg-[#0d0e12]/95 border border-slate-800/60 p-4 rounded-md shadow-2xl backdrop-blur-lg w-80 pointer-events-auto cursor-auto transition-all duration-200 z-[999999]"
                  style={{
                    boxShadow: chokepoint.risk === 'CRITICAL'
                      ? '0 10px 40px rgba(0,0,0,0.8), 0 0 0 1px rgba(239, 68, 68, 0.3)'
                      : chokepoint.risk === 'HIGH'
                        ? '0 10px 40px rgba(0,0,0,0.8), 0 0 0 1px rgba(249, 115, 22, 0.3)'
                        : '0 10px 40px rgba(0,0,0,0.8), 0 0 0 1px rgba(234, 179, 8, 0.3)'
                  }}
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-1 rounded-t-md"
                    style={{
                      backgroundColor: chokepoint.risk === 'CRITICAL'
                        ? '#dc2626'
                        : chokepoint.risk === 'HIGH'
                          ? '#f97316'
                          : '#eab308'
                    }}
                  />
                  <div className="flex justify-between items-center mb-4 mt-1">
                    <div>
                      <h3
                        className="font-headline font-bold tracking-wider text-lg uppercase truncate max-w-[200px]"
                        style={{
                          color: chokepoint.risk === 'CRITICAL'
                            ? '#dc2626'
                            : chokepoint.risk === 'HIGH'
                              ? '#f97316'
                              : '#eab308'
                        }}
                      >
                        {chokepoint.name}
                      </h3>
                      <span className="text-slate-500 font-mono text-[10px] tracking-wider uppercase block mt-0.5">
                        STRATEGIC CHOKEPOINT
                      </span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setActiveEntityId(null); }}
                      className="text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 w-7 h-7 flex items-center justify-center rounded-full transition-all duration-150 border border-slate-800"
                    >
                      <span className="material-symbols-outlined text-base">close</span>
                    </button>
                  </div>
                  <div className="bg-slate-900/40 border border-slate-800/40 p-4 rounded-lg space-y-3 mb-2">
                    <div className="flex justify-between items-center border-b border-slate-800/30 pb-2">
                      <span className="text-slate-500 text-[10px] font-mono tracking-wider uppercase">TRAFFIC VOLUME</span>
                      <span className="text-slate-200 text-sm font-mono font-bold">
                        {chokepoint.traffic || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-slate-500 text-[10px] font-mono tracking-wider uppercase">RISK ASSESSMENT</span>
                      <span
                        className="text-xs font-mono font-semibold uppercase"
                        style={{
                          color: chokepoint.risk === 'CRITICAL'
                            ? '#dc2626'
                            : chokepoint.risk === 'HIGH'
                              ? '#f97316'
                              : '#eab308'
                        }}
                      >
                        {chokepoint.risk || 'NORMAL'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </Marker>
          );
        })}
      </Map>

      {/* Ghost Border Grid — visible on satellite dive */}
      <GhostGrid visible={isDived} />

      {/* SYST_STATUS HUD — top left */}
      <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
        <div
          className={`w-2 h-2 ${status.includes('LIVE')
            ? 'bg-[#3cdcd1] shadow-[0_0_8px_#3cdcd1] animate-pulse'
            : status.includes('QUERYING') || status.includes('CONNECTING')
              ? 'bg-yellow-500 animate-pulse'
              : 'bg-red-500'
            }`}
        />
        <span className="font-mono text-[9px] tracking-widest text-[#bacac7] uppercase">
          SYST_STATUS: {status}
        </span>
      </div>

      {/* View Reset Button — visible when dived */}
      {isDived && (
        <button
          onClick={cameraReset}
          className="absolute top-8 right-8 z-30 px-3 py-1.5 bg-[rgba(68,71,78,0.40)] font-mono text-[9px] text-[#3cdcd1] tracking-wider uppercase cursor-pointer transition-all duration-150 hover:bg-[rgba(68,71,78,0.60)] border border-[#3cdcd1]/30 hover:scale-105"
          style={{ backdropFilter: 'blur(12px)' }}
        >
          ◁ TACTICAL GLOBE
        </button>
      )}

      {/* Globe View Reset Button */}
      {!isDived && (
        <button
          onClick={cameraReset}
          className="absolute top-8 right-8 z-30 w-8 h-8 flex items-center justify-center bg-[rgba(68,71,78,0.40)] text-[#3cdcd1] rounded-full cursor-pointer transition-all duration-150 hover:bg-[rgba(68,71,78,0.60)] border border-[#3cdcd1]/50 shadow-[0_0_10px_rgba(60,220,209,0.3)] hover:scale-110"
          style={{ backdropFilter: 'blur(12px)' }}
          title="Reset Globe View"
        >
          <span className="material-symbols-outlined text-[16px]">public</span>
        </button>
      )}

      {/* Tactical Video Feed Overlay */}
      {isDived && selectedCamera && (
        <TacticalVideoOverlay camera={selectedCamera} onClose={cameraReset} />
      )}

      {/* Coordinate readout footer — DESIGN.md Technical Authority */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20 flex justify-between items-center px-4 py-2 font-mono text-[8px] text-[#bacac7] tracking-wider"
        style={{
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(68, 71, 78, 0.25)',
        }}
      >
        <span ref={coordsRef} className="w-56 inline-block">
          CTR: {Math.abs(INITIAL_VIEW.latitude).toFixed(6)}°{INITIAL_VIEW.latitude >= 0 ? 'N' : 'S'}, {Math.abs(INITIAL_VIEW.longitude).toFixed(6)}°{INITIAL_VIEW.longitude >= 0 ? 'E' : 'W'}
        </span>
        <span>ZOOM: {(mapRef.current?.getMap()?.getZoom() ?? INITIAL_VIEW.zoom).toFixed(2)}</span>
        <span>PITCH: {(mapRef.current?.getMap()?.getPitch() ?? INITIAL_VIEW.pitch ?? 0).toFixed(1)}°</span>
        <span>ACQUISITION: {cameras.length} NODES TRACKED</span>
        <span className="text-[#3cdcd1]">
          {isDived ? 'MODE: LIVE NODE FEED' : 'MODE: OVERPASS HOLOGRAPHIC'}
        </span>
      </div>
    </div>
  );
}
