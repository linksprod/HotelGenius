
import { supabase } from '@/integrations/supabase/client';
import { TableReservation } from '@/features/dining/types';
import { reservationTransformers } from './reservationTransformers';

export const useReservationsFetching = (
  userId: string | null | undefined,
  userEmail: string | null | undefined,
  restaurantId?: string,
  hotelId?: string | null,
  isSuperAdmin: boolean = false
) => {
  // Fetch user's reservations
  const fetchUserReservations = async (): Promise<TableReservation[]> => {
    if (!userId && !userEmail) {
      console.log('No authenticated user or user_id/email in localStorage, returning empty reservations');
      return [];
    }

    let reservations: TableReservation[] = [];

    // Try first using the authenticated user's ID
    if (userId) {
      console.log('Fetching reservations for user ID:', userId, hotelId ? `for hotel ${hotelId}` : '');

      let query: any = supabase
        .from('table_reservations')
        .select('*')
        .eq('user_id', userId);

      if (hotelId) {
        query = query.eq('hotel_id', hotelId);
      }

      let { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reservations by user_id:', error);
      } else if (data && data.length > 0) {
        console.log('Found reservations by user_id:', data.length);
        reservations = [...reservations, ...reservationTransformers.transformReservations(data)];
      }
    }

    // If an email is available, also search by email
    if (userEmail) {
      console.log('Fetching reservations for user email:', userEmail, hotelId ? `for hotel ${hotelId}` : '');

      let query: any = supabase
        .from('table_reservations')
        .select('*')
        .eq('guest_email', userEmail);

      if (hotelId) {
        query = query.eq('hotel_id', hotelId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reservations by email:', error);
      } else if (data && data.length > 0) {
        console.log('Found reservations by email:', data.length);

        // Merge results avoiding duplicates
        const existingIds = new Set(reservations.map(r => r.id));
        const newReservations = reservationTransformers.transformReservations(data).filter(r => !existingIds.has(r.id));

        reservations = [...reservations, ...newReservations];
      }
    }

    console.log('Total unique reservations found:', reservations.length);
    return reservations;
  };

  // Fetch restaurant reservations (for admin)
  const fetchRestaurantReservations = async (): Promise<TableReservation[]> => {
    if (!restaurantId || restaurantId === ':id') {
      console.log('Invalid restaurant ID, returning empty reservations');
      return [];
    }

    console.log(`Fetching reservations for restaurant ID: ${restaurantId}`);

    try {
      let query: any = supabase
        .from('table_reservations')
        .select('*')
        .eq('restaurant_id', restaurantId);

      if (hotelId) {
        query = query.eq('hotel_id', hotelId);
      }

      const { data, error } = await query
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (error) {
        console.error('Error fetching restaurant reservations:', error);
        throw error;
      }

      console.log(`Found ${data.length} reservations for restaurant ${restaurantId}`);
      return reservationTransformers.transformReservations(data);
    } catch (error) {
      console.error('Exception fetching restaurant reservations:', error);
      throw error;
    }
  };

  return {
    fetchUserReservations,
    fetchRestaurantReservations
  };
};
