import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, LogOut, Globe, Home, Settings } from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarGroupLabel,
  useSidebar,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/features/auth/hooks/useAuthContext';
import { StaffNotificationBell } from '@/components/admin/StaffNotificationBell';
import { useAdminNotifications } from '@/hooks/admin/useAdminNotifications';
import { useUserRole } from '@/hooks/useUserRole';
import { useHotelPath } from '@/hooks/useHotelPath';
import { useHotel } from '@/features/hotels/context/HotelContext';
import AdminProfileDialog from './AdminProfileDialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { adminNavigation, globalNavigation, NavSectionConfig, Role } from '@/config/admin/navigation';

const NotificationBadge: React.FC<{ count: number }> = ({ count }) => {
  if (count <= 0) return null;
  return (
    <span className="bg-destructive text-destructive-foreground text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-medium absolute right-2 top-1/2 -translate-y-1/2">
      {count > 99 ? '99+' : count}
    </span>
  );
};

const SectionBadge: React.FC<{ count: number }> = ({ count }) => {
  if (count <= 0) return null;
  return (
    <span className="ml-auto mr-1 inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground text-[10px] font-medium px-1">
      {count > 99 ? '99+' : count}
    </span>
  );
};

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
];

export const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const { state, setOpenMobile } = useSidebar();
  const { i18n } = useTranslation();
  const isCollapsed = state === 'collapsed';
  const { counts } = useAdminNotifications();
  const { role, isSuperAdmin } = useUserRole();
  const { resolvePath } = useHotelPath();
  const { hotel } = useHotel();
  const [profileOpen, setProfileOpen] = useState(false);

  const isGlobalContext = location.pathname.startsWith('/administration/super');
  const baseNavigation = isGlobalContext && isSuperAdmin ? globalNavigation : adminNavigation;

  // Filter sections based on roles and active modules
  const filteredSections = baseNavigation.map(section => {
    const filteredItems = section.items.filter(item => {
      // Role Check
      if (!isSuperAdmin && item.requiredRoles) {
        if (!role || !item.requiredRoles.includes(role as Role)) return false;
      }

      // Module Check
      if (!isSuperAdmin && item.requiredModules) {
        if (!hotel?.active_modules) return false;
        const hasModules = item.requiredModules.every(mod => hotel.active_modules!.includes(mod));
        if (!hasModules) return false;
      }

      // Plan Check
      if (!isSuperAdmin && item.requiredPlan) {
        if (!hotel?.plan) return false;
        const planHierarchy: Record<string, number> = {
          'essential': 1,
          'experience': 2,
          'elite': 3
        };
        const currentPlanLevel = planHierarchy[hotel.plan] || 1;
        const requiredPlanLevel = planHierarchy[item.requiredPlan] || 1;
        
        if (currentPlanLevel < requiredPlanLevel) {
          return false;
        }
      }

      return true;
    });

    return { ...section, items: filteredItems };
  }).filter(section => section.items.length > 0);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    baseNavigation.forEach((section) => {
      initial[section.label] = section.defaultOpen ?? false;
    });
    return initial;
  });

  const currentLanguage = languages.find((l) => l.code === i18n.language) || languages[0];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate(resolvePath('/'));
  };

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };

  const isActive = (url: string) => {
    const resolvedUrl = resolvePath(url);
    if (url === '/admin') {
      return location.pathname === resolvedUrl;
    }
    return location.pathname.startsWith(resolvedUrl);
  };

  const isSectionActive = (section: NavSectionConfig) => {
    return section.items.some((item) => isActive(item.url));
  };

  const toggleSection = (label: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const getSectionNotificationCount = (section: NavSectionConfig): number => {
    return section.items.reduce((sum, item) => {
      if (item.notificationKey && counts[item.notificationKey as keyof typeof counts]) {
        return sum + counts[item.notificationKey as keyof typeof counts];
      }
      return sum;
    }, 0);
  };

  const userInitials = userData
    ? `${userData.first_name?.[0] || ''}${userData.last_name?.[0] || ''}`.toUpperCase()
    : user?.email?.[0]?.toUpperCase() || 'A';

  const userName = userData
    ? `${userData.first_name || ''} ${userData.last_name || ''}`.trim()
    : user?.email || 'Admin';

  return (
    <Sidebar collapsible="icon" id="admin-ob-sidebar">
      {/* Header */}
      <SidebarHeader className="p-4 pb-3">
        <div className="flex items-center justify-between gap-3">
          {/* Dynamic Branding */}
          <div className="flex items-center gap-2.5 min-w-0">
            {hotel?.logo_url ? (
              <img
                src={hotel.logo_url}
                alt={`${hotel?.name || 'Hotel'} Logo`}
                className="h-8 w-8 rounded-lg object-contain bg-background p-1 border shrink-0"
              />
            ) : null}
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                {isGlobalContext || hotel?.slug === 'demo' ? (
                  <span className="text-xl font-qurova font-bold tracking-tight text-sidebar-foreground">
                    HotelGenius
                  </span>
                ) : (
                  <>
                    <span className="text-sm font-bold truncate text-sidebar-foreground">
                      {hotel?.name || 'Hotel Admin'}
                    </span>
                    <span className="text-[10px] font-medium text-muted-foreground/60 flex items-center gap-1">
                      Powered by <span className="font-qurova font-bold transition-colors">HotelGenius</span>
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
          {!isCollapsed && (
            <span id="admin-ob-notif-bell" className="shrink-0">
              <StaffNotificationBell />
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      {/* Navigation */}
      <SidebarContent className="px-3 py-2">
        {filteredSections.map((section, index) => {
          const sectionActive = isSectionActive(section);
          const isOpen = openSections[section.label] || sectionActive;
          const isSingleItem = section.items.length === 1;
          const sectionNotifCount = getSectionNotificationCount(section);

          return (
            <React.Fragment key={section.label}>
              {index > 0 && <SidebarSeparator className="mx-0 my-1" />}
              {isSingleItem ? (
                <SidebarGroup className="py-1 px-0">
                  {!isCollapsed && (
                    <SidebarGroupLabel className="h-7 px-3 text-[11px] font-medium tracking-wide text-muted-foreground/70 uppercase">
                      {section.label}
                    </SidebarGroupLabel>
                  )}
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {section.items.map((item) => {
                        const itemCount = item.notificationKey ? (counts[item.notificationKey as keyof typeof counts] || 0) : 0;
                        return (
                          <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                              asChild
                              isActive={isActive(item.url)}
                              tooltip={item.title}
                              className="h-9 rounded-lg transition-all duration-150 relative"
                              onClick={() => setOpenMobile(false)}
                            >
                              <NavLink to={resolvePath(item.url)} end={item.url === '/admin'}>
                                <item.icon className={`h-4 w-4 ${isActive(item.url) ? 'text-primary' : 'text-muted-foreground'}`} />
                                <span>{item.title}</span>
                              </NavLink>
                            </SidebarMenuButton>
                            <NotificationBadge count={itemCount} />
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ) : (
                <Collapsible
                  open={isOpen}
                  onOpenChange={() => toggleSection(section.label)}
                >
                  <SidebarGroup className="py-1 px-0">
                    <CollapsibleTrigger asChild>
                      <SidebarGroupLabel className="flex w-full cursor-pointer items-center justify-between h-7 px-3 text-[11px] font-medium tracking-wide text-muted-foreground/70 uppercase hover:text-muted-foreground transition-colors">
                        <span>{section.label}</span>
                        <div className="flex items-center gap-1">
                          {!isCollapsed && sectionNotifCount > 0 && !isOpen && (
                            <SectionBadge count={sectionNotifCount} />
                          )}
                          {!isCollapsed && (
                            <ChevronRight
                              className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-90' : 'rotate-0'
                                }`}
                            />
                          )}
                        </div>
                      </SidebarGroupLabel>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarGroupContent>
                        <SidebarMenu>
                          {section.items.map((item) => {
                            const itemCount = item.notificationKey ? (counts[item.notificationKey as keyof typeof counts] || 0) : 0;
                            return (
                              <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                  asChild
                                  isActive={isActive(item.url)}
                                  tooltip={item.title}
                                  className="h-9 rounded-lg transition-all duration-150 relative"
                                >
                                  <NavLink to={resolvePath(item.url)} end={item.url === '/admin'}>
                                    <item.icon className={`h-4 w-4 ${isActive(item.url) ? 'text-primary' : 'text-muted-foreground'}`} />
                                    <span>{item.title}</span>
                                  </NavLink>
                                </SidebarMenuButton>
                                <NotificationBadge count={itemCount} />
                              </SidebarMenuItem>
                            );
                          })}
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </CollapsibleContent>
                  </SidebarGroup>
                </Collapsible>
              )}
            </React.Fragment>
          );
        })}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-sidebar-border p-3">
        {/* Theme Toggle & Language Selector */}
        {!isCollapsed && (
          <div className="flex items-center gap-2 mb-2">
            <ThemeToggle />
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <Link to={hotel?.slug ? (hotel.slug === 'demo' ? '/demo' : `/${hotel.slug}`) : '/'}>
                      <Home className="h-4 w-4" />
                      <span className="sr-only">View Public Site</span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  View Public Site
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="h-4 w-px bg-border/40 mx-1" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 justify-start gap-2 h-8 px-2 text-xs text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span>{currentLanguage.flag} {currentLanguage.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-36">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className="cursor-pointer text-xs"
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Settings Link */}
        <SidebarMenuButton
          asChild
          isActive={location.pathname.startsWith(resolvePath('/admin/settings'))}
          className="h-9 rounded-lg transition-all duration-150 mb-2 w-full justify-start text-muted-foreground hover:text-foreground"
        >
          <NavLink to={resolvePath('/admin/settings/hotel-profile')}>
            <Settings className="h-4 w-4" />
            {!isCollapsed && <span>Hotel Settings</span>}
          </NavLink>
        </SidebarMenuButton>

        {/* User Profile */}
        <div
          id="admin-ob-user-profile"
          className="flex items-center gap-2.5 rounded-lg p-2 hover:bg-sidebar-accent transition-colors cursor-pointer group"
          onClick={() => setProfileOpen(true)}
        >
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={userData?.profile_image || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <>
              <div className="flex flex-1 flex-col overflow-hidden">
                <span className="truncate text-sm font-medium text-sidebar-foreground leading-tight group-hover:text-primary transition-colors">
                  {userName}
                </span>
                <span className="truncate text-[11px] text-muted-foreground leading-tight">
                  {user?.email}
                </span>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLogout();
                    }}
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Sign out</TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
        <AdminProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
