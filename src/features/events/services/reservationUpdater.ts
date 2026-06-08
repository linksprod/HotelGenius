
import { supabase } from '@/integrations/supabase/client';
import { UpdateEventReservationStatusDTO } from '@/types/event';
import { mapRowToEventReservation } from './mappers/eventReservationMapper';
import { EventReservationRow } from '../types/eventReservation';

/**
 * Update the status of an event reservation
 */
export const updateEventReservationStatus = async (
  data: UpdateEventReservationStatusDTO
): Promise<void> => {
  const { id, status } = data;
  
  try {
    const { error } = await supabase
      .from('event_reservations')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error updating event reservation status:', error);
      throw new Error(error.message || 'Error updating reservation status');
    }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error in updateEventReservationStatus:', error);
    throw error;
  }
};
