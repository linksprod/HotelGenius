import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useHotelPath } from '@/hooks/useHotelPath';
import { useUserRole } from '@/hooks/useUserRole';
import { useHotel } from '@/features/hotels/context/HotelContext';
import { useAdminNotifications } from '@/hooks/admin/useAdminNotifications';
import { adminNavigation, globalNavigation, Role, PlanTier } from '@/config/admin/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Settings, Pin, PinOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import menuIcon from '@/assets/menu-icon-dark.png';

const planWeight: Record<PlanTier, number> = { essential: 0, experience: 1, elite: 2 };

const hasRequiredPlan = (currentPlan: string | undefined, requiredPlan?: PlanTier) => {
  if (!requiredPlan) return true;
  const current = (currentPlan as PlanTier) || 'essential';
  return planWeight[current] >= planWeight[requiredPlan];
};

const PIN_KEY = 'admin_sidebar_pinned';

const AdminSidebarRail: React.FC = () => {
  const location = useLocation();
  const { resolvePath } = useHotelPath();
  const { role, isSuperAdmin } = useUserRole();
  const { hotel } = useHotel();
  const { counts } = useAdminNotifications();
  const navigate = useNavigate();

  const [expanded, setExpanded] = useState(false);
  const [pinned, setPinned] = useState(() => {
    try { return localStorage.getItem(PIN_KEY) === 'true'; } catch { return false; }
  });
  const [hoverTimeout, setHoverTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  const isGlobalContext = location.pathname.startsWith('/administration/super');
  const baseNav = isGlobalContext && isSuperAdmin ? globalNavigation : adminNavigation;

  const filteredNav = baseNav.map((section) => ({
    ...section,
    items: section.items.filter((item) => {
      if (!isSuperAdmin && item.requiredRoles && role) {
        if (!item.requiredRoles.includes(role as Role)) return false;
      }
      if (!isSuperAdmin && item.requiredModules && hotel?.active_modules) {
        if (!item.requiredModules.every((m) => hotel.active_modules!.includes(m))) return false;
      }
      if (!isSuperAdmin && item.requiredPlan) {
        if (!hasRequiredPlan(hotel?.plan, item.requiredPlan)) return false;
      }
      return true;
    }),
  })).filter((s) => s.items.length > 0);

  const allItems = filteredNav.flatMap((s) => s.items);

  const isActive = (url: string) => {
    const resolved = resolvePath(url);
    if (url === '/admin') return location.pathname === resolved;
    return location.pathname.startsWith(resolved);
  };

  const getNotificationCount = (notifKey?: string) => {
    if (!notifKey) return 0;
    return (counts as any)[notifKey] ?? 0;
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
    try { localStorage.setItem(PIN_KEY, String(next)); } catch {}
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
          // Hide on mobile (top bar handles navigation)
          'hidden md:flex'
        )}
        style={{ willChange: 'width' }}
      >
        {/* Logo zone — mirrors topbar height */}
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
          {filteredNav.map((section, si) => (
            <div key={section.label}>
              {/* Section label — only visible when expanded */}
              {isOpen && si > 0 && (
                <div className="pt-4 pb-1 px-2">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                    {section.label}
                  </span>
                </div>
              )}
              {!isOpen && si > 0 && (
                <div className="mx-auto w-4 h-px bg-border/60 my-2" />
              )}

              {section.items.map((item) => {
                const active = isActive(item.url);
                const notifCount = getNotificationCount(item.notificationKey);
                const btn = (
                  <NavLink
                    to={resolvePath(item.url)}
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
                      {notifCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center px-0.5">
                          {notifCount > 99 ? '99+' : notifCount}
                        </span>
                      )}
                    </div>

                    {/* Label */}
                    {isOpen && (
                      <span className="flex-1 whitespace-nowrap overflow-hidden">
                        {item.title}
                      </span>
                    )}
                    {isOpen && notifCount > 0 && (
                      <span className="ml-auto bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                        {notifCount > 99 ? '99+' : notifCount}
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
                        {notifCount > 0 && <span className="ml-1 text-destructive">({notifCount})</span>}
                      </TooltipContent>
                    </Tooltip>
                  );
                }
                return <div key={item.url}>{btn}</div>;
              })}
            </div>
          ))}
        </nav>

        {/* Footer: Settings + Pin */}
        <div className="border-t border-border/40 p-2 space-y-0.5 shrink-0">
          {/* Settings */}
          {(() => {
            const settingsBtn = (
              <NavLink
                to={resolvePath('/admin/settings')}
                className={({ isActive: a }) => cn(
                  'flex items-center gap-3 px-2 py-2 rounded-xl text-sm font-medium transition-all duration-150',
                  a ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                )}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
                  <Settings className="w-4 h-4" />
                </div>
                {isOpen && <span className="whitespace-nowrap">Settings</span>}
              </NavLink>
            );
            if (!isOpen) {
              return (
                <Tooltip>
                  <TooltipTrigger asChild>{settingsBtn}</TooltipTrigger>
                  <TooltipContent side="right" className="text-xs">Settings</TooltipContent>
                </Tooltip>
              );
            }
            return settingsBtn;
          })()}

          {/* Pin toggle */}
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

export default AdminSidebarRail;
