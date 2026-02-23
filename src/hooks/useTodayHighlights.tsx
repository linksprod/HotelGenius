
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/types/event';
import { format } from 'date-fns';
import { useCurrentHotelId } from './useCurrentHotelId';

export const useTodayHighlights = () => {
  const [todayEvents, setTodayEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { hotelId, isSuperAdmin } = useCurrentHotelId();

  const fetchTodayEvents = useCallback(async () => {
    if (!hotelId && !isSuperAdmin) {
      setTodayEvents([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const today = format(new Date(), 'yyyy-MM-dd');

      // Fetch events for today (one-time events with today's date OR daily recurring events)
      let query = supabase
        .from('events')
        .select('*')
        .or(`and(date.eq.${today},recurrence_type.eq.once),recurrence_type.eq.daily`);

      if (hotelId && !isSuperAdmin) {
        query = query.eq('hotel_id', hotelId);
      }

      const { data, error } = await query.order('time', { ascending: true });

      if (error) throw error;

      setTodayEvents(data as Event[]);
    } catch (error) {
      console.error('Error fetching today events:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodayEvents();
  }, [fetchTodayEvents, hotelId]);

  return {
    todayEvents,
    loading,
    fetchTodayEvents,
  };
};
