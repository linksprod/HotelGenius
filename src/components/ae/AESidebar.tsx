import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { aeNavigation } from '@/config/ae/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Pin, PinOff } from 'lucide-react';
import menuIcon from '@/assets/menu-icon-dark.png';

const PIN_KEY = 'ae_sidebar_pinned';

const AESidebar: React.FC = () => {
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const [pinned, setPinned] = useState(() => {
    try {
      return localStorage.getItem(PIN_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [hoverTimeout, setHoverTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  const isActive = (url: string) => {
    return location.pathname === url || location.pathname.startsWith(url + '/');
  };

  const isOpen = pinned || expanded;

  const handleMouseEnter = () => {
    if (pinned) return;
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setExpanded(true);
  };

  const handleMouseLeave = () => {
    if (pinned) return;
    const t = setTimeout(() => setExpanded(false), 200);
    setHoverTimeout(t);
  };

  const togglePin = () => {
    const next = !pinned;
    setPinned(next);
    setExpanded(next);
    try {
      localStorage.setItem(PIN_KEY, String(next));
    } catch {}
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          'relative flex flex-col h-screen bg-background border-r border-border/60 z-40 shrink-0 overflow-hidden',
          'transition-all duration-280 ease-[cubic-bezier(0.4,0,0.2,1)]',
          isOpen ? 'w-[240px]' : 'w-[56px]',
          'hidden md:flex'
        )}
        style={{ willChange: 'width' }}
      >
        {/* Logo zone */}
        <div className={cn(
          "h-[56px] flex items-center shrink-0 border-b border-border/40 gap-2.5 px-3",
          !isOpen && "justify-center px-0"
        )}>
          <div className="w-8 h-8 rounded-lg bg-primary/10 relative flex items-center justify-center shrink-0">
            <img
              src={menuIcon}
              alt="Menu"
              className="w-4 h-4 object-contain absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            />
          </div>
          {isOpen && (
            <span className="text-xl font-qurova font-light tracking-wide text-sidebar-foreground whitespace-nowrap leading-none mt-[1px]">
              HotelGenius
            </span>
          )}
        </div>

        {/* Navigation items */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-0.5 px-2">
          {aeNavigation.map((item) => {
            const active = isActive(item.url);
            const btn = (
              <NavLink
                to={item.url}
                className={cn(
                  'relative flex items-center gap-3 px-2 py-2 rounded-xl text-sm font-medium transition-all duration-150 group',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                )}
              >
                {/* Active indicator bar */}
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.8)]" />
                )}

                {/* Icon */}
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 relative',
                  active ? 'bg-primary/15' : 'group-hover:bg-muted'
                )}>
                  <item.icon className="w-4 h-4" />
                </div>

                {/* Label */}
                {isOpen && (
                  <span className="flex-1 whitespace-nowrap overflow-hidden">
                    {item.title}
                  </span>
                )}
              </NavLink>
            );

            if (!isOpen) {
              return (
                <Tooltip key={item.url}>
                  <TooltipTrigger asChild>{btn}</TooltipTrigger>
                  <TooltipContent side="right" className="text-xs">
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              );
            }
            return <div key={item.url}>{btn}</div>;
          })}
        </nav>

        {/* Footer: Pin toggle */}
        <div className="border-t border-border/40 p-2 space-y-0.5 shrink-0">
          {(() => {
            const pinBtn = (
              <button
                onClick={togglePin}
                className="flex items-center gap-3 w-full px-2 py-2 rounded-xl text-sm font-medium transition-all duration-150 text-muted-foreground hover:text-foreground hover:bg-muted/60"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
                  {pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                </div>
                {isOpen && <span className="whitespace-nowrap">{pinned ? 'Unpin sidebar' : 'Pin sidebar'}</span>}
              </button>
            );
            if (!isOpen) {
              return (
                <Tooltip>
                  <TooltipTrigger asChild>{pinBtn}</TooltipTrigger>
                  <TooltipContent side="right" className="text-xs">{pinned ? 'Unpin sidebar' : 'Pin sidebar'}</TooltipContent>
                </Tooltip>
              );
            }
            return pinBtn;
          })()}
        </div>
      </aside>
    </TooltipProvider>
  );
};

export default AESidebar;
