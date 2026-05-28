import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { settingsNavigation, Role } from '@/config/admin/navigation';
import { useHotelPath } from '@/hooks/useHotelPath';
import { useUserRole } from '@/hooks/useUserRole';
import { Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function UnifiedSettingsLayout() {
  const { resolvePath } = useHotelPath();
  const { role, isSuperAdmin } = useUserRole();
  const location = useLocation();
  const navigate = useNavigate();

  // On mobile: show list → tap item → show content (back to list)
  const [mobileView, setMobileView] = useState<'nav' | 'content'>('nav');

  const filteredNavigation = settingsNavigation.map(section => ({
    ...section,
    items: section.items.filter(item => {
      if (!isSuperAdmin && item.requiredRoles) {
        if (!role || !item.requiredRoles.includes(role as Role)) return false;
      }
      return true;
    }),
  })).filter(section => section.items.length > 0);

  // Detect which item is currently active
  const activeItem = filteredNavigation
    .flatMap(s => s.items)
    .find(item => location.pathname === resolvePath(item.url));

  const handleMobileItemClick = (url: string) => {
    navigate(url);
    setMobileView('content');
  };

  // ─── Shared nav list ───────────────────────────────────────────────────────
  const NavList = ({ onItemClick }: { onItemClick?: (url: string) => void }) => (
    <nav className="space-y-5">
      {filteredNavigation.map((section, idx) => (
        <div key={idx} className="space-y-0.5">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/60 mb-1">
            {section.title}
          </p>
          {section.items.map((item, itemIdx) => {
            const url = resolvePath(item.url);
            const isActive = location.pathname === url;
            return (
              <NavLink
                key={itemIdx}
                to={url}
                onClick={() => onItemClick?.(url)}
                className={cn(
                  'flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground/70 hover:text-foreground hover:bg-muted/70'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                    isActive ? 'bg-primary/15' : 'bg-muted group-hover:bg-muted/80'
                  )}>
                    <item.icon className={cn(
                      'w-4 h-4',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )} />
                  </div>
                  <span>{item.title}</span>
                </div>
                {/* Active indicator */}
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                )}
                {/* Mobile chevron for non-active */}
                {!isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 lg:hidden" />
                )}
              </NavLink>
            );
          })}
        </div>
      ))}
    </nav>
  );

  return (
    <div className="flex h-full w-full bg-background">

      {/* ── DESKTOP: fixed left sidebar + scrollable content ── */}
      <aside className="hidden lg:flex w-64 xl:w-72 shrink-0 flex-col h-full border-r border-border/60 bg-background overflow-y-auto">
        {/* Sidebar header with back button */}
        <div className="sticky top-0 bg-background z-10 px-4 pt-5 pb-4 border-b border-border/40">
          <button
            onClick={() => navigate(resolvePath('/admin'))}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Settings className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-base font-bold text-foreground tracking-tight">Settings</h2>
          </div>
        </div>
        <div className="flex-1 px-3 py-4">
          <NavList />
        </div>
      </aside>

      {/* ── MOBILE: list view or content view ── */}
      <div className="flex-1 flex flex-col min-w-0 lg:hidden overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {mobileView === 'nav' ? (
            // Mobile nav list
            <motion.div
              key="nav"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.18 }}
              className="flex-1 overflow-y-auto"
            >
              {/* Mobile nav header */}
              <div className="sticky top-0 bg-background z-10 px-4 pt-4 pb-3 border-b border-border/40">
                <button
                  onClick={() => navigate(resolvePath('/admin'))}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3 group"
                >
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                  Back to Dashboard
                </button>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Settings className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="text-base font-bold text-foreground">Settings</h2>
                </div>
              </div>
              <div className="px-3 py-4">
                <NavList onItemClick={() => setMobileView('content')} />
              </div>
            </motion.div>
          ) : (
            // Mobile content view
            <motion.div
              key="content"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.18 }}
              className="flex-1 flex flex-col overflow-y-auto"
            >
              {/* Mobile content header with back */}
              <div className="sticky top-0 bg-background z-10 px-4 pt-4 pb-3 border-b border-border/40">
                <button
                  onClick={() => setMobileView('nav')}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-1 group"
                >
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                  Settings
                </button>
                {activeItem && (
                  <div className="flex items-center gap-2.5 mt-2">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                      <activeItem.icon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <h2 className="text-sm font-semibold text-foreground">{activeItem.title}</h2>
                  </div>
                )}
              </div>
              <div className="flex-1 p-4">
                <Outlet />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── DESKTOP: content area ── */}
      <main className="hidden lg:flex flex-1 flex-col min-w-0 overflow-y-auto">
        <div className="flex-1 p-6 xl:p-8">
          <div className={cn("w-full mx-auto", location.pathname.includes('billing') ? "max-w-[1600px]" : "max-w-3xl")}>
            <Outlet />
          </div>
        </div>
      </main>

    </div>
  );
}
