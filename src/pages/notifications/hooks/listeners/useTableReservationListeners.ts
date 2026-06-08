
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { reservationTransformers } from '@/hooks/reservations/reservationTransformers';

/**
 * Set up listener for table reservation updates by user ID
 */
export const setupReservationListenerById = (userId: string, refetchReservations: () => void) => {
  return supabase
    .channel('notifications_page_reservation_updates')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'table_reservations',
      filter: `user_id=eq.${userId}`,
    }, (payload) => {
      console.log('Notification page - reservation update received by ID:', payload);
      handleReservationUpdate(payload, refetchReservations);
    })
    .subscribe();
};

/**
 * Set up listener for table reservation updates by email
 */
export const setupReservationListenerByEmail = (userEmail: string, refetchReservations: () => void) => {
  return supabase
    .channel('notifications_page_email_updates')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'table_reservations',
      filter: `guest_email=eq.${userEmail}`,
    }, (payload) => {
      console.log('Notification page - reservation email update received:', payload);
      handleReservationUpdate(payload, refetchReservations);
    })
    .subscribe();
};

/**
 * Handle reservation update events
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleReservationUpdate = (payload: any, refetchReservations: () => void) => {
  // Silently refetch - toasts handled by direct action handlers
  refetchReservations();
};
