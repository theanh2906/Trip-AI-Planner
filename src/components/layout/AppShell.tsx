import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { cn } from '../../lib/utils';

interface AppShellProps {
  children: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const isMobile = useIsMobile();

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-100">
      {isMobile && <Header />}
      {!isMobile && <Header />}
      <Sidebar />
      <main className={cn('relative w-full h-full', isMobile && 'pt-14 pb-16')}>{children}</main>
      {isMobile && <BottomNav />}
    </div>
  );
};

export default AppShell;
