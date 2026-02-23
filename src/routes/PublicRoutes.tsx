
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import Login from '@/pages/auth/Login';
import Rooms from '@/pages/rooms/Rooms';
import RoomDetails from '@/pages/rooms/RoomDetails';
import Dining from '@/pages/dining/Dining';
import RestaurantDetail from '@/pages/dining/RestaurantDetail';
import Spa from '@/pages/spa/Spa';
import Activities from '@/pages/activities/Activities';
import Events from '@/pages/events/Events';
import EventDetail from '@/pages/events/EventDetail';
import Destination from '@/pages/destination/Destination';
import HotelMap from '@/pages/map/HotelMap';
import About from '@/pages/about/About';
import Contact from '@/pages/Contact';
import Services from '@/pages/services/Services';
import Shops from '@/pages/shops/Shops';
import Feedback from '@/pages/feedback/Feedback';
import Messages from '@/pages/messages/Messages';
import Notifications from '@/pages/notifications/Notifications';
import DebugInfo from '@/pages/debug/DebugInfo';
import MyRoom from '@/pages/my-room/MyRoom';
import ServiceRequestDetails from '@/pages/my-room/ServiceRequestDetails';
import Requests from '@/pages/requests/Requests';
import NotFound from '@/pages/NotFound';

const PublicRoutes = () => {
  return (
    <Routes>
      <Route index element={<Index />} />
      <Route path="auth/login" element={<Login />} />
      <Route path="rooms" element={<Rooms />} />
      <Route path="rooms/:id" element={<RoomDetails />} />
      <Route path="dining" element={<Dining />} />
      <Route path="dining/:id" element={<RestaurantDetail />} />
      <Route path="spa" element={<Spa />} />
      <Route path="activities" element={<Activities />} />
      <Route path="events" element={<Events />} />
      <Route path="events/:id" element={<EventDetail />} />
      <Route path="destination" element={<Destination />} />
      <Route path="map" element={<HotelMap />} />
      <Route path="about" element={<About />} />
      <Route path="contact" element={<Contact />} />
      <Route path="services" element={<Services />} />
      <Route path="shops" element={<Shops />} />
      <Route path="feedback" element={<Feedback />} />
      <Route path="messages" element={<Messages />} />
      <Route path="notifications" element={<Notifications />} />
      <Route path="requests" element={<Requests />} />
      <Route path="my-room" element={<MyRoom />} />
      <Route path="my-room/requests/:id" element={<ServiceRequestDetails />} />
      <Route path="debug" element={<DebugInfo />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default PublicRoutes;
