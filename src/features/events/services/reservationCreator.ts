
import { supabase } from '@/integrations/supabase/client';
import { CreateEventReservationDTO, EventReservation } from '@/types/event';
import { mapDtoToRow, mapRowToEventReservation } from './mappers/eventReservationMapper';
import { EventReservationRow } from '../types/eventReservation';

/**
 * Create a new event reservation
 */
export const createEventReservation = async (reservation: CreateEventReservationDTO): Promise<EventReservation> => {
  console.log('Creating event reservation with data:', reservation);
  
  if (!reservation.eventId) {
    throw new Error('ID d\'événement invalide');
  }
  
  // Verify room number is provided
  if (!reservation.roomNumber) {
    throw new Error('Le numéro de chambre est requis');
  }
  
  // Verify guest name is provided
  if (!reservation.guestName) {
    throw new Error('Le nom est requis');
  }
  
  // Get the current authenticated user from Supabase (if available)
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || null;
  
  // Create the properly typed reservation data
  const reservationData = mapDtoToRow(reservation, userId);
  
  try {
    const { data, error } = await supabase
      .from('event_reservations')
      .insert(reservationData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating event reservation:', error);
      throw new Error(error.message || 'Erreur lors de la création de la réservation');
    }

    if (!data) {
      throw new Error('Aucune donnée retournée lors de la création de la réservation');
    }

    // Map the returned data to our expected structure
    const result = data as unknown as EventReservationRow;
    
    return mapRowToEventReservation(result);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error creating event reservation:', error);
    throw error;
  }
};
