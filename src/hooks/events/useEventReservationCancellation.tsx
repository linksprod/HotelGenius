
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateEventReservationStatus } from '@/features/events/services/eventReservationService';

/**
 * Hook for cancelling event reservations
 */
export const useEventReservationCancellation = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: async (reservationId: string): Promise<void> => {
      await updateEventReservationStatus({ id: reservationId, status: 'cancelled' });
    },
    onSuccess: () => {
      // Invalidate all event reservations queries
      queryClient.invalidateQueries({ queryKey: ['eventReservations'] });
      toast.success('Réservation annulée avec succès');
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      console.error('Error cancelling event reservation:', error);
      toast.error(error.message || "Erreur lors de l'annulation de la réservation");
    }
  });

  return {
    cancelReservation: mutation.mutate,
    isCancelling: mutation.isPending
  };
};
