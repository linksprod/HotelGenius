
import { supabase } from '@/integrations/supabase/client';
import { SpaBooking } from '@/features/spa/types';

/**
 * Fonction pour récupérer les réservations d'un utilisateur spécifique
 */
export const fetchUserBookings = async (userId: string, hotelId?: string | null): Promise<SpaBooking[]> => {
  try {
    console.log('Fetching bookings for user ID:', userId, hotelId ? `for hotel ${hotelId}` : '');
    let query: any = supabase
      .from('spa_bookings')
      .select(`
        *,
        spa_services:service_id (
          id,
          name,
          price,
          duration,
          description,
          category,
          image,
          status,
          facility_id
        )
      `)
      .eq('user_id', userId);

    if (hotelId) {
      query = query.eq('hotel_id', hotelId);
    }

    const { data, error } = await query.order('date', { ascending: false });

    if (error) {
      console.error('Error fetching user spa bookings:', error);
      throw error;
    }

    console.log('Found bookings for user:', data?.length || 0);

    // Ensure we properly type the data that comes back
    const typedData = data?.map(booking => ({
      ...booking,
      status: booking.status as SpaBooking['status']
    }));

    return typedData as SpaBooking[];
  } catch (error) {
    console.error('Exception in fetchUserBookings:', error);
    return [];
  }
};
