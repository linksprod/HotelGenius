import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TableReservation } from '@/features/dining/types';
import { reservationTransformers } from './reservations/reservationTransformers';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { useCurrentHotelId } from '@/hooks/useCurrentHotelId';

interface UseAllTableReservationsOptions {
  restaurantId?: string;
  status?: string;
}

export const useAllTableReservations = (options?: UseAllTableReservationsOptions) => {
  const queryClient = useQueryClient();
  const { hotelId, isSuperAdmin } = useCurrentHotelId();
  const { restaurantId, status } = options || {};

  const { data: reservations, isLoading, error, refetch } = useQuery({
    queryKey: ['allTableReservations', hotelId, restaurantId, status],
    queryFn: async () => {
      let query: any = supabase
        .from('table_reservations')
        .select('*');

      if (hotelId) {
        query = query.eq('hotel_id', hotelId);
      }

      if (restaurantId) {
        query = query.eq('restaurant_id', restaurantId);
      }
      if (status) {
        query = query.eq('status', status);
      }

      const { data: fetchResult, error: fetchError } = await query
        .order('date', { ascending: false })
        .order('time', { ascending: false });

      if (fetchError) throw fetchError;
      return reservationTransformers.transformReservations(fetchResult || []);
    },
    staleTime: 1000 * 60,
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('all-table-reservations')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'table_reservations',
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['allTableReservations', hotelId] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('table_reservations')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allTableReservations'] });
      toast.success('Statut de la réservation mis à jour');
    },
    onError: (error) => {
      console.error('Error updating reservation status:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    },
  });

  return {
    reservations: reservations || [],
    isLoading,
    error,
    refetch,
    updateReservationStatus: updateStatusMutation.mutate,
  };
};
