'use client';

import { useTacticalStore } from '@/store/tactical-store';
import { useRouter } from 'next/navigation';

export function BottomNavBar() {
  const { mobileActiveTab, setMobileActiveTab } = useTacticalStore();
  const router = useRouter();

  const tabs = [
    { id: 'layers', label: 'LAYERS', icon: 'layers' },
    { id: 'analytics', label: 'ANALYTICS', icon: 'bar_chart' },
    { id: 'map', label: 'MAP', icon: 'public' },
    { id: 'status', label: 'STATUS', icon: 'router' },
    { id: 'news', label: 'NEWS', icon: 'newspaper' },
    { id: 'search', label: 'SEARCH', icon: 'search' },
  ] as const;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0a0a0c] border-t border-white/10 z-[100] flex justify-around items-center px-1">
      {tabs.map((tab) => {
        const isActive = mobileActiveTab === tab.id;
        const isMap = tab.id === 'map';
        return (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.id === 'analytics') {
                router.push('/analytics');
                setMobileActiveTab('none');
              } else if (tab.id === 'news') {
                router.push('/news');
                setMobileActiveTab('none');
              } else if (tab.id === 'map') {
                router.push('/');
                setMobileActiveTab('none');
              } else {
                setMobileActiveTab(isActive ? 'none' : (tab.id as any));
              }
            }}
            className={`flex flex-col items-center justify-center flex-1 gap-1 transition-colors ${
              isActive || isMap ? 'text-secondary' : 'text-slate-500'
            }`}
          >
            <span className={`material-symbols-outlined ${isMap ? 'text-[28px] drop-shadow-[0_0_8px_rgba(14,165,233,0.8)] text-[#0ea5e9]' : 'text-[20px]'}`}>
              {tab.icon}
            </span>
            <span className="text-[8px] font-mono tracking-widest">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
