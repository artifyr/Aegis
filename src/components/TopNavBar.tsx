'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function TopNavBar() {
  const pathname = usePathname();

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
        <div className="hidden lg:flex flex-col items-end font-mono text-[10px] tracking-widest">
          <span className="text-[#66FCF1]">ZULU: 14:22:05</span>
          <span className="text-on-surface-variant/60">SYST_HEALTH: OPTIMAL</span>
        </div>
        <div className="flex items-center gap-4 text-on-surface-variant">
          <span className="material-symbols-outlined cursor-pointer hover:text-white transition-colors">settings</span>
          <div className="relative">
            <span className="material-symbols-outlined cursor-pointer hover:text-white transition-colors">notifications</span>
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-on-tertiary-container"></span>
          </div>
          <span className="material-symbols-outlined cursor-pointer hover:text-white transition-colors">account_circle</span>
        </div>
      </div>
    </header>
  );
}
