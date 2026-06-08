
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Set up listener for service request updates by user ID
 */
export const setupServiceRequestListenerById = (userId: string, refetchRequests: () => void) => {
  return supabase
    .channel('notifications_page_service_updates')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'service_requests',
      filter: `guest_id=eq.${userId}`,
    }, (payload) => {
      console.log('Notification page - service request update received by user ID:', payload);
      handleServiceRequestUpdate(payload, refetchRequests);
    })
    .subscribe();
};

/**
 * Set up listener for service request updates by room number
 */
export const setupServiceRequestListenerByRoom = (roomNumber: string, refetchRequests: () => void) => {
  return supabase
    .channel('notifications_page_room_service_updates')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'service_requests',
      filter: `room_number=eq.${roomNumber}`,
    }, (payload) => {
      console.log('Notification page - service request update received by room number:', payload);
      handleServiceRequestUpdate(payload, refetchRequests);
    })
    .subscribe();
};

/**
 * Handle service request update events
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleServiceRequestUpdate = (payload: any, refetchRequests: () => void) => {
  // Silently refetch - toasts handled by direct action handlers
  refetchRequests();
};
