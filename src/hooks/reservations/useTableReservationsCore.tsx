
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TableReservation, CreateTableReservationDTO, UpdateReservationStatusDTO } from '@/features/dining/types';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/hooks/useAuthContext';
import { createReservation as apiCreateReservation, fetchReservations, updateReservationStatus as apiUpdateReservationStatus } from '@/features/dining/services/reservationService';
import { useEffect } from 'react';
import { useReservationsFetching } from './useReservationsFetching';
import { useReservationsRealtime } from './useReservationsRealtime';

import { useCurrentHotelId } from '@/hooks/useCurrentHotelId';

export const useTableReservationsCore = (restaurantId?: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { hotelId, isSuperAdmin } = useCurrentHotelId();

  const userId = user?.id || localStorage.getItem('user_id');
  const userEmail = user?.email || localStorage.getItem('user_email');

  const isRestaurantSpecific = !!restaurantId && restaurantId !== ':id';

  // Use the fetching logic from a separate hook
  const { fetchUserReservations, fetchRestaurantReservations } = useReservationsFetching(userId, userEmail, restaurantId, hotelId, isSuperAdmin);

  // Query for fetching reservations (either user's or restaurant's)
  const { data: reservations, isLoading, error, refetch } = useQuery({
    queryKey: ['tableReservations', userId, userEmail, restaurantId, hotelId, isSuperAdmin],
    queryFn: async () => {
      // Evaluate at query execution time, not hook initialization
      const shouldFetchByRestaurant = !!restaurantId && restaurantId !== ':id';
      if (shouldFetchByRestaurant) {
        return fetchRestaurantReservations();
      }
      return fetchUserReservations();
    },
    enabled: true,
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: true,
  });

  // Mutation for cancelling reservations
  const cancelMutation = useMutation({
    mutationFn: async (reservationId: string): Promise<void> => {
      if (!userId && !userEmail && !isRestaurantSpecific) {
        toast.error("Please log in to cancel a reservation");
        throw new Error("Unauthenticated user");
      }

      await apiUpdateReservationStatus({ id: reservationId, status: 'cancelled' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tableReservations', userId, userEmail, restaurantId] });
      toast.success('Reservation cancelled successfully');
    },
    onError: (error) => {
      console.error('Error cancelling reservation:', error);
      toast.error("Error cancelling the reservation");
    }
  });

  // Mutation for creating reservations
  const createMutation = useMutation({
    mutationFn: (data: CreateTableReservationDTO) => apiCreateReservation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tableReservations', userId, userEmail, restaurantId] });
    }
  });

  // Mutation for updating reservation status (admin use)
  const updateStatusMutation = useMutation({
    mutationFn: (data: UpdateReservationStatusDTO) => apiUpdateReservationStatus(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tableReservations', userId, userEmail, restaurantId] });
      toast.success('Reservation status updated');
    },
    onError: (error) => {
      console.error('Error updating reservation status:', error);
      toast.error("Error updating reservation status");
    }
  });

  // Setup real-time listeners
  useReservationsRealtime(userId, userEmail, restaurantId, isRestaurantSpecific, queryClient);

  return {
    reservations: reservations || [],
    isLoading,
    error,
    refetch,
    cancelReservation: cancelMutation.mutate,
    isCancelling: cancelMutation.isPending,
    createReservation: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateReservationStatus: updateStatusMutation.mutate,
    isUpdating: updateStatusMutation.isPending
  };
};
