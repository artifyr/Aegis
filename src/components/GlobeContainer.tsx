'use client';

import { useGlobalSurveillance } from '@/hooks/use-global-surveillance';

export function GlobeContainer() {
  const { assets, status } = useGlobalSurveillance();

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="relative w-[300px] h-[300px] md:w-[600px] md:h-[600px]">
        {/* Connection Status indicator - DESIGN.md Technical Authority */}
        <div className="absolute top-[-40px] left-1/2 -translate-x-1/2 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${status === 'LIVE' ? 'bg-secondary animate-pulse shadow-[0_0_8px_#66FCF1]' : 'bg-red-500'}`}></div>
          <span className="font-mono text-[9px] tracking-widest text-on-surface-variant/80 uppercase">
            SYST_STATUS: {status}
          </span>
        </div>

        {/* Holographic Globe Simulation Container */}
        <div className="absolute inset-0 rounded-full border border-secondary/20 bg-gradient-to-tr from-secondary/10 to-transparent shadow-[0_0_100px_rgba(102,252,241,0.05)]"></div>

        <img
          className="w-full h-full object-contain mix-blend-screen opacity-40 rounded-full"
          alt="digital 3D globe visualization placeholder"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFUYOXClXp8fnLfaIi65IB9umz9xazcjljlOybsxb3E0OqgtkqYIBzjBduu29nskZyNuNJgvkUDLeYY3sS4kRrcRUwCSj8MENyoe1ZN44kndH1XLVHb-AoaURVK_7IOl9OT-Ysf-yOLd4mxlKP26TSxrUBbzEYD9MzsPh4jN7tQm5gjkJySleM8qaPjcRaZ7zr6TDgsYV2Gu2JLdcRmkfIDj65Qd5lBAMLobdQImgs2zPzoMqlAgjnhG2AWW3jLwWKGwUKd4N8i25D"
        />

        {/* Dynamic Asset HUD Overlays - Replacing static markers */}
        {assets.map((asset, index) => (
          <div key={asset.id}
            className="absolute transition-all duration-500 linear group pointer-events-auto cursor-pointer"
            style={{
              // Simulating projection onto a 2D circle for visualization
              top: `${40 + (index * 20)}%`,
              left: `${35 + (index * 30)}%`
            }}>

            {/* DESIGN.md: Active Track 2px pulse animation */}
            <div className="grid place-items-center w-6 h-6">
              <span className={`col-start-1 row-start-1 material-symbols-outlined ${asset.classification === 'Aerial' ? 'text-secondary' : 'text-primary-fixed-dim'} text-lg leading-none`}
                style={{ fontVariationSettings: "'FILL' 1", fontSize: '20px' }}>
                {asset.classification === 'Aerial' ? 'flight_takeoff' : 'directions_boat'}
              </span>
              <span className="col-start-1 row-start-1 w-5 h-5 rounded-full border border-secondary/30 animate-ping"></span>
            </div>

            <div className="bg-black/80 backdrop-blur-md px-2 py-1 border-l-2 border-secondary text-[8px] font-mono mt-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              <span className="text-secondary font-bold">LOCKED: {asset.id.slice(0, 8)}</span><br />
              TYPE: {asset.classification.toUpperCase()} // ALT: {asset.altitude.toLocaleString()} FT<br />
              LAT: {asset.lat.toFixed(6)}<br />
              LNG: {asset.lng.toFixed(6)}<br />
              VEL: {asset.velocity.toFixed(1)} KTS
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
