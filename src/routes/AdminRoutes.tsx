
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AuthGuard from '@/components/AuthGuard';
import AdminRoleGuard from '@/components/admin/AdminRoleGuard';
import AdminLayout from '@/components/admin/AdminLayout';
const AdminDashboard = React.lazy(() => import('@/pages/admin/Dashboard'));
const SecurityManager = React.lazy(() => import('@/pages/admin/SecurityManager'));
const HousekeepingManager = React.lazy(() => import('@/pages/admin/HousekeepingManager'));
const MaintenanceManager = React.lazy(() => import('@/pages/admin/MaintenanceManager'));
const ReservationManager = React.lazy(() => import('@/pages/admin/ReservationManager'));
const RestaurantManager = React.lazy(() => import('@/pages/admin/RestaurantManager'));
const SpaManager = React.lazy(() => import('@/pages/admin/SpaManager'));
const EventsManager = React.lazy(() => import('@/pages/admin/EventsManager'));
const ShopsManager = React.lazy(() => import('@/pages/admin/ShopsManager'));
const DestinationManager = React.lazy(() => import('@/pages/admin/DestinationManager'));
const AdminChatDashboard = React.lazy(() => import('@/components/admin/chat/AdminChatDashboard').then(m => ({ default: m.AdminChatDashboard })));
const AboutEditor = React.lazy(() => import('@/pages/admin/AboutEditor'));
const FeedbackManager = React.lazy(() => import('@/pages/admin/FeedbackManager'));
const InformationTechnologyManager = React.lazy(() => import('@/pages/admin/InformationTechnologyManager'));
const RestaurantEventsManager = React.lazy(() => import('@/pages/admin/RestaurantEventsManager'));
const RestaurantReservationsManager = React.lazy(() => import('@/pages/admin/RestaurantReservationsManager'));
const DestinationAdmin = React.lazy(() => import('@/pages/admin/DestinationAdmin'));
const DemoManager = React.lazy(() => import('@/pages/admin/DemoManager'));
const GuestsManager = React.lazy(() => import('@/pages/admin/GuestsManager'));
const GuestDetailPage = React.lazy(() => import('@/pages/admin/GuestDetailPage'));
const StaffManager = React.lazy(() => import('@/pages/admin/StaffManager'));
const HotelsManager = React.lazy(() => import('@/pages/admin/HotelsManager'));
const HotelProfile = React.lazy(() => import('@/pages/admin/HotelProfile'));
const AIConcierge = React.lazy(() => import('@/pages/admin/AIConcierge'));
const NotificationCentre = React.lazy(() => import('@/pages/admin/NotificationCentre'));
const SuperDashboard = React.lazy(() => import('@/pages/admin/super/SuperDashboard'));


const AdminRoutes = () => {
  return (
    <AuthGuard adminRequired={true}>
      <AdminRoleGuard>
        <AdminLayout>
          <React.Suspense fallback={
            <div className="h-full w-full flex items-center justify-center bg-background/50 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-sm font-medium text-muted-foreground animate-pulse font-mono uppercase tracking-[0.2em]">Synchronizing Agent Data...</p>
              </div>
            </div>
          }>
            <Routes>
              <Route index element={<AdminDashboard />} />
              <Route path="hotels" element={<HotelsManager />} />
              <Route path="guests" element={<GuestsManager />} />
              <Route path="guests/:guestId" element={<GuestDetailPage />} />
              <Route path="security" element={<SecurityManager />} />
              <Route path="housekeeping" element={<HousekeepingManager />} />
              <Route path="maintenance" element={<MaintenanceManager />} />
              <Route path="reservations" element={<ReservationManager />} />
              <Route path="restaurants" element={<RestaurantManager />} />
              <Route path="spa" element={<SpaManager />} />
              <Route path="events" element={<EventsManager />} />
              <Route path="shops" element={<ShopsManager />} />
              <Route path="destination" element={<DestinationManager />} />
              <Route path="chat" element={<AdminChatDashboard />} />
              <Route path="about" element={<AboutEditor />} />
              <Route path="feedback" element={<FeedbackManager />} />
          
              {/* Super Admin Routes */}
              <Route path="super" element={<AdminRoleGuard allowedRoles={['super_admin']} />}>
                <Route path="dashboard" element={<SuperDashboard />} />
                <Route path="hotels" element={<HotelsManager />} />
                <Route path="users" element={<StaffManager />} />
                <Route path="ai" element={<AIConcierge />} />
                <Route path="notifications" element={<NotificationCentre />} />
              </Route>

              <Route path="information-technology" element={<InformationTechnologyManager />} />
              <Route path="restaurants/:id/events" element={<RestaurantEventsManager />} />
              <Route path="restaurants/:id/reservations" element={<RestaurantReservationsManager />} />
              <Route path="destination-admin" element={<DestinationAdmin />} />
              <Route path="demo" element={<DemoManager />} />
              <Route path="staff" element={<StaffManager />} />
              <Route path="hotel-profile" element={<HotelProfile />} />
              <Route path="agent/concierge" element={<AIConcierge />} />
              <Route path="notifications" element={<NotificationCentre />} />
            </Routes>
          </React.Suspense>
        </AdminLayout>
      </AdminRoleGuard>
    </AuthGuard>
  );
};

export default AdminRoutes;
