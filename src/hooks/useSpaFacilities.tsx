
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SpaFacility } from '@/features/spa/types';
import { useCurrentHotelId } from '@/hooks/useCurrentHotelId';

export const useSpaFacilities = () => {
  const queryClient = useQueryClient();
  const { hotelId, isSuperAdmin } = useCurrentHotelId();

  // Récupérer toutes les installations spa
  const fetchFacilities = async (): Promise<SpaFacility[]> => {
    if (!hotelId && !isSuperAdmin) {
      return [];
    }

    let query: any = supabase
      .from('spa_facilities')
      .select('*');

    if (hotelId) {
      query = query.eq('hotel_id', hotelId);
    }

    const { data, error } = await query.order('name');

    if (error) {
      console.error('Error fetching spa facilities:', error);
      throw error;
    }

    return data as SpaFacility[];
  };

  // Récupérer une installation par ID
  const getFacilityById = async (id: string): Promise<SpaFacility | null> => {
    const { data, error } = await supabase
      .from('spa_facilities')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching facility:', error);
      return null;
    }

    return data as SpaFacility;
  };

  // Créer une nouvelle installation
  const createFacilityMutation = useMutation({
    mutationFn: async (facility: Omit<SpaFacility, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('spa_facilities')
        .insert(facility)   // hotel_id is set automatically by DB trigger
        .select('id')
        .single();

      if (error) {
        console.error('Error creating facility:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spa-facilities'] });
      toast.success('Installation créée avec succès');
    },
    onError: (error) => {
      console.error('Error in create facility mutation:', error);
      toast.error('Erreur lors de la création de l\'installation');
    },
  });

  // Mettre à jour une installation
  const updateFacilityMutation = useMutation({
    mutationFn: async ({ id, ...facility }: SpaFacility) => {
      const { error } = await supabase
        .from('spa_facilities')
        .update(facility)
        .eq('id', id);

      if (error) {
        console.error('Error updating facility:', error);
        throw error;
      }

      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spa-facilities'] });
      toast.success('Installation mise à jour avec succès');
    },
    onError: (error) => {
      console.error('Error in update facility mutation:', error);
      toast.error('Erreur lors de la mise à jour de l\'installation');
    },
  });

  // Supprimer une installation
  const deleteFacilityMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('spa_facilities')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting facility:', error);
        throw error;
      }

      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spa-facilities'] });
      toast.success('Installation supprimée avec succès');
    },
    onError: (error) => {
      console.error('Error in delete facility mutation:', error);
      toast.error('Erreur lors de la suppression de l\'installation');
    },
  });

  const { data = [], isLoading, error, refetch } = useQuery({
    queryKey: ['spa-facilities', hotelId, isSuperAdmin],
    queryFn: fetchFacilities,
  });

  return {
    facilities: data,
    isLoading,
    error,
    getFacilityById,
    createFacility: createFacilityMutation.mutate,
    updateFacility: updateFacilityMutation.mutate,
    deleteFacility: deleteFacilityMutation.mutate,
    isCreating: createFacilityMutation.isPending,
    isUpdating: updateFacilityMutation.isPending,
    isDeleting: deleteFacilityMutation.isPending,
    refetch
  };
};
