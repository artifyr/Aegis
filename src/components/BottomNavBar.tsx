'use client';

import { useTacticalStore } from '@/store/tactical-store';

export function BottomNavBar() {
  const { mobileActiveTab, setMobileActiveTab } = useTacticalStore();

  const tabs = [
    { id: 'layers', label: 'LAYERS', icon: 'layers' },
    { id: 'analytics', label: 'ANALYTICS', icon: 'bar_chart' },
    { id: 'status', label: 'STATUS', icon: 'router' },
    { id: 'news', label: 'NEWS', icon: 'newspaper' },
    { id: 'search', label: 'SEARCH', icon: 'search' },
  ] as const;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0a0a0c] border-t border-white/10 z-[100] flex justify-around items-center px-2">
      {tabs.map((tab) => {
        const isActive = mobileActiveTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.id === 'analytics') {
                window.location.href = '/analytics';
              } else {
                setMobileActiveTab(isActive ? 'none' : (tab.id as any));
              }
            }}
            className={`flex flex-col items-center justify-center w-16 gap-1 transition-colors ${
              isActive ? 'text-secondary' : 'text-slate-500'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">{tab.icon}</span>
            <span className="text-[9px] font-mono tracking-widest">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
