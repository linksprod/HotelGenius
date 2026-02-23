
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { UtensilsCrossed, BedDouble, Phone, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMessageBadge } from '@/hooks/useMessageBadge';
import { useHotelPath } from '@/hooks/useHotelPath';

const BottomNav = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const isMobile = useIsMobile();
  const { unreadCount } = useMessageBadge();
  const { resolvePath } = useHotelPath();

  const isAdminPage = location.pathname.includes('/admin');

  // Optimiser la gestion du scroll pour de meilleures performances
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    if (currentScrollY > lastScrollY && currentScrollY > 20) {
      // Scrolling down - hide the navbar
      setIsVisible(false);
    } else {
      // Scrolling up - show the navbar
      setIsVisible(true);
    }
    setLastScrollY(currentScrollY);
  }, [lastScrollY]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, {
      passive: true
    });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Créer le tableau navItems une seule fois et le mettre en cache
  const navItems = useMemo(() => [
    {
      icon: <UtensilsCrossed className="h-5 w-5" />,
      label: t('bottomNav.dining'),
      path: '/dining'
    },
    {
      icon: <BedDouble className="h-5 w-5" />,
      label: t('bottomNav.myRoom'),
      path: '/my-room'
    },
    {
      icon: <Phone className="h-5 w-5" />,
      label: t('bottomNav.request'),
      path: '/services'
    },
    {
      icon: (
        <div className="relative">
          <MessageCircle className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full text-[8px] text-white flex items-center justify-center font-medium border border-card">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      ),
      label: 'Messages',
      path: '/messages'
    }
  ], [t, unreadCount]);

  // Optimiser la fonction de navigation
  const handleNavigation = useCallback((path: string) => {
    if (path !== '#') {
      const resolvedPath = resolvePath(path);
      if (path === '/messages') {
        navigate(resolvedPath, { state: { from: location.pathname } });
      } else {
        navigate(resolvedPath);
      }
    }
  }, [navigate, location.pathname, resolvePath]);

  // Hide navbar on admin pages
  if (isAdminPage) {
    return null;
  }

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border shadow-xl z-50 transition-transform duration-300 ease-out",
        isVisible ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="flex justify-around items-center h-16">
        {navItems.map(item => (
          <button
            key={`${item.path}-${item.label}`}
            onClick={() => handleNavigation(item.path)}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full gap-1.5 transition-colors relative",
              location.pathname === resolvePath(item.path)
                ? "text-primary"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            <div className="relative inline-flex items-center justify-center">
              {item.icon}
            </div>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
