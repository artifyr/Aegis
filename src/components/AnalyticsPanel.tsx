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

export function AnalyticsPanel({
  alerts = [],
  latestScan = null,
  changeReport = null,
  isScanning = false,
}: {
  alerts?: Alert[];
  latestScan?: ScanResult | null;
  changeReport?: ChangeReport | null;
  isScanning?: boolean;
}) {
  // Merge static placeholder alerts with dynamic ones
  const staticAlerts: Alert[] = [
    {
      alert_id: 'static-1',
      timestamp: '2026-04-01T14:12:00.000Z',
      priority: 'CRITICAL',
      title: 'Critical Detection',
      message: 'NEW OBJECT DETECTED - BBOX 4. UNKNOWN SIGNATURE DETECTED IN FORBIDDEN_ZONE_A.',
      classification: 'Unknown Signature',
      confidence: 0.92,
      border_color: 'on-tertiary-container',
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

  return (
    <aside className="static right-0 top-16 h-[calc(100vh-64px)] w-80 flex-shrink-0 flex flex-col bg-surface-container bezel-glow z-40 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-outline-variant/10 flex items-center gap-3">
        <span className="material-symbols-outlined text-secondary">analytics</span>
        <h2 className="font-headline font-bold text-sm tracking-tight text-white">DATA ANALYTICS &amp; ALERTS</h2>
      </div>

      {/* Change Detection Section */}
      <div className="p-5 flex flex-col gap-4 border-b border-outline-variant/10">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest">Change Detection</h3>
          {changeReport ? (
            <div className="flex gap-1">
              <AlertChip label={`${changeReport.summary.new_count} NEW`} type="critical" />
              <AlertChip label={`${changeReport.summary.moved_count} MOV`} type="info" />
            </div>
          ) : (
            <span className="text-[9px] font-mono text-secondary">30D TREND</span>
          )}
        </div>

        {/* Scan Summary */}
        {latestScan && (
          <div className="bg-surface-container-low p-3 bezel-glow">
            <div className="flex justify-between mb-2">
              <span className="text-[9px] font-mono text-on-surface-variant">LAST_SCAN</span>
              <span className="text-[9px] font-mono text-secondary">
                {latestScan.timestamp.slice(11, 19)} Z
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-[9px] font-mono text-on-surface-variant">
              <span>CHIPS: <span className="text-white">{latestScan.chip_count}</span></span>
              <span>DETEC: <span className="text-white">{latestScan.total_detections}</span></span>
              <span>HVT: <span className="text-on-tertiary-container">{latestScan.high_value_targets.length}</span></span>
              <span>SCAN_ID: <span className="text-secondary">{latestScan.scan_id.slice(0, 8)}</span></span>
            </div>
          </div>
        )}

        {/* Micro Histograms */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <span className="w-16 text-[9px] font-mono text-on-surface-variant">NAVAL</span>
            <div className="flex-1 flex items-end gap-1 h-8">
              <div className="bg-outline-variant w-1 h-3"></div>
              <div className="bg-outline-variant w-1 h-5"></div>
              <div className="bg-secondary w-1 h-8"></div>
              <div className="bg-secondary w-1 h-6"></div>
              <div className="bg-outline-variant w-1 h-4"></div>
              <div className="bg-outline-variant w-1 h-2"></div>
              <div className="bg-secondary w-1 h-7"></div>
              <div className="bg-secondary w-1 h-5"></div>
              <div className="bg-outline-variant w-1 h-3"></div>
              <div className="bg-outline-variant w-1 h-4"></div>
            </div>
            <span className="text-[10px] font-mono text-white">+12%</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="w-16 text-[9px] font-mono text-on-surface-variant">AERIAL</span>
            <div className="flex-1 flex items-end gap-1 h-8">
              <div className="bg-secondary w-1 h-4"></div>
              <div className="bg-secondary w-1 h-3"></div>
              <div className="bg-outline-variant w-1 h-6"></div>
              <div className="bg-outline-variant w-1 h-8"></div>
              <div className="bg-secondary w-1 h-5"></div>
              <div className="bg-secondary w-1 h-4"></div>
              <div className="bg-outline-variant w-1 h-3"></div>
              <div className="bg-outline-variant w-1 h-2"></div>
              <div className="bg-secondary w-1 h-6"></div>
              <div className="bg-secondary w-1 h-7"></div>
            </div>
            <span className="text-[10px] font-mono text-on-tertiary-container">-04%</span>
          </div>
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
                  <span className="text-[9px] font-mono text-on-surface-variant whitespace-nowrap">
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
