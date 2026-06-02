'use client';

import { useTacticalStore } from '@/store/tactical-store';
import { useState, useEffect } from 'react';

export function SearchPanel() {
  const { flights, ports, chokepoints, cameras, satellites, news, setMapCommand, setActiveEntityId, mobileActiveTab, setMobileActiveTab } = useTacticalStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [externalResults, setExternalResults] = useState<any[]>([]);

  useEffect(() => {
    const fetchExternal = async () => {
      if (searchQuery.trim().length < 3) {
        setExternalResults([]);
        return;
      }
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!token) return;
      try {
        const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${token}&types=place,region,country,locality`);
        const data = await res.json();
        if (data.features) {
          const formatted = data.features.map((f: any) => ({
            id: f.id,
            type: 'location',
            name: f.text,
            lat: f.center[1],
            lng: f.center[0],
            sub: f.place_name
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

    return [...results, ...externalResults].slice(0, 10); // Limit to 10 results
  })();

  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      if (searchResults.length > 0) {
        const best = searchResults[0];
        setMapCommand({ type: 'flyTo', lat: best.lat, lng: best.lng, zoom: best.type === 'location' ? 8 : 12 });
        if (best.type !== 'location') setActiveEntityId(best.id);
        setSearchQuery('');
        setMobileActiveTab('none');
      }
    }
  };

  return (
    <aside className={`
      ${mobileActiveTab === 'search'
        ? 'fixed inset-x-0 bottom-[64px] top-[40%] bg-[#0a0a0c]/95 backdrop-blur-xl border-t border-white/20 rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.8)] translate-y-0' 
        : 'fixed inset-x-0 bottom-[64px] top-[40%] translate-y-[150%] md:hidden'
      }
      md:hidden flex flex-col gap-4 z-[90] p-4 overflow-hidden flex-shrink-0 transition-transform duration-300
    `}>
      {/* Mobile Header */}
      <div className="flex items-center justify-between -mt-2 mb-2 pb-2 border-b border-white/10">
        <h2 className="text-white font-headline font-bold tracking-widest text-sm uppercase">Global Search</h2>
        <button onClick={() => setMobileActiveTab('none')} className="text-white/50 hover:text-white transition-colors">
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <div className="fui-border p-2">
        <div className="fui-corner-tl"></div><div className="fui-corner-tr"></div><div className="fui-corner-bl"></div><div className="fui-corner-br"></div>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="CMD: LOCATE"
            className="w-full bg-transparent border-b border-white/30 focus:border-white rounded-none text-sm font-mono py-2 px-2 placeholder:text-white/30 outline-none text-white transition-colors"
          />
          <span className="material-symbols-outlined absolute right-2 top-2 text-[18px] text-white/50">search</span>
        </div>
        
        {searchQuery.trim() && searchResults.length > 0 && (
          <div className="mt-2 bg-black/80 border border-white/30 overflow-y-auto" style={{ maxHeight: 'calc(60vh - 120px)' }}>
            {searchResults.map((res, i) => (
              <button
                key={`${res.type}-${res.id}-${i}`}
                className="w-full text-left px-3 py-2 hover:bg-white/10 border-b border-white/10 flex items-center justify-between group"
                onClick={() => {
                  setMapCommand({ type: 'flyTo', lat: res.lat, lng: res.lng, zoom: res.type === 'location' ? 8 : 12 });
                  if (res.type !== 'location') setActiveEntityId(res.id);
                  setSearchQuery('');
                  setMobileActiveTab('none');
                }}
              >
                <div className="flex flex-col overflow-hidden">
                  <span className="text-white text-xs tracking-wide uppercase truncate">{res.name}</span>
                  <span className="text-white/50 text-[10px] tracking-wide uppercase truncate">{res.sub}</span>
                </div>
                <span className="material-symbols-outlined text-white/30 group-hover:text-secondary text-sm">arrow_forward</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
