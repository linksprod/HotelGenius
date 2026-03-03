
import React from 'react';
import { useTheme } from 'next-themes';
import menuIconWhite from '@/assets/menu-icon-dark.png';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BedDouble, UtensilsCrossed, Heart, Compass, Phone, ShoppingBag, Map, Home, Info, Calendar, BellRing } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHotelPath } from '@/hooks/useHotelPath';

interface MainMenuProps {
  buttonClassName?: string;
}

const MainMenu = ({ buttonClassName }: MainMenuProps = {}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = React.useState(false);
  const { resolvePath } = useHotelPath();
  const { theme } = useTheme();

  const menuIconSrc = theme === 'dark'
    ? menuIconWhite
    : '/lovable-uploads/e2223a53-3149-4a08-a3f3-2bb8d3db515f.png';

  console.log('Current path in MainMenu:', location.pathname);

  const menuItems = [
    { icon: <Home className="h-5 w-5" />, label: t('nav.home'), path: '/' },
    { icon: <BellRing className="h-5 w-5" />, label: t('nav.notifications'), path: '/requests' },
    { icon: <Info className="h-5 w-5" />, label: t('nav.about'), path: '/about' },
    { icon: <UtensilsCrossed className="h-5 w-5" />, label: t('nav.gastronomy'), path: '/dining' },
    { icon: <Heart className="h-5 w-5" />, label: t('nav.spa'), path: '/spa' },
    { icon: <Phone className="h-5 w-5" />, label: t('nav.concierge'), path: '/services' },
    { icon: <Calendar className="h-5 w-5" />, label: t('nav.eventsPromos'), path: '/events' },
    { icon: <Compass className="h-5 w-5" />, label: t('nav.destination'), path: '/destination' },
    { icon: <ShoppingBag className="h-5 w-5" />, label: t('nav.shops'), path: '/shops' },
    { icon: <Map className="h-5 w-5" />, label: t('nav.hotelMap'), path: '/map' },
    { icon: <BedDouble className="h-5 w-5" />, label: t('nav.myRoom'), path: '/my-room' },
  ];

  const handleNavigate = (path: string) => {
    const resolvedPath = resolvePath(path);
    console.log(`Navigating to: ${resolvedPath}`);
    setOpen(false);
    navigate(resolvedPath);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          id="onboarding-menu"
          variant="ghost"
          size="icon"
          className={cn("relative p-2 rounded-full hover:bg-accent/20", buttonClassName)}
        >
          <img
            src={menuIconSrc}
            alt="Menu"
            className="h-6 w-6 object-contain"
          />
          <span className="absolute top-0 right-0 h-2 w-2 bg-primary rounded-full" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-80 sm:max-w-sm bg-card border-border">
        <div className="flex flex-col bg-card">
          <SheetHeader className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-b border-border">
            <div className="flex items-center gap-3">
              <img
                src={menuIconSrc}
                alt="Logo"
                className="h-8 w-8 object-contain"
              />
              <SheetTitle className="text-2xl text-card-foreground font-semibold">{t('nav.services')}</SheetTitle>
            </div>
          </SheetHeader>
          <ScrollArea className="flex-1 bg-card">
            <div className="grid gap-2 p-4">
              {menuItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  className="w-full justify-start gap-3 p-4 rounded-xl hover:bg-primary/10 transition-colors text-card-foreground"
                  onClick={() => handleNavigate(item.path)}
                >
                  <span className="text-card-foreground">{item.icon}</span>
                  <span className="font-medium text-card-foreground">{item.label}</span>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MainMenu;
