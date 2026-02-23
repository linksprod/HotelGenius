
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useHotel } from '@/features/hotels/context/HotelContext';

export interface Room {
  id: string;
  room_number: string;
  type: string;
  floor: number;
  status: string;
  price: number;
  capacity: number;
  amenities: string[];
  images: string[];
}

export const useRoom = (roomNumber?: string) => {
  const { hotelId } = useHotel();

  return useQuery({
    queryKey: ['room', roomNumber, hotelId],
    queryFn: async () => {
      if (!roomNumber) throw new Error("Room number is required");

      let query: any = supabase
        .from('rooms')
        .select('*')
        .eq('room_number', roomNumber);

      if (hotelId) {
        query = query.eq('hotel_id', hotelId);
      }

      const { data, error } = await query.maybeSingle();

      if (error) throw error;
      if (!data) throw new Error(`Room ${roomNumber} not found`);

      return data as Room;
    },
    enabled: !!roomNumber,
    staleTime: 1000 * 60 * 15, // 15 minutes cache
    gcTime: 1000 * 60 * 30, // 30 minutes garbage collection time (formerly cacheTime)
    retry: 1, // Limit retry attempts on failure
    refetchOnMount: false, // Don't refetch data on component mount
    refetchOnWindowFocus: false, // Don't refetch data on window focus
  });
};
