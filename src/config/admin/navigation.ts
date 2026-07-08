import { 
  LayoutDashboard, Bell, Users, MessageCircle, MessageSquare, Trash2, Brush,
  Wrench, Shield, Wifi, Utensils, Sparkles, PartyPopper, Store, MapPin, 
  FileText, ImageIcon, Globe, Settings, Building2, UserCog, Bot,
  CreditCard, LayoutTemplate, Coins, Calendar, Phone, Award
} from 'lucide-react';
import React from 'react';

export type Role = 'super_admin' | 'hotel_admin' | 'admin' | 'moderator' | 'staff' | 'user';

export type PlanTier = 'essential' | 'experience' | 'elite';

export interface NavItemConfig {
  title: string;
  url: string;
  icon: React.ElementType;
  notificationKey?: string;
  requiredRoles?: Role[];
  requiredModules?: string[];
  requiredPlan?: PlanTier;
}

export interface NavSectionConfig {
  label: string;
  items: NavItemConfig[];
  defaultOpen?: boolean;
}

export const adminNavigation: NavSectionConfig[] = [
  {
    label: 'Command Center',
    defaultOpen: true,
    items: [
      { title: 'Live Dashboard', url: '/admin', icon: LayoutDashboard },
      { title: 'Unified Inbox', url: '/admin/chat', icon: MessageCircle, notificationKey: 'chat', requiredRoles: ['super_admin', 'hotel_admin', 'admin', 'moderator'] },
      { title: 'Advanced Console', url: '/admin/console', icon: LayoutTemplate, requiredPlan: 'experience' },
      { title: 'Multi-property', url: '/admin/multi-property', icon: Building2, requiredPlan: 'elite' },
      { title: 'Revenue Analytics', url: '/admin/analytics', icon: Globe, requiredPlan: 'elite' },
    ],
  },
  {
    label: 'Services',
    defaultOpen: true,
    items: [
      { title: 'Housekeeping', url: '/admin/housekeeping', icon: Brush, notificationKey: 'housekeeping' },
      { title: 'Maintenance', url: '/admin/maintenance', icon: Wrench, notificationKey: 'maintenance' },
      { title: 'IT Support', url: '/admin/information-technology', icon: Wifi, notificationKey: 'information-technology' },
      { title: 'Security', url: '/admin/security', icon: Shield, notificationKey: 'security' },
    ],
  },
  {
    label: 'Operations',
    defaultOpen: false,
    items: [
      { title: 'Digital Tipping', url: '/admin/tipping', icon: Coins, requiredRoles: ['super_admin', 'hotel_admin', 'admin'], requiredPlan: 'essential' },
      { title: 'Task Routing', url: '/admin/routing', icon: Bot, requiredPlan: 'experience' },
      { title: 'Auto Escalations', url: '/admin/escalations', icon: Bell, requiredPlan: 'elite' },
    ],
  },
  {
    label: 'Guest Relations',
    defaultOpen: true,
    items: [
      { title: 'Guest Directory', url: '/admin/guests', icon: Users, requiredRoles: ['super_admin', 'hotel_admin', 'admin'] },
      { title: 'Feedback & NPS', url: '/admin/feedback', icon: MessageSquare, requiredRoles: ['super_admin', 'hotel_admin', 'admin'] },
      { title: '360° Profiles', url: '/admin/profiles', icon: UserCog, requiredPlan: 'experience' },
      { title: 'Advanced Profiling', url: '/admin/advanced-profiling', icon: Users, requiredPlan: 'elite' },
    ],
  },
  {
    label: 'Revenue Centers',
    defaultOpen: true,
    items: [
      { title: 'Dining', url: '/admin/restaurants', icon: Utensils, notificationKey: 'restaurants', requiredRoles: ['super_admin', 'hotel_admin', 'admin', 'staff'], requiredModules: ['restaurants'] },
      { title: 'Wellness', url: '/admin/spa', icon: Sparkles, notificationKey: 'spa', requiredRoles: ['super_admin', 'hotel_admin', 'admin', 'staff'], requiredModules: ['spa'] },
      { title: 'Explore & Discover', url: '/admin/events', icon: PartyPopper, notificationKey: 'events', requiredRoles: ['super_admin', 'hotel_admin', 'admin', 'staff'], requiredModules: ['events'] },
      { title: 'Shops', url: '/admin/shops', icon: Store, requiredRoles: ['super_admin', 'hotel_admin', 'admin', 'staff'], requiredModules: ['shops'] },
      { title: 'Daily Activities', url: '/admin/activities', icon: Calendar, requiredRoles: ['super_admin', 'hotel_admin', 'admin', 'staff'] },
      { title: 'Booking Engine', url: '/admin/booking-engine', icon: CreditCard },
      { title: 'Smart Upselling', url: '/admin/upselling', icon: Sparkles, requiredPlan: 'elite' },
      { title: 'Social Ads', url: '/admin/ads', icon: Globe, requiredPlan: 'elite' },
    ],
  },
  {
    label: 'AI & Automation',
    defaultOpen: true,
    items: [
      { title: 'AI Concierge', url: '/admin/agent/concierge', icon: Bot, requiredRoles: ['super_admin', 'hotel_admin', 'admin'] },
    ],
  },
];

export const globalNavigation: NavSectionConfig[] = [
  {
    label: 'Platform Control',
    defaultOpen: true,
    items: [
      { title: 'Global Insights', url: '/administration/super/dashboard', icon: Globe, requiredRoles: ['super_admin'] },
      { title: 'Hotels Portfolio', url: '/administration/super/hotels', icon: Building2, requiredRoles: ['super_admin'] },
      { title: 'Loyalty Program', url: '/administration/super/loyalty', icon: Award, requiredRoles: ['super_admin'] },
      { title: 'System Users', url: '/administration/super/users', icon: UserCog, requiredRoles: ['super_admin'] },
    ],
  },
  {
    label: 'Network Status',
    defaultOpen: true,
    items: [
      { title: 'AI Infrastructure', url: '/administration/super/ai', icon: Sparkles, requiredRoles: ['super_admin'] },
      { title: 'Global Notifications', url: '/administration/super/notifications', icon: Bell, requiredRoles: ['super_admin'] },
    ],
  },
  {
    label: 'System Settings',
    defaultOpen: false,
    items: [
      { title: 'Platform Config', url: '/administration/super/settings', icon: Settings, requiredRoles: ['super_admin'] },
      { title: 'Global Destinations', url: '/administration/super/destinations', icon: MapPin, requiredRoles: ['super_admin'] },
    ],
  },
];

// Unified Settings navigation logic
export const settingsNavigation = [
  {
    title: 'General',
    items: [
      { title: 'Hotel Profile', url: '/admin/settings/hotel-profile', icon: ImageIcon },
      { title: 'Home Page', url: '/admin/settings/home-page', icon: LayoutDashboard },
      { title: 'About Editor', url: '/admin/settings/about', icon: FileText },
      { title: 'Contact Page', url: '/admin/settings/contact', icon: Phone },
      { title: 'AI Content Import', url: '/admin/settings/ai-import', icon: Sparkles },
      { title: 'Loyalty Program', url: '/admin/settings/loyalty', icon: Award },
      { title: 'Destinations', url: '/admin/settings/destinations', icon: MapPin },
    ]
  },
  {
    title: 'Platform & Access',
    items: [
      { title: 'Live App Preview', url: '/admin/settings/live-app', icon: Globe },
      { title: 'Staff & Team', url: '/admin/settings/staff', icon: UserCog },
      { title: 'Active Modules', url: '/admin/settings/modules', icon: LayoutTemplate },
      { title: 'Billing & Plans', url: '/admin/settings/billing', icon: CreditCard },
    ]
  },
  {
    title: 'Platform (Super Admin)',
    items: [
      { title: 'Demo Mode', url: '/admin/settings/demo', icon: Wrench, requiredRoles: ['super_admin'] },
      { title: 'All Hotels', url: '/admin/settings/hotels', icon: Building2, requiredRoles: ['super_admin'] },
    ]
  }
];
