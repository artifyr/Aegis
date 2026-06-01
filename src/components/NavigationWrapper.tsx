'use client';

import { usePathname } from 'next/navigation';
import { TopNavBar } from './TopNavBar';
import { SideNavBar } from './SideNavBar';
import { BottomNavBar } from './BottomNavBar';
import { GlobalDataLoader } from './GlobalDataLoader';

export function NavigationWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <>
      <TopNavBar />
      <GlobalDataLoader />
      <div className="flex pt-16 pb-16 md:pb-0 h-screen w-screen overflow-hidden tactical-grid bg-black">
        <SideNavBar />
        {children}
      </div>
      <BottomNavBar />
    </>
  );
}
