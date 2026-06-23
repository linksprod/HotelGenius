import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

export type HotelActivity = Database['public']['Tables']['hotel_activities']['Row'];
export type InsertHotelActivity = Database['public']['Tables']['hotel_activities']['Insert'];
export type UpdateHotelActivity = Database['public']['Tables']['hotel_activities']['Update'];

export const useHotelActivities = (hotelId: string | null) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch activities of the day for the current hotel
  const { data: activities, isLoading, error } = useQuery<HotelActivity[]>({
    queryKey: ['hotel-activities', hotelId],
    queryFn: async () => {
      if (!hotelId) return [];

      const { data, error } = await supabase
        .from('hotel_activities')
        .select('*')
        .eq('hotel_id', hotelId)
        .order('time', { ascending: true });

      if (error) {
        console.error('Error fetching hotel activities:', error);
        throw error;
      }
      return data || [];
    },
    enabled: !!hotelId,
  });

  // Add activity mutation
  const addMutation = useMutation({
    mutationFn: async (newActivity: Omit<InsertHotelActivity, 'hotel_id'>) => {
      if (!hotelId) throw new Error('No hotel selected');

      const activityData: InsertHotelActivity = {
        ...newActivity,
        hotel_id: hotelId,
      };

      const { data, error } = await supabase
        .from('hotel_activities')
        .insert(activityData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotel-activities', hotelId] });
      toast({
        title: 'Activity Added',
        description: 'The activity of the day has been added successfully.',
      });
    },
    onError: (err: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to Add Activity',
        description: err.message || 'An error occurred.',
      });
    },
  });

  // Update activity mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Omit<UpdateHotelActivity, 'id' | 'hotel_id'>>) => {
      const { data, error } = await supabase
        .from('hotel_activities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotel-activities', hotelId] });
      toast({
        title: 'Activity Updated',
        description: 'The activity has been updated successfully.',
      });
    },
    onError: (err: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to Update Activity',
        description: err.message || 'An error occurred.',
      });
    },
  });

  // Delete activity mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('hotel_activities')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotel-activities', hotelId] });
      toast({
        title: 'Activity Deleted',
        description: 'The activity has been deleted successfully.',
      });
    },
    onError: (err: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to Delete Activity',
        description: err.message || 'An error occurred.',
      });
    },
  });

  return {
    activities: activities || [],
    isLoading,
    error,
    addActivity: addMutation.mutateAsync,
    isAdding: addMutation.isPending,
    updateActivity: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteActivity: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};
