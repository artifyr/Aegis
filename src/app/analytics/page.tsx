'use client';

import { useAnalytics } from '@/hooks/use-analytics';
import { useGlobalSurveillance } from '@/hooks/use-global-surveillance';

// ─── Mini Bar Chart (pure CSS) ──────────────────────────────────
function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="w-full h-full flex items-end">
      <div
        className="w-full transition-all duration-300 ease-out"
        style={{ height: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

// ─── Status Chip ────────────────────────────────────────────────
function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    NOMINAL: 'text-secondary bg-secondary/10',
    DEGRADED: 'text-tertiary-fixed-dim bg-tertiary-fixed-dim/10',
    CRITICAL: 'text-on-tertiary-container bg-on-tertiary-container/10',
  };
  return (
    <span className={`px-1.5 py-0.5 text-[8px] font-mono font-bold uppercase tracking-wider ${map[status] || 'text-on-surface-variant bg-surface-container-high'}`}>
      {status}
    </span>
  );
}

// ─── Stat Card ──────────────────────────────────────────────────
function StatCard({
  label,
  value,
  unit,
  sublabel,
}: {
  label: string;
  value: string | number;
  unit?: string;
  sublabel?: string;
}) {
  return (
    <div className="bg-surface-container-high p-5 bezel-glow flex flex-col justify-between">
      <span className="text-[9px] font-label text-on-surface-variant uppercase tracking-widest mb-3">{label}</span>
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-headline font-bold text-white tracking-tight">{value}</span>
        {unit && <span className="text-[10px] font-mono text-secondary">{unit}</span>}
      </div>
      {sublabel && <span className="text-[8px] font-mono text-on-surface-variant mt-1">{sublabel}</span>}
    </div>
  );
}

export default function AnalyticsPage() {
  const { data, loading, refresh } = useAnalytics();
  const { assets, status } = useGlobalSurveillance();

  // Derive max for bar chart scale
  const trendMax = data
    ? Math.max(...data.trend_30d.flatMap((d) => [d.naval, d.aerial]), 1)
    : 25;

  return (
    <main className="flex-1 w-full relative bg-surface-container-lowest h-full overflow-y-auto">
      {/* Top Bar */}
      <div className="sticky top-0 z-20 bg-surface-container-lowest/80 backdrop-blur-xl border-b border-outline-variant/10 px-8 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-[#66FCF1] font-bold text-lg font-headline uppercase tracking-wider">
            Advanced Analytics
          </h1>
          <p className="font-mono text-[10px] text-on-surface-variant mt-0.5">
            PROCESSING_DATA_STREAMS // SIGNAL: {status}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[9px] text-on-surface-variant">
            LAST_SYNC: {data?.timestamp?.slice(11, 19) ?? '--:--:--'} Z
          </span>
          <button
            onClick={refresh}
            className="px-3 py-1.5 border border-outline-variant/20 text-[9px] font-mono text-secondary uppercase tracking-wider hover:border-secondary/60 transition-colors cursor-pointer"
          >
            ↻ REFRESH
          </button>
        </div>
      </div>

      <div className="p-8 max-w-[1600px] mx-auto">
        {/* Loading state */}
        {loading && !data && (
          <div className="flex items-center gap-2 mb-6 animate-pulse">
            <div className="w-2 h-2 bg-secondary" />
            <span className="font-mono text-[10px] text-secondary tracking-wider">LOADING_ANALYTICS_STREAM...</span>
          </div>
        )}

        {/* ═══ KPI Row ═══ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Assets Tracked"
            value={data?.total_assets ?? assets.length}
            unit="ACTIVE"
            sublabel={`WS_STATUS: ${status}`}
          />
          <StatCard
            label="Avg Velocity"
            value={data?.avg_velocity_kts ?? 0}
            unit="KTS"
            sublabel={`MAX: ${data?.max_velocity_kts ?? 0} KTS`}
          />
          <StatCard
            label="Inference Scans / 24H"
            value={data?.system?.inference_scans_24h ?? 0}
            unit="SCANS"
            sublabel="NEURAL_OBSERVER ACTIVE"
          />
          <StatCard
            label="System Uptime"
            value={data?.system?.uptime_pct ?? 0}
            unit="%"
            sublabel={`LATENCY: ${data?.system?.latency_ms ?? '--'}ms`}
          />
        </div>

        {/* ═══ Main Grid ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* 30-Day Detection Trend */}
          <div className="lg:col-span-2 bg-surface-container p-6 bezel-glow">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest">30-Day Detection Trend</h3>
              <div className="flex items-center gap-4 text-[8px] font-mono">
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#3cdcd1] inline-block" /> NAVAL</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#7bd6d1] inline-block" /> AERIAL</span>
              </div>
            </div>

            {data ? (
              <div className="flex items-end gap-[3px] h-48">
                {data.trend_30d.map((day, i) => (
                  <div key={day.date} className="flex-1 flex items-end gap-[1px] h-full group relative">
                    <div className="flex-1 h-full">
                      <MiniBar value={day.naval} max={trendMax} color="#3cdcd1" />
                    </div>
                    <div className="flex-1 h-full">
                      <MiniBar value={day.aerial} max={trendMax} color="#7bd6d1" />
                    </div>
                    {/* Tooltip on hover */}
                    <div
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 whitespace-nowrap px-2 py-1 text-[8px] font-mono text-[#bacac7]"
                      style={{
                        backdropFilter: 'blur(12px)',
                        backgroundColor: 'rgba(68, 71, 78, 0.40)',
                      }}
                    >
                      {day.date.slice(5)} — N:{day.naval} A:{day.aerial}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center">
                <span className="text-[10px] font-mono text-on-surface-variant animate-pulse">LOADING...</span>
              </div>
            )}

            {/* X-axis labels */}
            {data && (
              <div className="flex justify-between mt-2 text-[7px] font-mono text-on-surface-variant/50">
                <span>{data.trend_30d[0]?.date.slice(5)}</span>
                <span>{data.trend_30d[14]?.date.slice(5)}</span>
                <span>{data.trend_30d[29]?.date.slice(5)}</span>
              </div>
            )}
          </div>

          {/* Sector Threat Matrix */}
          <div className="bg-surface-container p-6 bezel-glow">
            <h3 className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest mb-5">Sector Threat Matrix</h3>
            <div className="flex flex-col gap-2">
              {(data?.sectors ?? []).map((sector) => {
                const barColor = sector.status === 'CRITICAL'
                  ? '#c31f29'
                  : sector.status === 'DEGRADED'
                  ? '#d4a84c'
                  : '#3cdcd1';
                return (
                  <div key={sector.id} className="bg-surface-container-low p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-mono text-white">{sector.id}</span>
                      <StatusChip status={sector.status} />
                    </div>
                    {/* Confidence bar */}
                    <div className="h-1.5 w-full bg-surface-container-lowest">
                      <div
                        className="h-full transition-all duration-500 ease-out"
                        style={{
                          width: `${sector.confidence}%`,
                          backgroundColor: barColor,
                          boxShadow: `0 0 6px ${barColor}40`,
                        }}
                      />
                    </div>
                    <span className="text-[8px] font-mono text-on-surface-variant mt-1 block text-right">
                      {sector.confidence}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ═══ Bottom Row ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Live Asset Table */}
          <div className="bg-surface-container p-6 bezel-glow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest">Live Asset Feed</h3>
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 ${status === 'LIVE' ? 'bg-[#3cdcd1] animate-pulse' : 'bg-red-500'}`} />
                <span className="text-[8px] font-mono text-on-surface-variant">{status}</span>
              </div>
            </div>

            {/* Table header */}
            <div className="grid grid-cols-5 gap-2 text-[8px] font-mono text-on-surface-variant uppercase tracking-wider pb-2 border-b border-outline-variant/10">
              <span>CALLSIGN</span>
              <span>CLASS</span>
              <span className="text-right">LAT</span>
              <span className="text-right">LNG</span>
              <span className="text-right">VEL</span>
            </div>

            {/* Table body — zebra layering per DESIGN.md */}
            <div className="flex flex-col mt-1 max-h-64 overflow-y-auto">
              {assets.map((asset, idx) => (
                <div
                  key={asset.id}
                  className={`grid grid-cols-5 gap-2 py-2 px-1 text-[9px] font-mono transition-colors duration-150 ${
                    idx % 2 === 0 ? 'bg-surface-container-low' : 'bg-surface-container'
                  }`}
                >
                  <span className="text-white truncate">{(asset as any).callsign || asset.id.slice(0, 8).toUpperCase()}</span>
                  <span className={`${asset.classification === 'Naval' ? 'text-[#3cdcd1]' : asset.classification === 'Aerial' ? 'text-[#7bd6d1]' : 'text-on-surface-variant'}`}>
                    {asset.classification.toUpperCase().slice(0, 6)}
                  </span>
                  <span className="text-right text-on-surface-variant">{asset.lat.toFixed(4)}</span>
                  <span className="text-right text-on-surface-variant">{asset.lng.toFixed(4)}</span>
                  <span className="text-right text-secondary">{asset.velocity.toFixed(1)}</span>
                </div>
              ))}
              {assets.length === 0 && (
                <div className="py-6 text-center text-[10px] font-mono text-on-surface-variant">
                  NO_ACTIVE_FEEDS — START BACKEND
                </div>
              )}
            </div>
          </div>

          {/* Classification Breakdown */}
          <div className="bg-surface-container p-6 bezel-glow">
            <h3 className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest mb-5">Classification Breakdown</h3>

            {data ? (
              <div className="flex flex-col gap-4">
                {Object.entries(data.classification_counts).map(([cls, count]) => {
                  const pct = Math.round((count / data.total_assets) * 100);
                  const color = cls === 'Naval' ? '#3cdcd1' : cls === 'Aerial' ? '#7bd6d1' : '#44474e';
                  return (
                    <div key={cls}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-[10px] font-mono text-white uppercase">{cls}</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-headline font-bold text-white">{count}</span>
                          <span className="text-[9px] font-mono text-on-surface-variant">{pct}%</span>
                        </div>
                      </div>
                      <div className="h-2 w-full bg-surface-container-lowest">
                        <div
                          className="h-full transition-all duration-700 ease-out"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: color,
                            boxShadow: `0 0 8px ${color}30`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center">
                <span className="text-[10px] font-mono text-on-surface-variant animate-pulse">LOADING...</span>
              </div>
            )}

            {/* System Health Readout */}
            {data && (
              <div className="mt-8 pt-4 border-t border-outline-variant/10">
                <span className="text-[9px] font-label text-on-surface-variant uppercase tracking-widest block mb-3">System Health</span>
                <div className="grid grid-cols-2 gap-3 text-[9px] font-mono text-on-surface-variant">
                  <div className="flex justify-between bg-surface-container-low p-2">
                    <span>UPTIME</span>
                    <span className="text-secondary">{data.system.uptime_pct}%</span>
                  </div>
                  <div className="flex justify-between bg-surface-container-low p-2">
                    <span>LATENCY</span>
                    <span className="text-secondary">{data.system.latency_ms}ms</span>
                  </div>
                  <div className="flex justify-between bg-surface-container-low p-2">
                    <span>WS_CONN</span>
                    <span className="text-secondary">{data.system.ws_connections}</span>
                  </div>
                  <div className="flex justify-between bg-surface-container-low p-2">
                    <span>SCANS_24H</span>
                    <span className="text-secondary">{data.system.inference_scans_24h}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
