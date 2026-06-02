'use client';

import { useState, useEffect } from 'react';
import { useTacticalStore } from '@/store/tactical-store';
import { getThreatSeverity } from '@/lib/ai-engine';

// ─── Mini SVG Line Chart for Live Data ─────────────────────────
function LiveSparkline({ data, color, height = 100 }: { data: number[]; color: string; height?: number }) {
  if (data.length <= 1) return <div style={{ height }} className="w-full flex items-center justify-center text-[10px] text-white/30 font-mono">WAITING FOR DATA...</div>;
  
  const min = Math.min(...data) * 0.9;
  const max = Math.max(...data) * 1.1 || 10;
  const range = max - min;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((val - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full relative" style={{ height }}>
      <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
          vectorEffect="non-scaling-stroke"
          className="drop-shadow-lg"
          style={{ filter: `drop-shadow(0 0 4px ${color}80)` }}
        />
        {/* Gradient fill under the line */}
        <polygon
          fill={`url(#gradient-${color.replace('#', '')})`}
          points={`0,100 ${points} 100,100`}
          opacity="0.3"
        />
        <defs>
          <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// ─── Status Chip ────────────────────────────────────────────────
function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    NOMINAL: 'text-green-400 bg-green-400/10 border-green-400/30',
    DEGRADED: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
    CRITICAL: 'text-red-500 bg-red-500/10 border-red-500/30',
  };
  return (
    <span className={`px-2 py-0.5 text-[8px] font-mono font-bold uppercase tracking-wider border ${map[status] || 'text-white bg-white/10'}`}>
      {status}
    </span>
  );
}

// ─── Stat Card ──────────────────────────────────────────────────
function StatCard({ label, value, unit, sublabel }: { label: string; value: string | number; unit?: string; sublabel?: string }) {
  return (
    <div className="fui-border bg-black/60 p-5 flex flex-col justify-between relative backdrop-blur-sm">
      <div className="fui-corner-tl"></div><div className="fui-corner-tr"></div><div className="fui-corner-bl"></div><div className="fui-corner-br"></div>
      <span className="text-[9px] font-label text-white/50 uppercase tracking-widest mb-3">{label}</span>
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-headline font-bold text-white tracking-tight">{value}</span>
        {unit && <span className="text-[10px] font-mono text-secondary">{unit}</span>}
      </div>
      {sublabel && <span className="text-[8px] font-mono text-white/40 mt-1">{sublabel}</span>}
    </div>
  );
}

// ─── Lightweight Markdown Parser for AI Output ──────────────────
function parseMarkdown(text: string) {
  if (!text) return '';
  const lines = text.split('\n');
  
  return lines.map((line, index) => {
    const trimmed = line.trim();
    
    // Headers
    if (trimmed.startsWith('### ')) {
      return (
        <h4 key={index} className="text-secondary font-bold text-[10px] mt-2.5 mb-1 uppercase tracking-wider font-headline">
          {renderInlineMarkdown(trimmed.substring(4))}
        </h4>
      );
    }
    if (trimmed.startsWith('## ')) {
      return (
        <h3 key={index} className="text-secondary font-bold text-[11px] mt-3.5 mb-1.5 uppercase tracking-widest font-headline border-b border-white/10 pb-0.5">
          {renderInlineMarkdown(trimmed.substring(3))}
        </h3>
      );
    }
    if (trimmed.startsWith('# ')) {
      return (
        <h2 key={index} className="text-white font-bold text-[12px] mt-3.5 mb-2 uppercase tracking-widest font-headline">
          {renderInlineMarkdown(trimmed.substring(2))}
        </h2>
      );
    }
    
    // Bullet lists
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      return (
        <div key={index} className="flex gap-1.5 ml-2 my-0.5 items-start text-white/90">
          <span className="text-secondary">•</span>
          <span className="flex-1">{renderInlineMarkdown(trimmed.substring(2))}</span>
        </div>
      );
    }
    
    // Empty lines
    if (trimmed === '') {
      return <div key={index} className="h-1.5" />;
    }
    
    // Paragraphs
    return (
      <p key={index} className="my-1 leading-relaxed text-white/90">
        {renderInlineMarkdown(line)}
      </p>
    );
  });
}

function renderInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="bg-white/10 px-1 py-0.5 font-mono text-[8px] text-yellow-400 rounded">{part.slice(1, -1)}</code>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i} className="italic text-white/80">{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);
  const store = useTacticalStore();
  
  // Rolling data for graphs
  const [history, setHistory] = useState<{ time: string, aviation: number, maritime: number }[]>([]);

  // Aegis AI Core State
  const [aiTab, setAiTab] = useState<'briefing' | 'chat'>('briefing');
  const [loading, setLoading] = useState(false);
  const [briefingText, setBriefingText] = useState<string>('');
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const [statusMsg, setStatusMsg] = useState('COGNITIVE CORE IDLE');

  const getIntelligenceContext = () => {
    // Map earthquakes from store to EarthquakeEvent[]
    const earthquakes = store.earthquakes.map((eq: any) => ({
      id: String(eq.id),
      magnitude: eq.mag || eq.magnitude || 0,
      location: eq.title || eq.place || 'Unknown Location',
      latitude: eq.lat || 0,
      longitude: eq.lng || 0,
      depth: eq.depth || 0,
      timestamp: eq.date || eq.time || new Date().toISOString(),
      tsunami: eq.tsunami ? true : false,
      felt: eq.felt || null,
      alert: eq.alert || null,
    }));

    // Map news from store to NewsItem[]
    const news = store.news.map((item: any) => ({
      id: String(item.id),
      title: item.title || '',
      description: item.description || '',
      link: item.link || '',
      published: item.date || item.published || new Date().toISOString(),
      source: item.source || 'Unknown OSINT',
      risk_score: item.risk_score || 0,
      coords: item.coords || null,
      machine_assessment: item.machine_assessment || null,
    }));

    // Map strategic bases, nuclear facilities, weather events and incidents to ThreatEvent[]
    const threats: any[] = [];

    // 1. Incidents
    store.incidents.forEach((inc: any) => {
      threats.push({
        id: String(inc.id),
        type: 'OSINT_INCIDENT',
        title: inc.name || 'Active Incident',
        description: inc.html || '',
        severity: getThreatSeverity(inc.name || '', inc.html || ''),
        region: 'Global',
        latitude: inc.lat || 0,
        longitude: inc.lng || 0,
        timestamp: inc.date || new Date().toISOString(),
        source: 'AEGIS OSINT Mapper'
      });
    });

    // 2. Nuclear Facilities
    store.nuclearFacilities.forEach((nuc: any) => {
      threats.push({
        id: String(nuc.id),
        type: 'NUCLEAR_FACILITY',
        title: nuc.name,
        description: `Nuclear facility in ${nuc.city}, ${nuc.country}. Status: ${nuc.status}`,
        severity: nuc.status === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
        region: nuc.country || 'Global',
        latitude: nuc.lat,
        longitude: nuc.lng,
        timestamp: new Date().toISOString(),
        source: 'Aegis Strategic Intel',
      });
    });

    // 3. Strategic Bases
    store.strategicBases.forEach((base: any) => {
      threats.push({
        id: String(base.id),
        type: 'STRATEGIC_BASE',
        title: base.callsign || 'Strategic Base',
        description: `${base.type || 'Base'} in ${base.country}. Status: ${base.status}`,
        severity: base.status === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
        region: base.country || 'Global',
        latitude: base.lat,
        longitude: base.lng,
        timestamp: new Date().toISOString(),
        source: 'Aegis Strategic Intel',
      });
    });

    // 4. Severe Weather Events
    store.weatherEvents.forEach((w: any) => {
      threats.push({
        id: String(w.id),
        type: 'SEVERE_WEATHER',
        title: w.title || 'Weather Alert',
        description: `Severe weather event. Provider: ${w.provider || 'N/A'}. Details: ${w.area || 'Global'}`,
        severity: w.severity === 'high' ? 'HIGH' : w.severity === 'medium' ? 'ELEVATED' : 'LOW',
        region: w.area || 'Global',
        latitude: w.lat,
        longitude: w.lng,
        timestamp: w.date || new Date().toISOString(),
        source: w.source || 'NASA/NOAA',
      });
    });

    return {
      earthquakes,
      news,
      threats,
      cyberAlerts: [], // Emtpy array as active feed is not implemented
      timestamp: new Date().toISOString(),
    };
  };

  const generateBriefing = async () => {
    if (loading) return;
    setLoading(true);
    setStatusMsg('FUSING SENSOR CHANNELS...');
    try {
      const response = await fetch('/api/ai/briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: getIntelligenceContext() }),
      });
      const data = await response.json();
      if (response.ok && data.briefing) {
        setBriefingText(data.briefing);
        localStorage.setItem('aegis_ai_briefing', data.briefing);
        setStatusMsg('ANALYSIS COMPLETE');
      } else {
        setBriefingText(`[ERROR] Briefing failed: ${data.error || 'Unknown response structure'}`);
        setStatusMsg('CORE COMPROMISED');
      }
    } catch (e: any) {
      setBriefingText(`[ERROR] Network anomaly: ${e.message}`);
      setStatusMsg('COMMS OFFLINE');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || loading) return;
    const userMessage = chatInput.trim();
    setChatInput('');
    const newHistory = [...chatHistory, { role: 'user', text: userMessage } as const];
    setChatHistory(newHistory);
    localStorage.setItem('aegis_ai_chat_history', JSON.stringify(newHistory));
    setLoading(true);
    setStatusMsg('RUNNING COGNITIVE SIMULATION...');

    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userMessage,
          context: getIntelligenceContext()
        }),
      });
      const data = await response.json();
      if (response.ok && data.analysis) {
        const updatedHistory = [...newHistory, { role: 'assistant', text: data.analysis } as const];
        setChatHistory(updatedHistory);
        localStorage.setItem('aegis_ai_chat_history', JSON.stringify(updatedHistory));
        setStatusMsg('COGNITIVE FEEDBACK READY');
      } else {
        const updatedHistory = [...newHistory, { role: 'assistant', text: `[ERROR] Analysis failure: ${data.error || 'Invalid API payload'}` } as const];
        setChatHistory(updatedHistory);
        localStorage.setItem('aegis_ai_chat_history', JSON.stringify(updatedHistory));
        setStatusMsg('CORE ERROR');
      }
    } catch (e: any) {
      const updatedHistory = [...newHistory, { role: 'assistant', text: `[ERROR] Connection reset: ${e.message}` } as const];
      setChatHistory(updatedHistory);
      localStorage.setItem('aegis_ai_chat_history', JSON.stringify(updatedHistory));
      setStatusMsg('COMMS RETRYING');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);

    // Load cached AI state from localStorage
    const cachedBriefing = localStorage.getItem('aegis_ai_briefing');
    if (cachedBriefing) {
      setBriefingText(cachedBriefing);
      setStatusMsg('ANALYSIS RESTORED');
    }

    const cachedChat = localStorage.getItem('aegis_ai_chat_history');
    if (cachedChat) {
      try {
        setChatHistory(JSON.parse(cachedChat));
      } catch (e) {
        console.warn('Failed to parse cached chat history', e);
      }
    }
    
    // Every second, capture current asset counts for the live graph
    const interval = setInterval(() => {
      setHistory(prev => {
        const now = new Date();
        const timeStr = `${now.getUTCMinutes()}:${now.getUTCSeconds().toString().padStart(2, '0')}`;
        const newRecord = {
          time: timeStr,
          aviation: useTacticalStore.getState().flights.length,
          maritime: useTacticalStore.getState().ships.length
        };
        const updated = [...prev, newRecord];
        if (updated.length > 30) updated.shift(); // Keep last 30 seconds
        return updated;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return <div className="p-8 text-white font-mono">INIT ANALYTICS ENGINE...</div>;

  // Compute live metrics
  const totalAssets = store.flights.length + store.ships.length + store.satellites.length + store.cameras.length;
  const activeHazards = store.earthquakes.length + store.incidents.length;
  const stratPoints = store.strategicBases.length + store.nuclearFacilities.length;
  
  // Classifications
  const totalElements = totalAssets + activeHazards + stratPoints;
  const clsAviation = store.flights.length;
  const clsMaritime = store.ships.length + store.ports.length + store.chokepoints.length;
  const clsSpace = store.satellites.length;
  const clsGround = totalElements - clsAviation - clsMaritime - clsSpace;

  const getPct = (val: number) => totalElements > 0 ? Math.round((val / totalElements) * 100) : 0;

  // Sector logic based on live coordinates
  const sectors = [
    { id: 'NORTHCOM (NA)', bounds: { lat: [15, 90], lng: [-170, -50] } },
    { id: 'EUCOM (EU)', bounds: { lat: [35, 90], lng: [-10, 40] } },
    { id: 'CENTCOM (ME)', bounds: { lat: [10, 45], lng: [30, 75] } },
    { id: 'INDOPACOM (AP)', bounds: { lat: [-40, 45], lng: [75, 180] } }
  ];

  const sectorThreats = sectors.map(sec => {
    let threatScore = 0;
    let incidentCount = 0;
    let militaryFlightCount = 0;
    let hazardCount = 0;
    
    const inBounds = (lat: number, lng: number) => 
      lat >= sec.bounds.lat[0] && lat <= sec.bounds.lat[1] && 
      lng >= sec.bounds.lng[0] && lng <= sec.bounds.lng[1];

    store.incidents.forEach(inc => {
      if (inBounds(inc.lat, inc.lng)) {
        threatScore += 15; // Incidents have high weight
        incidentCount++;
      }
    });

    store.earthquakes.forEach(eq => {
      if (inBounds(eq.lat, eq.lng)) {
        threatScore += 5; // Moderate weight for natural hazards
        hazardCount++;
      }
    });

    store.flights.forEach(f => {
      if (f.category === 'military' && inBounds(f.lat, f.lng)) {
        threatScore += 0.2; // Low weight due to high volume (especially in NA)
        militaryFlightCount++;
      }
    });

    store.nuclearFacilities.forEach(nf => {
      if (inBounds(nf.lat, nf.lng)) {
        threatScore += 2; // Baseline strategic tension
      }
    });

    store.strategicBases.forEach(base => {
      if (inBounds(base.lat, base.lng)) {
        threatScore += 1; // Baseline strategic tension
      }
    });
    
    // Calculate final threat score normalized against a baseline of 300
    const confidence = Math.min(100, Math.max(0, Math.round((threatScore / 300) * 100)));
    const status = confidence >= 75 ? 'CRITICAL' : confidence >= 40 ? 'DEGRADED' : 'NOMINAL';
    return { ...sec, confidence, status, details: { incidents: incidentCount, milFlights: militaryFlightCount, hazards: hazardCount } };
  });

  return (
    <main className="flex-1 w-full relative bg-[#0b0c10] h-full overflow-y-auto">
      {/* Top Bar */}
      <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-xl border-b border-white/10 px-4 md:px-8 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-white font-bold text-lg font-headline uppercase tracking-wider">
            GLOBAL ANALYTICS COMMAND
          </h1>
          <p className="font-mono text-[10px] text-white/50 mt-0.5">
            LIVE TELEMETRY // REAL-TIME SENSOR FUSION
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="font-mono text-[9px] text-white/70">
              DATALINK ACTIVE
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-8 max-w-[1600px] mx-auto pb-20 md:pb-8">
        {/* ═══ KPI Row ═══ */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 md:gap-4 mb-4 md:mb-8">
          <StatCard
            label="Total Mobile Assets"
            value={totalAssets}
            unit="TRK"
            sublabel="FLIGHTS, SHIPS, SATS"
          />
          <StatCard
            label="Maritime Vessels"
            value={store.ships.length}
            unit="VSL"
            sublabel="LIVE AIS TRACKING"
          />
          <StatCard
            label="Active Hazards"
            value={activeHazards}
            unit="EVT"
            sublabel="INCIDENTS & QUAKES"
          />
          <StatCard
            label="Strategic Points"
            value={stratPoints}
            unit="LOC"
            sublabel="BASES & FACILITIES"
          />
          <StatCard
            label="Space / LEO Coverage"
            value={store.satellites.length}
            unit="SATS"
            sublabel="ORBITAL ASSETS"
          />
        </div>

        {/* ═══ Main Grid ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-8">
          
          {/* Real-Time Telemetry Graph */}
          <div className="lg:col-span-2 fui-border bg-black/40 p-6 relative">
            <div className="fui-corner-tl"></div><div className="fui-corner-tr"></div><div className="fui-corner-bl"></div><div className="fui-corner-br"></div>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-[10px] font-label text-white/60 uppercase tracking-widest">Real-Time Traffic Telemetry (Last 30s)</h3>
              <div className="flex items-center gap-4 text-[8px] font-mono text-white">
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#0ea5e9] inline-block" /> AVIATION</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#10b981] inline-block" /> MARITIME</span>
              </div>
            </div>

            <div className="relative h-48 w-full border-b border-l border-white/10 p-2">
              <div className="absolute inset-0 pt-2 pb-2 pl-2 pr-2">
                {/* Aviation Line */}
                <div className="absolute inset-0">
                  <LiveSparkline data={history.map(d => d.aviation)} color="#0ea5e9" height={175} />
                </div>
                {/* Maritime Line */}
                <div className="absolute inset-0">
                  <LiveSparkline data={history.map(d => d.maritime)} color="#10b981" height={175} />
                </div>
              </div>
            </div>
            {/* X-axis labels */}
            <div className="flex justify-between mt-2 text-[8px] font-mono text-white/40 px-2">
              <span>{history[0]?.time || '00:00'}</span>
              <span>{history[Math.floor(history.length/2)]?.time || '00:00'}</span>
              <span>{history[history.length-1]?.time || '00:00'}</span>
            </div>
          </div>

          {/* Sector Threat Matrix */}
          <div className="fui-border bg-black/40 p-6 relative">
            <div className="fui-corner-tl"></div><div className="fui-corner-tr"></div><div className="fui-corner-bl"></div><div className="fui-corner-br"></div>
            <h3 className="text-[10px] font-label text-white/60 uppercase tracking-widest mb-5">Sector Threat Matrix</h3>
            <div className="flex flex-col gap-3">
              {sectorThreats.map((sector) => {
                const barColor = sector.status === 'CRITICAL' ? '#ef4444' : sector.status === 'DEGRADED' ? '#eab308' : '#22c55e';
                return (
                  <div key={sector.id} className="bg-white/5 border border-white/10 p-3 relative">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-mono text-white">{sector.id}</span>
                      <StatusChip status={sector.status} />
                    </div>
                    {/* Confidence bar */}
                    <div className="h-1.5 w-full bg-black">
                      <div
                        className="h-full transition-all duration-500 ease-out"
                        style={{ width: `${sector.confidence}%`, backgroundColor: barColor, boxShadow: `0 0 8px ${barColor}80` }}
                      />
                    </div>
                    <div className="text-[8px] font-mono text-white/40 mt-1 flex justify-between items-center">
                      <span>MIL:{sector.details.milFlights} HAZ:{sector.details.hazards} INC:{sector.details.incidents}</span>
                      <span>THREAT_LEVEL: {sector.confidence}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ═══ Bottom Row ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Live High-Velocity Asset Feed */}
          <div className="fui-border bg-black/40 p-6 relative">
            <div className="fui-corner-tl"></div><div className="fui-corner-tr"></div><div className="fui-corner-bl"></div><div className="fui-corner-br"></div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[10px] font-label text-white/60 uppercase tracking-widest">High-Velocity Asset Feed</h3>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#0ea5e9] animate-pulse" />
                <span className="text-[8px] font-mono text-white/50">LIVE SORT: SPEED</span>
              </div>
            </div>

            {/* Table header */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-[8px] font-mono text-white/50 uppercase tracking-wider pb-2 border-b border-white/10">
              <span>CALLSIGN</span>
              <span>CLASS</span>
              <span className="text-right hidden sm:block">LAT</span>
              <span className="text-right hidden sm:block">LNG</span>
              <span className="text-right">VEL (KTS)</span>
            </div>

            <div className="flex flex-col mt-1 max-h-[220px] overflow-y-auto custom-scrollbar pr-2">
              {[...store.flights, ...store.ships]
                .sort((a, b) => (b.velocity || 0) - (a.velocity || 0))
                .slice(0, 15)
                .map((asset: any, idx) => (
                <div key={`feed-${asset.id || asset.mmsi || asset.icao24}`} className={`grid grid-cols-3 sm:grid-cols-5 gap-2 py-2 px-1 text-[9px] font-mono transition-colors duration-150 ${idx % 2 === 0 ? 'bg-white/5' : 'bg-transparent'}`}>
                  <span className="text-white truncate">{asset.callsign || asset.name || 'UNKNOWN'}</span>
                  <span className={`${asset.icao24 ? 'text-[#0ea5e9]' : 'text-[#10b981]'}`}>
                    {asset.icao24 ? 'AERIAL' : 'NAVAL'}
                  </span>
                  <span className="text-right text-white/60 hidden sm:block">{asset.lat.toFixed(3)}</span>
                  <span className="text-right text-white/60 hidden sm:block">{asset.lng.toFixed(3)}</span>
                  <span className="text-right text-[#0ea5e9]">{(asset.velocity || 0).toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Classification Breakdown */}
          <div className="fui-border bg-black/40 p-6 relative">
            <div className="fui-corner-tl"></div><div className="fui-corner-tr"></div><div className="fui-corner-bl"></div><div className="fui-corner-br"></div>
            <h3 className="text-[10px] font-label text-white/60 uppercase tracking-widest mb-5">Global Domain Breakdown</h3>

            <div className="flex flex-col gap-5 mt-4">
              {[
                { name: 'AEROSPACE', count: clsAviation, color: '#0ea5e9' },
                { name: 'MARITIME', count: clsMaritime, color: '#10b981' },
                { name: 'ORBITAL', count: clsSpace, color: '#a855f7' },
                { name: 'TERRESTRIAL', count: clsGround, color: '#f59e0b' }
              ].map(domain => {
                const pct = getPct(domain.count);
                return (
                  <div key={domain.name}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-[10px] font-mono text-white uppercase">{domain.name}</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-headline font-bold text-white">{domain.count}</span>
                        <span className="text-[9px] font-mono text-white/50">{pct}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-black">
                      <div
                        className="h-full transition-all duration-700 ease-out"
                        style={{ width: `${pct}%`, backgroundColor: domain.color, boxShadow: `0 0 8px ${domain.color}60` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-8 p-3 border border-white/10 bg-white/5 flex justify-between items-center">
               <span className="text-[9px] font-mono text-white/50">SYSTEM DIAGNOSTICS</span>
               <span className="text-[9px] font-mono text-green-400 animate-pulse">ALL SYSTEMS NOMINAL</span>
            </div>
          </div>

          {/* Aegis AI Analyst */}
          <div className="fui-border bg-black/40 p-6 relative flex flex-col h-[380px]">
            <div className="fui-corner-tl"></div><div className="fui-corner-tr"></div><div className="fui-corner-bl"></div><div className="fui-corner-br"></div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-[10px] font-label text-white/60 uppercase tracking-widest flex items-center gap-1.5">
                <span className="material-symbols-outlined text-xs text-[#0ea5e9] animate-pulse">psychology</span>
                Aegis Tactical AI Analyst
              </h3>
              <span className={`text-[8px] font-mono border px-1.5 py-0.5 tracking-wider uppercase ${
                loading ? 'text-yellow-400 border-yellow-400/30 animate-pulse' : 'text-secondary border-secondary/30'
              }`}>
                {statusMsg}
              </span>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-3 border-b border-white/10 pb-2">
              <button
                onClick={() => setAiTab('briefing')}
                className={`flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider px-3 py-1.5 border transition-all ${
                  aiTab === 'briefing'
                    ? 'bg-secondary/10 border-secondary text-secondary font-bold'
                    : 'bg-transparent border-white/5 text-white/60 hover:text-white hover:border-white/20'
                }`}
              >
                <span className="material-symbols-outlined text-xs">description</span>
                Briefing
              </button>
              <button
                onClick={() => setAiTab('chat')}
                className={`flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider px-3 py-1.5 border transition-all ${
                  aiTab === 'chat'
                    ? 'bg-secondary/10 border-secondary text-secondary font-bold'
                    : 'bg-transparent border-white/5 text-white/60 hover:text-white hover:border-white/20'
                }`}
              >
                <span className="material-symbols-outlined text-xs">terminal</span>
                Ask Aegis
              </button>
            </div>

            {/* Tab content */}
            <div className="flex-1 min-h-0 flex flex-col justify-between">
              {aiTab === 'briefing' ? (
                <div className="flex flex-col h-full justify-between">
                  <div className="flex-1 bg-black/60 border border-white/5 p-3 font-mono text-[9px] text-white/80 overflow-y-auto leading-relaxed custom-scrollbar mb-3 select-text">
                    {loading && briefingText === '' ? (
                      <div className="flex flex-col items-center justify-center h-full gap-2">
                        <span className="material-symbols-outlined text-xl text-secondary animate-spin">sync</span>
                        <span className="text-[8px] uppercase tracking-widest text-white/40">Fusing Datalink Streams...</span>
                      </div>
                    ) : briefingText ? (
                      <div className="select-text pr-1">{parseMarkdown(briefingText)}</div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center text-white/40 px-4">
                        <span className="material-symbols-outlined text-3xl mb-2 text-white/20">satellite_alt</span>
                        <p className="uppercase tracking-widest text-[8px] mb-1">Datalink Ready</p>
                        <p className="text-[8px] text-white/30 lowercase">click generate to run a tactical assessment of active threats</p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={generateBriefing}
                    disabled={loading}
                    className="w-full bg-secondary/10 hover:bg-secondary/20 active:bg-secondary/30 disabled:bg-white/5 disabled:text-white/20 text-secondary border border-secondary/50 font-mono text-[10px] py-2.5 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all select-none"
                  >
                    <span className="material-symbols-outlined text-sm">bolt</span>
                    Generate Strategic Briefing
                  </button>
                </div>
              ) : (
                <div className="flex flex-col h-full justify-between">
                  <div className="flex-1 bg-black/60 border border-white/5 p-3 overflow-y-auto custom-scrollbar mb-3 flex flex-col gap-2 select-text">
                    {chatHistory.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center text-white/40 px-4 select-none">
                        <span className="material-symbols-outlined text-3xl mb-2 text-white/20">quick_reference_all</span>
                        <p className="uppercase tracking-widest text-[8px] mb-1">Cognitive Terminal Ready</p>
                        <p className="text-[8px] text-white/30 lowercase">ask anything regarding live flights, sea ships, or severe weather</p>
                      </div>
                    ) : (
                      chatHistory.map((msg, i) => (
                        <div key={i} className={`flex flex-col gap-1 border-b border-white/5 pb-2 last:border-0 ${
                          msg.role === 'user' ? 'items-end' : 'items-start'
                        }`}>
                          <span className={`text-[8px] font-mono font-bold tracking-wider uppercase ${
                            msg.role === 'user' ? 'text-secondary' : 'text-purple-400'
                          }`}>
                            {msg.role === 'user' ? 'OPERATOR' : 'AEGIS AI'}
                          </span>
                          <span className="text-[9px] font-mono text-white/95 leading-relaxed break-words max-w-full">
                            {msg.role === 'user' ? (
                              <div className="whitespace-pre-wrap">{msg.text}</div>
                            ) : (
                              parseMarkdown(msg.text)
                            )}
                          </span>
                        </div>
                      ))
                    )}
                    {loading && aiTab === 'chat' && (
                      <div className="flex items-center gap-2 py-1">
                        <span className="material-symbols-outlined text-xs text-secondary animate-spin">sync</span>
                        <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest">Processing request...</span>
                      </div>
                    )}
                  </div>
                  <form onSubmit={handleSendMessage} className="flex gap-2 select-none">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={loading ? "CORE PROCESSING..." : "ASK AEGIS ANYTHING..."}
                      disabled={loading}
                      className="flex-1 bg-black/60 border border-white/10 hover:border-white/25 focus:border-secondary focus:outline-none px-3 py-2 font-mono text-[9px] text-white placeholder-white/30 uppercase tracking-wider"
                    />
                    <button
                      type="submit"
                      disabled={loading || !chatInput.trim()}
                      className="bg-secondary/15 hover:bg-secondary/25 border border-secondary/50 disabled:bg-white/5 disabled:border-white/5 disabled:text-white/20 text-secondary px-4 flex items-center justify-center transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">send</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
