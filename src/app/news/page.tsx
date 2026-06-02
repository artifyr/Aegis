'use client';

import { useTacticalStore } from '@/store/tactical-store';
import { useEffect, useState, useMemo } from 'react';

type SortOption = 'date-desc' | 'date-asc' | 'a-z' | 'z-a';

export default function NewsPage() {
  const { news, setMapCommand, setActiveEntityId } = useTacticalStore();
  const [mounted, setMounted] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('aegis-news-sort');
    if (saved) setSortBy(saved as SortOption);
  }, []);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as SortOption;
    setSortBy(val);
    localStorage.setItem('aegis-news-sort', val);
  };

  const sortedNews = useMemo(() => {
    return [...news].sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.published).getTime() - new Date(a.published).getTime();
        case 'date-asc':
          return new Date(a.published).getTime() - new Date(b.published).getTime();
        case 'a-z':
          return (a.title || '').localeCompare(b.title || '');
        case 'z-a':
          return (b.title || '').localeCompare(a.title || '');
        default:
          return 0;
      }
    });
  }, [news, sortBy]);

  if (!mounted) return <div className="p-8 text-white font-mono">INIT NEWS ENGINE...</div>;

  return (
    <main className="flex-1 w-full relative bg-[#0b0c10] h-full overflow-y-auto p-4 md:p-8 custom-scrollbar">
      <div className="max-w-[1600px] mx-auto pb-20 md:pb-8">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div>
            <h1 className="text-white font-bold text-2xl font-headline mb-2 uppercase tracking-wider">
              Global News & Intel
            </h1>
            <p className="font-mono text-sm text-white/50">
              LIVE_FEED // SYNDICATED_SOURCES: {news.length || '---'}
            </p>
          </div>
          
          <div className="flex items-center gap-2 border border-white/20 bg-black/40 px-3 py-1.5 font-mono text-xs">
            <span className="text-white/50 material-symbols-outlined text-[16px]">sort</span>
            <select 
              className="bg-transparent text-white outline-none cursor-pointer"
              value={sortBy}
              onChange={handleSortChange}
            >
              <option value="date-desc" className="bg-[#0b0c10] text-white">LATEST FIRST</option>
              <option value="date-asc" className="bg-[#0b0c10] text-white">OLDEST FIRST</option>
              <option value="a-z" className="bg-[#0b0c10] text-white">TITLE (A-Z)</option>
              <option value="z-a" className="bg-[#0b0c10] text-white">TITLE (Z-A)</option>
            </select>
          </div>
        </div>

        {sortedNews.length === 0 ? (
          <div className="text-center py-20 font-mono text-white/50 text-sm">
            NO INTELLIGENCE FEEDS AVAILABLE
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 auto-rows-[250px]">
            {sortedNews.map((item, i) => {
              // Bento styling: make some critical/first items larger
              const isHero = i % 7 === 0; 
              const isCritical = item.risk_score >= 8;
              const color = isCritical ? 'red' : item.risk_score >= 5 ? 'yellow' : 'emerald';

              return (
                <div 
                  key={item.id} 
                  className={`fui-border relative flex flex-col justify-between overflow-hidden group cursor-pointer ${
                    isHero ? 'sm:col-span-2 sm:row-span-2' : ''
                  } ${
                    isCritical ? 'bg-red-950/20 hover:bg-red-950/40' : 'bg-black/40 hover:bg-black/60'
                  } transition-colors p-5`}
                  onClick={() => {
                    if (item.coords) {
                      setMapCommand({ type: 'flyTo', lat: item.coords[0], lng: item.coords[1], zoom: 6 });
                      setActiveEntityId(item.id);
                      window.location.href = '/'; // send back to map
                    } else if (item.link) {
                      window.open(item.link, '_blank');
                    }
                  }}
                >
                  <div className="fui-corner-tl"></div><div className="fui-corner-tr"></div><div className="fui-corner-bl"></div><div className="fui-corner-br"></div>
                  
                  {/* Top Bar */}
                  <div className="flex justify-between items-start mb-4 z-10">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full bg-${color}-500 ${isCritical ? 'animate-pulse' : ''}`}></div>
                      <span className={`text-[10px] font-mono tracking-widest uppercase text-${color}-500`}>
                        {isCritical ? 'CRITICAL ALERT' : 'INTEL'}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-white/40 uppercase">
                      {new Date(item.published).toLocaleDateString()} {new Date(item.published).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}Z
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-hidden z-10 flex flex-col justify-center">
                    <h2 className={`font-headline font-bold text-white mb-2 leading-tight ${isHero ? 'text-2xl lg:text-3xl line-clamp-3' : 'text-sm sm:text-base line-clamp-2'}`}>
                      {item.title}
                    </h2>
                    <p className={`font-mono text-white/60 leading-relaxed ${isHero ? 'text-xs sm:text-sm line-clamp-4' : 'text-[10px] sm:text-xs line-clamp-3'}`}>
                      {item.description}
                    </p>
                  </div>

                  {/* Bottom Bar */}
                  <div className="flex justify-between items-end mt-4 z-10 border-t border-white/10 pt-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider">SOURCE</span>
                      <span className="text-[10px] font-mono text-white/70 truncate max-w-[120px]">{item.source}</span>
                    </div>
                    {item.machine_assessment && (
                      <div className="bg-red-500/10 border border-red-500/20 px-2 py-1 text-[8px] font-mono text-red-400">
                        AI ASSESSED
                      </div>
                    )}
                    {item.coords && (
                      <span className="material-symbols-outlined text-white/30 group-hover:text-secondary transition-colors text-lg" title="View on Map">
                        travel_explore
                      </span>
                    )}
                  </div>
                  
                  {/* Background Accents */}
                  <div className={`absolute -bottom-10 -right-10 w-40 h-40 bg-${color}-500/5 blur-[50px] pointer-events-none transition-opacity opacity-50 group-hover:opacity-100`}></div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
