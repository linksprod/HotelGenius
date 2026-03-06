import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ServiceRequest } from '@/features/rooms/types';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/hooks/useAuthContext';
import { useLocation } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { useCurrentHotelId } from '@/hooks/useCurrentHotelId';

export const useServiceRequests = () => {
  const queryClient = useQueryClient();
  const { user, userData } = useAuth();
  const location = useLocation();
  const { hotelId, isSuperAdmin } = useCurrentHotelId();
  const isAdminSection = location.pathname.includes('/admin');

  const userId = user?.id || localStorage.getItem('user_id');
  const userRoomNumber = userData?.room_number || localStorage.getItem('user_room_number');

  const fetchServiceRequests = async (): Promise<ServiceRequest[]> => {
    console.log('fetchServiceRequests called with:', { userId, userRoomNumber, isAdminSection, hotelId });

    // For admin section, fetch service requests for the specific hotel
    if (isAdminSection) {
      if (!hotelId && !isSuperAdmin) {
        return [];
      }

      console.log('Admin view: Fetching service requests', hotelId ? `for hotel ${hotelId}` : 'all hotels');

      let userIds: string[] = [];

      if (hotelId) {
        // Double fetch: first get all guest user_ids for this hotel
        const { data: guests, error: guestsError } = await supabase
          .from('guests')
          .select('user_id')
          .eq('hotel_id', hotelId);

        if (guestsError) {
          console.error('Error fetching guests for hotel:', guestsError);
          throw guestsError;
        }

        userIds = guests.map(g => g.user_id).filter(Boolean) as string[];

        if (userIds.length === 0) {
          console.log('No guests found for this hotel, returning empty requests');
          return [];
        }
      }

      let query = supabase
        .from('service_requests')
        .select('*, request_items(*)');

      if (hotelId && userIds.length > 0) {
        query = query.in('guest_id', userIds);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching service requests:', error);
        throw error;
      }

      console.log('Service requests data retrieved:', data?.length || 0);
      return data as ServiceRequest[];
    } else {
      if (!userId && !userRoomNumber) {
        console.log('No authenticated user or user_id in localStorage, returning empty service requests');
        return [];
      }

      let query: any = supabase
        .from('service_requests')
        .select('*, request_items(*)');

      // For guests, we rely on guest_id or room_number for isolation
      // We remove the hotel_id filter because the column is missing in the DB
      if (userId) {
        console.log(`Fetching service requests for guest_id: ${userId}`);
        query = query.eq('guest_id', userId);
      } else if (userRoomNumber) {
        console.log(`Fetching service requests for room number: ${userRoomNumber}`);
        query = query.eq('room_number', userRoomNumber);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching service requests:', error);
        throw error;
      }

      return data as ServiceRequest[];
    }
  };

  const cancelServiceRequest = async (requestId: string): Promise<void> => {
    if (!userId && !isAdminSection) {
      toast.error("Veuillez vous connecter pour annuler une demande");
      throw new Error("Utilisateur non authentifié");
    }

    let query = supabase
      .from('service_requests')
      .update({ status: 'cancelled' })
      .eq('id', requestId);

    // Only apply user filter if not in admin section
    if (!isAdminSection) {
      // Ajouter une vérification du guest_id pour s'assurer que l'utilisateur ne peut annuler que ses propres demandes
      query = query.eq('guest_id', userId);
    }

    const { error } = await query;

    if (error) {
      console.error('Error cancelling service request:', error);
      throw error;
    }
  };

  const { data, isLoading, error, refetch, isError } = useQuery({
    queryKey: ['serviceRequests', userId, userRoomNumber, isAdminSection],
    queryFn: fetchServiceRequests,
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  const cancelMutation = useMutation({
    mutationFn: cancelServiceRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceRequests', userId, userRoomNumber, isAdminSection] });
      toast.success('Demande annulée avec succès');
    },
    onError: (error) => {
      console.error('Error cancelling request:', error);
      toast.error("Erreur lors de l'annulation de la demande");
    }
  });

  return {
    data,
    isLoading,
    error,
    isError,
    refetch,
    cancelRequest: cancelMutation.mutate,
    isCancelling: cancelMutation.isPending
  };
};
