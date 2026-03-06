
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SpaBooking } from '@/features/spa/types';
import { NotificationService } from '@/services/NotificationService';
import { useCurrentHotelId } from '@/hooks/useCurrentHotelId';

export const useSpaBookingMutations = () => {
  const queryClient = useQueryClient();
  const { hotelId } = useCurrentHotelId();

  // Créer une nouvelle réservation
  const createBookingMutation = useMutation({
    mutationFn: async (booking: Omit<SpaBooking, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('spa_bookings')
        .insert(booking)
        .select()
        .single();

      if (error) {
        console.error('Error creating booking:', error);
        throw error;
      }

      // Notify staff
      await NotificationService.createNotification({
        hotel_id: hotelId || undefined,
        type: 'system_alert' as any,
        recipient_type: 'staff',
        recipient_id: '00000000-0000-0000-0000-000000000000',
        title: 'New Spa Booking',
        body: `New ${booking.guest_name} booked a session on ${booking.date} at ${booking.time}.`,
        source_module: 'Spa',
        source_event: 'created',
        reference_id: data.id,
        reference_type: 'SpaBooking'
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spa-bookings'] });
      // Toast handled by the calling form (SpaBookingForm.tsx)
    },
    onError: (error) => {
      console.error('Error in create booking mutation:', error);
      toast.error('Erreur lors de la création de la réservation');
    },
  });

  // Mettre à jour le statut d'une réservation
  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'confirmed' | 'cancelled' | 'pending' | 'completed' }) => {
      const { data: booking, error: fetchError } = await supabase
        .from('spa_bookings')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from('spa_bookings')
        .update({ status })
        .eq('id', id);

      if (error) {
        console.error('Error updating booking status:', error);
        throw error;
      }

      // Notify guest on priority changes
      if (status === 'confirmed' && booking.user_id) {
        await NotificationService.createNotification({
          type: 'booking_confirmed',
          recipient_type: 'guest',
          recipient_id: booking.user_id,
          title: 'Spa Booking Confirmed',
          body: `Your spa session on ${booking.date} at ${booking.time} has been confirmed.`,
          source_module: 'Spa',
          reference_id: id,
          reference_type: 'SpaBooking'
        });
      }

      return { id, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spa-bookings'] });
    },
    onError: (error) => {
      console.error('Error in update booking status mutation:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    },
  });

  // Add cancellation functionality
  const cancelBookingMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: booking, error: fetchError } = await supabase
        .from('spa_bookings')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from('spa_bookings')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) {
        console.error('Error cancelling booking:', error);
        throw error;
      }

      if (booking.user_id) {
        await NotificationService.createNotification({
          type: 'booking_cancelled',
          recipient_type: 'guest',
          recipient_id: booking.user_id,
          title: 'Spa Booking Cancelled',
          body: `Your spa session on ${booking.date} at ${booking.time} has been cancelled.`,
          source_module: 'Spa',
          reference_id: id,
          reference_type: 'SpaBooking'
        });
      }

      return { id, status: 'cancelled' };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spa-bookings'] });
      toast.success('Réservation annulée avec succès');
    },
    onError: (error) => {
      console.error('Error in cancel booking mutation:', error);
      toast.error('Erreur lors de l\'annulation de la réservation');
    },
  });

  return {
    createBooking: createBookingMutation.mutate,
    updateBookingStatus: updateBookingStatusMutation.mutate,
    cancelBooking: cancelBookingMutation.mutate,
    isCreating: createBookingMutation.isPending,
    isUpdating: updateBookingStatusMutation.isPending,
    isCancelling: cancelBookingMutation.isPending,
  };
};
