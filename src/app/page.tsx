'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { AnalyticsPanel } from '@/components/AnalyticsPanel';
import { useInference } from '@/hooks/use-inference';

// Dynamic import to prevent SSR of Mapbox GL (requires window/document)
const TacticalMap = dynamic(
  () => import('@/components/TacticalMap').then((mod) => mod.TacticalMap),
  { ssr: false },
);

interface TrackedAsset {
  id: string;
  classification: string;
  velocity: number;
  altitude: number;
  lat: number;
  lng: number;
  last_updated: string;
}

export default function GlobalSurveillanceHub() {
  const { alerts, latestScan, changeReport, isScanning, fetchTimelineImagery } = useInference();
  const [selectedAsset, setSelectedAsset] = useState<TrackedAsset | null>(null);

  const handleTimelineScrub = (dateStr: string) => {
    fetchTimelineImagery(dateStr);
  };

  return (
    <>
      <main className="flex-1 relative bg-surface-container-lowest h-full overflow-hidden">
        {/* Tactical Map with live WebSocket data */}
        <TacticalMap
          onAssetSelect={(asset) => setSelectedAsset(asset)}
          selectedAssetId={selectedAsset?.id ?? null}
        />

        {/* Coordinate HUD corners */}
        <div className="absolute top-6 left-6 border-t-2 border-l-2 border-secondary w-8 h-8 opacity-50 z-20 pointer-events-none"></div>
        <div className="absolute top-6 right-6 border-t-2 border-r-2 border-secondary w-8 h-8 opacity-50 z-20 pointer-events-none"></div>
        <div className="absolute bottom-24 left-6 border-b-2 border-l-2 border-secondary w-8 h-8 opacity-50 z-20 pointer-events-none"></div>
        <div className="absolute bottom-24 right-6 border-b-2 border-r-2 border-secondary w-8 h-8 opacity-50 z-20 pointer-events-none"></div>

        {/* Lock Status */}
        <div className="absolute top-8 left-12 font-mono text-[10px] text-secondary tracking-widest bg-surface-container-lowest/50 px-3 py-1 border border-outline-variant/30 z-20 pointer-events-none">
          LOCKED: SECTOR_7 // OVERRIDE_DISABLED
        </div>

        {/* Time Travel Slider — wired to inference */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-3/4 max-w-2xl bg-[rgba(68,71,78,0.30)] backdrop-blur-xl p-4 z-30 bezel-glow">
          <div className="flex justify-between items-center mb-3 px-2">
            <span className="text-[10px] font-mono text-on-surface-variant">SCRUB TIMELINE</span>
            <div className="flex items-center gap-3">
              {isScanning && (
                <span className="text-[8px] font-mono text-secondary animate-pulse tracking-wider">
                  NEURAL_OBSERVER: PROCESSING...
                </span>
              )}
              <span className="text-xs font-headline font-bold text-white uppercase tracking-tighter">OCT 24, 2023 — 14:22 Z</span>
            </div>
          </div>
          <div className="relative h-1.5 bg-surface-container-lowest mb-2">
            <div className="absolute top-0 left-0 w-3/4 h-full bg-secondary shadow-[0_0_10px_rgba(102,252,241,0.5)]"></div>
            <div className="absolute top-1/2 left-3/4 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white border-4 border-secondary pointer-events-auto cursor-pointer hover:scale-110 transition-transform"></div>
          </div>
          <div className="flex justify-between text-[9px] font-mono text-on-surface-variant px-1">
            <button onClick={() => handleTimelineScrub('2023-09-24')} className="hover:text-secondary transition-colors cursor-pointer">30 DAYS AGO</button>
            <button onClick={() => handleTimelineScrub('2023-10-17')} className="hover:text-secondary transition-colors cursor-pointer">7 DAYS AGO</button>
            <button onClick={() => handleTimelineScrub('2023-10-23')} className="hover:text-secondary transition-colors cursor-pointer">24H</button>
            <button onClick={() => handleTimelineScrub('2023-10-24')} className="text-secondary font-bold hover:text-white transition-colors cursor-pointer">LIVE_FEED</button>
          </div>
        </div>
      </main>

      {/* Right Sidebar — wired to inference */}
      <AnalyticsPanel
        alerts={alerts}
        latestScan={latestScan}
        changeReport={changeReport}
        isScanning={isScanning}
      />
    </>
  );
}
