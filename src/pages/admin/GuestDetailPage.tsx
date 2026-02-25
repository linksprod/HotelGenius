import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHotelPath } from '@/hooks/useHotelPath';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { isToday, isBefore, isAfter, startOfDay } from 'date-fns';
import { Loader2 } from 'lucide-react';

import GuestPageHeader from './components/guests/GuestPageHeader';
import GuestProfileCard from './components/guests/GuestProfileCard';
import GuestPreferencesCard from './components/guests/GuestPreferencesCard';
import GuestActivityCard from './components/guests/GuestActivityCard';
import GuestIntelligenceCard from './components/guests/GuestIntelligenceCard';
import { GuestStatus } from './components/guests/types';

const GuestDetailPage: React.FC = () => {
  const { guestId } = useParams<{ guestId: string }>();
  const navigate = useNavigate();
  const { resolvePath } = useHotelPath();
  const today = startOfDay(new Date());

  const getGuestStatus = (checkIn: string | null, checkOut: string | null): GuestStatus => {
    if (!checkIn || !checkOut) return null;
    const checkInDate = startOfDay(new Date(checkIn));
    const checkOutDate = startOfDay(new Date(checkOut));

    if (isToday(checkInDate)) return 'arrivals';
    if (isToday(checkOutDate)) return 'departures';
    if (!isBefore(today, checkInDate) && !isAfter(today, checkOutDate)) return 'in-house';
    if (isAfter(checkInDate, today)) return 'upcoming';
    if (isBefore(checkOutDate, today)) return 'past';
    return null;
  };

  // Fetch guest data
  const { data: guest, isLoading: isGuestLoading } = useQuery({
    queryKey: ['guest', guestId],
    queryFn: async () => {
      if (!guestId) return null;
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .eq('id', guestId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!guestId,
  });

  // Fetch room details
  const { data: room } = useQuery({
    queryKey: ['room', guest?.room_number],
    queryFn: async () => {
      if (!guest?.room_number) return null;
      const { data } = await supabase
        .from('rooms')
        .select('*')
        .eq('room_number', guest.room_number)
        .single();
      return data;
    },
    enabled: !!guest?.room_number,
  });

  // Fetch companions
  const { data: companions = [] } = useQuery({
    queryKey: ['companions', guest?.user_id],
    queryFn: async () => {
      if (!guest?.user_id) return [];
      const { data } = await supabase
        .from('companions')
        .select('*')
        .eq('user_id', guest.user_id)
        .order('created_at', { ascending: true });
      return data || [];
    },
    enabled: !!guest?.user_id,
  });

  // Fetch service requests
  const { data: serviceRequests = [] } = useQuery({
    queryKey: ['guest-service-requests', guest?.id, guest?.user_id],
    queryFn: async () => {
      if (!guest) return [];
      let query = supabase
        .from('service_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (guest.user_id) {
        query = query.or(`guest_id.eq.${guest.user_id},guest_id.eq.${guest.id}`);
      } else {
        query = query.eq('guest_id', guest.id);
      }

      const { data } = await query;
      return data || [];
    },
    enabled: !!guest,
  });

  // Fetch table reservations
  const { data: tableReservations = [] } = useQuery({
    queryKey: ['guest-table-reservations', guest?.user_id, guest?.email],
    queryFn: async () => {
      if (!guest) return [];
      let query = supabase
        .from('table_reservations')
        .select('*')
        .order('created_at', { ascending: false });

      if (guest.user_id) {
        query = query.eq('user_id', guest.user_id);
      } else if (guest.email) {
        query = query.eq('guest_email', guest.email);
      } else {
        return [];
      }

      const { data } = await query;
      return data || [];
    },
    enabled: !!guest,
  });

  // Fetch spa bookings
  const { data: spaBookings = [] } = useQuery({
    queryKey: ['guest-spa-bookings', guest?.user_id, guest?.email],
    queryFn: async () => {
      if (!guest) return [];
      let query = supabase
        .from('spa_bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (guest.user_id) {
        query = query.eq('user_id', guest.user_id);
      } else if (guest.email) {
        query = query.eq('guest_email', guest.email);
      } else {
        return [];
      }

      const { data } = await query;
      return data || [];
    },
    enabled: !!guest,
  });

  // Fetch event reservations
  const { data: eventReservations = [] } = useQuery({
    queryKey: ['guest-event-reservations', guest?.user_id, guest?.email],
    queryFn: async () => {
      if (!guest) return [];
      let query = supabase
        .from('event_reservations')
        .select('*')
        .order('created_at', { ascending: false });

      if (guest.user_id) {
        query = query.eq('user_id', guest.user_id);
      } else if (guest.email) {
        query = query.eq('guest_email', guest.email);
      } else {
        return [];
      }

      const { data } = await query;
      return data || [];
    },
    enabled: !!guest,
  });

  const status = guest ? getGuestStatus(guest.check_in_date, guest.check_out_date) : null;

  if (isGuestLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!guest) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-muted-foreground">Guest not found</p>
        <button
          onClick={() => navigate(resolvePath('/admin/guests'))}
          className="text-primary hover:underline"
        >
          Back to guests
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Page Header */}
      <GuestPageHeader
        guest={guest}
        room={room || null}
        companions={companions}
        status={status}
      />

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <GuestProfileCard guest={guest} companions={companions} />
          <GuestActivityCard
            serviceRequests={serviceRequests}
            tableReservations={tableReservations}
            spaBookings={spaBookings}
            eventReservations={eventReservations}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <GuestPreferencesCard guestId={guest.id} />
          <GuestIntelligenceCard guest={guest} />
        </div>
      </div>
    </div>
  );
};

export default GuestDetailPage;
