'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { AnalyticsPanel } from '@/components/AnalyticsPanel';
import { NukeSimPanel } from '@/components/NukeSimPanel';
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

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('aegisAssetSelected', { detail: selectedAsset }));
  }, [selectedAsset]);

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

        {/* Nuclear Simulator Panel (Disabled) */}
        {/* <NukeSimPanel /> */}

        {/* Coordinate HUD corners */}
        <div className="absolute top-6 left-6 border-t-2 border-l-2 border-secondary w-8 h-8 opacity-50 z-20 pointer-events-none"></div>
        <div className="absolute top-6 right-6 border-t-2 border-r-2 border-secondary w-8 h-8 opacity-50 z-20 pointer-events-none"></div>
        <div className="absolute bottom-24 left-6 border-b-2 border-l-2 border-secondary w-8 h-8 opacity-50 z-20 pointer-events-none"></div>
        <div className="absolute bottom-24 right-6 border-b-2 border-r-2 border-secondary w-8 h-8 opacity-50 z-20 pointer-events-none"></div>

        {/* Lock Status */}
        <div className="absolute top-8 left-12 font-mono text-[10px] text-secondary tracking-widest bg-surface-container-lowest/50 px-3 py-1 border border-outline-variant/30 z-20 pointer-events-none">
          LOCKED: SECTOR_7 // OVERRIDE_DISABLED
        </div>
      </main>
    </>
  );
}
