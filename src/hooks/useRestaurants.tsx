
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Restaurant } from '@/features/dining/types';
import {
  fetchRestaurants,
  fetchRestaurantById,
  fetchFeaturedRestaurants,
  createRestaurant as createRestaurantService,
  updateRestaurant as updateRestaurantService,
  deleteRestaurant as deleteRestaurantService
} from '@/features/dining/services/restaurantService';

import { useCurrentHotelId } from '@/hooks/useCurrentHotelId';

export const useRestaurants = () => {
  const queryClient = useQueryClient();
  const { hotelId, isSuperAdmin } = useCurrentHotelId();

  // Use React Query for data fetching and caching
  // Don't fire until hotelId is resolved (HotelContext async) or user is super admin
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['restaurants', hotelId, isSuperAdmin],
    queryFn: () => fetchRestaurants(hotelId, isSuperAdmin),
    enabled: isSuperAdmin || hotelId !== null,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });

  const {
    data: featuredRestaurants,
    isLoading: isFeaturedLoading
  } = useQuery({
    queryKey: ['featuredRestaurants', hotelId, isSuperAdmin],
    queryFn: () => fetchFeaturedRestaurants(hotelId, isSuperAdmin),
    enabled: isSuperAdmin || hotelId !== null,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });

  const createMutation = useMutation({
    mutationFn: (newRestaurant: Omit<Restaurant, 'id'>) =>
      createRestaurantService(newRestaurant as any), // hotel_id set by DB trigger
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['featuredRestaurants'] });
      toast.success('Restaurant créé avec succès');
    },
    onError: (error: any) => {
      console.error('Error creating restaurant:', error);
      const message = error.message || 'Erreur lors de la création du restaurant';
      toast.error(message);
    }
  });

  const updateMutation = useMutation({
    mutationFn: updateRestaurantService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['featuredRestaurants'] });
      toast.success('Restaurant mis à jour avec succès');
    },
    onError: (error) => {
      console.error('Error updating restaurant:', error);
      toast.error('Erreur lors de la mise à jour du restaurant');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRestaurantService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['featuredRestaurants'] });
      toast.success('Restaurant supprimé avec succès');
    },
    onError: (error) => {
      console.error('Error deleting restaurant:', error);
      toast.error('Erreur lors de la suppression du restaurant');
    }
  });

  return {
    restaurants: data,
    featuredRestaurants,
    isLoading,
    isFeaturedLoading,
    error,
    refetch,
    fetchRestaurantById,
    createRestaurant: createMutation.mutate,
    updateRestaurant: updateMutation.mutate,
    deleteRestaurant: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
};
