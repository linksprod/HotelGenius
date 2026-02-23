import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { NavLink } from '@/components/NavLink';
import { useTranslation } from 'react-i18next';
import { useAdminNotifications } from '@/hooks/admin/useAdminNotifications';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  LayoutDashboard,
  Users,
  Utensils,
  Sparkles,
  PartyPopper,
  Store,
  Trash2,
  Wrench,
  Wifi,
  MapPin,
  FileText,
  MessageSquare,
  LogOut,
  Hotel,
  Shield,
  MessageCircle,
  Settings,
  ChevronRight,
  Globe,
  UserCog,
  Building2,
} from 'lucide-react';
import { StaffNotificationBell } from '@/components/admin/StaffNotificationBell';
import { useUserRole } from '@/hooks/useUserRole';
import { useHotelPath } from '@/hooks/useHotelPath';

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  disabled?: boolean;
  notificationKey?: string;
}

interface NavSection {
  label: string;
  items: NavItem[];
  defaultOpen?: boolean;
}

const navigationSections: NavSection[] = [
  {
    label: 'Overview',
    items: [
      { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
    ],
    defaultOpen: true,
  },
  {
    label: 'Guest Management',
    items: [
      { title: 'Guests', url: '/admin/guests', icon: Users },
      { title: 'Chat Manager', url: '/admin/chat', icon: MessageCircle, notificationKey: 'chat' },
      { title: 'Feedback', url: '/admin/feedback', icon: MessageSquare },
    ],
    defaultOpen: true,
  },
  {
    label: 'Services',
    items: [
      { title: 'Housekeeping', url: '/admin/housekeeping', icon: Trash2, notificationKey: 'housekeeping' },
      { title: 'Maintenance', url: '/admin/maintenance', icon: Wrench, notificationKey: 'maintenance' },
      { title: 'Security', url: '/admin/security', icon: Shield, notificationKey: 'security' },
      { title: 'IT Support', url: '/admin/information-technology', icon: Wifi, notificationKey: 'information-technology' },
    ],
    defaultOpen: false,
  },
  {
    label: 'F&B',
    items: [
      { title: 'Restaurants', url: '/admin/restaurants', icon: Utensils, notificationKey: 'restaurants' },
    ],
    defaultOpen: false,
  },
  {
    label: 'Wellness',
    items: [
      { title: 'Spa', url: '/admin/spa', icon: Sparkles, notificationKey: 'spa' },
    ],
    defaultOpen: false,
  },
  {
    label: 'Entertainment',
    items: [
      { title: 'Events', url: '/admin/events', icon: PartyPopper, notificationKey: 'events' },
      { title: 'Shops', url: '/admin/shops', icon: Store },
    ],
    defaultOpen: false,
  },
  {
    label: 'Hotel Info',
    items: [
      { title: 'Destinations', url: '/admin/destination-admin', icon: MapPin },
      { title: 'About Editor', url: '/admin/about', icon: FileText },
    ],
    defaultOpen: false,
  },
  {
    label: 'Administration',
    items: [
      { title: 'Hotels', url: '/admin/hotels', icon: Building2 },
      { title: 'Staff Management', url: '/admin/staff', icon: UserCog },
      { title: 'Demo Settings', url: '/admin/demo', icon: Settings },
    ],
    defaultOpen: false,
  },
];

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
];

const NotificationBadge: React.FC<{ count: number }> = ({ count }) => {
  if (count <= 0) return null;
  return (
    <SidebarMenuBadge className="bg-destructive text-destructive-foreground text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-medium">
      {count > 99 ? '99+' : count}
    </SidebarMenuBadge>
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

export const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const { state } = useSidebar();
  const { i18n } = useTranslation();
  const isCollapsed = state === 'collapsed';
  const { counts } = useAdminNotifications();
  const { role } = useUserRole();
  const { resolvePath } = useHotelPath();

  // Role-based allowed paths
  const superAdminAllowedUrls = [
    '/admin',
    '/admin/hotels',
    // Super admin can access everything, but mainly these for high level
    '/admin/staff', // to manage other admins? possibly
  ];

  const moderatorAllowedUrls = [
    '/admin',
    '/admin/chat',
    '/admin/housekeeping',
    '/admin/maintenance',
    '/admin/security',
    '/admin/information-technology',
  ];

  const staffAllowedUrls = [
    '/admin',
    '/admin/restaurants',
  ];

  const filteredSections = (() => {
    // Super Admin should see Hotels
    if (role === 'super_admin') {
      return navigationSections; // Super admin sees everything for now, or specifically filtered
    }

    // Hotel Admin (default 'admin' or new 'hotel_admin')
    if (role === 'admin' || role === 'hotel_admin') {
      return navigationSections.map(section => ({
        ...section,
        items: section.items.filter(item => item.title !== 'Hotels') // Hide Hotels manager from normal admins
      })).filter(section => section.items.length > 0);
    }

    if (role === 'moderator') {
      return navigationSections
        .map((section) => ({
          ...section,
          items: section.items.filter((item) => moderatorAllowedUrls.includes(item.url)),
        }))
        .filter((section) => section.items.length > 0);
    }
    if (role === 'staff') {
      return navigationSections
        .map((section) => ({
          ...section,
          items: section.items.filter((item) => staffAllowedUrls.includes(item.url)),
        }))
        .filter((section) => section.items.length > 0);
    }
    return navigationSections;
  })();

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    filteredSections.forEach((section) => {
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

  const isSectionActive = (section: NavSection) => {
    return section.items.some((item) => isActive(item.url));
  };

  const toggleSection = (label: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const getSectionNotificationCount = (section: NavSection): number => {
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
    <Sidebar collapsible="icon">
      {/* Header */}
      <SidebarHeader className="p-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm">
            <Hotel className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-1 flex-col">
              <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">Admin Panel</span>
              <span className="text-[11px] text-muted-foreground">Hotel Management</span>
            </div>
          )}
          <StaffNotificationBell />
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
                              className="h-9 rounded-lg transition-all duration-150"
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
                                  disabled={item.disabled}
                                  className="h-9 rounded-lg transition-all duration-150"
                                >
                                  {item.disabled ? (
                                    <span className="flex items-center gap-2 opacity-40 cursor-not-allowed px-2 py-1.5">
                                      <item.icon className="h-4 w-4" />
                                      <span>{item.title}</span>
                                    </span>
                                  ) : (
                                    <NavLink to={resolvePath(item.url)} end={item.url === '/admin'}>
                                      <item.icon className={`h-4 w-4 ${isActive(item.url) ? 'text-primary' : 'text-muted-foreground'}`} />
                                      <span>{item.title}</span>
                                    </NavLink>
                                  )}
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
        {/* Language Selector */}
        {!isCollapsed && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 h-8 px-2 text-xs text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
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
        )}

        {/* User Profile */}
        <div className="flex items-center gap-2.5 rounded-lg p-2 hover:bg-sidebar-accent transition-colors">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={userData?.profile_image || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <>
              <div className="flex flex-1 flex-col overflow-hidden">
                <span className="truncate text-sm font-medium text-sidebar-foreground leading-tight">
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
                    onClick={handleLogout}
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
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
