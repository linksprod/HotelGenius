
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateEventReservationDTO, UpdateEventReservationStatusDTO } from '@/types/event';
import { toast } from 'sonner';
import { 
  createEventReservation, 
  updateEventReservationStatus 
} from '@/features/events/services/eventReservationService';

/**
 * Hook for event reservation mutations (create, update, cancel)
 */
export const useEventReservationMutations = (userId?: string | null, userEmail?: string | null, eventId?: string) => {
  const queryClient = useQueryClient();
  
  // Mutation for cancelling reservations
  const cancelMutation = useMutation({
    mutationFn: async (reservationId: string): Promise<void> => {
      if (!userId && !userEmail && !eventId) {
        toast.error("Veuillez vous connecter pour annuler une réservation");
        throw new Error("Utilisateur non authentifié");
      }

      await updateEventReservationStatus({ id: reservationId, status: 'cancelled' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventReservations', userId, userEmail, eventId] });
      toast.success('Réservation annulée avec succès');
    },
    onError: (error) => {
      console.error('Error cancelling event reservation:', error);
      toast.error("Erreur lors de l'annulation de la réservation");
    }
  });

  // Mutation for creating reservations
  const createMutation = useMutation({
    mutationFn: (data: CreateEventReservationDTO) => createEventReservation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventReservations', userId, userEmail, eventId] });
      // Toast handled by the calling form
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      console.error('Error creating event reservation:', error);
      toast.error(error.message || "Erreur lors de la création de la réservation");
    }
  });

  // Mutation for updating reservation status (admin use)
  const updateStatusMutation = useMutation({
    mutationFn: (data: UpdateEventReservationStatusDTO) => updateEventReservationStatus(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventReservations', userId, userEmail, eventId] });
      toast.success('Statut de la réservation mis à jour');
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      console.error('Error updating event reservation status:', error);
      toast.error("Erreur lors de la mise à jour du statut: " + (error.message || "Erreur inconnue"));
    }
  });

  return {
    cancelReservation: cancelMutation.mutate,
    isCancelling: cancelMutation.isPending,
    createReservation: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateReservationStatus: updateStatusMutation.mutate,
    isUpdating: updateStatusMutation.isPending
  };
};
