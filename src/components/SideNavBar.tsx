'use client';

import { useTacticalStore } from '@/store/tactical-store';
import { useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';

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

export function SideNavBar({ desktopHidden = false }: { desktopHidden?: boolean }) {
  const { setDiveTarget, layers, toggleLayer, cameras, flights, gpsJamming, ports, chokepoints, ships, satellites, earthquakes, nuclearFacilities, strategicBases, incidents, news, weatherEvents, setMapCommand, activeEntityId, setActiveEntityId, activeCamera, nukeSimMode, setNukeSimMode, mobileActiveTab, setMobileActiveTab } = useTacticalStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssetEvent, setSelectedAssetEvent] = useState<any>(null);
  const [externalResults, setExternalResults] = useState<any[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    aviation: true,
    maritime: true,
    surveillance: true,
  });
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isOverlayMode, setIsOverlayMode] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    setIsCollapsed(window.innerWidth < 1200);
    setIsOverlayMode(window.innerWidth < 1200);

    let prevWidth = window.innerWidth;
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      setIsOverlayMode(currentWidth < 1200);
      if ((prevWidth >= 1200 && currentWidth < 1200) || (prevWidth < 1200 && currentWidth >= 1200)) {
        setIsCollapsed(currentWidth < 1200);
      }
      prevWidth = currentWidth;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchExternal = async () => {
      if (searchQuery.trim().length < 3) {
        setExternalResults([]);
        return;
      }
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          const formatted = data.slice(0, 5).map((f: any) => ({
            id: f.place_id,
            type: 'location',
            name: f.display_name.split(',')[0],
            lat: parseFloat(f.lat),
            lng: parseFloat(f.lon),
            bbox: f.boundingbox ? [
              [parseFloat(f.boundingbox[2]), parseFloat(f.boundingbox[0])],
              [parseFloat(f.boundingbox[3]), parseFloat(f.boundingbox[1])]
            ] : undefined,
            sub: f.display_name
          }));
          setExternalResults(formatted);
        }
      } catch (err) {
        // ignore
      }
    };
    
    const timeout = setTimeout(fetchExternal, 400);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    const handleSelected = (e: any) => setSelectedAssetEvent(e.detail);
    window.addEventListener('aegisAssetSelected', handleSelected);
    return () => window.removeEventListener('aegisAssetSelected', handleSelected);
  }, []);

  const selectedAsset = useMemo(() => {
    if (activeCamera) return { ...activeCamera, type: 'camera' as const };
    
    if (activeEntityId) {
      const flight = flights.find(f => f.icao24 === activeEntityId);
      if (flight) return { ...flight, type: 'flight' as const };
      
      const ship = ships?.find((s: any) => s.mmsi === activeEntityId || s.id === activeEntityId);
      if (ship) return { ...ship, type: 'maritime' as const };

      const sat = satellites.find(s => s.noradId === activeEntityId);
      if (sat) return { ...sat, type: 'satellite' as const };

      const port = ports.find(p => p.id === activeEntityId || p.name === activeEntityId);
      if (port) return { ...port, type: 'port' as const };
      
      const chokepoint = chokepoints.find(c => c.name === activeEntityId);
      if (chokepoint) return { ...chokepoint, type: 'chokepoint' as const };
      
      const quake = earthquakes.find(e => e.id === activeEntityId);
      if (quake) return { ...quake, type: 'earthquake' as const };
      
      const nuke = nuclearFacilities.find(n => n.id === activeEntityId);
      if (nuke) return { ...nuke, type: 'nuclear' as const };
      
      const strat = strategicBases.find(s => s.id === activeEntityId);
      if (strat) return { ...strat, type: 'strategic' as const };
      
      const inc = incidents.find(i => i.id === activeEntityId);
      if (inc) return { ...inc, type: 'incident' as const };
      
      const weather = weatherEvents?.find((w: any) => w.id === activeEntityId);
      if (weather) return { ...weather, type: 'weather' as const };
    }
    return selectedAssetEvent;
  }, [activeEntityId, activeCamera, flights, ships, satellites, ports, chokepoints, earthquakes, nuclearFacilities, strategicBases, incidents, weatherEvents, selectedAssetEvent]);

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const toggleGroupAll = (groupId: string, turnOn: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    const groupLayers: Record<string, string[]> = {
      aviation: ['aviation_commercial', 'aviation_private', 'aviation_jets', 'aviation_military'],
      maritime: ['maritime', 'space_satellites', 'maritime_cables'],
      surveillance: ['cctv'],
      hazards: ['hazards_earthquakes', 'hazards_weather', 'hazards_fires'],
      threats: ['threats_nuclear', 'threats_incidents', 'threats_strategic', 'threats_news', 'threats_jamming'],
    };

    const targetLayers = groupLayers[groupId];
    if (!targetLayers) return;

    useTacticalStore.setState((state: any) => {
      const newLayers = { ...state.layers };
      targetLayers.forEach(l => {
        newLayers[l] = turnOn;
      });
      return { layers: newLayers };
    });
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
    // Search News
    news.forEach(n => {
      if ((n.title?.toLowerCase().includes(q) || n.description?.toLowerCase().includes(q)) && n.coords) {
        results.push({ id: n.id, type: 'news', name: n.title, lat: n.coords[0], lng: n.coords[1], sub: 'News Alert' });
      }
    });
    // Search Weather
    if (weatherEvents) {
      weatherEvents.forEach((w: any) => {
        if (w.title?.toLowerCase().includes(q) || w.type?.toLowerCase().includes(q)) {
          results.push({ id: w.id, type: 'weather', name: w.title, lat: w.lat, lng: w.lng, sub: w.type });
        }
      });
    }

    return [...results, ...externalResults].slice(0, 10); // Limit to 10 results
  })();

  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      let best = searchResults.length > 0 ? searchResults[0] : null;
      
      // If no result or it's just lagging from typing quickly, fetch exact match directly
      if (!best || best.type === 'location') {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const f = data[0];
            best = {
              id: f.place_id,
              type: 'location',
              name: f.display_name.split(',')[0],
              lat: parseFloat(f.lat),
              lng: parseFloat(f.lon),
              bbox: f.boundingbox ? [
                [parseFloat(f.boundingbox[2]), parseFloat(f.boundingbox[0])],
                [parseFloat(f.boundingbox[3]), parseFloat(f.boundingbox[1])]
              ] : undefined,
              sub: f.display_name
            };
          }
        } catch (err) {}
      }

      if (best) {
        setMapCommand({ type: 'flyTo', lat: best.lat, lng: best.lng, zoom: 17 });
        if (best.type !== 'location') setActiveEntityId(best.id);
        setSearchQuery('');
        if (pathname !== '/') router.push('/');
      }
    }
  };

  // Helper for rendering a switch
  const LayerSwitch = ({ label, icon, active, onClick, count, dotColor }: any) => (
    <div className="flex items-center justify-between py-1.5 pl-2 pr-2 hover:bg-white/5 transition-colors group cursor-pointer" onClick={onClick}>
      <div className="flex items-center gap-3">
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor || 'bg-slate-600'} ${active ? 'opacity-100 shadow-[0_0_5px_currentColor]' : 'opacity-30'}`} />
        <div className="flex items-center gap-2">
          {icon && <span className="material-symbols-outlined text-[13px] text-white/70 group-hover:opacity-100">{icon}</span>}
          <span className={`text-[11px] font-mono tracking-wide ${active ? 'text-white' : 'text-slate-400'}`}>{label}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {count !== undefined && count > 0 && (
          <span className={`text-[10px] font-mono ${active ? 'text-secondary' : 'text-slate-600'}`}>
            {count.toLocaleString()}
          </span>
        )}
        <div className={`w-7 h-4 rounded-full p-0.5 transition-colors border border-white/20 ${active ? 'bg-white/20' : 'bg-black/40'}`}>
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
          <div
            className={`w-3 h-3 rounded border flex items-center justify-center hover:border-white transition-colors cursor-pointer ${activeParent ? 'border-secondary/50' : 'border-slate-600'}`}
            onClick={(e) => toggleGroupAll(id, activeCount < totalCount, e)}
          >
            <div className={`w-1.5 h-1.5 ${activeParent ? 'bg-secondary' : 'bg-transparent'}`} />
          </div>
        </div>
      </div>
    );
  };

  const aviationActiveCount = [layers.aviation_commercial, layers.aviation_private, layers.aviation_jets, layers.aviation_military].filter(Boolean).length;
  const maritimeActiveCount = [layers.maritime, layers.space_satellites, layers.maritime_cables].filter(Boolean).length;
  const survActiveCount = [layers.cctv, false].filter(Boolean).length;
  const hazardsActiveCount = [layers.hazards_earthquakes, layers.hazards_weather, layers.hazards_fires].filter(Boolean).length;
  const threatsActiveCount = [layers.threats_nuclear, layers.threats_incidents, layers.threats_strategic, layers.threats_news, layers.threats_jamming].filter(Boolean).length;

  const totalEntities = cameras.length + flights.length + ports.length + chokepoints.length + satellites.length + earthquakes.length + nuclearFacilities.length + incidents.length + strategicBases.length + (weatherEvents?.length || 0) + (gpsJamming?.length || 0);
  const activeLayersTotal = aviationActiveCount + maritimeActiveCount + survActiveCount + hazardsActiveCount + threatsActiveCount;

  return (
    <aside className={`
      ${mobileActiveTab === 'layers' 
        ? 'fixed inset-x-0 bottom-[64px] top-[20%] bg-[#0a0a0c]/95 backdrop-blur-xl border-t border-white/20 rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.8)] translate-y-0' 
        : `fixed inset-x-0 bottom-[64px] top-[20%] translate-y-[150%] ${desktopHidden ? 'md:hidden' : 'md:translate-y-0 md:flex'}`
      }
      ${desktopHidden ? 'md:hidden' : isOverlayMode ? 'md:absolute md:left-0 md:top-0 md:bottom-0 md:z-[90] bg-[#0a0a0c]/95 backdrop-blur-xl' : 'md:relative md:inset-auto md:h-full md:bg-transparent z-[90]'}
      md:border-t-0 md:rounded-none md:shadow-none border-white/10
      ${desktopHidden 
        ? 'md:hidden' 
        : isCollapsed 
        ? 'md:w-0 md:p-0 md:border-r-0' 
        : 'md:w-80 md:p-4 md:border-r'
      }
      flex flex-col gap-4 z-[90] p-4 overflow-visible flex-shrink-0 transition-all duration-300 ease-in-out
    `}>
      {/* Toggle Handle Button */}
      {!desktopHidden && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute top-1/2 -translate-y-1/2 right-[-16px] z-[100] w-4 h-16 bg-black/80 hover:bg-black border border-white/20 hover:border-secondary text-slate-400 hover:text-white items-center justify-center cursor-pointer transition-all duration-200 group shadow-[0_0_10px_rgba(0,0,0,0.5)] hover:shadow-[0_0_15px_rgba(123,214,209,0.2)]"
          title={isCollapsed ? "Expand Panel" : "Collapse Panel"}
        >
          <span className="material-symbols-outlined text-[14px] select-none font-bold group-hover:scale-y-110 transition-transform">
            {isCollapsed ? 'chevron_right' : 'chevron_left'}
          </span>
          <div className="absolute inset-y-2 left-[2px] w-[1px] bg-white/10 group-hover:bg-secondary/40 transition-colors"></div>
          <div className="absolute inset-y-2 right-[2px] w-[1px] bg-white/10 group-hover:bg-secondary/40 transition-colors"></div>
        </button>
      )}

      {/* Inner Content Wrapper */}
      <div className={`w-full md:w-[288px] md:min-w-[288px] h-full flex flex-col gap-4 overflow-hidden transition-opacity duration-300 ${
        isCollapsed ? 'md:opacity-0 md:pointer-events-none' : 'opacity-100'
      }`}>
        {/* Mobile Drag Handle */}
        <div 
          className="md:hidden w-full h-6 -mt-4 mb-2 flex justify-center items-center cursor-grab active:cursor-grabbing"
          onTouchStart={(e) => {
            const target = e.target as HTMLDivElement;
            target.dataset.touchY = e.touches[0].clientY.toString();
          }}
          onTouchEnd={(e) => {
            const startY = parseFloat((e.target as HTMLDivElement).dataset.touchY || '0');
            if (e.changedTouches[0].clientY - startY > 50) {
              setMobileActiveTab('none');
            }
          }}
        >
          <div className="w-12 h-1.5 bg-white/20 rounded-full pointer-events-none" />
        </div>

        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between -mt-2 mb-2 pb-2 border-b border-white/10">
          <h2 className="text-white font-headline font-bold tracking-widest text-sm uppercase">Layers & Stats</h2>
          <button onClick={() => setMobileActiveTab('none')} className="text-white/50 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Box 1: AEGIS SDK */}
        <div className="fui-border p-3 flex gap-4 items-center">
          <div className="fui-corner-tl"></div><div className="fui-corner-tr"></div><div className="fui-corner-bl"></div><div className="fui-corner-br"></div>
          <div className="w-20 h-16 bg-white/10 flex items-center justify-center border border-white/20 relative">
            <span className="material-symbols-outlined text-3xl text-secondary">
              {!selectedAsset ? 'satellite_alt'
                : selectedAsset.type === 'flight' || selectedAsset.category === 'commercial' || selectedAsset.category === 'military' || selectedAsset.category === 'private' ? 'flight'
                  : selectedAsset.type === 'maritime' || selectedAsset.type === 'port' || selectedAsset.type === 'chokepoint' ? 'directions_boat'
                    : selectedAsset.type === 'camera' ? 'videocam'
                      : selectedAsset.type === 'earthquake' ? 'waves'
                        : selectedAsset.type === 'nuclear' ? 'science'
                          : selectedAsset.type === 'strategic' ? 'security'
                            : selectedAsset.type === 'incident' ? 'warning'
                              : selectedAsset.type === 'satellite' ? 'satellite_alt'
                                : selectedAsset.type === 'weather' ? 'cyclone'
                                  : 'radar'}
            </span>
            <div className="absolute top-0 left-0 w-1 h-1 border-t border-l border-white"></div>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-2 text-[10px] font-mono text-white">
            <div>
              <div className="text-white/60 mb-1">TOTAL ASSETS</div>
              <div className="text-lg font-bold">{totalEntities}</div>
            </div>
            <div>
              <div className="text-white/60 mb-1">LIVE STREAMS</div>
              <div className="text-lg font-bold">{cameras.length}</div>
            </div>
            <div>
              <div className="text-white/60 mb-1">ACTIVE FLIGHTS</div>
              <div className="text-lg font-bold">{flights.length}</div>
            </div>
            <div>
              <div className="text-white/60 mb-1">NAVAL PORTS</div>
              <div className="text-lg font-bold">{ports.length}</div>
            </div>
          </div>
        </div>

        {/* Watchlist Input */}
        <div className="hidden md:block fui-border p-2 z-50">
          <div className="fui-corner-tl"></div><div className="fui-corner-tr"></div><div className="fui-corner-bl"></div><div className="fui-corner-br"></div>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="CMD: LOCATE"
              className="w-full bg-transparent border-b border-white/30 focus:border-white rounded-none text-[11px] font-mono py-1 px-1 placeholder:text-white/30 outline-none text-white transition-colors"
            />
            <span className="material-symbols-outlined absolute right-1 top-0.5 text-[14px] text-white/50">search</span>
          </div>
          {searchQuery.trim() && searchResults.length > 0 && (
            <div className="absolute top-[100%] left-0 right-0 mt-1 bg-black/80 border border-white/30 z-[999] max-h-64 overflow-y-auto">
              {searchResults.map((res, i) => (
                <button
                  key={`${res.type}-${res.id}-${i}`}
                  className="w-full text-left px-2 py-1 hover:bg-white/10 border-b border-white/10 flex items-center justify-between group"
                  onClick={() => {
                    setMapCommand({ type: 'flyTo', lat: res.lat, lng: res.lng, zoom: 17 });
                    if (res.type !== 'location') setActiveEntityId(res.id);
                    setSearchQuery('');
                    if (pathname !== '/') router.push('/');
                  }}
                >
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-white text-[11px] tracking-wide uppercase truncate">{res.name}</span>
                    <span className="text-white/50 text-[9px] tracking-widest uppercase truncate">{res.type} {res.sub ? `// ${res.sub}` : ''}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-1">
          {/* Box 2: AVIATION */}
          <div className="fui-border p-3 flex flex-col gap-2">
            <div className="fui-corner-tl"></div><div className="fui-corner-tr"></div><div className="fui-corner-bl"></div><div className="fui-corner-br"></div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-white font-bold tracking-widest text-sm">AVIATION TRAFFIC</h3>
              <span className="text-white/40 text-[9px] uppercase">Live airborne assets</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <LayerSwitch label="COMMERCIAL" active={layers.aviation_commercial} count={flights.filter(f => f.category === 'commercial').length} dotColor="bg-white" onClick={() => toggleLayer('aviation_commercial')} />
              <LayerSwitch label="MILITARY" active={layers.aviation_military} count={flights.filter(f => f.category === 'military').length} dotColor="bg-red-500" onClick={() => toggleLayer('aviation_military')} />
              <LayerSwitch label="PRIVATE" active={layers.aviation_private} count={flights.filter(f => f.category === 'private').length} dotColor="bg-green-500" onClick={() => toggleLayer('aviation_private')} />
            </div>
          </div>

          {/* Box 3: MARITIME & SURVEILLANCE */}
          <div className="fui-border p-3 flex flex-col gap-2">
            <div className="fui-corner-tl"></div><div className="fui-corner-tr"></div><div className="fui-corner-bl"></div><div className="fui-corner-br"></div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-white font-bold tracking-widest text-sm">SURFACE & LEO</h3>
              <span className="text-white/40 text-[9px] uppercase">Maritime and Space</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <LayerSwitch label="MARITIME NAVAL" active={layers.maritime} count={ports.length + chokepoints.length} dotColor="bg-white" onClick={() => toggleLayer('maritime')} />
              <LayerSwitch label="SUBSEA CABLES" active={layers.maritime_cables} count={717} dotColor="bg-blue-400" onClick={() => toggleLayer('maritime_cables')} />
              <LayerSwitch label="SATELLITES" active={layers.space_satellites} count={satellites.length} dotColor="bg-white" onClick={() => toggleLayer('space_satellites')} />
              <LayerSwitch label="CCTV NODES" active={layers.cctv} count={cameras.length} dotColor="bg-white" onClick={() => toggleLayer('cctv')} />
            </div>
          </div>

          {/* Box 4: THREATS */}
          <div className="fui-border p-3 flex flex-col gap-2 flex-1">
            <div className="fui-corner-tl"></div><div className="fui-corner-tr"></div><div className="fui-corner-bl"></div><div className="fui-corner-br"></div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-white font-bold tracking-widest text-sm">THREAT MATRIX</h3>
              <span className="text-white/40 text-[9px] uppercase">Hazards and Targets</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <LayerSwitch label="NUCLEAR FACILITIES" active={layers.threats_nuclear} count={nuclearFacilities.length} dotColor="bg-red-500" onClick={() => toggleLayer('threats_nuclear')} />
              <LayerSwitch label="STRAT BASES" active={layers.threats_strategic} count={strategicBases.length} dotColor="bg-red-500" onClick={() => toggleLayer('threats_strategic')} />
              <LayerSwitch label="INCIDENTS" active={layers.threats_incidents} count={incidents.length} dotColor="bg-orange-500" onClick={() => toggleLayer('threats_incidents')} />
              <LayerSwitch label="LIVE NEWS" active={layers.threats_news} count={news.length} dotColor="bg-yellow-500" onClick={() => toggleLayer('threats_news')} />
              <LayerSwitch label="GPS JAMMING" active={layers.threats_jamming} count={gpsJamming?.length || 0} dotColor="bg-red-500" onClick={() => toggleLayer('threats_jamming')} />
              <LayerSwitch label="SEISMIC 24H" active={layers.hazards_earthquakes} count={earthquakes.length} dotColor="bg-yellow-500" onClick={() => toggleLayer('hazards_earthquakes')} />
              <LayerSwitch label="SEVERE WEATHER" active={layers.hazards_weather} count={weatherEvents?.length || 0} dotColor="bg-cyan-500" onClick={() => toggleLayer('hazards_weather')} />
              <LayerSwitch label="ACTIVE FIRES" active={layers.hazards_fires} count={useTacticalStore((state) => state.fires).length} dotColor="bg-orange-500" onClick={() => toggleLayer('hazards_fires')} />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
