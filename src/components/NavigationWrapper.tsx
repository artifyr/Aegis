'use client';

import { usePathname } from 'next/navigation';
import { TopNavBar } from './TopNavBar';
import { SideNavBar } from './SideNavBar';
import { BottomNavBar } from './BottomNavBar';
import { SearchPanel } from './SearchPanel';
import { GlobalDataLoader } from './GlobalDataLoader';
import { useTacticalStore } from '@/store/tactical-store';
import { AnalyticsPanel } from './AnalyticsPanel';

export function NavigationWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { mobileActiveTab, setMobileActiveTab } = useTacticalStore();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  const isMapPage = pathname === '/';

  return (
    <>
      <TopNavBar />
      <GlobalDataLoader />
      <div className="flex pt-16 pb-16 md:pb-0 h-screen w-screen overflow-hidden tactical-grid bg-black relative">
        <SideNavBar />
        {children}
        <AnalyticsPanel desktopHidden={!isMapPage} />

        {/* Mobile Backdrop Overlay */}
        {mobileActiveTab !== 'none' && (
          <div 
            className="md:hidden fixed inset-0 z-[80] bg-black/60 backdrop-blur-md transition-opacity"
            onClick={() => setMobileActiveTab('none')}
          />
        )}
      </div>
      <SearchPanel />
      <BottomNavBar />
    </>
  );
}
