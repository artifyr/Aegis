'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTacticalStore } from '@/store/tactical-store';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Activity, 
  Flame, 
  Zap, 
  Copy, 
  MapPin, 
  ExternalLink, 
  Globe, 
  Calendar, 
  Hash, 
  X, 
  Search, 
  Database,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function ArchivePage() {
  const store = useTacticalStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Consolidate all records into a single uniform array
  const allRecords = useMemo(() => {
    const records: any[] = [];
    
    store.strategicBases.forEach(b => records.push({
      id: b.id || Math.random().toString(),
      type: 'STRATEGIC_BASE',
      name: b.name || b.codename || b.callsign || 'UNKNOWN BASE',
      location: `${b.lat?.toFixed(5)}, ${b.lng?.toFixed(5)}`,
      lat: b.lat,
      lng: b.lng,
      classification: b.status === 'INACTIVE' ? 'RESTRICTED' : 'TOP_SECRET',
      date: new Date().toISOString().split('T')[0],
      detail: b.type?.replace('_', ' ') || 'MILITARY INSTALLATION',
      status: b.status || 'ACTIVE',
      country: b.country || 'UNKNOWN',
      raw: b
    }));

    store.nuclearFacilities.forEach(n => records.push({
      id: n.id || Math.random().toString(),
      type: 'NUCLEAR_FACILITY',
      name: n.name || n.facility || 'UNKNOWN FACILITY',
      location: `${n.lat?.toFixed(5)}, ${n.lng?.toFixed(5)}`,
      lat: n.lat,
      lng: n.lng,
      classification: n.status?.includes('SEISMIC') ? 'TOP_SECRET' : 'RESTRICTED',
      date: new Date().toISOString().split('T')[0],
      detail: `${n.reactors} Reactors · ${n.capacityMW} MW`,
      status: n.status || 'OPERATIONAL',
      country: n.country || 'UNKNOWN',
      raw: n
    }));

    store.incidents.forEach(i => records.push({
      id: i.id || Math.random().toString(),
      type: 'INCIDENT',
      name: i.name || i.title || 'UNCLASSIFIED INCIDENT',
      location: `${i.lat?.toFixed(5)}, ${i.lng?.toFixed(5)}`,
      lat: i.lat,
      lng: i.lng,
      classification: 'CLASSIFIED',
      date: i.date || new Date().toISOString().split('T')[0],
      detail: i.description || i.severity || 'SECURITY EVENT',
      status: 'CRITICAL',
      country: 'GLOBAL FEED',
      raw: i
    }));

    store.earthquakes.forEach(e => records.push({
      id: e.id || Math.random().toString(),
      type: 'SEISMIC_EVENT',
      name: e.place || 'SEISMIC ANOMALY',
      location: `${e.lat?.toFixed(5)}, ${e.lng?.toFixed(5)}`,
      lat: e.lat,
      lng: e.lng,
      classification: 'UNCLASSIFIED',
      date: e.time ? new Date(e.time).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      detail: `Magnitude ${e.mag || e.magnitude || '?'}`,
      status: (e.mag || 0) >= 6.0 ? 'CRITICAL' : 'MONITORED',
      country: 'TECTONIC BOUNDARY',
      raw: e
    }));

    return records;
  }, [store.strategicBases, store.nuclearFacilities, store.incidents, store.earthquakes]);

  const filteredRecords = useMemo(() => {
    return allRecords.filter(rec => {
      if (activeTab !== 'ALL' && rec.type !== activeTab) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          rec.name.toLowerCase().includes(q) || 
          rec.id.toString().toLowerCase().includes(q) || 
          rec.location.includes(q) || 
          rec.detail.toLowerCase().includes(q) ||
          rec.country.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allRecords, activeTab, searchQuery]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const locateOnMap = (rec: any) => {
    let targetLayer: 'threats_strategic' | 'threats_nuclear' | 'threats_incidents' | 'hazards_earthquakes' | null = null;
    if (rec.type === 'STRATEGIC_BASE') targetLayer = 'threats_strategic';
    else if (rec.type === 'NUCLEAR_FACILITY') targetLayer = 'threats_nuclear';
    else if (rec.type === 'INCIDENT') targetLayer = 'threats_incidents';
    else if (rec.type === 'SEISMIC_EVENT') targetLayer = 'hazards_earthquakes';

    if (targetLayer && !store.layers[targetLayer]) {
      store.toggleLayer(targetLayer);
    }

    store.setMapCommand({
      type: 'flyTo',
      lat: rec.lat,
      lng: rec.lng,
      zoom: rec.type === 'INCIDENT' ? 8 : 6
    });

    store.setActiveEntityId(rec.id);
    router.push('/');
  };

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'STRATEGIC_BASE':
        return <Shield className="w-4 h-4 text-[#3cdcd1]" />;
      case 'NUCLEAR_FACILITY':
        return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'INCIDENT':
        return <Flame className="w-4 h-4 text-red-400" />;
      case 'SEISMIC_EVENT':
        return <Activity className="w-4 h-4 text-orange-400" />;
      default:
        return <Database className="w-4 h-4 text-white/50" />;
    }
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'TOP_SECRET':
        return 'border-red-500/30 text-red-400 bg-red-950/20';
      case 'RESTRICTED':
        return 'border-yellow-500/30 text-yellow-400 bg-yellow-950/20';
      case 'CLASSIFIED':
        return 'border-cyan-500/30 text-cyan-400 bg-cyan-950/20';
      default:
        return 'border-white/20 text-white/60 bg-white/5';
    }
  };

  return (
    <main className="flex-1 w-full relative bg-[#090a0f] h-full overflow-hidden flex flex-col pt-16">
      {/* Top Header Panel */}
      <div className="bg-black/60 backdrop-blur-md border-b border-white/5 px-8 py-5 flex flex-col md:flex-row md:justify-between md:items-center gap-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/')}
            className="p-2 border border-white/10 hover:border-[#3cdcd1] hover:text-[#3cdcd1] rounded-none transition-colors group flex items-center justify-center bg-white/5"
            title="Return to Live Map"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <h1 className="text-white font-bold text-lg font-headline uppercase tracking-widest flex items-center gap-2">
              <Database className="w-5 h-5 text-[#3cdcd1]" /> INTELLIGENCE ARCHIVE
            </h1>
            <p className="font-mono text-[9px] text-white/40 mt-0.5 tracking-wider">
              OFFLINE TELEMETRY ARCHIVE // TOTAL_INDEXED: {allRecords.length}
            </p>
          </div>
        </div>
        
        {/* Search Input */}
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30 w-3.5 h-3.5" />
          <input
            type="text"
            placeholder="SEARCH REGISTRY..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 py-2 pl-9 pr-3 text-[10px] font-mono text-white placeholder-white/30 rounded-none outline-none focus:border-[#3cdcd1]/50 focus:bg-white/10 transition-colors uppercase tracking-wider"
          />
        </div>
      </div>

      {/* Main Split Screen Area */}
      <div className="flex-1 flex overflow-hidden w-full relative">
        {/* Left Side: Table & Filters */}
        <div className="flex-1 flex flex-col overflow-hidden p-6 md:p-8">
          {/* Tabs / Filter Controls */}
          <div className="flex flex-wrap gap-1.5 mb-5 flex-shrink-0">
            {['ALL', 'STRATEGIC_BASE', 'NUCLEAR_FACILITY', 'INCIDENT', 'SEISMIC_EVENT'].map(tab => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSelectedRecord(null);
                }}
                className={`px-3 py-1.5 text-[9px] font-mono tracking-wider transition-colors border ${
                  activeTab === tab 
                    ? 'border-[#3cdcd1] bg-[#3cdcd1]/15 text-[#3cdcd1] font-bold' 
                    : 'border-white/5 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                }`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Database Table Container */}
          <div className="flex-1 border border-white/5 bg-black/40 overflow-hidden relative flex flex-col">
            <div className="overflow-y-auto custom-scrollbar flex-1">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-[#0d0e12] border-b border-white/5 shadow-md">
                  <tr className="text-[8px] font-mono text-white/30 uppercase tracking-widest">
                    <th className="p-3.5 font-normal">SOURCE/ID</th>
                    <th className="p-3.5 font-normal">DESIGNATION</th>
                    <th className="p-3.5 font-normal">CLASSIFICATION</th>
                    <th className="p-3.5 font-normal">COORDINATES</th>
                    <th className="p-3.5 font-normal text-right">DATE LOGGED</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredRecords.map((rec, i) => (
                    <tr 
                      key={rec.id + '-' + i} 
                      onClick={() => setSelectedRecord(rec)}
                      className={`hover:bg-white/5 transition-all cursor-pointer text-[10px] font-mono text-white/80 group ${
                        selectedRecord?.id === rec.id ? 'bg-white/5 border-l-2 border-l-[#3cdcd1]' : ''
                      }`}
                    >
                      <td className="p-3.5 text-white/30 group-hover:text-white/50 flex items-center gap-2">
                        {getCategoryIcon(rec.type)}
                        <span>{rec.id.toString().slice(0, 8).toUpperCase()}</span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex flex-col">
                          <span className="font-bold text-white group-hover:text-[#3cdcd1] transition-colors">{rec.name}</span>
                          <span className="text-[8px] text-white/40 mt-0.5 truncate max-w-[280px]">{rec.detail}</span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 text-[8px] border font-bold tracking-wider rounded-none ${getClassificationColor(rec.classification)}`}>
                          {rec.classification}
                        </span>
                      </td>
                      <td className="p-3.5 text-white/40">{rec.location}</td>
                      <td className="p-3.5 text-right text-white/40">{rec.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredRecords.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                  <Database className="w-10 h-10 text-white/10 mb-4 animate-pulse" />
                  <span className="text-[10px] font-mono text-white/30 tracking-widest">NO DIRECTIVES OR ARCHIVES LOCATED</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Detailed Intelligence Viewer Panel */}
        <AnimatePresence>
          {selectedRecord && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full md:w-[400px] border-l border-white/5 bg-black/60 backdrop-blur-md flex flex-col h-full z-30 absolute inset-y-0 right-0 md:static flex-shrink-0 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]"
            >
              {/* Card Header */}
              <div className="p-5 border-b border-white/5 flex items-center justify-between bg-black/40">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#3cdcd1] rounded-full animate-pulse" />
                  <span className="font-mono text-[9px] text-[#3cdcd1] tracking-widest uppercase font-bold">DETAILED INTEL REPORT</span>
                </div>
                <button 
                  onClick={() => setSelectedRecord(null)}
                  className="p-1 text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Card Contents */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                
                {/* Title and ID */}
                <div>
                  <div className="flex items-center gap-2 text-white/30 font-mono text-[8px] tracking-widest uppercase mb-1">
                    {getCategoryIcon(selectedRecord.type)}
                    <span>{selectedRecord.type.replace('_', ' ')} // {selectedRecord.id.toString().slice(0, 12).toUpperCase()}</span>
                  </div>
                  <h2 className="text-white text-base font-bold font-headline leading-tight tracking-wide">
                    {selectedRecord.name}
                  </h2>
                </div>

                {/* Primary Stats Grid */}
                <div className="grid grid-cols-2 gap-2 font-mono text-[9px]">
                  <div className="bg-white/5 border border-white/5 p-3 flex flex-col gap-1">
                    <span className="text-white/30 uppercase tracking-wider">CLASSIFICATION</span>
                    <span className={`font-bold ${
                      selectedRecord.classification === 'TOP_SECRET' ? 'text-red-400' :
                      selectedRecord.classification === 'RESTRICTED' ? 'text-yellow-400' : 'text-cyan-400'
                    }`}>{selectedRecord.classification}</span>
                  </div>
                  <div className="bg-white/5 border border-white/5 p-3 flex flex-col gap-1">
                    <span className="text-white/30 uppercase tracking-wider">OPERATIONAL STATUS</span>
                    <span className="font-bold text-[#3cdcd1] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-[#3cdcd1] rounded-full animate-pulse" />
                      {selectedRecord.status}
                    </span>
                  </div>
                </div>

                {/* Map Coordinates with Copy Tool */}
                <div className="border border-white/5 bg-white/5 p-4 rounded-none space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[8px] text-white/30 tracking-widest uppercase">COORDINATES (LAT/LNG)</span>
                    <button 
                      onClick={() => copyToClipboard(selectedRecord.location)}
                      className="p-1 hover:bg-white/5 border border-white/10 rounded-none transition-colors text-white/50 hover:text-white flex items-center gap-1 text-[8px] font-mono"
                    >
                      {copied ? <CheckCircle2 className="w-2.5 h-2.5 text-green-400" /> : <Copy className="w-2.5 h-2.5" />}
                      {copied ? 'COPIED' : 'COPY'}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-white font-mono text-xs">
                    <MapPin className="w-4 h-4 text-[#3cdcd1]" />
                    <span>{selectedRecord.location}</span>
                  </div>
                </div>

                {/* Sub-details breakdown based on Type */}
                <div className="space-y-3">
                  <span className="font-mono text-[8px] text-white/30 tracking-widest uppercase block border-b border-white/5 pb-1">DATABASE RECORDS</span>
                  
                  <div className="space-y-2.5 font-mono text-[9px]">
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-white/40">COUNTRY / ZONE:</span>
                      <span className="text-white font-bold">{selectedRecord.country}</span>
                    </div>

                    {selectedRecord.type === 'STRATEGIC_BASE' && (
                      <>
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-white/40">DESIGNATION TYPE:</span>
                          <span className="text-white font-bold">{selectedRecord.detail}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-white/40">CALLSIGN:</span>
                          <span className="text-[#3cdcd1] font-bold">{selectedRecord.raw?.callsign || 'N/A'}</span>
                        </div>
                      </>
                    )}

                    {selectedRecord.type === 'NUCLEAR_FACILITY' && (
                      <>
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-white/40">REACTOR COUNT:</span>
                          <span className="text-white font-bold">{selectedRecord.raw?.reactors || '0'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-white/40">POWER CAPACITY:</span>
                          <span className="text-[#3cdcd1] font-bold">{selectedRecord.raw?.capacityMW || '0'} MW</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-white/40">FACILITY OWNER:</span>
                          <span className="text-white font-bold">{selectedRecord.raw?.owner || 'UNKNOWN'}</span>
                        </div>
                      </>
                    )}

                    {selectedRecord.type === 'INCIDENT' && (
                      <>
                        <div className="flex flex-col gap-1 py-1 border-b border-white/5">
                          <span className="text-white/40">OSINT DESCRIPTION:</span>
                          <p className="text-white/70 leading-normal mt-1 text-[9px]">{selectedRecord.detail}</p>
                        </div>
                        {selectedRecord.raw?.url && (
                          <a 
                            href={selectedRecord.raw.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-[#3cdcd1] hover:underline pt-2 font-bold"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> OPEN PRIMARY SOURCE FEED
                          </a>
                        )}
                      </>
                    )}

                    {selectedRecord.type === 'SEISMIC_EVENT' && (
                      <>
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-white/40">SEISMIC MAGNITUDE:</span>
                          <span className="text-red-400 font-bold">{selectedRecord.detail}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-white/40">TELEMETRY SOURCE:</span>
                          <span className="text-white font-bold">USGS EARTHQUAKE FEED</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Tactical Actions Card */}
                <div className="bg-red-950/10 border border-red-500/15 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-[8px] font-mono text-red-400 font-bold tracking-widest">
                    <AlertTriangle className="w-3.5 h-3.5" /> OVERRIDE CONFIRMATION REQUIRED
                  </div>
                  <p className="text-[8.5px] font-mono text-white/55 leading-relaxed">
                    Deploying satellite tracking parameters will redirect live camera grids, orbit feeds, and sensor arrays directly to this sector.
                  </p>
                  <button
                    onClick={() => locateOnMap(selectedRecord)}
                    className="w-full bg-[#3cdcd1] hover:bg-[#2cbcb1] text-black font-bold font-mono py-2.5 px-4 text-[10px] tracking-wider transition-colors flex items-center justify-center gap-2 rounded-none"
                  >
                    <Globe className="w-4 h-4" /> DEPLOY TELEMETRY OVERRIDE
                  </button>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
