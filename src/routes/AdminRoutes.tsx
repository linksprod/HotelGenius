
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AuthGuard from '@/components/AuthGuard';
import AdminRoleGuard from '@/components/admin/AdminRoleGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/Dashboard';
import SecurityManager from '@/pages/admin/SecurityManager';
import HousekeepingManager from '@/pages/admin/HousekeepingManager';
import MaintenanceManager from '@/pages/admin/MaintenanceManager';
import ReservationManager from '@/pages/admin/ReservationManager';
import RestaurantManager from '@/pages/admin/RestaurantManager';
import SpaManager from '@/pages/admin/SpaManager';
import EventsManager from '@/pages/admin/EventsManager';
import ShopsManager from '@/pages/admin/ShopsManager';
import DestinationManager from '@/pages/admin/DestinationManager';
import { AdminChatDashboard } from '@/components/admin/chat/AdminChatDashboard';
import AboutEditor from '@/pages/admin/AboutEditor';
import FeedbackManager from '@/pages/admin/FeedbackManager';
import InformationTechnologyManager from '@/pages/admin/InformationTechnologyManager';
import RestaurantEventsManager from '@/pages/admin/RestaurantEventsManager';
import RestaurantReservationsManager from '@/pages/admin/RestaurantReservationsManager';
import DestinationAdmin from '@/pages/admin/DestinationAdmin';
import DemoManager from '@/pages/admin/DemoManager';
import GuestsManager from '@/pages/admin/GuestsManager';
import GuestDetailPage from '@/pages/admin/GuestDetailPage';
import StaffManager from '@/pages/admin/StaffManager';
import HotelsManager from '@/pages/admin/HotelsManager';


const AdminRoutes = () => {
  return (
    <AuthGuard adminRequired={true}>
      <AdminRoleGuard>
        <AdminLayout>
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
            <Route path="information-technology" element={<InformationTechnologyManager />} />
            <Route path="restaurants/:id/events" element={<RestaurantEventsManager />} />
            <Route path="restaurants/:id/reservations" element={<RestaurantReservationsManager />} />
            <Route path="destination-admin" element={<DestinationAdmin />} />
            <Route path="demo" element={<DemoManager />} />
            <Route path="staff" element={<StaffManager />} />

          </Routes>
        </AdminLayout>
      </AdminRoleGuard>
    </AuthGuard>
  );
};

export default AdminRoutes;
