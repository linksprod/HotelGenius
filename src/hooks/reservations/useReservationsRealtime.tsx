
import { useEffect } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useReservationsRealtime = (
  userId: string | null | undefined,
  userEmail: string | null | undefined,
  restaurantId?: string,
  isRestaurantSpecific?: boolean,
  queryClient?: QueryClient
) => {
  // Subscribe to real-time updates for table reservations
  useEffect(() => {
    if (!queryClient) return;

    // For user's own reservations
    const channels = [];
    
    if (isRestaurantSpecific) {
      // For admin view of restaurant reservations
      console.log(`Setting up real-time listener for restaurant reservations: ${restaurantId}`);
      
      const restaurantChannel = supabase
        .channel('restaurant_reservations')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'table_reservations',
          filter: `restaurant_id=eq.${restaurantId}`,
        }, (payload) => {
          console.log('Restaurant reservation update received:', payload);
          queryClient.invalidateQueries({ queryKey: ['tableReservations', userId, userEmail, restaurantId] });
          
          // Silently refetch - no toast needed here
        })
        .subscribe();
        
      channels.push(restaurantChannel);
    } else if (userId || userEmail) {
      // Set up channels for user's own reservations
      console.log("Setting up real-time listener for user reservations");
      
      if (userId) {
        const userIdChannel = supabase
          .channel('reservation_updates_userId')
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'table_reservations',
            filter: `user_id=eq.${userId}`,
          }, (payload) => {
            console.log('Reservation update received by user_id:', payload);
            handleReservationUpdate(payload);
          })
          .subscribe();
          
        channels.push(userIdChannel);
      }
      
      if (userEmail) {
        const emailChannel = supabase
          .channel('reservation_updates_email')
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'table_reservations',
            filter: `guest_email=eq.${userEmail}`,
          }, (payload) => {
            console.log('Reservation update received by email:', payload);
            handleReservationUpdate(payload);
          })
          .subscribe();
          
        channels.push(emailChannel);
      }
    }
      
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleReservationUpdate = (payload: any) => {
      // Silently refetch - toasts are handled by the direct action handlers
      queryClient.invalidateQueries({ queryKey: ['tableReservations', userId, userEmail, restaurantId] });
    };
      
    return () => {
      console.log("Cleaning up real-time listener for reservations");
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [userId, userEmail, queryClient, restaurantId, isRestaurantSpecific]);
};
