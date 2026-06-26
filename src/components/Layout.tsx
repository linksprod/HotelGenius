
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, Link } from 'react-router-dom';
import MainMenu from './MainMenu';
import UserMenu from './UserMenu';
import NotificationMenu from './NotificationMenu';
import BottomNav from './BottomNav';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from './ui/scroll-area';
import { ThemeToggle } from './ThemeToggle';


import { useHotel } from '@/features/hotels/context/HotelContext';
import { hexToHSL } from '@/lib/colors';
import { useTheme } from 'next-themes';

interface LayoutProps {
  children: React.ReactNode;
  hideBottomNav?: boolean;
  hideHeader?: boolean;
}

const Layout = ({
  children,
  hideBottomNav = false,
  hideHeader = false
}: LayoutProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { hotel } = useHotel();
  const { resolvedTheme } = useTheme();

  const isHomePage = hotel ? location.pathname === `/${hotel.slug}` || location.pathname === `/${hotel.slug}/` : false;
  const isSpaManagerPage = hotel ? location.pathname === `/${hotel.slug}/admin/spa` : location.pathname === '/admin/spa';
  const isMessagesPage = hotel ? location.pathname === `/${hotel.slug}/messages` : location.pathname === '/messages';
  const isMobile = useIsMobile();

  const homeLink = hotel ? `/${hotel.slug}` : "/";

  const isDark = resolvedTheme === 'dark';
  const resolvedPrimaryColor = (isDark ? hotel?.dark_primary_color : hotel?.primary_color) || hotel?.primary_color;

  // Prepare dynamic theme styles
  const dynamicStyles = resolvedPrimaryColor ? {
    '--primary': hexToHSL(resolvedPrimaryColor),
    '--ring': hexToHSL(resolvedPrimaryColor),
  } as React.CSSProperties : {};

  return (
    <div className="min-h-screen bg-background" style={dynamicStyles}>
      {!hideHeader && (
        <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-lg">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Left section - Menu */}
              <div className="flex items-center flex-1">
                <MainMenu />
              </div>

              {/* Center section - Official Logo */}
              <div id="main-header-logo" className="flex justify-center items-center flex-1">
                <Link 
                  to={homeLink} 
                  className="main-header-logo absolute left-1/2 -translate-x-1/2 flex items-center justify-center gap-2 hover:opacity-80 transition-opacity"
                >
                  {hotel?.logo_url ? (
                    <img src={hotel.logo_url} alt={hotel.name} className="h-11 w-auto object-contain max-w-[180px] dark:brightness-0 dark:invert" />
                  ) : (
                    <span className={cn(
                      "font-qurova font-light tracking-wide text-foreground transition-colors",
                      isMobile ? "text-xl" : "text-2xl"
                    )}>
                      {hotel?.name ?? "HotelGenius"}
                    </span>
                  )}
                </Link>
              </div>


              {/* Right section - Notifications and User Menu */}
              <div className="flex items-center justify-end gap-1 flex-1">
                <ThemeToggle />
                <NotificationMenu />
                <UserMenu />
              </div>
            </div>
          </div>
        </header>
      )}

      <main className={cn(
        "container mx-auto px-[9px] pt-16 pb-24",
        isSpaManagerPage && "h-screen flex flex-col",
        isMessagesPage && "fixed inset-0 flex flex-col max-w-none px-0 z-0 bg-background",
        isMessagesPage && (hideHeader ? "pt-0" : "pt-16"),
        isMessagesPage && (hideBottomNav ? "pb-0" : "pb-16")
      )}>
        {isSpaManagerPage ? (
          <ScrollArea className="flex-1 overflow-y-auto h-full">
            <div className="py-4 h-full">
              {children}
            </div>
          </ScrollArea>
        ) : isMessagesPage ? (
          <div className="flex-1 h-full overflow-hidden">
            {children}
          </div>
        ) : (
          <div>
            {children}
          </div>
        )}
      </main>

      {!hideBottomNav && <BottomNav />}
    </div >
  );
};

export default Layout;
