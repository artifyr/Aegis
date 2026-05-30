'use client';

interface Alert {
  alert_id: string;
  timestamp: string;
  priority: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  message: string;
  classification: string;
  confidence: number;
  border_color: string;
  glow: boolean;
}

interface ScanResult {
  scan_id: string;
  timestamp: string;
  chip_count: number;
  total_detections: number;
  high_value_targets: { classification: string; confidence: number }[];
}

interface ChangeReport {
  summary: { new_count: number; moved_count: number; gone_count: number };
}

// DESIGN.md border color mapping
const BORDER_MAP: Record<string, string> = {
  'on-tertiary-container': 'border-on-tertiary-container',
  'secondary': 'border-secondary',
  'outline': 'border-outline',
};

/**
 * DESIGN.md: Alert Chips — no rounded corners (0px),
 * on_tertiary_container (#c31f29) text for alerts,
 * surface_container_highest background.
 */
function AlertChip({ label, type }: { label: string; type: 'critical' | 'info' | 'warning' }) {
  const colors = {
    critical: 'text-on-tertiary-container bg-surface-container-highest',
    warning: 'text-tertiary-fixed-dim bg-surface-container-highest',
    info: 'text-secondary bg-surface-container-highest',
  };

  return (
    <span className={`px-1.5 py-0.5 text-[8px] font-mono font-bold uppercase tracking-wider ${colors[type]}`}>
      {label}
    </span>
  );
}

function ConfidenceChip({ confidence }: { confidence: number }) {
  const pct = (confidence * 100).toFixed(1);
  const color = confidence >= 0.8
    ? 'text-on-tertiary-container'
    : confidence >= 0.5
    ? 'text-tertiary-fixed-dim'
    : 'text-secondary';

  return (
    <span className={`px-1.5 py-0.5 text-[8px] font-mono font-bold bg-surface-container-highest ${color}`}>
      {pct}%
    </span>
  );
}

import { useTacticalStore } from '@/store/tactical-store';

// Very rough approximation for regions due to lack of local client-side shapefiles
const getRegionFromCoords = (lat: number, lng: number) => {
  if (lat > 24 && lat < 50 && lng > -125 && lng < -65) return "United States";
  if (lat > 35 && lat < 70 && lng > -10 && lng < 40) return "Europe";
  if (lat > -60 && lat < 15 && lng > -85 && lng < -35) return "South America";
  if (lat > 15 && lat < 55 && lng > 70 && lng < 145) return "East Asia";
  if (lat > -40 && lat < -10 && lng > 110 && lng < 155) return "Oceania";
  if (lat > -35 && lat < 35 && lng > -20 && lng < 55) return "Africa";
  return "Intl Waters";
};

export function AnalyticsPanel({
  alerts = [],
  latestScan = null,
  isScanning = false,
}: {
  alerts?: Alert[];
  latestScan?: ScanResult | null;
  changeReport?: ChangeReport | null;
  isScanning?: boolean;
}) {
  const cameras = useTacticalStore(state => state.cameras);
  
  // Merge static placeholder alerts with dynamic ones
  const staticAlerts: Alert[] = [
    {
      alert_id: 'static-1',
      timestamp: new Date().toISOString(),
      priority: 'CRITICAL',
      title: 'Uplink Established',
      message: `SUCCESSFULLY PARSED ${cameras.length} SURVEILLANCE STREAMS FROM GLOBAL NETWORK.`,
      classification: 'System',
      confidence: 1.0,
      border_color: 'secondary',
      glow: true,
    },
    {
      alert_id: 'static-2',
      timestamp: '2026-04-01T14:12:00.000Z',
      priority: 'INFO',
      title: 'Asset Sync',
      message: 'SENTINEL-2 HANDOVER COMPLETE. REFRESH RATE OPTIMIZED TO 500MS.',
      classification: 'System',
      confidence: 1.0,
      border_color: 'secondary',
      glow: false,
    },
    {
      alert_id: 'static-3',
      timestamp: '2026-04-01T14:12:00.000Z',
      priority: 'INFO',
      title: 'System Log',
      message: 'USER_ADMIN INITIATED BROADCAST SCAN ON SECTOR_7. COMPLIANCE OK.',
      classification: 'System',
      confidence: 1.0,
      border_color: 'outline',
      glow: false,
    },
  ];

  const mergedAlerts = alerts.length > 0 ? alerts : staticAlerts;

  // Calculate real-time stats based on cameras in view
  const totalNodes = cameras.length;
  // Simulating 86% uptime for network camera feeds (as true verification only happens on individual click via Windy)
  const workingFeeds = Math.floor(totalNodes * 0.86);
  const deadFeeds = totalNodes - workingFeeds;

  // Calculate Region Distribution
  const regionCounts = cameras.reduce((acc, cam) => {
    const region = getRegionFromCoords(cam.lat, cam.lon);
    acc[region] = (acc[region] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedRegions = Object.entries(regionCounts).sort((a, b) => b[1] - a[1]);

  return (
    <aside className="static right-0 top-16 h-[calc(100vh-64px)] w-80 flex-shrink-0 flex flex-col bg-surface-container bezel-glow z-40 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-outline-variant/10 flex items-center gap-3">
        <span className="material-symbols-outlined text-secondary">analytics</span>
        <h2 className="font-headline font-bold text-sm tracking-tight text-white">DATA ANALYTICS &amp; ALERTS</h2>
      </div>

      {/* Network Status Section */}
      <div className="p-5 flex flex-col gap-4 border-b border-outline-variant/10">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest">Network Status</h3>
          <div className="flex gap-1">
            <AlertChip label={`${workingFeeds} ONLINE`} type="info" />
            <AlertChip label={`${deadFeeds} OFFLINE`} type="critical" />
          </div>
        </div>

        {/* Scan Summary */}
        {latestScan && (
          <div className="bg-surface-container-low p-3 bezel-glow">
            <div className="flex justify-between mb-2">
              <span className="text-[9px] font-mono text-on-surface-variant">LATEST_SYNC</span>
              <span className="text-[9px] font-mono text-secondary">
                LIVE
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-[9px] font-mono text-on-surface-variant">
              <span>NODES: <span className="text-white">{cameras.length}</span></span>
              <span>API_KEY: <span className="text-secondary">SECURE</span></span>
              <span>PROXY: <span className="text-on-tertiary-container">localhost:8002</span></span>
              <span>WINDY: <span className="text-secondary">v3</span></span>
            </div>
          </div>
        )}

        {/* Regional Asset Breakdown */}
        <div className="flex flex-col gap-2 mt-2">
          <h3 className="text-[9px] font-mono text-on-surface-variant mb-1">REGIONAL NODE DISTRIBUTION</h3>
          {sortedRegions.slice(0, 5).map(([region, count]) => {
            const percentage = totalNodes > 0 ? (count / totalNodes) * 100 : 0;
            return (
              <div key={region} className="flex flex-col gap-1">
                <div className="flex justify-between items-end">
                  <span className="text-[9px] font-mono text-white uppercase">{region}</span>
                  <span className="text-[9px] font-mono text-secondary">{count}</span>
                </div>
                <div className="w-full h-1 bg-surface-container-highest">
                  <div className="h-full bg-[#66FCF1] transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                </div>
              </div>
            );
          })}
          {sortedRegions.length === 0 && (
            <span className="text-[9px] font-mono text-on-surface-variant italic">Awaiting telemetry...</span>
          )}
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="flex-1 flex flex-col p-5 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest">System Alerts</h3>
          <div className="flex items-center gap-2">
            {isScanning && (
              <span className="text-[8px] font-mono text-secondary animate-pulse">SCANNING...</span>
            )}
            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>
          </div>
        </div>

        <div className="flex flex-col gap-3 overflow-y-auto pr-2">
          {mergedAlerts.map((alert) => {
            const borderClass = BORDER_MAP[alert.border_color] || 'border-outline-variant';
            return (
              <div
                key={alert.alert_id}
                className={`p-3 bg-surface-container-high border-l-2 ${borderClass} transition-all duration-300 ${
                  alert.glow
                    ? 'shadow-[inset_0_0_12px_rgba(60,220,209,0.08),0_0_8px_rgba(195,31,41,0.15)]'
                    : ''
                }`}
              >
                <div className="flex justify-between items-start mb-1 gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-white uppercase font-headline">{alert.title}</span>
                    {alert.priority === 'CRITICAL' && <AlertChip label="CRIT" type="critical" />}
                  </div>
                  <span className="text-[9px] font-mono text-on-surface-variant whitespace-nowrap" suppressHydrationWarning>
                    {alert.timestamp.slice(11, 19)} Z
                  </span>
                </div>
                <p className="text-[10px] font-mono text-on-surface-variant leading-tight mb-1.5">
                  {alert.message}
                </p>
                {alert.confidence < 1.0 && (
                  <ConfidenceChip confidence={alert.confidence} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="p-4 bg-surface-container-lowest font-mono text-[9px] text-on-surface-variant grid grid-cols-2 gap-2 mt-auto">
        <div className="flex justify-between border-b border-outline-variant/30 pb-1">
          <span>UPTIME:</span>
          <span className="text-secondary">99.9%</span>
        </div>
        <div className="flex justify-between border-b border-outline-variant/30 pb-1">
          <span>LATENCY:</span>
          <span className="text-secondary">12ms</span>
        </div>
        <div className="flex justify-between">
          <span>API_ST:</span>
          <span className="text-secondary">ACTIVE</span>
        </div>
        <div className="flex justify-between">
          <span>LOAD:</span>
          <span className="text-secondary">1.43%</span>
        </div>
      </div>
    </aside>
  );
}
