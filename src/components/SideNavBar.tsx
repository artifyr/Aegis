'use client';

import { useGlobalSurveillance } from '@/hooks/use-global-surveillance';

export function SideNavBar() {
  const { assets } = useGlobalSurveillance();

  // Filter live assets by classification
  const navalAssets = assets.filter((a) => a.classification === 'Naval');
  const aerialAssets = assets.filter((a) => a.classification === 'Aerial');

  const handleTargetClick = (lat: number, lng: number) => {
    const dive = (window as any).__aegisCameraDive;
    if (dive) dive(lat, lng);
  };

  return (
    <aside className="static flex-shrink-0 left-0 top-16 h-[calc(100vh-64px)] w-72 flex flex-col justify-between py-4 bg-[#1f1f24] z-40 bezel-glow">
      <div className="flex flex-col h-full overflow-y-auto px-4 gap-6">
        {/* Header Section */}
        <div className="flex items-center gap-3 border-b border-outline-variant/10 pb-4">
          <div className="w-10 h-10 bg-surface-container-high flex items-center justify-center">
            <span className="material-symbols-outlined text-[#66FCF1]">radar</span>
          </div>
          <div>
            <h2 className="text-[#66FCF1] font-bold text-sm font-headline">ASSETS &amp; TARGETS</h2>
            <p className="text-[10px] text-on-surface-variant font-mono">SECTOR_7_GEOINT</p>
          </div>
        </div>

        {/* Watchlist Input */}
        <div className="flex flex-col gap-2">
          <label className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">Target Watchlist</label>
          <div className="relative">
            <input
              type="text"
              placeholder="ENTER ID / COORDINATES"
              className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant focus:border-[#66FCF1] focus:ring-0 text-xs font-mono py-2 pl-2 pr-8 placeholder:text-outline-variant/50"
            />
            <span className="material-symbols-outlined absolute right-2 top-1.5 text-sm text-on-surface-variant">search</span>
          </div>
        </div>

        {/* ═══ NAVAL VESSELS ═══ */}
        <div className="flex flex-col gap-3">
          <div className="group flex items-center justify-between p-2 bg-white/5 border-l-4 border-[#66FCF1] cursor-pointer">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-xs">directions_boat</span>
              <span className="text-xs font-headline font-medium">NAVAL VESSELS</span>
            </div>
            <span className="text-[10px] font-mono text-secondary">{navalAssets.length > 0 ? `0${navalAssets.length}` : '08'}</span>
          </div>

          {/* Live naval asset list items — clickable for Camera Dive */}
          <div className="flex flex-col gap-1 pl-2">
            {navalAssets.length > 0 ? (
              navalAssets.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => handleTargetClick(asset.lat, asset.lng)}
                  className="flex items-center justify-between p-2 hover:bg-white/5 transition-all duration-150 cursor-pointer group text-left w-full"
                >
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-white">{asset.callsign || asset.id.slice(0, 8).toUpperCase()}</span>
                    <span className="text-[9px] text-on-surface-variant uppercase">Naval Contact</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-[#66FCF1]">{asset.velocity.toFixed(1)} KTS</span>
                    <p className="text-[8px] text-on-surface-variant">{asset.lat.toFixed(4)}°N</p>
                  </div>
                </button>
              ))
            ) : (
              <>
                <div className="flex items-center justify-between p-2 hover:bg-white/5 transition-all cursor-pointer group">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-white">X-RAY 492</span>
                    <span className="text-[9px] text-on-surface-variant uppercase">Carrier Strike Group</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-[#66FCF1]">98% CONF</span>
                    <p className="text-[8px] text-on-surface-variant">14:19:00 Z</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 hover:bg-white/5 transition-all cursor-pointer group">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-white">YANKEE 102</span>
                    <span className="text-[9px] text-on-surface-variant uppercase">Subsurface Contact</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-[#66FCF1]">92% CONF</span>
                    <p className="text-[8px] text-on-surface-variant">14:18:22 Z</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ═══ AIRCRAFT ═══ */}
          <div className="group flex items-center justify-between p-2 hover:bg-white/5 transition-all cursor-pointer text-slate-400">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-xs">flight</span>
              <span className="text-xs font-headline">AIRCRAFT</span>
            </div>
            <span className="text-[10px] font-mono">{aerialAssets.length > 0 ? `${aerialAssets.length}` : '14'}</span>
          </div>

          {/* Live aerial asset items */}
          {aerialAssets.length > 0 && (
            <div className="flex flex-col gap-1 pl-2">
              {aerialAssets.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => handleTargetClick(asset.lat, asset.lng)}
                  className="flex items-center justify-between p-2 hover:bg-white/5 transition-all duration-150 cursor-pointer group text-left w-full"
                >
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-white">{asset.callsign || asset.id.slice(0, 8).toUpperCase()}</span>
                    <span className="text-[9px] text-on-surface-variant uppercase">Aerial — FL{(asset.altitude / 100).toFixed(0)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-[#66FCF1]">{asset.velocity.toFixed(0)} KTS</span>
                    <p className="text-[8px] text-on-surface-variant">{asset.lat.toFixed(4)}°N</p>
                  </div>
                </button>
              ))}
            </div>
          )}

        </div>

        {/* AOI Hierarchy */}
        <div className="flex flex-col gap-2 mt-4">
          <label className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">Area of Interest</label>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 py-1 px-2 hover:bg-white/5 cursor-pointer">
              <span className="material-symbols-outlined text-xs text-secondary">folder_open</span>
              <span className="text-[11px] font-mono">NORTH_PACIFIC_S3</span>
            </div>
            <div className="flex items-center gap-2 py-1 px-4 hover:bg-white/5 cursor-pointer text-on-surface-variant">
              <span className="material-symbols-outlined text-xs">layers</span>
              <span className="text-[10px] font-mono">SUB_GRID_ALPHA</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 border-t border-outline-variant/10">
        <button className="w-full bg-white text-on-primary font-headline font-bold text-xs py-3 flex items-center justify-center gap-2 hover:bg-secondary-fixed transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-sm">satellite_alt</span>
          DEPLOY SENSOR
        </button>
      </div>
    </aside>
  );
}
