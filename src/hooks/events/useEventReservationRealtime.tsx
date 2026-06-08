
import { QueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to listen for real-time changes to event reservations
 */
export const useEventReservationRealtime = (
  queryClient: QueryClient,
  userId?: string | null,
  userEmail?: string | null,
  eventId?: string,
  isEventSpecific?: boolean
) => {
  useEffect(() => {
    // Set up the subscription to listen for changes
    const subscription = supabase
      .channel('event_reservations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_reservations',
          ...(isEventSpecific && eventId 
            ? { filter: `event_id=eq.${eventId}` } 
            : {})
        },
        (payload) => {
          console.log('Event reservation change received:', payload);
          
          // Invalidate the reservations query to trigger a refetch
          queryClient.invalidateQueries({ 
            queryKey: ['eventReservations', userId, userEmail, eventId]
          });
        }
      )
      .subscribe();

    return () => {
      // Unsubscribe when the component unmounts
      supabase.removeChannel(subscription);
    };
  }, [queryClient, userId, userEmail, eventId, isEventSpecific]);
};
