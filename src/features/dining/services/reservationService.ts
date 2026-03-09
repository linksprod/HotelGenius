
import { supabase } from '@/integrations/supabase/client';
import { TableReservation, CreateTableReservationDTO, UpdateReservationStatusDTO } from '@/features/dining/types';
import { NotificationService } from '@/services/NotificationService';

// Define the shape of the data returned from Supabase
interface SupabaseTableReservation {
  id: string;
  restaurant_id: string;
  user_id: string | null;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  room_number: string | null;
  date: string;
  time: string;
  guests: number;
  special_requests: string | null;
  status: string;
  created_at: string;
  hotel_id: string | null;
}

// Fetch reservations for a restaurant
export const fetchReservations = async (restaurantId?: string): Promise<TableReservation[]> => {
  let query = supabase
    .from('table_reservations')
    .select('*')
    .order('date', { ascending: true })
    .order('time', { ascending: true });

  if (restaurantId && restaurantId !== ':id') {
    query = query.eq('restaurant_id', restaurantId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching reservations:', error);
    throw error;
  }

  return (data as unknown as SupabaseTableReservation[]).map(item => ({
    id: item.id,
    restaurantId: item.restaurant_id,
    userId: item.user_id || undefined,
    guestName: item.guest_name || undefined,
    guestEmail: item.guest_email || undefined,
    guestPhone: item.guest_phone || undefined,
    roomNumber: item.room_number || undefined,
    date: item.date,
    time: item.time,
    guests: item.guests,
    specialRequests: item.special_requests || undefined,
    status: item.status as 'pending' | 'confirmed' | 'cancelled',
    createdAt: item.created_at,
    hotelId: item.hotel_id
  }));
};

// Create a new reservation
export const createReservation = async (reservation: CreateTableReservationDTO): Promise<TableReservation> => {
  console.log('Creating reservation with data:', reservation);

  if (!reservation.restaurantId || reservation.restaurantId === ':id') {
    throw new Error('ID de restaurant invalide');
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

  // Create the reservation payload for Supabase format
  const reservationData = {
    restaurant_id: reservation.restaurantId,
    user_id: userId,
    guest_name: reservation.guestName,
    guest_email: reservation.guestEmail || '',
    guest_phone: reservation.guestPhone || '',
    room_number: reservation.roomNumber,  // Ensure this field matches the Supabase column name
    date: reservation.date,
    time: reservation.time,
    guests: reservation.guests,
    special_requests: reservation.specialRequests || '',
    status: reservation.status || 'pending',
    hotel_id: reservation.hotelId
  };

  try {
    console.log('Sending to Supabase:', reservationData);
    console.log('Room number being sent:', reservationData.room_number);

    // Debug output to see the table structure
    const { data: tableInfo, error: tableError } = await supabase
      .from('table_reservations')
      .select('*')
      .limit(1);

    if (tableInfo && tableInfo.length > 0) {
      console.log('Table structure sample:', tableInfo);
      console.log('Available columns:', Object.keys(tableInfo[0]));
    }

    if (tableError) {
      console.error('Error checking table structure:', tableError);
    }

    const { data, error } = await supabase
      .from('table_reservations')
      .insert(reservationData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating reservation:', error);

      // Additional error handling for column not found error
      if (error.message && error.message.includes('column "room_number" does not exist')) {
        throw new Error('La colonne "room_number" n\'existe pas dans la table. Veuillez vérifier la structure de la base de données.');
      }

      throw new Error(error.message || 'Erreur lors de la création de la réservation');
    }

    if (!data) {
      throw new Error('Aucune donnée retournée lors de la création de la réservation');
    }

    // Utiliser une assertion de type pour éviter l'erreur
    const typedData = data as unknown as SupabaseTableReservation;
    // Trigger notification for staff (New reservation alert)
    await NotificationService.createNotification({
      hotel_id: typedData.hotel_id,
      type: 'table_reservation',
      recipient_type: 'staff',
      recipient_id: '00000000-0000-0000-0000-000000000000',
      template_data: {
        guests: typedData.guests.toString(),
        date: typedData.date,
        time: typedData.time,
        guest_name: typedData.guest_name || 'Guest'
      },
      source_module: 'Dining',
      source_event: 'reservation_created',
      reference_id: typedData.id,
      reference_type: 'TableReservation'
    });

    // Also trigger for Guest to appear in unified notifications
    if (userId) {
      await NotificationService.createNotification({
        hotel_id: typedData.hotel_id,
        type: 'table_reservation',
        recipient_type: 'guest',
        recipient_id: userId,
        template_data: {
          date: typedData.date,
          time: typedData.time,
          hotel_name: 'the restaurant' // Fallback
        },
        source_module: 'Dining',
        source_event: 'requested',
        reference_id: typedData.id,
        reference_type: 'TableReservation'
      });
    }

    return {
      id: typedData.id,
      restaurantId: typedData.restaurant_id,
      userId: typedData.user_id || undefined,
      guestName: typedData.guest_name || undefined,
      guestEmail: typedData.guest_email || undefined,
      guestPhone: typedData.guest_phone || undefined,
      roomNumber: typedData.room_number || undefined,
      date: typedData.date,
      time: typedData.time,
      guests: typedData.guests,
      specialRequests: typedData.special_requests || undefined,
      status: typedData.status as 'pending' | 'confirmed' | 'cancelled',
      createdAt: typedData.created_at,
      hotelId: typedData.hotel_id
    };
  } catch (error: any) {
    console.error('Failed to create reservation:', error);
    throw new Error(error.message || 'Erreur lors de la création de la réservation. Veuillez vérifier vos informations et réessayer.');
  }
};

// Update reservation status
export const updateReservationStatus = async ({ id, status }: UpdateReservationStatusDTO): Promise<void> => {
  try {
    const { data: reservation, error: fetchError } = await supabase
      .from('table_reservations')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const { error } = await supabase
      .from('table_reservations')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Error updating reservation status:', error);
      throw error;
    }

    // Trigger notification based on new status
    if (status === 'confirmed' && reservation.user_id) {
      await NotificationService.createNotification({
        type: 'booking_confirmed',
        recipient_type: 'guest',
        recipient_id: reservation.user_id,
        template_data: {
          guest_name: reservation.guest_name || 'Guest',
          date: reservation.date,
          hotel_name: 'the hotel'
        },
        source_module: 'Dining',
        source_event: 'confirmed',
        reference_id: id,
        reference_type: 'TableReservation'
      });
    } else if (status === 'cancelled' && reservation.user_id) {
      await NotificationService.createNotification({
        type: 'booking_cancelled',
        recipient_type: 'guest',
        recipient_id: reservation.user_id,
        template_data: {
          date: reservation.date
        },
        source_module: 'Dining',
        source_event: 'cancelled',
        reference_id: id,
        reference_type: 'TableReservation'
      });
    }
  } catch (error) {
    console.error('Error in updateReservationStatus:', error);
    throw error;
  }
};
