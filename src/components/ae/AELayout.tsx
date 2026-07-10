import React from 'react';
import { useLocation } from 'react-router-dom';
import AETopBar from './AETopBar';
import AESidebar from './AESidebar';

interface AELayoutProps {
  children: React.ReactNode;
}

function getSectionLabel(pathname: string): string {
  if (pathname.includes('/ae/hotels')) return 'Hotel Management';
  return 'Dashboard';
}

export const AELayout: React.FC<AELayoutProps> = ({ children }) => {
  const location = useLocation();
  const sectionLabel = getSectionLabel(location.pathname);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <AESidebar />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar */}
        <AETopBar sectionLabel={sectionLabel} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 bg-slate-50/50 dark:bg-slate-900/10">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AELayout;
