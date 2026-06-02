'use client';

import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import Map, { Marker, Source, Layer, type MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useTacticalStore, SurveillanceNode } from '@/store/tactical-store';
import circle from '@turf/circle';

// ─── Constants ────────────────────────────────────────────────────

// DESIGN.md: surface_container_lowest (#0d0e12) for global background
const DARK_STYLE = 'mapbox://styles/mapbox/dark-v11';
const SATELLITE_STYLE = 'mapbox://styles/mapbox/satellite-v9';

const INITIAL_VIEW = {
  longitude: 15.0, // Europe center
  latitude: 50.0,
  zoom: 1.5, // Zoomed out for globe view
  pitch: 0,
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
  isZoomedIn,
  onClick,
}: {
  camera: SurveillanceNode;
  isSelected: boolean;
  isZoomedIn: boolean;
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

      <div className={`absolute top-full mt-1.5 text-[7px] font-mono text-slate-300 whitespace-nowrap bg-black/60 px-1.5 py-0.5 rounded transition-opacity duration-300 ${isZoomedIn ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        CAMERA NODE {camera.id.toString().slice(0, 8)}
      </div>

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
  const ports = useTacticalStore(state => state.ports);
  const chokepoints = useTacticalStore(state => state.chokepoints);
  const ships = useTacticalStore(state => state.ships);
  const satellites = useTacticalStore(state => state.satellites);
  const earthquakes = useTacticalStore(state => state.earthquakes);
  const nuclearFacilities = useTacticalStore(state => state.nuclearFacilities);
  const strategicBases = useTacticalStore(state => state.strategicBases);
  const incidents = useTacticalStore(state => state.incidents);
  const news = useTacticalStore(state => state.news);
  const layers = useTacticalStore(state => state.layers);
  const nukeSimMode = useTacticalStore(state => state.nukeSimMode);
  const nukeSimData = useTacticalStore(state => state.nukeSimData);
  const setNukeSimData = useTacticalStore(state => state.setNukeSimData);

  const activeEntityId = useTacticalStore(state => state.activeEntityId);
  const setActiveEntityId = useTacticalStore(state => state.setActiveEntityId);
  const mapCommand = useTacticalStore(state => state.mapCommand);
  const setMapCommand = useTacticalStore(state => state.setMapCommand);

  const [status, setStatus] = useState('AWAITING_MAP');
  const [isDived, setIsDived] = useState(false);
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [mapStyle, setMapStyle] = useState(DARK_STYLE);
  const [bounds, setBounds] = useState<{ sw: { lat: number, lng: number }, ne: { lat: number, lng: number } } | null>(null);

  const [dossier, setDossier] = useState<any>(null);
  const [isFetchingDossier, setIsFetchingDossier] = useState(false);
  const [dossierLngLat, setDossierLngLat] = useState<{ lng: number, lat: number } | null>(null);

  const fetchDossier = async (lat: number, lng: number) => {
    setIsFetchingDossier(true);
    setDossierLngLat({ lng, lat });
    setDossier(null);
    try {
      const [dossierRes, sentinelRes] = await Promise.allSettled([
        fetch(`/api/region-dossier?lat=${lat}&lng=${lng}`),
        fetch(`/api/sentinel?lat=${lat}&lng=${lng}`)
      ]);

      let finalData: any = {};

      if (dossierRes.status === 'fulfilled' && dossierRes.value.ok) {
        finalData = await dossierRes.value.json();
      } else {
        finalData = { error: true };
      }

      if (sentinelRes.status === 'fulfilled' && sentinelRes.value.ok) {
        finalData.sentinel = await sentinelRes.value.json();
      }

      setDossier(finalData);
    } catch (err) {
      console.error(err);
      setDossier({ error: true });
    } finally {
      setIsFetchingDossier(false);
    }
  };

  // Convert flights to GeoJSON for highly performant Mapbox WebGL rendering
  const flightGeoJson = useMemo(() => {
    return {
      type: 'FeatureCollection',
      features: flights.filter((flight) => {
        if (flight.category === 'commercial' && !layers.aviation_commercial) return false;
        if (flight.category === 'private' && !layers.aviation_private) return false;
        if (flight.category === 'jet' && !layers.aviation_jets) return false;
        if (flight.category === 'military' && !layers.aviation_military) return false;
        return true;
      }).map(f => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [f.lng, f.lat] },
        properties: {
          id: f.icao24,
          heading: f.heading || 0,
          icon: `plane-${f.category}`,
        }
      }))
    };
  }, [flights, layers.aviation_commercial, layers.aviation_private, layers.aviation_jets, layers.aviation_military]);

  // Convert satellites to GeoJSON
  const satelliteGeoJson = useMemo(() => {
    return {
      type: 'FeatureCollection',
      features: satellites.filter(() => layers.space_satellites).map(s => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [s.lng, s.lat] },
        properties: {
          id: s.noradId,
          mission: s.mission,
          color: s.color,
          name: s.name,
          alt: s.alt,
        }
      }))
    };
  }, [satellites, layers.space_satellites]);

  // Convert ships to GeoJSON
  const shipGeoJson = useMemo(() => {
    return {
      type: 'FeatureCollection',
      features: ships.filter(() => layers.maritime).map(s => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [s.lng, s.lat] },
        properties: {
          id: s.mmsi,
          name: s.name || `MMSI: ${s.mmsi}`,
          type: s.type || 'cargo',
          speed: s.speed || 0,
          heading: s.heading || 0,
          destination: s.destination || 'UNKNOWN',
          icon: `ship-${s.type || 'cargo'}`,
          flag: s.flag || 'AIS'
        }
      }))
    };
  }, [ships, layers.maritime]);

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
  // Use turf.js to calculate accurate geodesic circles for Nuke Sim
  const nukeSimGeoJson = useMemo(() => {
    if (!nukeSimMode || !nukeSimData?.target || !nukeSimData?.radii) return null;

    const { target, radii } = nukeSimData;
    const center = [target.lng, target.lat];
    const steps = 64; // smoothness

    return {
      type: 'FeatureCollection',
      features: [
        circle(center, radii.lightBlast, { steps, properties: { type: 'lightBlast' } }),
        circle(center, radii.thermal, { steps, properties: { type: 'thermal' } }),
        circle(center, radii.moderateBlast, { steps, properties: { type: 'moderateBlast' } }),
        circle(center, radii.fireball, { steps, properties: { type: 'fireball' } }),
      ]
    };
  }, [nukeSimMode, nukeSimData]);

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



  // Execute external dives from the Zustand store
  useEffect(() => {
    if (diveTarget && mapRef.current) {
      const map = mapRef.current.getMap();
      map.flyTo({
        center: [diveTarget.lng, diveTarget.lat],
        zoom: diveTarget.zoom || 14,
        pitch: 45,
        speed: 2.0,
        curve: 1.2
      });
      setMapStyle(SATELLITE_STYLE);
      setIsDived(true);
    }
  }, [diveTarget]);

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
      center: [15.0, 50.0],
      zoom: 1.5,
      pitch: 0,
      bearing: 0,
      speed: 1.2,
      essential: true,
    });
  }, []);

  // Expose cameraDive via window for SideNavBar integration
  useEffect(() => {
    if (mapCommand && mapRef.current) {
      if (mapCommand.type === 'flyTo') {
        mapRef.current.flyTo({
          center: [mapCommand.lng, mapCommand.lat],
          zoom: mapCommand.zoom || 10,
          duration: 2500,
          essential: true
        });
      }
      setMapCommand(null);
    }
  }, [mapCommand, setMapCommand]);

  useEffect(() => {
    (window as any).__aegisCameraDive = cameraDive;
    (window as any).__aegisCameraReset = cameraReset;
    (window as any).__aegisCameraZoomIn = () => { mapRef.current?.zoomIn({ duration: 500 }); };
    (window as any).__aegisCameraZoomOut = () => { mapRef.current?.zoomOut({ duration: 500 }); };
    (window as any).__aegisToggleMapStyle = () => { setMapStyle(prev => prev === DARK_STYLE ? SATELLITE_STYLE : DARK_STYLE); };
    return () => {
      delete (window as any).__aegisCameraDive;
      delete (window as any).__aegisCameraReset;
      delete (window as any).__aegisCameraZoomIn;
      delete (window as any).__aegisCameraZoomOut;
      delete (window as any).__aegisToggleMapStyle;
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
        onContextMenu={(e) => {
          e.originalEvent.preventDefault();
          const { lng, lat } = e.lngLat;
          fetchDossier(lat, lng);
        }}
        onClick={(e) => {
          if (nukeSimMode) {
            setNukeSimData({ ...nukeSimData, target: { lat: e.lngLat.lat, lng: e.lngLat.lng } });
            return;
          }

          // If clicking elsewhere on map, close dossier
          if (dossierLngLat) setDossierLngLat(null);

          if (e.features && e.features.length > 0) {
            const feature = e.features[0];
            if (feature.layer?.id === 'flights-layer' || feature.layer?.id === 'satellites-layer' || feature.layer?.id === 'ships-layer') {
              setActiveEntityId(feature.properties?.id);
            }
          } else {
            setActiveEntityId(null);
          }
        }}
        onIdle={fetchCamerasInView}
        onMoveEnd={(e) => {
          const b = e.target.getBounds();
          if (b) setBounds({ sw: b.getSouthWest(), ne: b.getNorthEast() });
        }}
        onZoom={(e) => {
          const z = e.viewState.zoom;
          if (z >= 6 && !isZoomedIn) setIsZoomedIn(true);
          else if (z < 6 && isZoomedIn) setIsZoomedIn(false);
        }}
        onStyleData={(e) => {
          const map = (e as any).target;
          if (map && !map.hasImage('plane-military')) {
            const addPlaneImage = (color: string, name: string) => {
              const img = new Image(24, 24);
              img.onload = () => {
                if (!map.hasImage(name)) map.addImage(name, img);
              };
              const svgStr = `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21,16v-2l-8-5V3.5C13,2.67,12.33,2,11.5,2S10,2.67,10,3.5V9l-8,5v2l8-2.5V19l-2,1.5V22l3.5-1l3.5,1v-1.5L13,19v-5.5L21,16z" fill="${color}"/></svg>`;
              img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr);
            };
            addPlaneImage('#ef4444', 'plane-military');
            addPlaneImage('#ec4899', 'plane-jet');
            addPlaneImage('#a855f7', 'plane-private');
            addPlaneImage('#f97316', 'plane-commercial');

            const addShipImage = (color: string, name: string) => {
              const img = new Image(14, 14);
              img.onload = () => {
                if (!map.hasImage(name)) map.addImage(name, img);
              };
              const svgStr = `<svg width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12,2 L18,10 L18,22 L6,22 L6,10 Z" fill="${color}" stroke="#0d0e12" stroke-width="1"/></svg>`;
              img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr);
            };
            addShipImage('#ef4444', 'ship-military');
            addShipImage('#eab308', 'ship-tanker');
            addShipImage('#06b6d4', 'ship-cargo');
          }
        }}
        onLoad={(e) => {
          const map = e.target;
          const b = map.getBounds();
          if (b) setBounds({ sw: b.getSouthWest(), ne: b.getNorthEast() });
        }}
        interactiveLayerIds={['flights-layer', 'satellites-layer', 'ships-layer']}

        onMouseEnter={(e) => {
          if (e.features && e.features.length > 0) {
            if (mapRef.current) mapRef.current.getCanvas().style.cursor = 'pointer';
          }
        }}
        onMouseMove={(e) => {
          if (coordsRef.current && e.lngLat) {
            const lat = e.lngLat.lat;
            const lng = e.lngLat.lng;
            coordsRef.current.innerText = `CTR: ${Math.abs(lat).toFixed(6)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lng).toFixed(6)}°${lng >= 0 ? 'E' : 'W'}`;
          }
        }}
        onMouseLeave={(e) => {
          if (mapRef.current) mapRef.current.getCanvas().style.cursor = '';
          if (coordsRef.current) {
            const center = mapRef.current?.getMap()?.getCenter();
            if (center) {
              const lat = center.lat;
              const lng = center.lng;
              coordsRef.current.innerText = `CTR: ${Math.abs(lat).toFixed(6)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lng).toFixed(6)}°${lng >= 0 ? 'E' : 'W'}`;
            }
          }
        }}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={mapStyle}
        projection={{ name: 'globe' }}
        fog={{
          color: '#0d0e12',
          'high-color': '#0d0e12',
          'horizon-blend': 0.08,
          'space-color': '#000000',
          'star-intensity': 0.3,
        }}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
      >
        {/* Default zoom controls removed in favor of TopNavBar custom zoom buttons */}

        {/* HUD Markers projected directly onto WebGL Globe via Mapbox Marker */}
        {!isDived && layers.cctv && cameras.map((camera) => (
          <Marker key={`cam-${camera.id}`} longitude={camera.lon} latitude={camera.lat} anchor="center">
            <CameraMarker
              camera={camera}
              isSelected={selectedCamera?.id === camera.id || selectedAssetId === camera.id}
              isZoomedIn={isZoomedIn}
              onClick={() => {
                onAssetSelect?.(camera);
                setSelectedCamera(camera);
                cameraDive(camera.lat, camera.lon);
              }}
            />
          </Marker>
        ))}

        {/* GeoJSON Flights Layer for High Performance */}
        {!isDived && (
          <Source id="flights-source" type="geojson" data={flightGeoJson as any}>
            <Layer
              id="flights-layer"
              type="symbol"
              layout={{
                'icon-image': ['get', 'icon'],
                'icon-rotate': ['get', 'heading'],
                'icon-allow-overlap': true,
                'icon-ignore-placement': true,
                'icon-size': 0.7,
              }}
            />
          </Source>
        )}

        {/* GeoJSON Satellites Layer */}
        {!isDived && layers.space_satellites && (
          <Source id="satellites-source" type="geojson" data={satelliteGeoJson as any}>
            <Layer
              id="satellites-layer"
              type="circle"
              paint={{
                'circle-radius': 3.5,
                'circle-color': ['get', 'color'],
                'circle-opacity': 0.85,
                'circle-stroke-width': 0.5,
                'circle-stroke-color': '#0d0e12'
              }}
            />
            <Layer
              id="satellites-label-layer"
              type="symbol"
              layout={{
                'text-field': ['get', 'name'],
                'text-size': 8,
                'text-offset': [0, 1],
                'text-anchor': 'top'
              }}
              paint={{
                'text-color': ['get', 'color'],
                'text-halo-color': '#000000',
                'text-halo-width': 1,
                'text-opacity': [
                  'interpolate', ['linear'], ['zoom'],
                  5, 0,
                  6, 1
                ]
              }}
            />
          </Source>
        )}

        {/* Active Flight Popup rendering as a DOM Marker so we keep exact CSS styling */}
        {!isDived && activeEntityId && flights.find(f => f.icao24 === activeEntityId) && (
          (() => {
            const flight = flights.find(f => f.icao24 === activeEntityId)!;
            return (
              <Marker
                longitude={flight.lng}
                latitude={flight.lat}
                anchor="center"
                style={{ zIndex: 999999 }}
              >
                <div
                  className="absolute top-4 left-4 fui-border bg-black/80 p-4 shadow-2xl backdrop-blur-md w-80 pointer-events-auto cursor-auto transition-all duration-200 z-[999999]"
                  >
                  <div className="fui-corner-tl"></div><div className="fui-corner-tr"></div><div className="fui-corner-bl"></div><div className="fui-corner-br"></div>
                  <div className="flex justify-between items-center mb-4 mt-1">
                    <div>
                      <h3
                        className="font-headline font-bold tracking-wider text-xl uppercase"
                        style={{
                          color: flight.category === 'military'
                            ? '#ef4444'
                            : flight.category === 'jet'
                              ? '#ec4899'
                              : flight.category === 'private'
                                ? '#a855f7'
                                : '#f97316'
                        }}
                      >
                        {flight.callsign || 'UNKNOWN'}
                      </h3>
                      <span className="text-slate-500 font-mono text-[10px] tracking-wider uppercase block mt-0.5">ICAO24: {flight.icao24}</span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setActiveEntityId(null); }}
                      className="text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 w-7 h-7 flex items-center justify-center rounded-full transition-all duration-150 border border-slate-800"
                    >
                      <span className="material-symbols-outlined text-base">close</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-5 bg-slate-900/40 border border-slate-800/40 p-3 rounded-lg">
                    <div>
                      <p className="text-slate-500 text-[8px] font-mono tracking-wider mb-0.5 uppercase">MODEL</p>
                      <p className="text-white text-xs font-mono font-medium uppercase truncate">{flight.category}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[8px] font-mono tracking-wider mb-0.5 uppercase">ALTITUDE</p>
                      <p className="text-cyan-400 text-xs font-mono font-medium">{flight.alt}m</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[8px] font-mono tracking-wider mb-0.5 uppercase">SPEED</p>
                      <p className="text-white text-xs font-mono font-medium">{flight.speed_knots}kt</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[8px] font-mono tracking-wider mb-0.5 uppercase">HEADING</p>
                      <p className="text-white text-xs font-mono font-medium">{flight.heading}°</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[8px] font-mono tracking-wider mb-0.5 uppercase">REGISTR.</p>
                      <p className="text-white text-xs font-mono font-medium truncate">{flight.airline_code || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[8px] font-mono tracking-wider mb-0.5 uppercase">POSITION</p>
                      <p className="text-white text-[10px] font-mono font-medium truncate">{flight.lat.toFixed(2)},{flight.lng.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`https://www.flightaware.com/live/flight/${flight.callsign?.trim() || flight.icao24}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 bg-slate-900 border border-orange-500/30 hover:border-orange-500/60 text-orange-400 text-[10px] font-bold font-mono tracking-wider rounded-lg transition-all duration-150 hover:bg-orange-500/10 flex items-center justify-center gap-1.5 shadow-[0_2px_8px_rgba(249,115,22,0.05)] hover:shadow-[0_2px_12px_rgba(249,115,22,0.15)]"
                    >
                      <span className="material-symbols-outlined text-xs">bolt</span> FLIGHTAWARE
                    </a>
                    <a
                      href={`https://globe.adsbexchange.com/?icao=${flight.icao24}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 bg-slate-900 border border-cyan-500/30 hover:border-cyan-500/60 text-cyan-400 text-[10px] font-bold font-mono tracking-wider rounded-lg transition-all duration-150 hover:bg-cyan-500/10 flex items-center justify-center gap-1.5 shadow-[0_2px_8px_rgba(6,182,212,0.05)] hover:shadow-[0_2px_12px_rgba(6,182,212,0.15)]"
                    >
                      <span className="material-symbols-outlined text-xs">satellite_alt</span> ADS-B
                    </a>
                  </div>
                </div>
              </Marker>
            );
          })()
        )}

        {/* Active Satellite Popup */}
        {!isDived && activeEntityId && satellites.find(s => s.noradId === activeEntityId) && (
          (() => {
            const sat = satellites.find(s => s.noradId === activeEntityId)!;
            return (
              <Marker
                longitude={sat.lng}
                latitude={sat.lat}
                anchor="center"
                style={{ zIndex: 999999 }}
              >
                <div
                  className="absolute top-4 left-4 fui-border bg-black/80 p-5 shadow-2xl backdrop-blur-md w-[320px] pointer-events-auto cursor-auto transition-all duration-200 z-[999999]"
                  
                >
                  <div className="flex justify-between items-start mb-5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg inline-block transform -rotate-12 filter drop-shadow-md">🛰️</span>
                      <h3 className="font-mono text-[16px] font-bold tracking-widest uppercase mt-1" style={{ color: sat.color }}>{sat.name}</h3>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setActiveEntityId(null); }}
                      className="text-slate-500 hover:text-white transition-colors p-1 -mr-2 -mt-2"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-6">
                    <div>
                      <p className="text-slate-500 text-[10px] font-mono tracking-widest mb-1.5 uppercase">MISSION</p>
                      <p className="text-[#3cdcd1] font-mono text-[11px] uppercase truncate">{sat.mission}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] font-mono tracking-widest mb-1.5 uppercase">ALT</p>
                      <p className="text-[#3cdcd1] font-mono text-[11px] uppercase">{sat.alt} km</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] font-mono tracking-widest mb-1.5 uppercase">POS</p>
                      <p className="text-slate-200 font-mono text-[11px] truncate uppercase">{sat.lat.toFixed(2)}°, {sat.lng.toFixed(2)}°</p>
                    </div>
                  </div>

                  <a
                    href={`https://db.satnogs.org/satellite/${sat.noradId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-cyan-950/20 border border-cyan-800/60 hover:border-[#3cdcd1]/80 text-[#3cdcd1] text-[10px] font-bold font-mono tracking-[0.2em] rounded transition-all duration-150 hover:bg-cyan-900/40 flex items-center justify-center gap-2 shadow-[0_2px_12px_rgba(6,182,212,0.05)]"
                  >
                    <span className="text-[14px]">🔭</span> SOURCE: SATNOGS
                  </a>
                </div>
              </Marker>
            );
          })()
        )}

        {/* GeoJSON Ships Layer */}
        {!isDived && layers.maritime && (
          <Source id="ships-source" type="geojson" data={shipGeoJson as any}>
            <Layer
              id="ships-layer"
              type="symbol"
              layout={{
                'icon-image': ['get', 'icon'],
                'icon-rotate': ['get', 'heading'],
                'icon-allow-overlap': true,
                'icon-ignore-placement': true,
                'icon-size': 0.8,
                'text-field': ['get', 'name'],
                'text-size': 7,
                'text-offset': [0, 1.2],
                'text-anchor': 'top'
              }}
              paint={{
                'text-color': '#94a3b8',
                'text-halo-color': '#000000',
                'text-halo-width': 1,
                'text-opacity': [
                  'interpolate', ['linear'], ['zoom'],
                  5, 0,
                  6, 1
                ]
              }}
            />
          </Source>
        )}

        {/* Active Ship Popup */}
        {!isDived && activeEntityId && ships.find(s => s.mmsi === activeEntityId) && (
          (() => {
            const ship = ships.find(s => s.mmsi === activeEntityId)!;
            const isMilitary = ship.type === 'military';
            const isTanker = ship.type === 'tanker';
            const themeColor = isMilitary ? '#ef4444' : isTanker ? '#eab308' : '#06b6d4';
            const themeShadow = isMilitary ? 'rgba(239, 68, 68, 0.3)' : isTanker ? 'rgba(234, 179, 8, 0.3)' : 'rgba(6, 182, 212, 0.3)';

            return (
              <Marker
                longitude={ship.lng}
                latitude={ship.lat}
                anchor="center"
                style={{ zIndex: 999999 }}
              >
                <div
                  className="absolute top-4 left-4 fui-border bg-black/80 p-5 shadow-2xl backdrop-blur-md w-[320px] pointer-events-auto cursor-auto transition-all duration-200 z-[999999]"
                  
                >
                  <div className="fui-corner-tl"></div><div className="fui-corner-tr"></div><div className="fui-corner-bl"></div><div className="fui-corner-br"></div>

                  {/* Header */}
                  <div className="flex justify-between items-start mb-4 mt-1">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[16px] transform -rotate-12">🚢</span>
                        <h3 className="font-headline font-bold tracking-widest text-[16px] uppercase text-white">
                          {ship.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-slate-400 font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded bg-slate-800/50 border border-slate-700/50">
                          {ship.flag}
                        </span>
                        <span className="text-slate-500 font-mono text-[10px] tracking-wider uppercase">
                          MMSI: {ship.mmsi}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setActiveEntityId(null); }}
                      className="text-slate-500 hover:text-white transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>

                  {/* 3-Column Data Grid */}
                  <div className="grid grid-cols-3 gap-2 mb-5">
                    <div className="bg-slate-900/50 border border-slate-800/80 rounded p-2 text-center">
                      <span className="text-slate-500 text-[8px] font-mono tracking-widest uppercase block mb-1">TYPE</span>
                      <span className="text-slate-200 font-mono text-[11px] uppercase truncate">{ship.type}</span>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800/80 rounded p-2 text-center">
                      <span className="text-slate-500 text-[8px] font-mono tracking-widest uppercase block mb-1">SPEED</span>
                      <span className="text-slate-200 font-mono text-[11px]">{ship.speed.toFixed(1)} kn</span>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800/80 rounded p-2 text-center">
                      <span className="text-slate-500 text-[8px] font-mono tracking-widest uppercase block mb-1">HDG</span>
                      <span className="text-slate-200 font-mono text-[11px]">{ship.heading.toFixed(0)}°</span>
                    </div>
                  </div>

                  {/* Destination */}
                  <div className="bg-slate-900/50 border border-slate-800/80 rounded p-3 mb-2 flex flex-col items-center justify-center">
                    <span className="text-slate-500 text-[8px] font-mono tracking-widest uppercase block mb-1">DESTINATION</span>
                    <span className="text-slate-200 font-mono text-[11px] uppercase truncate max-w-[200px]">
                      {ship.destination || 'UNKNOWN'}
                    </span>
                  </div>
                </div>
              </Marker>
            );
          })()
        )}

        {!isDived && layers.maritime && visiblePorts.map((port) => {
          const isActive = activeEntityId === (port.id || port.name);
          return (
            <React.Fragment key={`port-${port.id || port.name}`}>
            <Marker
              longitude={port.lng}
              latitude={port.lat}
              anchor="center"
              style={{ zIndex: isActive ? 999998 : undefined }}
            >
              <div className="relative flex flex-col items-center">
                <div
                  className={`w-3 h-3 rounded-full border border-black cursor-pointer ${port.congestion === 'SEVERE' ? 'bg-red-500 text-red-500' : port.congestion === 'CONGESTED' ? 'bg-orange-500 text-orange-500' : 'bg-cyan-500 text-cyan-500'}`}
                  onClick={(e) => { e.stopPropagation(); setActiveEntityId(port.id || port.name); }}
                />
                <div className={`absolute top-full mt-1.5 text-[7px] font-mono text-slate-300 whitespace-nowrap bg-black/60 px-1.5 py-0.5 rounded transition-opacity duration-300 ${isZoomedIn ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                  {port.name}
                </div>
              </div>
            </Marker>
            {isActive && (
              <Marker
                longitude={port.lng}
                latitude={port.lat}
                anchor="top-left"
                style={{ zIndex: 999999 }}
              >
                <div className="absolute top-2 left-2 fui-border bg-black/80 p-4 shadow-2xl backdrop-blur-md w-80 pointer-events-auto cursor-auto transition-all duration-200 z-[999999]"
                  >
                  <div className="fui-corner-tl"></div><div className="fui-corner-tr"></div><div className="fui-corner-bl"></div><div className="fui-corner-br"></div>
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
              </Marker>
            )}
          </React.Fragment>
          );
        })}

        {!isDived && layers.maritime && visibleChokepoints.map((chokepoint) => {
          const isActive = activeEntityId === chokepoint.name;
          return (
            <React.Fragment key={`chokepoint-${chokepoint.name}`}>
            <Marker
              longitude={chokepoint.lng}
              latitude={chokepoint.lat}
              anchor="center"
              style={{ zIndex: isActive ? 999998 : undefined }}
            >
              <div className="relative flex flex-col items-center">
                <div
                  className={`w-3 h-3 rotate-45 border border-black cursor-pointer ${chokepoint.risk === 'CRITICAL' ? 'bg-red-600 text-red-600' : chokepoint.risk === 'HIGH' ? 'bg-orange-500 text-orange-500' : 'bg-yellow-500 text-yellow-500'}`}
                  onClick={(e) => { e.stopPropagation(); setActiveEntityId(chokepoint.name); }}
                />
                <div className={`absolute top-full mt-1.5 text-[7px] font-mono text-slate-300 whitespace-nowrap bg-black/60 px-1.5 py-0.5 rounded transition-opacity duration-300 ${isZoomedIn ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                  {chokepoint.name}
                </div>
              </div>
            </Marker>
            {isActive && (
              <Marker
                longitude={chokepoint.lng}
                latitude={chokepoint.lat}
                anchor="top-left"
                style={{ zIndex: 999999 }}
              >
                <div className="absolute top-2 left-2 fui-border bg-black/80 p-4 shadow-2xl backdrop-blur-md w-80 pointer-events-auto cursor-auto transition-all duration-200 z-[999999]"
                  >
                  <div className="fui-corner-tl"></div><div className="fui-corner-tr"></div><div className="fui-corner-bl"></div><div className="fui-corner-br"></div>
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
              </Marker>
            )}
          </React.Fragment>
          );
        })}

        {/* Render Earthquakes */}
        {!isDived && layers.hazards_earthquakes && earthquakes.map((eq) => {
          const isActive = activeEntityId === eq.id;
          const mag = eq.magnitude || 0;
          const size = Math.max(8, mag * 3);
          const color = mag >= 6 ? '#ef4444' : mag >= 4.5 ? '#f97316' : '#eab308';

          return (
            <React.Fragment key={`eq-${eq.id}`}>
            <Marker longitude={eq.lng} latitude={eq.lat} anchor="center" style={{ zIndex: isActive ? 999998 : 10 }}>
              <div className="relative flex flex-col items-center">
                <div
                  className="rounded-full cursor-pointer transition-transform relative flex items-center justify-center hover:scale-110"
                  style={{ width: `${size}px`, height: `${size}px` }}
                  onClick={(e) => { e.stopPropagation(); setActiveEntityId(eq.id); }}
                >
                  <div className="absolute inset-0 rounded-full animate-ping opacity-75" style={{ backgroundColor: color }}></div>
                  <div className="relative rounded-full border border-black shadow-[0_0_8px_currentColor] w-full h-full" style={{ backgroundColor: color, color }}></div>
                </div>
                <div className={`absolute top-full mt-1 text-[7px] font-mono text-slate-300 whitespace-nowrap bg-black/60 px-1.5 py-0.5 rounded transition-opacity duration-300 ${isZoomedIn ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                  {eq.place}
                </div>
              </div>
            </Marker>
            {isActive && (
              <Marker longitude={eq.lng} latitude={eq.lat} anchor="top-left" style={{ zIndex: 999999 }}>
                <div className="absolute top-2 left-2 fui-border bg-black/80 p-4 shadow-2xl backdrop-blur-md w-72 pointer-events-auto cursor-auto z-[999999]"
                  >
                  <div className="fui-corner-tl"></div><div className="fui-corner-tr"></div><div className="fui-corner-bl"></div><div className="fui-corner-br"></div>
                  <div className="flex justify-between items-start mb-2 mt-1">
                    <div>
                      <h3 className="font-headline font-bold text-sm tracking-wider uppercase" style={{ color }}>{eq.place}</h3>
                      <span className="text-slate-400 font-mono text-[9px] uppercase">{new Date(eq.time).toLocaleString()}</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setActiveEntityId(null); }} className="text-slate-500 hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3 mb-2">
                    <div className="bg-slate-900/50 border border-slate-800 rounded p-2 text-center">
                      <span className="text-slate-500 text-[8px] font-mono tracking-widest uppercase block mb-1">MAGNITUDE</span>
                      <span className="text-white font-mono text-sm font-bold" style={{ color }}>M {mag.toFixed(1)}</span>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800 rounded p-2 text-center">
                      <span className="text-slate-500 text-[8px] font-mono tracking-widest uppercase block mb-1">DEPTH</span>
                      <span className="text-slate-200 font-mono text-xs">{eq.depth.toFixed(1)} km</span>
                    </div>
                  </div>
                  {eq.alert && (
                    <div className="bg-red-900/20 border border-red-500/30 rounded p-2 text-center mt-2">
                      <span className="text-red-400 text-[9px] font-mono uppercase">Alert Level: {eq.alert}</span>
                    </div>
                  )}
                  {eq.url && (
                    <a href={eq.url} target="_blank" rel="noopener noreferrer" className="mt-3 text-cyan-400 text-[10px] font-mono hover:underline flex items-center justify-center gap-1 w-full bg-slate-900/50 p-2 rounded">
                      <span className="material-symbols-outlined text-[12px]">open_in_new</span> USGS REPORT
                    </a>
                  )}
                </div>
              </Marker>
            )}
          </React.Fragment>
          );
        })}

        {/* Render Global Incidents */}
        {!isDived && layers.threats_incidents && incidents.map((incident) => {
          const isActive = activeEntityId === incident.id;
          const color = '#ef4444'; // Red for conflict

          return (
            <React.Fragment key={incident.id}>
            <Marker longitude={incident.lng} latitude={incident.lat} anchor="center" style={{ zIndex: isActive ? 999998 : 20 }}>
              <div className="relative flex flex-col items-center">
                <div
                  className="cursor-pointer flex items-center justify-center hover:scale-110 transition-transform"
                  onClick={(e) => { e.stopPropagation(); setActiveEntityId(incident.id); }}
                >
                  <span className="material-symbols-outlined text-[20px]" style={{ color }}>crisis_alert</span>
                </div>
                {/* Text visible only when zoomed in, limited to 4 words */}
                <div 
                  className={`absolute top-full mt-0.5 text-[7px] font-headline font-bold whitespace-nowrap transition-opacity duration-300 uppercase ${isZoomedIn ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                  style={{ color }}
                >
                  {incident.name.split(' ').slice(0, 4).join(' ')}{incident.name.split(' ').length > 4 ? '...' : ''}
                </div>
              </div>
            </Marker>
            {isActive && (
              <Marker longitude={incident.lng} latitude={incident.lat} anchor="top-left" style={{ zIndex: 999999 }}>
                <div className="absolute top-2 left-2 fui-border bg-black/80 p-4 shadow-2xl backdrop-blur-md w-[300px] pointer-events-auto cursor-auto z-[999999]" >
                  <div className="fui-corner-tl"></div><div className="fui-corner-tr"></div><div className="fui-corner-bl"></div><div className="fui-corner-br"></div>
                  <div className="flex justify-between items-start mb-3 mt-1">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]" style={{ color }}>crisis_alert</span>
                        <h3 className="font-headline font-bold text-sm tracking-wider uppercase truncate max-w-[200px]" style={{ color }}>Global Incident</h3>
                      </div>
                      <span className="text-slate-400 font-mono text-[9px] uppercase tracking-widest block mt-0.5">{incident.type}</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setActiveEntityId(null); }} className="text-slate-500 hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>

                  <div className="bg-slate-900/50 border border-slate-800/80 rounded p-3 mb-3">
                    <span className="text-slate-500 text-[8px] font-mono tracking-widest uppercase block mb-1">INCIDENT DETAILS</span>
                    <div className="text-[10px] font-mono text-slate-300 whitespace-normal leading-relaxed break-words" dangerouslySetInnerHTML={{ __html: incident.html }} />
                  </div>
                  
                  <a href={incident.url} target="_blank" rel="noopener noreferrer" className="block w-full py-1.5 rounded text-[10px] font-mono text-center transition-colors bg-secondary/10 text-secondary hover:bg-secondary/20">
                    VIEW SOURCE
                  </a>
                </div>
              </Marker>
            )}
          </React.Fragment>
          );
        })}

        {/* Render News Live Alerts */}
        {!isDived && layers.threats_news && news.filter(n => n.coords).map((item) => {
          const isActive = activeEntityId === item.id;
          const color = item.risk_score >= 8 ? '#ef4444' : item.risk_score >= 5 ? '#eab308' : '#10b981';

          return (
            <React.Fragment key={item.id}>
            <Marker longitude={item.coords[1]} latitude={item.coords[0]} anchor="center" style={{ zIndex: isActive ? 999998 : 20 }}>
              <div className="relative flex flex-col items-center">
                <div
                  className="cursor-pointer flex items-center justify-center hover:scale-110 transition-transform bg-black/50 border border-white/20 p-1 rounded-full backdrop-blur-sm"
                  onClick={(e) => { e.stopPropagation(); setActiveEntityId(item.id); }}
                >
                  <span className="material-symbols-outlined text-[16px]" style={{ color }}>newspaper</span>
                </div>
                {/* Text visible only when zoomed in, limited to 4 words */}
                <div 
                  className={`absolute top-full mt-1 text-[7px] font-mono whitespace-nowrap transition-opacity duration-300 uppercase bg-black/60 px-1 ${isZoomedIn ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                  style={{ color }}
                >
                  {item.source}
                </div>
              </div>
            </Marker>
            {isActive && (
              <Marker longitude={item.coords[1]} latitude={item.coords[0]} anchor="top-left" style={{ zIndex: 999999 }}>
                <div className="absolute top-2 left-2 fui-border bg-black/80 p-4 shadow-2xl backdrop-blur-md w-[300px] pointer-events-auto cursor-auto z-[999999]" >
                  <div className="fui-corner-tl"></div><div className="fui-corner-tr"></div><div className="fui-corner-bl"></div><div className="fui-corner-br"></div>
                  <div className="flex justify-between items-start mb-3 mt-1">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]" style={{ color }}>newspaper</span>
                        <h3 className="font-headline font-bold text-sm tracking-wider uppercase truncate max-w-[200px]" style={{ color }}>Live Alert</h3>
                      </div>
                      <span className="text-slate-400 font-mono text-[9px] uppercase tracking-widest block mt-0.5">{item.source}</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setActiveEntityId(null); }} className="text-slate-500 hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>

                  <div className="bg-slate-900/50 border border-slate-800/80 rounded p-3 mb-3">
                    <span className="text-slate-500 text-[8px] font-mono tracking-widest uppercase block mb-1">ALERT DETAILS</span>
                    <div className="text-[10px] font-mono text-slate-300 whitespace-normal leading-relaxed break-words">
                      {item.description || item.title}
                    </div>
                  </div>
                  
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="block w-full py-1.5 rounded text-[10px] font-mono text-center transition-colors bg-secondary/10 text-secondary hover:bg-secondary/20">
                    VIEW SOURCE
                  </a>
                </div>
              </Marker>
            )}
          </React.Fragment>
          );
        })}

        {/* Render Nuke Sim Circles */}
        {nukeSimMode && nukeSimData?.target && (
          <Marker longitude={nukeSimData.target.lng} latitude={nukeSimData.target.lat} anchor="center">
            <div className="relative flex items-center justify-center pointer-events-none">
              <span className="material-symbols-outlined text-red-500 text-2xl animate-pulse">
                radioactive
              </span>
            </div>
          </Marker>
        )}

        {/* Nuke Sim GeoJSON Layers */}
        {nukeSimGeoJson && (
          <Source type="geojson" data={nukeSimGeoJson as any}>
            <Layer
              id="nukesim-lightBlast"
              type="fill"
              filter={['==', 'type', 'lightBlast']}
              paint={{
                'fill-color': '#aaaaaa',
                'fill-opacity': 0.1,
              }}
            />
            <Layer
              id="nukesim-lightBlast-line"
              type="line"
              filter={['==', 'type', 'lightBlast']}
              paint={{
                'line-color': '#aaaaaa',
                'line-width': 1,
                'line-opacity': 0.3,
              }}
            />
            <Layer
              id="nukesim-thermal"
              type="fill"
              filter={['==', 'type', 'thermal']}
              paint={{
                'fill-color': '#ff9900',
                'fill-opacity': 0.15,
              }}
            />
            <Layer
              id="nukesim-thermal-line"
              type="line"
              filter={['==', 'type', 'thermal']}
              paint={{
                'line-color': '#ff9900',
                'line-width': 1,
                'line-opacity': 0.4,
              }}
            />
            <Layer
              id="nukesim-moderateBlast"
              type="fill"
              filter={['==', 'type', 'moderateBlast']}
              paint={{
                'fill-color': '#ff3300',
                'fill-opacity': 0.2,
              }}
            />
            <Layer
              id="nukesim-moderateBlast-line"
              type="line"
              filter={['==', 'type', 'moderateBlast']}
              paint={{
                'line-color': '#ff3300',
                'line-width': 1.5,
                'line-opacity': 0.5,
              }}
            />
            <Layer
              id="nukesim-fireball"
              type="fill"
              filter={['==', 'type', 'fireball']}
              paint={{
                'fill-color': '#fff700',
                'fill-opacity': 0.4,
              }}
            />
            <Layer
              id="nukesim-fireball-line"
              type="line"
              filter={['==', 'type', 'fireball']}
              paint={{
                'line-color': '#fff700',
                'line-width': 2,
                'line-opacity': 0.8,
              }}
            />
          </Source>
        )}

        {/* Render Nuclear Facilities */}
        {!isDived && layers.threats_nuclear && nuclearFacilities.map((nuc) => {
          const isActive = activeEntityId === nuc.id;
          const isDanger = nuc.status.includes('SEISMIC') || nuc.status.includes('Conflict') || nuc.status.includes('Destroyed');
          const isWarning = nuc.status.includes('Shutdown') || nuc.status.includes('Suspended');
          const color = isDanger ? '#ef4444' : isWarning ? '#eab308' : '#22c55e';

          return (
            <React.Fragment key={`nuc-${nuc.id}`}>
            <Marker longitude={nuc.lng} latitude={nuc.lat} anchor="center" style={{ zIndex: isActive ? 999998 : 20 }}>
              <div className="relative flex flex-col items-center">
                <div
                  className="cursor-pointer flex items-center justify-center hover:scale-110 transition-transform"
                  onClick={(e) => { e.stopPropagation(); setActiveEntityId(nuc.id); }}
                >
                  <span className="material-symbols-outlined text-[20px]" style={{ color }}>warning</span>
                </div>
                <div className={`absolute top-full mt-1.5 text-[7px] font-mono text-slate-300 whitespace-nowrap bg-black/60 px-1.5 py-0.5 rounded transition-opacity duration-300 ${isZoomedIn ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                  {nuc.name}
                </div>
              </div>
            </Marker>
            {isActive && (
              <Marker longitude={nuc.lng} latitude={nuc.lat} anchor="top-left" style={{ zIndex: 999999 }}>
                <div className="absolute top-2 left-2 fui-border bg-black/80 p-4 shadow-2xl backdrop-blur-md w-[300px] pointer-events-auto cursor-auto z-[999999]" >
                  <div className="fui-corner-tl"></div><div className="fui-corner-tr"></div><div className="fui-corner-bl"></div><div className="fui-corner-br"></div>
                  <div className="flex justify-between items-start mb-3 mt-1">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]" style={{ color }}>warning</span>
                        <h3 className="font-headline font-bold text-sm tracking-wider uppercase truncate max-w-[200px]" style={{ color }}>{nuc.name}</h3>
                      </div>
                      <span className="text-slate-400 font-mono text-[9px] uppercase tracking-widest block mt-0.5">NUCLEAR FACILITY // {nuc.city}, {nuc.country}</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setActiveEntityId(null); }} className="text-slate-500 hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>

                  <div className="bg-slate-900/50 border border-slate-800/80 rounded p-3 mb-3">
                    <span className="text-slate-500 text-[8px] font-mono tracking-widest uppercase block mb-1">STATUS</span>
                    <span className="font-mono text-xs font-bold uppercase truncate" style={{ color }}>{nuc.status}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="bg-slate-900/50 border border-slate-800 rounded p-2 text-center">
                      <span className="text-slate-500 text-[8px] font-mono tracking-widest uppercase block mb-1">REACTORS</span>
                      <span className="text-white font-mono text-xs">{nuc.reactors}</span>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800 rounded p-2 text-center">
                      <span className="text-slate-500 text-[8px] font-mono tracking-widest uppercase block mb-1">CAPACITY</span>
                      <span className="text-white font-mono text-xs">{nuc.capacityMW} MW</span>
                    </div>
                  </div>
                  <div className="text-center mt-2 pt-2 border-t border-slate-800/50">
                    <span className="text-slate-500 font-mono text-[9px] uppercase">OWNER: <span className="text-slate-300">{nuc.owner}</span></span>
                  </div>
                </div>
              </Marker>
            )}
          </React.Fragment>
          );
        })}

        {/* Render Strategic Bases */}
        {!isDived && layers.threats_strategic && strategicBases.map((base) => {
          const isActive = activeEntityId === base.id;
          const color = base.type === 'NUCLEAR_SUB_BASE' ? '#0ea5e9' : base.type === 'ICBM_SILO' ? '#f59e0b' : '#a855f7';
          const iconStr = base.type === 'NUCLEAR_SUB_BASE' ? 'directions_boat' : base.type === 'ICBM_SILO' ? 'rocket_launch' : 'radar';

          return (
            <React.Fragment key={base.id}>
            <Marker longitude={base.lng} latitude={base.lat} anchor="center" style={{ zIndex: isActive ? 999998 : 20 }}>
              <div className="relative flex flex-col items-center">
                <div
                  className="cursor-pointer flex items-center justify-center hover:scale-110 transition-transform"
                  onClick={(e) => { e.stopPropagation(); setActiveEntityId(base.id); }}
                >
                  <span className="material-symbols-outlined text-[20px]" style={{ color }}>{iconStr}</span>
                </div>
                <div className={`absolute top-full mt-1.5 text-[7px] font-mono text-slate-300 whitespace-nowrap bg-black/60 px-1.5 py-0.5 rounded transition-opacity duration-300 ${isZoomedIn ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                  {base.callsign}
                </div>
              </div>
            </Marker>
            {isActive && (
              <Marker longitude={base.lng} latitude={base.lat} anchor="top-left" style={{ zIndex: 999999 }}>
                <div className="absolute top-2 left-2 fui-border bg-black/80 p-4 shadow-2xl backdrop-blur-md w-[300px] pointer-events-auto cursor-auto z-[999999]" >
                  <div className="fui-corner-tl"></div><div className="fui-corner-tr"></div><div className="fui-corner-bl"></div><div className="fui-corner-br"></div>
                  <div className="flex justify-between items-start mb-3 mt-1">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]" style={{ color }}>{iconStr}</span>
                        <h3 className="text-white font-headline font-bold text-sm tracking-wider uppercase truncate max-w-[200px]">{base.callsign}</h3>
                      </div>
                      <span className="text-slate-400 font-mono text-[9px] uppercase tracking-widest block mt-0.5">STRATEGIC BASE // {base.country}</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setActiveEntityId(null); }} className="text-slate-500 hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>

                  <div className="fui-border bg-black/40 p-3 mb-3 flex flex-col items-center text-center">
                    <div className="fui-corner-tl"></div><div className="fui-corner-tr"></div><div className="fui-corner-bl"></div><div className="fui-corner-br"></div>
                    <span className="text-slate-500 text-[8px] font-mono tracking-widest uppercase block mb-1">TYPE</span>
                    <span className="text-white font-mono text-xs font-bold uppercase truncate">{base.type.replace(/_/g, ' ')}</span>
                  </div>

                  <div className="grid grid-cols-1 mb-2">
                    <div className="fui-border bg-black/40 p-3 flex flex-col items-center text-center">
                      <div className="fui-corner-tl"></div><div className="fui-corner-tr"></div><div className="fui-corner-bl"></div><div className="fui-corner-br"></div>
                      <span className="text-slate-500 text-[8px] font-mono tracking-widest uppercase block mb-1">STATUS</span>
                      <span className="text-white font-mono text-xs font-bold">{base.status}</span>
                    </div>
                  </div>
                </div>
              </Marker>
            )}
          </React.Fragment>
          );
        })}

        {/* Region Dossier Modal - Pinned to Map */}
        {dossierLngLat && (
          <Marker
            longitude={dossierLngLat.lng}
            latitude={dossierLngLat.lat}
            anchor="bottom"
            offset={[0, -10]}
            style={{ zIndex: 100 }}
          >
            <div
              className="fui-border bg-black/80 shadow-2xl p-5 w-[500px] backdrop-blur-md cursor-default pointer-events-auto relative"
              onContextMenu={(e) => e.preventDefault()}
              onClick={(e) => e.stopPropagation()}
              onWheel={(e) => e.stopPropagation()}
            >
              <div className="fui-corner-tl"></div><div className="fui-corner-tr"></div><div className="fui-corner-bl"></div><div className="fui-corner-br"></div>
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/5">
                <h3 className="text-[#3cdcd1] font-headline font-bold text-sm uppercase tracking-widest">Region Intel</h3>
                <button onClick={() => setDossierLngLat(null)} className="text-slate-500 hover:text-white material-symbols-outlined text-sm transition-colors">close</button>
              </div>

              {isFetchingDossier ? (
                <div className="flex flex-col items-center justify-center py-8 text-[#3cdcd1] animate-pulse">
                  <span className="material-symbols-outlined text-4xl mb-3">radar</span>
                  <span className="font-mono text-[10px] tracking-widest">TRANSMITTING INTEL...</span>
                </div>
              ) : dossier && !dossier.error ? (
                <div className="flex flex-col gap-4 text-left">
                  {/* Location Row */}
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-[8px] font-mono tracking-widest uppercase mb-1">Location</span>
                    <span className="text-white text-[12px] font-headline tracking-wide">{dossier.location?.display_name || 'UNKNOWN TERRITORY'}</span>
                  </div>

                  {/* Grid for Country details */}
                  {dossier.country ? (
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                      <div className="flex flex-col">
                        <span className="text-slate-500 text-[8px] font-mono tracking-widest uppercase mb-1">Country</span>
                        <div className="flex items-center gap-2">
                          {dossier.country.flag_url ? (
                            <img src={dossier.country.flag_url} alt="Flag" className="w-5 h-3.5 object-cover rounded-[2px]" />
                          ) : <span className="text-sm leading-none">{dossier.country.flag}</span>}
                          <span className="text-white text-[11px] font-headline">{dossier.country.official_name || dossier.country.name}</span>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-500 text-[8px] font-mono tracking-widest uppercase mb-1">Capital</span>
                        <span className="text-white text-[11px] font-headline truncate">{dossier.country.capital || 'N/A'}</span>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-slate-500 text-[8px] font-mono tracking-widest uppercase mb-1">Population</span>
                        <span className="text-white text-[11px] font-headline">{dossier.country.population?.toLocaleString() || 'N/A'}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-500 text-[8px] font-mono tracking-widest uppercase mb-1">Region</span>
                        <span className="text-white text-[11px] font-headline truncate">{dossier.country.region}</span>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-slate-500 text-[8px] font-mono tracking-widest uppercase mb-1">Languages</span>
                        <span className="text-white text-[11px] font-headline truncate">{dossier.country.languages?.join(', ') || 'N/A'}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-500 text-[8px] font-mono tracking-widest uppercase mb-1">Area</span>
                        <span className="text-white text-[11px] font-headline">{dossier.country.area?.toLocaleString()} km²</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-red-400 p-3 bg-red-900/10 border border-red-500/20 rounded-md font-mono text-[9px]">NO SOVEREIGN DATA FOUND (INTERNATIONAL WATERS)</div>
                  )}

                  {/* Head of State */}
                  {dossier.head_of_state && (
                    <div className="flex flex-col">
                      <span className="text-slate-500 text-[8px] font-mono tracking-widest uppercase mb-1">Head of State</span>
                      <span className="text-[#3cdcd1] text-[12px] font-headline">{dossier.head_of_state.name}</span>
                      <span className="text-slate-500 text-[9px] mt-0.5 lowercase">{dossier.head_of_state.position}</span>
                    </div>
                  )}

                  {/* Intelligence Brief */}
                  {dossier.wikipedia && (
                    <div className="flex flex-col">
                      <span className="text-slate-500 text-[8px] font-mono tracking-widest uppercase mb-2">Intelligence Brief</span>
                      <div className="flex gap-4 items-start">
                        {dossier.country?.flag_url ? (
                          <img src={dossier.country.flag_url} alt="Flag" className="w-14 h-10 rounded border border-white/10 object-cover shrink-0 mt-0.5" />
                        ) : dossier.wikipedia.thumbnail ? (
                          <img src={dossier.wikipedia.thumbnail} alt="Thumb" className="w-12 h-12 rounded border border-white/10 object-cover shrink-0 mt-0.5" />
                        ) : null}
                        <div className="text-[10px] leading-relaxed text-slate-400 text-justify line-clamp-4">
                          {dossier.wikipedia.extract}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sentinel SAR Recent Overpasses */}
                  {dossier.sentinel && dossier.sentinel.scenes && dossier.sentinel.scenes.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-800/30">
                      <span className="text-slate-500 text-[8px] font-mono tracking-widest uppercase mb-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[10px]">satellite_alt</span> Recent Sentinel Overpasses ({dossier.sentinel.total})
                      </span>
                      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                        {dossier.sentinel.scenes.slice(0, 3).map((scene: any, i: number) => (
                          <div
                            key={i}
                            className="flex-shrink-0 relative group rounded overflow-hidden border border-slate-800/60 hover:border-cyan-500/50 transition-all cursor-pointer bg-slate-900"
                            style={{ width: '80px', height: '60px' }}
                            onClick={() => window.open(`https://browser.dataspace.copernicus.eu/?zoom=12&lat=${dossierLngLat?.lat}&lng=${dossierLngLat?.lng}&themeId=DEFAULT-THEME&datasetId=S1_GRD_IW`, '_blank')}
                          >
                            {scene.preview || scene.thumbnail ? (
                              <img src={scene.preview || scene.thumbnail} alt="SAR" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-[8px] text-slate-500 font-mono">
                                <span className="material-symbols-outlined text-[14px] mb-1">image_not_supported</span>
                                NO IMG
                              </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-black/80 px-1 py-0.5 text-[7px] text-white font-mono truncate text-center">
                              {new Date(scene.datetime).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-red-400 py-4 text-center">INTEL UNAVAILABLE</div>
              )}
            </div>
          </Marker>
        )}

      </Map>

      {/* Ghost Border Grid — visible on satellite dive */}

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
