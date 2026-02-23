import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SpaBooking } from '@/features/spa/types';
import { useCurrentHotelId } from '@/hooks/useCurrentHotelId';

/**
 * Hook pour récupérer toutes les réservations de spa
 */
export const useBookingsFetch = () => {
  const { hotelId, isSuperAdmin } = useCurrentHotelId();

  // Fetch all spa bookings
  const fetchBookings = async (): Promise<SpaBooking[]> => {
    try {
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
        `);

      if (hotelId) {
        query = query.eq('hotel_id', hotelId);
      }

      const { data, error } = await query.order('date', { ascending: false });

      if (error) {
        console.error('Error fetching spa bookings:', error);
        throw error;
      }

      // Ensure we properly type the data that comes back
      const typedData = data?.map(booking => ({
        ...booking,
        status: booking.status as SpaBooking['status']
      }));

      return typedData as SpaBooking[];
    } catch (error) {
      console.error('Exception in fetchBookings:', error);
      return [];
    }
  };

  const { data = [], isLoading, error, refetch } = useQuery({
    queryKey: ['spa-bookings', hotelId, isSuperAdmin],
    queryFn: fetchBookings,
  });

  return {
    bookings: data,
    isLoading,
    error,
    refetch
  };
};
