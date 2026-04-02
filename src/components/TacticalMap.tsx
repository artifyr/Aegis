'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import Map, { NavigationControl, type MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useGlobalSurveillance } from '@/hooks/use-global-surveillance';

// ─── Types ────────────────────────────────────────────────────────
interface TrackedAsset {
  id: string;
  classification: string;
  callsign?: string;
  velocity: number;
  altitude: number;
  lat: number;
  lng: number;
  last_updated: string;
}

// ─── Constants ────────────────────────────────────────────────────
// DESIGN.md: surface_container_lowest (#0d0e12) for global background
const DARK_STYLE = 'mapbox://styles/mapbox/dark-v11';
const SATELLITE_STYLE = 'mapbox://styles/mapbox/satellite-streets-v12';

const INITIAL_VIEW = {
  longitude: -30,
  latitude: 20,
  zoom: 1.8,
  pitch: 0,
  bearing: 0,
};

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

// ─── HUD Coordinate Overlay SVG ──────────────────────────────────
// DESIGN.md: 2px "corner bracket" detail in each corner, "targeting" aesthetic
function HUDMarker({
  asset,
  isSelected,
  onClick,
}: {
  asset: TrackedAsset;
  isSelected: boolean;
  onClick: () => void;
}) {
  const size = isSelected ? 48 : 36;
  const color = asset.classification === 'Naval' ? '#3cdcd1' : '#7bd6d1';
  const icon = asset.classification === 'Naval' ? '⬡' : '△';

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
        {/* Center crosshair */}
        <line x1="24" y1="18" x2="24" y2="30" stroke={color} strokeWidth="1" opacity="0.4" />
        <line x1="18" y1="24" x2="30" y2="24" stroke={color} strokeWidth="1" opacity="0.4" />
        {/* Center icon */}
        <text
          x="24" y="24"
          textAnchor="middle"
          dominantBaseline="central"
          fill={color}
          fontSize="12"
          fontFamily="monospace"
        >
          {icon}
        </text>
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
            LOCKED: {asset.callsign || asset.id.slice(0, 8).toUpperCase()}
          </div>
          <div className="text-[8px] font-mono text-[#bacac7] leading-relaxed">
            TYPE: {asset.classification.toUpperCase()}<br />
            LAT: {asset.lat.toFixed(6)}<br />
            LNG: {asset.lng.toFixed(6)}<br />
            VEL: {asset.velocity.toFixed(1)} KTS // ALT: {asset.altitude.toLocaleString()} FT
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

// ─── Main Tactical Map ───────────────────────────────────────────
export function TacticalMap({
  onAssetSelect,
  selectedAssetId,
}: {
  onAssetSelect?: (asset: TrackedAsset) => void;
  selectedAssetId?: string | null;
}) {
  const mapRef = useRef<MapRef>(null);
  const { assets, status } = useGlobalSurveillance();
  const [viewState, setViewState] = useState(INITIAL_VIEW);
  const [isDived, setIsDived] = useState(false);
  const [mapStyle, setMapStyle] = useState(DARK_STYLE);
  const [markers, setMarkers] = useState<{ x: number; y: number; asset: TrackedAsset }[]>([]);

  // Project assets to screen coordinates
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || assets.length === 0) return;

    const projected = assets.map((asset) => {
      const point = map.project([asset.lng, asset.lat]);
      return { x: point.x, y: point.y, asset };
    });
    setMarkers(projected);
  }, [assets, viewState]);

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
        zoom: 15,
        pitch: 45,
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

    setMapStyle(DARK_STYLE);
    setIsDived(false);

    map.flyTo({
      center: [INITIAL_VIEW.longitude, INITIAL_VIEW.latitude],
      zoom: INITIAL_VIEW.zoom,
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
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
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
      </Map>

      {/* Ghost Border Grid — visible on satellite dive */}
      <GhostGrid visible={isDived} />

      {/* HUD Markers projected onto screen */}
      {markers.map(({ x, y, asset }) => (
        <div
          key={asset.id}
          className="absolute"
          style={{ left: x, top: y, zIndex: 20 }}
        >
          <HUDMarker
            asset={asset}
            isSelected={selectedAssetId === asset.id}
            onClick={() => {
              onAssetSelect?.(asset);
              cameraDive(asset.lat, asset.lng);
            }}
          />
        </div>
      ))}

      {/* SYST_STATUS HUD — top left */}
      <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
        <div
          className={`w-2 h-2 ${
            status === 'LIVE'
              ? 'bg-[#3cdcd1] shadow-[0_0_8px_#3cdcd1] animate-pulse'
              : status === 'CONNECTING'
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
          className="absolute top-4 right-4 z-30 px-3 py-1.5 bg-[rgba(68,71,78,0.40)] font-mono text-[9px] text-[#7bd6d1] tracking-wider uppercase cursor-pointer transition-all duration-150 hover:bg-[rgba(68,71,78,0.60)] border border-[rgba(133,148,145,0.20)]"
          style={{ backdropFilter: 'blur(12px)' }}
        >
          ◁ GLOBAL VIEW
        </button>
      )}

      {/* Coordinate readout footer — DESIGN.md Technical Authority */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20 flex justify-between items-center px-4 py-2 font-mono text-[8px] text-[#bacac7] tracking-wider"
        style={{
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(68, 71, 78, 0.25)',
        }}
      >
        <span>
          CTR: {viewState.latitude.toFixed(6)}°N, {viewState.longitude.toFixed(6)}°W
        </span>
        <span>ZOOM: {viewState.zoom.toFixed(2)}</span>
        <span>PITCH: {(viewState.pitch ?? 0).toFixed(1)}°</span>
        <span>ASSETS: {assets.length} TRACKED</span>
        <span className="text-[#3cdcd1]">
          {isDived ? 'MODE: SATELLITE / HI-RES' : 'MODE: GLOBE / HOLOGRAPHIC'}
        </span>
      </div>
    </div>
  );
}
