
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SpaService, SpaBooking } from '@/features/spa/types';
import { useCurrentHotelId } from '@/hooks/useCurrentHotelId';

export const useSpaServices = () => {
  const queryClient = useQueryClient();
  const { hotelId, isSuperAdmin } = useCurrentHotelId();

  // Récupérer tous les services spa
  const fetchServices = async (): Promise<SpaService[]> => {
    if (!hotelId && !isSuperAdmin) {
      return [];
    }

    let query: any = supabase
      .from('spa_services')
      .select('*');

    if (hotelId) {
      query = query.eq('hotel_id', hotelId);
    }

    const { data, error } = await query.order('name');

    if (error) {
      console.error('Error fetching spa services:', error);
      throw error;
    }

    // Ensure all required fields have values and proper typing
    return (data || []).map(service => ({
      ...service,
      category: service.category as 'massage' | 'facial' | 'body' | 'wellness' | string,
      image: service.image || '', // Ensure image is never undefined
      status: service.status as 'available' | 'unavailable' | string,
      facility_id: service.facility_id || '' // Provide empty string default
    })) as SpaService[];
  };

  // Récupérer les services mis en avant
  const fetchFeaturedServices = async (): Promise<SpaService[]> => {
    if (!hotelId && !isSuperAdmin) {
      return [];
    }

    let query: any = supabase
      .from('spa_services')
      .select('*')
      .eq('is_featured', true)
      .eq('status', 'available');

    if (hotelId) {
      query = query.eq('hotel_id', hotelId);
    }

    const { data, error } = await query.order('name');

    if (error) {
      console.error('Error fetching featured spa services:', error);
      throw error;
    }

    // Ensure all required fields have values and proper typing
    return (data || []).map(service => ({
      ...service,
      category: service.category as 'massage' | 'facial' | 'body' | 'wellness' | string,
      image: service.image || '', // Ensure image is never undefined
      status: service.status as 'available' | 'unavailable' | string,
      facility_id: service.facility_id || '' // Provide empty string default
    })) as SpaService[];
  };

  // Réserver un traitement
  const bookTreatmentMutation = useMutation({
    mutationFn: async (booking: Omit<SpaBooking, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('spa_bookings')
        .insert(booking)   // hotel_id set by DB trigger
        .select()
        .single();

      if (error) {
        console.error('Error booking treatment:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spa-bookings'] });
      toast.success('Réservation effectuée avec succès');
    },
    onError: (error) => {
      console.error('Error in booking mutation:', error);
      toast.error('Erreur lors de la réservation');
    },
  });

  // Récupérer un service par ID
  const getServiceById = async (id: string): Promise<SpaService | null> => {
    const { data, error } = await supabase
      .from('spa_services')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching service:', error);
      return null;
    }

    if (!data) return null;

    // Ensure all required fields have values and proper typing
    return {
      ...data,
      category: data.category as 'massage' | 'facial' | 'body' | 'wellness' | string,
      image: data.image || '', // Ensure image is never undefined
      status: data.status as 'available' | 'unavailable' | string,
      facility_id: data.facility_id || '' // Provide empty string default
    } as SpaService;
  };

  // Services data
  const { data: services = [], isLoading: isLoadingServices, error: servicesError, refetch: refetchServices } = useQuery({
    queryKey: ['spa-services', hotelId, isSuperAdmin],
    queryFn: fetchServices,
  });

  // Featured services data
  const { data: featuredServices = [], isLoading: isLoadingFeatured, error: featuredError } = useQuery({
    queryKey: ['spa-services', 'featured', hotelId, isSuperAdmin],
    queryFn: fetchFeaturedServices,
  });

  const isLoading = isLoadingServices || isLoadingFeatured;
  const error = servicesError || featuredError;

  return {
    services,
    featuredServices,
    isLoading,
    error,
    getServiceById,
    bookTreatment: bookTreatmentMutation.mutate,
    isBooking: bookTreatmentMutation.isPending,
    refetch: refetchServices
  };
};
