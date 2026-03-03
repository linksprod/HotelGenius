
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
          <div className="flex items-center justify-between h-16">
            {/* Left section - Menu */}
            <div className="flex items-center flex-1">
              <MainMenu />
            </div>

            {/* Center section - Logo */}
            <div className="flex justify-center items-center flex-1">
              <Link to={homeLink} className="hover:opacity-80 transition-opacity">
                {hotel?.logo_url ? (
                  <img
                    src={hotel.logo_url}
                    alt={hotel.name}
                    className={cn("object-contain", isMobile ? "h-7 max-w-[120px]" : "h-10 max-w-[200px]")}
                  />
                ) : hotel?.name ? (
                  <span className={cn(
                    "font-semibold tracking-tight text-foreground dark:text-white",
                    isMobile ? "text-lg" : "text-2xl"
                  )}>
                    {hotel.name}
                  </span>
                ) : (
                  <>
                    {/* Light mode logo */}
                    <img
                      src="/lovable-uploads/logo-light.png"
                      alt="Hotel Genius"
                      className={cn("block dark:hidden object-contain", isMobile ? "h-5 max-w-[120px]" : "h-7 max-w-[200px]")}
                    />
                    {/* Dark mode logo */}
                    <img
                      src="/lovable-uploads/logo-dark.png"
                      alt="Hotel Genius"
                      className={cn("hidden dark:block object-contain", isMobile ? "h-5 max-w-[120px]" : "h-7 max-w-[200px]")}
                    />
                  </>
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

      <main className={cn(
        "container mx-auto px-[9px] pt-16 pb-24",
        isSpaManagerPage && "h-screen flex flex-col",
        isMessagesPage && "fixed inset-0 pt-16 pb-16 flex flex-col max-w-none px-0 z-0 bg-background"
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
