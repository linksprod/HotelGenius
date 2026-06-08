import React from 'react';
import { Role } from './navigation';

export interface AdminRouteConfig {
  path: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.LazyExoticComponent<any> | React.FC<any>;
  requiredRoles?: Role[];
  requiredModules?: string[];
  children?: AdminRouteConfig[];
}

// Overview
export const Dashboard = React.lazy(() => import('@/pages/admin/overview/Dashboard'));
export const NotificationCentre = React.lazy(() => import('@/pages/admin/overview/NotificationCentre'));

// CRM (Guest Relations)
export const GuestsManager = React.lazy(() => import('@/pages/admin/crm/GuestsManager'));
export const GuestDetailPage = React.lazy(() => import('@/pages/admin/crm/GuestDetailPage'));
export const FeedbackManager = React.lazy(() => import('@/pages/admin/crm/FeedbackManager'));
export const AdminChatDashboard = React.lazy(() => import('@/pages/admin/crm/chat/AdminChatDashboard').then(m => ({ default: m.AdminChatDashboard })));

// Modules (Revenue Centers)
export const RestaurantManager = React.lazy(() => import('@/pages/admin/modules/restaurants/RestaurantManager'));
export const RestaurantEventsManager = React.lazy(() => import('@/pages/admin/modules/restaurants/RestaurantEventsManager'));
export const RestaurantReservationsManager = React.lazy(() => import('@/pages/admin/modules/restaurants/RestaurantReservationsManager'));
export const SpaManager = React.lazy(() => import('@/pages/admin/modules/spa/SpaManager'));
export const EventsManager = React.lazy(() => import('@/pages/admin/modules/events/EventsManager'));
export const ShopsManager = React.lazy(() => import('@/pages/admin/modules/shops/ShopsManager'));

// Operations
export const HousekeepingManager = React.lazy(() => import('@/pages/admin/operations/HousekeepingManager'));
export const MaintenanceManager = React.lazy(() => import('@/pages/admin/operations/MaintenanceManager'));
export const SecurityManager = React.lazy(() => import('@/pages/admin/operations/SecurityManager'));
export const InformationTechnologyManager = React.lazy(() => import('@/pages/admin/operations/InformationTechnologyManager'));
export const TippingManager = React.lazy(() => import('@/pages/admin/operations/TippingManager'));

// Settings
export const UnifiedSettingsLayout = React.lazy(() => import('@/pages/admin/settings/UnifiedSettingsLayout'));
export const HotelProfile = React.lazy(() => import('@/pages/admin/settings/HotelProfile'));
export const LiveApp = React.lazy(() => import('@/pages/admin/settings/LiveApp'));
export const ModuleSettings = React.lazy(() => import('@/pages/admin/settings/ModuleSettings'));
export const StaffManager = React.lazy(() => import('@/pages/admin/settings/StaffManager'));
export const DestinationAdmin = React.lazy(() => import('@/pages/admin/settings/DestinationAdmin'));
export const DestinationManager = React.lazy(() => import('@/pages/admin/settings/DestinationManager'));
export const AboutEditor = React.lazy(() => import('@/pages/admin/settings/AboutEditor'));
export const BillingManager = React.lazy(() => import('@/pages/admin/settings/BillingManager'));
export const DemoManager = React.lazy(() => import('@/pages/admin/settings/DemoManager'));

// Miscellaneous
export const HotelsManager = React.lazy(() => import('@/pages/admin/HotelsManager'));
export const ReservationManager = React.lazy(() => import('@/pages/admin/ReservationManager')); // Deprecated?
export const AISetupPage = React.lazy(() => import('@/pages/admin/hotels/setup/AISetupPage'));

// AI
export const AIConcierge = React.lazy(() => import('@/pages/admin/ai/AIConcierge'));

// Super Admin
export const SuperDashboard = React.lazy(() => import('@/pages/admin/super/SuperDashboard'));

export const adminRoutes: AdminRouteConfig[] = [
  // Overview
  { path: '', component: Dashboard },
  { path: 'notifications', component: NotificationCentre },

  // CRM
  { path: 'guests', component: GuestsManager },
  { path: 'guests/:guestId', component: GuestDetailPage },
  { path: 'feedback', component: FeedbackManager },
  { path: 'chat', component: AdminChatDashboard },

  // Operations
  { path: 'housekeeping', component: HousekeepingManager },
  { path: 'maintenance', component: MaintenanceManager },
  { path: 'security', component: SecurityManager },
  { path: 'information-technology', component: InformationTechnologyManager },
  { path: 'tipping', component: TippingManager },

  // Revenue Centers
  { path: 'restaurants', component: RestaurantManager, requiredModules: ['restaurants'] },
  { path: 'restaurants/:id/events', component: RestaurantEventsManager, requiredModules: ['restaurants'] },
  { path: 'restaurants/:id/reservations', component: RestaurantReservationsManager, requiredModules: ['restaurants'] },
  { path: 'spa', component: SpaManager, requiredModules: ['spa'] },
  { path: 'events', component: EventsManager, requiredModules: ['events'] },
  { path: 'shops', component: ShopsManager, requiredModules: ['shops'] },

  // AI
  { path: 'agent/concierge', component: AIConcierge },

  // Miscellaneous
  { path: 'reservations', component: ReservationManager },

  // Unified Settings
  {
    path: 'settings',
    component: UnifiedSettingsLayout,
    children: [
      { path: 'hotel-profile', component: HotelProfile },
      { path: 'about', component: AboutEditor },
      { path: 'destinations', component: DestinationAdmin },
      { path: 'destinations/:id', component: DestinationManager },
      { path: 'ai-import', component: AISetupPage },
      { path: 'live-app', component: LiveApp },
      { path: 'staff', component: StaffManager },
      { path: 'modules', component: ModuleSettings },
      { path: 'billing', component: BillingManager },
      { path: 'demo', component: DemoManager, requiredRoles: ['super_admin'] },
      { path: 'hotels', component: HotelsManager, requiredRoles: ['super_admin', 'hotel_admin'] },
    ]
  }
];
