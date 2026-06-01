'use client';

import { useState, useMemo } from 'react';
import { useTacticalStore } from '@/store/tactical-store';

export default function ArchivePage() {
  const store = useTacticalStore();
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Consolidate all records into a single uniform array
  const allRecords = useMemo(() => {
    const records: any[] = [];
    
    store.strategicBases.forEach(b => records.push({
      id: b.id || Math.random().toString(),
      type: 'STRATEGIC_BASE',
      name: b.name || b.codename || 'UNKNOWN BASE',
      location: `${b.lat?.toFixed(4)}, ${b.lng?.toFixed(4)}`,
      lat: b.lat,
      lng: b.lng,
      classification: 'TOP_SECRET',
      date: new Date().toISOString().split('T')[0],
      detail: b.type || 'MILITARY INSTALLATION'
    }));

    store.nuclearFacilities.forEach(n => records.push({
      id: n.id || Math.random().toString(),
      type: 'NUCLEAR_FACILITY',
      name: n.name || n.facility || 'UNKNOWN FACILITY',
      location: `${n.lat?.toFixed(4)}, ${n.lng?.toFixed(4)}`,
      lat: n.lat,
      lng: n.lng,
      classification: 'RESTRICTED',
      date: new Date().toISOString().split('T')[0],
      detail: n.status || n.reactor_type || 'NUCLEAR ASSET'
    }));

    store.incidents.forEach(i => records.push({
      id: i.id || Math.random().toString(),
      type: 'INCIDENT',
      name: i.title || i.name || 'UNCLASSIFIED INCIDENT',
      location: `${i.lat?.toFixed(4)}, ${i.lng?.toFixed(4)}`,
      lat: i.lat,
      lng: i.lng,
      classification: 'CLASSIFIED',
      date: i.date || new Date().toISOString().split('T')[0],
      detail: i.description || i.severity || 'SECURITY EVENT'
    }));

    store.earthquakes.forEach(e => records.push({
      id: e.id || Math.random().toString(),
      type: 'SEISMIC_EVENT',
      name: e.place || 'SEISMIC ANOMALY',
      location: `${e.lat?.toFixed(4)}, ${e.lng?.toFixed(4)}`,
      lat: e.lat,
      lng: e.lng,
      classification: 'UNCLASSIFIED',
      date: e.time ? new Date(e.time).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      detail: `MAG ${e.mag || e.magnitude || '?'}`
    }));

    return records;
  }, [store.strategicBases, store.nuclearFacilities, store.incidents, store.earthquakes]);

  const filteredRecords = useMemo(() => {
    return allRecords.filter(rec => {
      if (activeTab !== 'ALL' && rec.type !== activeTab) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return rec.name.toLowerCase().includes(q) || rec.id.toString().toLowerCase().includes(q) || rec.location.includes(q) || rec.detail.toLowerCase().includes(q);
      }
      return true;
    });
  }, [allRecords, activeTab, searchQuery]);

  return (
    <main className="flex-1 w-full relative bg-[#0b0c10] h-full overflow-y-auto custom-scrollbar">
      {/* Top Bar */}
      <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-xl border-b border-white/10 px-8 py-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-white font-bold text-lg font-headline uppercase tracking-wider">
            INTELLIGENCE ARCHIVE
          </h1>
          <p className="font-mono text-[10px] text-white/50 mt-0.5">
            HISTORICAL DATA RETRIEVAL // INDEXED_RECORDS: {allRecords.length}
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="relative max-w-sm w-full">
          <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-white/40 text-[16px]">search</span>
          <input
            type="text"
            placeholder="SEARCH DATABASE..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 py-1.5 pl-8 pr-3 text-xs font-mono text-white placeholder-white/30 outline-none focus:border-white/40 focus:bg-white/10 transition-colors"
          />
        </div>
      </div>

      <div className="p-8 max-w-[1600px] mx-auto">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['ALL', 'STRATEGIC_BASE', 'NUCLEAR_FACILITY', 'INCIDENT', 'SEISMIC_EVENT'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-[10px] font-mono tracking-wider transition-colors ${activeTab === tab ? 'bg-white text-black font-bold' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'}`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Database Table */}
        <div className="fui-border bg-black/40 p-1 relative">
          <div className="fui-corner-tl"></div><div className="fui-corner-tr"></div><div className="fui-corner-bl"></div><div className="fui-corner-br"></div>
          
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[9px] font-mono text-white/40 uppercase tracking-wider bg-black/60">
                  <th className="p-3 font-normal">RECORD ID</th>
                  <th className="p-3 font-normal">DESIGNATION</th>
                  <th className="p-3 font-normal">CLASSIFICATION</th>
                  <th className="p-3 font-normal">CATEGORY</th>
                  <th className="p-3 font-normal">COORDINATES</th>
                  <th className="p-3 font-normal text-right">DATE LOGGED</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((rec, i) => (
                  <tr key={rec.id + '-' + i} className="border-b border-white/5 hover:bg-white/5 transition-colors group cursor-pointer text-[10px] font-mono text-white">
                    <td className="p-3 text-white/40 group-hover:text-white/60">
                      {(rec.id || '').toString().slice(0, 10).toUpperCase()}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col">
                        <span className="font-bold tracking-wide">{rec.name}</span>
                        <span className="text-[8px] text-[#0ea5e9] mt-0.5">{rec.detail}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-1.5 py-0.5 text-[8px] border ${rec.classification === 'TOP_SECRET' ? 'border-red-500/50 text-red-400 bg-red-500/10' : rec.classification === 'RESTRICTED' ? 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10' : rec.classification === 'CLASSIFIED' ? 'border-blue-500/50 text-blue-400 bg-blue-500/10' : 'border-white/20 text-white/60 bg-white/5'}`}>
                        {rec.classification}
                      </span>
                    </td>
                    <td className="p-3 text-white/50">{rec.type.replace('_', ' ')}</td>
                    <td className="p-3 text-white/50">{rec.location}</td>
                    <td className="p-3 text-right text-white/50">{rec.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredRecords.length === 0 && (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-4xl text-white/20 mb-3">database</span>
                <span className="text-[10px] font-mono text-white/40">NO RECORDS FOUND IN ACTIVE ARCHIVE</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
