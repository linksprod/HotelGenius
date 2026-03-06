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

      let query: any = supabase
        .from('service_requests')
        .select('*, request_categories!inner(hotel_id), request_items(*)');

      if (hotelId) {
        query = query.eq('request_categories.hotel_id', hotelId);
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
        .select('*, guests!inner(hotel_id), request_items(*)');

      if (hotelId) {
        query = query.eq('guests.hotel_id', hotelId);
      }

      // Pour un utilisateur normal, privilégier le filtrage par numéro de chambre
      if (userRoomNumber) {
        console.log(`Fetching service requests for room number: ${userRoomNumber}`);
        query = query.eq('room_number', userRoomNumber);
      } else if (userId) {
        console.log(`Fetching service requests for user ID: ${userId}`);
        query = query.eq('guest_id', userId);
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
