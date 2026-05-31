'use client';

import { useTacticalStore } from '@/store/tactical-store';
import { useState } from 'react';

// Very rough approximation for regions due to lack of local client-side shapefiles
const getRegionFromCoords = (lat: number, lng: number) => {
  if (lat > 24 && lat < 50 && lng > -125 && lng < -65) return "United States";
  if (lat > 35 && lat < 70 && lng > -10 && lng < 40) return "Europe";
  if (lat > -60 && lat < 15 && lng > -85 && lng < -35) return "South America";
  if (lat > 15 && lat < 55 && lng > 70 && lng < 145) return "East Asia";
  if (lat > -40 && lat < -10 && lng > 110 && lng < 155) return "Oceania";
  if (lat > -35 && lat < 35 && lng > -20 && lng < 55) return "Africa";
  return "International Waters";
};

export function SideNavBar() {
  const { setDiveTarget, layers, toggleLayer, cameras, flights, ports, chokepoints, satellites, earthquakes, nuclearFacilities, setMapCommand, setActiveEntityId } = useTacticalStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    aviation: true,
    maritime: true,
    surveillance: true,
  });

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const searchResults = (() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results: any[] = [];
    
    // Search Flights
    flights.forEach(f => {
      if (f.callsign?.toLowerCase().includes(q) || f.icao24.toLowerCase().includes(q) || f.airline_code?.toLowerCase().includes(q)) {
        results.push({ id: f.icao24, type: 'flight', name: f.callsign || f.icao24, lat: f.lat, lng: f.lng, sub: f.category });
      }
    });
    // Search Ports
    ports.forEach(p => {
      if (p.name.toLowerCase().includes(q) || p.country?.toLowerCase().includes(q)) {
        results.push({ id: p.id || p.name, type: 'port', name: p.name, lat: p.lat, lng: p.lng, sub: p.country || 'Port' });
      }
    });
    // Search Chokepoints
    chokepoints.forEach(c => {
      if (c.name.toLowerCase().includes(q)) {
        results.push({ id: c.name, type: 'chokepoint', name: c.name, lat: c.lat, lng: c.lng, sub: 'Chokepoint' });
      }
    });
    // Search Cameras
    cameras.forEach(c => {
      if (c.id.toString().includes(q) || c.country?.toLowerCase().includes(q) || c.tags?.name?.toLowerCase().includes(q)) {
        results.push({ id: c.id.toString(), type: 'cctv', name: c.tags?.name || `CAM-${c.id}`, lat: c.lat, lng: c.lon, sub: c.country || 'Camera' });
      }
    });
    // Search Satellites
    satellites.forEach(s => {
      if (s.name.toLowerCase().includes(q) || s.mission.toLowerCase().includes(q)) {
        results.push({ id: s.noradId, type: 'satellite', name: s.name, lat: s.lat, lng: s.lng, sub: s.mission });
      }
    });
    
    return results.slice(0, 8); // Limit to 8 results
  })();

  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      if (searchResults.length > 0) {
        const best = searchResults[0];
        setMapCommand({ type: 'flyTo', lat: best.lat, lng: best.lng, zoom: 12 });
        setActiveEntityId(best.id);
        setSearchQuery('');
        return;
      }
      
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!token) return;
      try {
        const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${token}&types=place,region,country`);
        const data = await res.json();
        if (data.features && data.features.length > 0) {
          const [lng, lat] = data.features[0].center;
          setMapCommand({ type: 'flyTo', lat, lng, zoom: 10 });
        }
      } catch (err) {
        console.error("Geocoding failed", err);
      }
    }
  };

  // Helper for rendering a switch
  const LayerSwitch = ({ label, icon, active, onClick, count, dotColor }: any) => (
    <div className="flex items-center justify-between py-1.5 pl-6 pr-2 hover:bg-white/5 transition-colors group cursor-pointer" onClick={onClick}>
      <div className="flex items-center gap-3">
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor || 'bg-slate-600'} ${active ? 'opacity-100 shadow-[0_0_5px_currentColor]' : 'opacity-30'}`} />
        <div className="flex items-center gap-2">
          {icon && <span className="material-symbols-outlined text-[13px] text-on-surface-variant opacity-70 group-hover:opacity-100">{icon}</span>}
          <span className={`text-[11px] font-mono tracking-wide ${active ? 'text-white' : 'text-slate-400'}`}>{label}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {count !== undefined && (
          <span className={`text-[10px] font-mono ${active ? 'text-secondary' : 'text-slate-600'}`}>
            {count.toLocaleString()}
          </span>
        )}
        <div className={`w-7 h-4 rounded-full p-0.5 transition-colors ${active ? 'bg-secondary/20' : 'bg-surface-container-high'}`}>
          <div className={`w-3 h-3 rounded-full transition-transform ${active ? 'translate-x-3 bg-secondary shadow-[0_0_5px_currentColor]' : 'translate-x-0 bg-slate-500'}`} />
        </div>
      </div>
    </div>
  );

  const GroupHeader = ({ id, label, icon, activeCount, totalCount, activeParent }: any) => {
    const isExpanded = expandedGroups[id];
    return (
      <div className="flex items-center justify-between py-2 px-3 bg-white/5 border-l-2 border-secondary/50 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => toggleGroup(id)}>
        <div className="flex items-center gap-2">
          <span className={`material-symbols-outlined text-sm ${activeParent ? 'text-secondary' : 'text-slate-400'}`}>{icon}</span>
          <span className={`text-[11px] font-headline font-bold tracking-widest ${activeParent ? 'text-white' : 'text-slate-400'} uppercase`}>{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-slate-500">{activeCount}/{totalCount}</span>
          <span className={`material-symbols-outlined text-[14px] text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>expand_more</span>
          <div className={`w-3 h-3 rounded border flex items-center justify-center ${activeParent ? 'border-secondary/50' : 'border-slate-600'}`}>
             <div className={`w-1.5 h-1.5 ${activeParent ? 'bg-secondary' : 'bg-transparent'}`} />
          </div>
        </div>
      </div>
    );
  };

  const aviationActiveCount = [layers.aviation_commercial, layers.aviation_private, layers.aviation_jets, layers.aviation_military].filter(Boolean).length;
  const maritimeActiveCount = [layers.maritime, layers.space_satellites].filter(Boolean).length;
  const survActiveCount = [layers.cctv, false].filter(Boolean).length;
  const hazardsActiveCount = [layers.hazards_earthquakes, false, false].filter(Boolean).length;
  const threatsActiveCount = [layers.threats_nuclear, false, false].filter(Boolean).length;
  
  const totalEntities = cameras.length + flights.length + ports.length + chokepoints.length + satellites.length + earthquakes.length + nuclearFacilities.length;
  const activeLayersTotal = aviationActiveCount + maritimeActiveCount + survActiveCount + hazardsActiveCount + threatsActiveCount;

  return (
    <aside className="static flex-shrink-0 left-0 top-16 h-[calc(100vh-64px)] w-80 flex flex-col justify-between py-4 bg-[#0d0e12] border-r border-outline-variant/10 z-40 overflow-hidden">
      <div className="flex flex-col h-full px-2 gap-4 overflow-y-auto custom-scrollbar">
        {/* Header Section */}
        <div className="flex items-center justify-between pb-2 border-b border-outline-variant/10 px-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-sm">layers</span>
            <h2 className="text-white font-bold text-xs font-headline tracking-widest">DATA LAYERS</h2>
          </div>
          <div className="flex items-center gap-2 text-[9px] font-mono">
            <span className="bg-surface-container-high px-1.5 py-0.5 rounded text-slate-300">{activeLayersTotal}/16</span>
            <span className="text-secondary">{totalEntities.toLocaleString()} ENT</span>
          </div>
        </div>

        {/* Watchlist Input */}
        <div className="flex flex-col gap-1 px-2 relative">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="CMD: LOCATE"
              className="w-full bg-surface-container-highest border border-outline-variant/20 focus:border-secondary/50 rounded text-[11px] font-mono py-1.5 pl-2 pr-8 placeholder:text-outline-variant/50 outline-none text-white transition-colors"
            />
            <span className="material-symbols-outlined absolute right-2 top-1 text-[14px] text-on-surface-variant">search</span>
          </div>

          {searchQuery.trim() && searchResults.length > 0 && (
            <div className="absolute top-[100%] left-2 right-2 mt-1 bg-[#14151a] border border-outline-variant/30 rounded-md shadow-2xl z-[999] max-h-64 overflow-y-auto custom-scrollbar">
              {searchResults.map((res, i) => (
                <button 
                  key={`${res.type}-${res.id}-${i}`}
                  className="w-full text-left px-3 py-2 hover:bg-slate-800/50 border-b border-outline-variant/10 flex items-center justify-between group"
                  onClick={() => {
                    setMapCommand({ type: 'flyTo', lat: res.lat, lng: res.lng, zoom: 12 });
                    setActiveEntityId(res.id);
                    setSearchQuery('');
                  }}
                >
                  <div className="flex flex-col overflow-hidden pr-2">
                    <span className="text-white text-xs font-headline tracking-wide uppercase truncate">{res.name}</span>
                    <span className="text-slate-500 text-[9px] font-mono uppercase truncate">{res.type} • {res.sub}</span>
                  </div>
                  <span className="material-symbols-outlined text-slate-500 text-[14px] group-hover:text-secondary transition-colors shrink-0">my_location</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ═══ AEGIS SDK ═══ */}
        <div className="flex flex-col gap-1">
           <GroupHeader id="sdk" label="AEGIS SDK" icon="account_tree" activeCount={0} totalCount={1} activeParent={false} />
           {expandedGroups['sdk'] && (
             <LayerSwitch label="Intelligence Stream" active={false} count={0} dotColor="bg-slate-500" onClick={() => {}} />
           )}
        </div>

        {/* ═══ AVIATION ═══ */}
        <div className="flex flex-col gap-1">
           <GroupHeader id="aviation" label="AVIATION" icon="flight" activeCount={aviationActiveCount} totalCount={4} activeParent={aviationActiveCount > 0} />
           {expandedGroups['aviation'] && (
             <div className="flex flex-col gap-0.5">
               <LayerSwitch label="Commercial" active={layers.aviation_commercial} count={flights.filter(f => f.category === 'commercial').length} dotColor="bg-orange-500" onClick={() => toggleLayer('aviation_commercial')} />
               <LayerSwitch label="Private" active={layers.aviation_private} count={flights.filter(f => f.category === 'private').length} dotColor="bg-purple-500" onClick={() => toggleLayer('aviation_private')} />
               <LayerSwitch label="Private Jets" active={layers.aviation_jets} count={flights.filter(f => f.category === 'jet').length} dotColor="bg-pink-500" onClick={() => toggleLayer('aviation_jets')} />
               <LayerSwitch label="Military" active={layers.aviation_military} count={flights.filter(f => f.category === 'military').length} dotColor="bg-red-500" onClick={() => toggleLayer('aviation_military')} />
             </div>
           )}
        </div>

        {/* ═══ MARITIME & SPACE ═══ */}
        <div className="flex flex-col gap-1">
           <GroupHeader id="maritime" label="MARITIME & SPACE" icon="sailing" activeCount={maritimeActiveCount} totalCount={2} activeParent={maritimeActiveCount > 0} />
           {expandedGroups['maritime'] && (
             <div className="flex flex-col gap-0.5">
               <LayerSwitch label="Maritime / Naval" active={layers.maritime} count={ports.length + chokepoints.length} dotColor="bg-cyan-500" onClick={() => toggleLayer('maritime')} />
               <LayerSwitch label="Satellites" active={layers.space_satellites} count={satellites.length} dotColor="bg-yellow-500" onClick={() => toggleLayer('space_satellites')} />
             </div>
           )}
        </div>

        {/* ═══ SURVEILLANCE ═══ */}
        <div className="flex flex-col gap-1">
           <GroupHeader id="surveillance" label="SURVEILLANCE" icon="videocam" activeCount={survActiveCount} totalCount={2} activeParent={survActiveCount > 0} />
           {expandedGroups['surveillance'] && (
             <div className="flex flex-col gap-0.5">
               <LayerSwitch label="CCTV Cameras" active={layers.cctv} count={cameras.length} dotColor="bg-green-500" onClick={() => toggleLayer('cctv')} />
               <LayerSwitch label="Live News Feeds" active={false} count={15} dotColor="bg-red-500" onClick={() => {}} />
             </div>
           )}
        </div>

        {/* ═══ NATURAL HAZARDS ═══ */}
        <div className="flex flex-col gap-1">
           <GroupHeader id="hazards" label="NATURAL HAZARDS" icon="bolt" activeCount={hazardsActiveCount} totalCount={3} activeParent={hazardsActiveCount > 0} />
           {expandedGroups['hazards'] && (
             <div className="flex flex-col gap-0.5">
               <LayerSwitch label="Earthquakes (24h)" active={layers.hazards_earthquakes} count={earthquakes.length} dotColor="bg-orange-500" onClick={() => toggleLayer('hazards_earthquakes')} />
               <LayerSwitch label="Active Fires" active={false} count={0} dotColor="bg-red-500" onClick={() => {}} />
               <LayerSwitch label="Severe Weather" active={false} count={0} dotColor="bg-purple-500" onClick={() => {}} />
             </div>
           )}
        </div>
        
        {/* ═══ THREATS & INFRA ═══ */}
        <div className="flex flex-col gap-1">
           <GroupHeader id="threats" label="THREATS & INFRA" icon="warning" activeCount={threatsActiveCount} totalCount={3} activeParent={threatsActiveCount > 0} />
           {expandedGroups['threats'] && (
             <div className="flex flex-col gap-0.5">
               <LayerSwitch label="Nuclear Facilities" active={layers.threats_nuclear} count={nuclearFacilities.length} dotColor="bg-green-500" onClick={() => toggleLayer('threats_nuclear')} />
               <LayerSwitch label="Global Incidents" active={false} count={30} dotColor="bg-red-500" onClick={() => {}} />
               <LayerSwitch label="GPS Jamming" active={false} count={0} dotColor="bg-slate-500" onClick={() => {}} />
             </div>
           )}
        </div>
      </div>
    </aside>
  );
}
