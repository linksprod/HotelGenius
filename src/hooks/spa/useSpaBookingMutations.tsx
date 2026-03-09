
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
    mutationFn: async (bookingWithExtras: any) => {
      // Destructure service_name and hotel_id (if passed) to avoid inserting them into spa_bookings table
      // which might not have these columns or might fail on extra fields
      const { service_name, hotel_id: providedHotelId, ...bookingData } = bookingWithExtras;
      const finalHotelId = providedHotelId || hotelId;

      const { data, error } = await supabase
        .from('spa_bookings')
        .insert({
          ...bookingData,
          hotel_id: finalHotelId
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating booking:', error);
        throw error;
      }

      // Notify staff
      await NotificationService.createNotification({
        hotel_id: providedHotelId || hotelId || undefined,
        type: 'spa_booking',
        recipient_type: 'staff',
        recipient_id: '00000000-0000-0000-0000-000000000000',
        template_data: {
          service_name: service_name || 'Spa Service',
          guest_name: bookingData.guest_name || 'Guest',
          date: bookingData.date,
          time: bookingData.time
        },
        source_module: 'Spa',
        source_event: 'created',
        reference_id: data.id,
        reference_type: 'SpaBooking'
      });

      // Also notify guest to appear in their unified notifications list
      if (bookingData.user_id) {
        await NotificationService.createNotification({
          hotel_id: providedHotelId || hotelId || undefined,
          type: 'spa_booking',
          recipient_type: 'guest',
          recipient_id: bookingData.user_id,
          template_data: {
            service_name: service_name || 'Spa Service',
            date: bookingData.date,
            time: bookingData.time,
            hotel_name: 'Hotel Genius'
          },
          source_module: 'Spa',
          source_event: 'requested',
          reference_id: data.id,
          reference_type: 'SpaBooking'
        });
      }

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
      if (booking && (status === 'confirmed' || status === 'cancelled')) {
        await NotificationService.createNotification({
          hotel_id: (booking as any).hotel_id,
          type: status === 'confirmed' ? 'booking_confirmed' : 'booking_cancelled',
          recipient_type: 'guest',
          recipient_id: booking.user_id,
          template_data: {
            guest_name: booking.guest_name || 'Guest',
            date: booking.date,
            time: booking.time,
            hotel_name: 'Hotel Genius' // Should ideally come from hotel config
          },
          source_module: 'Spa',
          source_event: status,
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

      // Notify guest
      await NotificationService.createNotification({
        hotel_id: (booking as any).hotel_id,
        type: 'booking_cancelled',
        recipient_type: 'guest',
        recipient_id: booking.user_id,
        template_data: {
          guest_name: booking.guest_name || 'Guest',
          date: booking.date,
          time: booking.time,
          hotel_name: 'Hotel Genius'
        },
        source_module: 'Spa',
        source_event: 'cancelled',
        reference_id: id,
        reference_type: 'SpaBooking'
      });

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
