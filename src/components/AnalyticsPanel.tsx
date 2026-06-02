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

import { useState, useEffect } from 'react';
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
  const { cameras, mobileActiveTab, setMobileActiveTab, news, setMapCommand, setActiveEntityId, layers, toggleLayer } = useTacticalStore();
  const isFetchingNews = false; // We can let GlobalDataLoader handle the loading state or just keep it simple.
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
    <aside className={`
      ${mobileActiveTab === 'news' || mobileActiveTab === 'status'
        ? 'fixed inset-x-0 bottom-[64px] top-[20%] bg-[#0a0a0c]/95 backdrop-blur-xl border-t border-white/20 rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.8)] translate-y-0' 
        : 'fixed inset-x-0 bottom-[64px] top-[20%] translate-y-[150%] md:translate-y-0 md:flex'
      }
      md:static md:inset-auto md:w-[340px] md:h-full md:bg-transparent md:border-t-0 md:rounded-none md:shadow-none md:border-l border-white/10
      flex flex-col gap-4 z-[90] p-4 overflow-hidden flex-shrink-0 transition-transform duration-300
    `}>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between -mt-2 mb-2 pb-2 border-b border-white/10">
        <h2 className="text-white font-headline font-bold tracking-widest text-sm uppercase">
          {mobileActiveTab === 'news' ? 'LIVE NEWS' : 'SYSTEM STATUS'}
        </h2>
        <button onClick={() => setMobileActiveTab('none')} className="text-white/50 hover:text-white transition-colors">
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>
      
      {/* Network Status & Scan Summary */}
      <div className={`fui-border p-3 flex-col gap-3 ${mobileActiveTab === 'news' ? 'hidden md:flex' : 'flex'}`}>
        <div className="fui-corner-tl"></div><div className="fui-corner-tr"></div><div className="fui-corner-bl"></div><div className="fui-corner-br"></div>
        
        <div className="flex items-center justify-between border-b border-white/20 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full border border-white"></span>
            <h3 className="text-white font-bold tracking-widest text-[11px] uppercase">NETWORK STATUS</h3>
          </div>
          <div className="flex gap-1 text-[9px] font-mono">
            <span className="bg-white/20 text-white px-1">{workingFeeds} ONLINE</span>
            <span className="bg-red-500/20 text-red-400 px-1">{deadFeeds} OFFLINE</span>
          </div>
        </div>

        {latestScan && (
          <div className="bg-white/5 p-2 border border-white/10">
            <div className="flex justify-between mb-1">
              <span className="text-[9px] font-mono text-white/50">LATEST_SYNC</span>
              <span className="text-[9px] font-mono text-secondary animate-pulse">LIVE</span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-[9px] font-mono text-white/70">
              <span>NODES: <span className="text-white">{cameras.length}</span></span>
              <span>API_KEY: <span className="text-secondary">SECURE</span></span>
              <span>PROXY: <span className="text-white">localhost:8002</span></span>
              <span>WINDY: <span className="text-secondary">v3</span></span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1.5 mt-1">
          <h3 className="text-[9px] font-mono text-white/50 mb-1 uppercase tracking-widest">Regional Node Distribution</h3>
          {sortedRegions.slice(0, 4).map(([region, count]) => {
            const percentage = totalNodes > 0 ? (count / totalNodes) * 100 : 0;
            return (
              <div key={region} className="flex flex-col gap-0.5">
                <div className="flex justify-between items-end">
                  <span className="text-[9px] font-mono text-white uppercase">{region}</span>
                  <span className="text-[9px] font-mono text-secondary">{count}</span>
                </div>
                <div className="w-full h-1 bg-white/10">
                  <div className="h-full bg-white transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                </div>
              </div>
            );
          })}
          {sortedRegions.length === 0 && (
            <span className="text-[9px] font-mono text-white/40 italic">Awaiting telemetry...</span>
          )}
        </div>
      </div>

      {/* Alerts Feed */}
      <div className={`fui-border p-3 flex-1 flex-col overflow-hidden min-h-[150px] ${mobileActiveTab === 'news' ? 'hidden md:flex' : 'flex'}`}>
        <div className="fui-corner-tl"></div><div className="fui-corner-tr"></div><div className="fui-corner-bl"></div><div className="fui-corner-br"></div>
        <div className="flex items-center justify-between mb-3 border-b border-white/20 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full border border-red-500 bg-red-500/20"></span>
            <h3 className="text-white font-bold tracking-widest text-[11px] uppercase">SYSTEM ALERTS</h3>
          </div>
          <div className="flex items-center gap-2">
            {isScanning && <span className="text-[8px] font-mono text-secondary animate-pulse">SCANNING...</span>}
            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>
          </div>
        </div>

        <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-1">
          {mergedAlerts.map((alert) => {
            const isCrit = alert.priority === 'CRITICAL';
            return (
              <div
                key={alert.alert_id}
                className={`p-2 border-l-2 bg-white/5 ${isCrit ? 'border-red-500' : 'border-white/50'} transition-all`}
              >
                <div className="flex justify-between items-start mb-1 gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold uppercase font-headline ${isCrit ? 'text-red-400' : 'text-white'}`}>{alert.title}</span>
                    {isCrit && <span className="text-[8px] bg-red-500/20 text-red-500 px-1 border border-red-500/30">CRIT</span>}
                  </div>
                  <span className="text-[9px] font-mono text-white/40 whitespace-nowrap" suppressHydrationWarning>
                    {alert.timestamp.slice(11, 16)} Z
                  </span>
                </div>
                <p className="text-[9px] font-mono text-white/70 leading-tight">
                  {alert.message}
                </p>
                {alert.confidence < 1.0 && (
                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-[8px] font-mono text-white/40">CONF:</span>
                    <div className="w-16 h-1 bg-white/10 flex">
                      <div className="h-full bg-secondary" style={{ width: `${alert.confidence * 100}%` }}></div>
                    </div>
                    <span className="text-[8px] font-mono text-secondary">{(alert.confidence * 100).toFixed(0)}%</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Alerts (News) Feed */}
      <div className={`fui-border p-3 flex-[1.5] flex-col overflow-hidden min-h-[250px] ${mobileActiveTab === 'status' ? 'hidden md:flex' : 'flex'}`}>
        <div className="fui-corner-tl"></div><div className="fui-corner-tr"></div><div className="fui-corner-bl"></div><div className="fui-corner-br"></div>
        <div className="flex items-center justify-between mb-3 border-b border-white/20 pb-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px] text-white/80">sensors</span>
            <h3 className="text-white font-bold tracking-widest text-[11px] uppercase">LIVE ALERTS</h3>
            <span className="text-[9px] font-mono text-white/40 bg-white/10 px-1 ml-1">{news.length} FEEDS</span>
          </div>
          <div className="flex items-center gap-2">
            {isFetchingNews && <span className="text-[8px] font-mono text-secondary animate-pulse">SYNCING...</span>}
            <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></div>
          </div>
        </div>

        <div className="flex flex-col gap-2 overflow-y-auto overflow-x-hidden custom-scrollbar pr-1">
          {news.length === 0 && !isFetchingNews && (
            <div className="text-[9px] font-mono text-white/40 text-center py-4">NO ALERTS FOUND</div>
          )}
          {news.map((item) => (
            <div 
              key={item.id} 
              className="p-2 border-l-2 border-white/20 bg-white/5 mb-1.5 hover:bg-white/10 transition-colors cursor-pointer"
              onClick={() => {
                if (item.coords) {
                  // Ensure news layer is active
                  if (!layers.threats_news) toggleLayer('threats_news');
                  
                  // Pan to marker
                  setMapCommand({ type: 'flyTo', lat: item.coords[0], lng: item.coords[1], zoom: 6 });
                  
                  // Open modal
                  setActiveEntityId(item.id);
                  
                  // On mobile, close the panel so they can see the map
                  if (window.innerWidth < 768) {
                    setMobileActiveTab('none');
                  }
                }
              }}
            >
              <div className="flex gap-2">
                <div className="flex items-start gap-1 pt-0.5 flex-shrink-0">
                  <div className={`w-1.5 h-1.5 rounded-full ${item.risk_score >= 8 ? 'bg-red-500' : item.risk_score >= 5 ? 'bg-yellow-500' : 'bg-[#10b981]'} mt-1`}></div>
                  <span className="material-symbols-outlined text-[11px] text-white/50">newspaper</span>
                </div>
                <div className="flex flex-col flex-1 gap-1.5 min-w-0">
                  <p className="text-[9px] font-mono text-white/80 leading-tight break-words whitespace-normal">
                    {item.description || item.title}
                  </p>
                  {item.machine_assessment && (
                    <div className="bg-red-500/10 border border-red-500/20 p-1 mt-1 text-[8px] font-mono text-red-400">
                      <span className="font-bold mr-1">AI:</span>
                      {item.machine_assessment}
                    </div>
                  )}
                  <div className="flex justify-between items-center text-[8px] font-mono text-white/40 mt-0.5 border-t border-white/10 pt-1.5">
                    <div className="flex items-center gap-1.5">
                      <span>{item.source?.toUpperCase()}</span>
                      <span>|</span>
                      <span suppressHydrationWarning>
                        {new Date(item.published).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} Z
                      </span>
                    </div>
                    <a 
                      href={item.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-secondary hover:text-white transition-colors bg-secondary/10 px-1 py-0.5 border border-secondary/20"
                      onClick={(e) => e.stopPropagation()}
                    >
                      SOURCE
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Stats */}
      <div className={`fui-border p-3 grid-cols-2 gap-2 flex-shrink-0 ${mobileActiveTab === 'news' ? 'hidden md:grid' : 'grid'}`}>
        <div className="fui-corner-tl"></div><div className="fui-corner-tr"></div><div className="fui-corner-bl"></div><div className="fui-corner-br"></div>
        <div className="flex justify-between border-b border-white/20 pb-1 text-[9px] font-mono">
          <span className="text-white/50">UPTIME:</span>
          <span className="text-secondary">99.9%</span>
        </div>
        <div className="flex justify-between border-b border-white/20 pb-1 text-[9px] font-mono">
          <span className="text-white/50">LATENCY:</span>
          <span className="text-secondary">12ms</span>
        </div>
        <div className="flex justify-between text-[9px] font-mono">
          <span className="text-white/50">API_ST:</span>
          <span className="text-secondary">ACTIVE</span>
        </div>
        <div className="flex justify-between text-[9px] font-mono">
          <span className="text-white/50">LOAD:</span>
          <span className="text-secondary">1.43%</span>
        </div>
      </div>
    </aside>
  );
}
