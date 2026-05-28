
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AuthGuard from '@/components/AuthGuard';
import Profile from '@/pages/profile/Profile';
import ServiceRequestDetails from '@/pages/my-room/ServiceRequestDetails';
import ReservationDetails from '@/pages/dining/ReservationDetails';
import SpaBookingDetails from '@/pages/spa/SpaBookingDetails';
import EventDetail from '@/pages/events/EventDetail';
import MyRoom from '@/pages/my-room/MyRoom';
import NotificationDetail from '@/pages/notifications/NotificationDetail';
import DigitalTipping from '@/pages/tipping/DigitalTipping';

const AuthenticatedRoutes = () => {
  return (
    <AuthGuard>
      <Routes>
        <Route path="/" element={<Profile />} />
        <Route path="/requests/:id" element={<ServiceRequestDetails />} />
        <Route path="/dining/reservations/:id" element={<ReservationDetails />} />
        <Route path="/spa/booking/:id" element={<SpaBookingDetails />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/my-room" element={<MyRoom />} />
        <Route path="/notifications/:type/:id" element={<NotificationDetail />} />
        <Route path="/tipping" element={<DigitalTipping />} />
      </Routes>
    </AuthGuard>
  );
};

export default AuthenticatedRoutes;
