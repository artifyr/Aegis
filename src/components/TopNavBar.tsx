'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export function TopNavBar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [uptime, setUptime] = useState(0);
  const [zuluTime, setZuluTime] = useState('');

  useEffect(() => {
    setMounted(true);
    const start = Date.now();
    const updateTime = () => {
      setUptime(Math.floor((Date.now() - start) / 1000));
      const now = new Date();
      const zulu = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')}`;
      setZuluTime(`ZULU: ${zulu}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const navLinks = [
    { name: 'MAP', href: '/' },
    { name: 'ANALYTICS', href: '/analytics' },
    { name: 'ARCHIVE', href: '/archive' },
    { name: 'NEWS', href: '/news' },
  ];

  return (
    <header className="flex justify-between items-center w-full px-6 h-16 bg-black fixed top-0 z-50 border-b border-white/20">
      <div className="flex items-center gap-8">
        <Link href="/">
          <h1 className="text-2xl font-black tracking-widest text-white uppercase font-headline hover:text-white/80 transition-colors">
            AEGIS
          </h1>
        </Link>
        <nav className="hidden md:flex gap-6 items-center">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`font-mono tracking-widest uppercase text-[11px] transition-colors pb-1 ${
                  isActive
                    ? 'text-white border-b-2 border-white'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
        <div 
          className="cursor-pointer transition-transform hover:scale-110 flex items-center justify-center ml-2 md:ml-4"
          onClick={() => (window as any).__aegisCameraReset?.()}
          title="Reset Globe View"
        >
          <img src="/aegislogo.png" alt="Aegis Logo" className="h-6" />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-white/30 rounded-none bg-black">
            <button 
              onClick={() => (window as any).__aegisToggleMapStyle?.()}
              className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 transition-colors border-r border-white/30"
              title="Toggle Satellite View"
            >
              <span className="material-symbols-outlined text-[18px]">satellite_alt</span>
            </button>
            <button 
              onClick={() => (window as any).__aegisCameraZoomIn?.()}
              className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 transition-colors border-r border-white/30"
              title="Zoom In"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
            </button>
            <button 
              onClick={() => (window as any).__aegisCameraZoomOut?.()}
              className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              title="Zoom Out"
            >
              <span className="material-symbols-outlined text-[18px]">remove</span>
            </button>
          </div>
        </div>

        <div className="hidden lg:flex flex-col items-end font-mono text-[10px] tracking-widest border border-white/30 px-3 py-1">
          <span className="text-white">{mounted ? zuluTime : 'ZULU: --:--:--'}</span>
          <span className="text-green-500">SYST: OPTIMAL</span>
        </div>

        <div className="hidden lg:flex flex-col items-end font-mono text-[10px] tracking-widest border border-white/30 px-3 py-1">
          <span className="text-white/50">UPTIME</span>
          <span className="text-white">{mounted ? formatUptime(uptime) : '00:00:00'}</span>
        </div>

        <button 
          onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/login';
          }}
          className="font-mono text-[10px] tracking-widest text-white/50 hover:text-white transition-colors"
        >
          LOGOUT
        </button>
      </div>
    </header>
  );
}
