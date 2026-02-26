
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

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({
  children
}: LayoutProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { hotel } = useHotel();

  const isHomePage = hotel ? location.pathname === `/${hotel.slug}` || location.pathname === `/${hotel.slug}/` : false;
  const isSpaManagerPage = hotel ? location.pathname === `/${hotel.slug}/admin/spa` : location.pathname === '/admin/spa';
  const isMessagesPage = hotel ? location.pathname === `/${hotel.slug}/messages` : location.pathname === '/messages';
  const isMobile = useIsMobile();

  const homeLink = hotel ? `/${hotel.slug}` : "/";

  // Prepare dynamic theme styles
  const dynamicStyles = hotel?.primary_color ? {
    '--primary': hexToHSL(hotel.primary_color),
    '--ring': hexToHSL(hotel.primary_color),
  } as React.CSSProperties : {};

  return (
    <div className="min-h-screen bg-background" style={dynamicStyles}>
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-lg">
        <div className="container mx-auto px-4">
          <div className="relative flex items-center h-16">
            {/* Left section - Menu */}
            <div className="absolute left-0 flex items-center">
              <MainMenu />
            </div>

            {/* Center section - Logo - absolutely centered */}
            <div className={cn(
              "w-full flex justify-center items-center pointer-events-none",
              isMobile && "px-24"
            )}>
              <Link to={homeLink} className="hover:opacity-80 transition-opacity pointer-events-auto">
                {hotel?.logo_url ? (
                  <img
                    src={hotel.logo_url}
                    alt={hotel.name}
                    className={cn("object-contain", isMobile ? "h-8" : "h-10")}
                  />
                ) : (
                  <img
                    src="/lovable-uploads/aab13959-5215-4313-87f8-c3012cdb27f0.png"
                    alt="Hotel Genius"
                    className={cn("filter brightness-110 dark:brightness-0 dark:invert", isMobile ? "h-5" : "h-7")}
                  />
                )}
              </Link>
            </div>

            {/* Right section - Notifications and User Menu */}
            <div className="absolute right-0 flex items-center gap-1">
              <ThemeToggle />
              <NotificationMenu />
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <main className={cn(
        "container mx-auto px-[9px] pt-16 pb-24",
        isSpaManagerPage && "h-screen flex flex-col",
        isMessagesPage && "max-w-none px-0 pt-16 pb-16 h-screen flex flex-col"
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

      <BottomNav />
    </div >
  );
};

export default Layout;
