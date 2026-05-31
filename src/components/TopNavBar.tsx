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
    { name: 'MISSIONS', href: '/missions' },
  ];

  return (
    <header className="flex justify-between items-center w-full px-6 h-16 bg-[#0d0e12] dark:bg-slate-950 fixed top-0 z-50 border-b-0 inner-glow-primary">
      <div className="flex items-center gap-8">
        <h1 className="text-xl font-black tracking-widest text-white uppercase font-headline">AEGIS COMMAND</h1>
        <nav className="hidden md:flex gap-6 items-center">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`font-headline tracking-tighter uppercase text-sm transition-colors pb-1 ${
                  isActive
                    ? 'text-white border-b-2 border-[#66FCF1]'
                    : 'text-slate-500 hover:text-[#66FCF1] hover:bg-white/5 font-mono'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center gap-6">
        <button 
          onClick={() => (window as any).__aegisCameraReset?.()}
          className="w-8 h-8 flex items-center justify-center bg-[rgba(68,71,78,0.40)] text-[#3cdcd1] rounded-full cursor-pointer transition-all duration-150 hover:bg-[rgba(68,71,78,0.60)] border border-[#3cdcd1]/50 shadow-[0_0_10px_rgba(60,220,209,0.3)] hover:scale-110"
          title="Reset Globe View"
        >
          <span className="material-symbols-outlined text-[16px]">public</span>
        </button>

        <div className="hidden lg:flex flex-col items-end font-mono text-[10px] tracking-widest">
          <span className="text-[#66FCF1]">{mounted ? zuluTime : 'ZULU: --:--:--'}</span>
          <span className="text-on-surface-variant/60">SYST_HEALTH: OPTIMAL</span>
        </div>

        <div className="hidden lg:flex flex-col items-end font-mono text-[10px] tracking-widest border-l border-outline-variant/30 pl-4">
          <span className="text-[#3cdcd1]">UPTIME</span>
          <span className="text-white">{mounted ? formatUptime(uptime) : '00:00:00'}</span>
        </div>

        <div className="flex items-center gap-4 text-on-surface-variant ml-2">
          <div className="relative">
            <span className="material-symbols-outlined cursor-pointer hover:text-white transition-colors">notifications</span>
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#66FCF1] rounded-full shadow-[0_0_5px_#66FCF1]"></span>
          </div>
          <span className="material-symbols-outlined cursor-pointer hover:text-white transition-colors">account_circle</span>
        </div>
      </div>
    </header>
  );
}
