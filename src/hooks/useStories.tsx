
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Story } from '@/types/event';
import { useToast } from './use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCurrentHotelId } from '@/hooks/useCurrentHotelId';

export const useStories = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { hotelId, isSuperAdmin } = useCurrentHotelId();

  // Utiliser React Query pour la mise en cache et les états de chargement
  const { data: stories = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['stories', hotelId, isSuperAdmin],
    queryFn: async () => {
      if (!hotelId && !isSuperAdmin) {
        return [];
      }

      let query = supabase
        .from('stories')
        .select('*');

      if (hotelId) {
        query = query.eq('hotel_id', hotelId);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      return data as Story[];
    },
    staleTime: 1000 * 60 * 5, // Cache pendant 5 minutes
    refetchOnWindowFocus: false,
  });

  // Mutation pour créer une story
  const createStoryMutation = useMutation({
    mutationFn: async (story: Omit<Story, 'id' | 'created_at' | 'updated_at' | 'seen'>) => {
      // Ensure eventId is either a valid UUID or null, never an empty string
      const storyData = {
        ...story,
        eventId: story.eventId && story.eventId.trim() !== '' ? story.eventId : null,
        seen: false
        // hotel_id set by DB trigger
      };

      const { data, error } = await supabase
        .from('stories')
        .insert([storyData])
        .select();

      if (error) throw error;

      return data[0] as Story;
    },
    onSuccess: (newStory) => {
      // Mettre à jour le cache React Query
      queryClient.setQueryData(['stories', hotelId, isSuperAdmin], (oldStories: Story[] = []) =>
        [newStory, ...oldStories]
      );

      toast({
        title: 'Success',
        description: 'Story created successfully',
      });
    },
    onError: (error) => {
      console.error('Error creating story:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create story',
      });
    }
  });

  const createStory = useCallback(async (story: Omit<Story, 'id' | 'created_at' | 'updated_at' | 'seen'>) => {
    return createStoryMutation.mutateAsync(story);
  }, [createStoryMutation]);

  // Mutation pour mettre à jour une story
  const updateStoryMutation = useMutation({
    mutationFn: async ({ id, story }: { id: string, story: Partial<Story> }) => {
      const storyData = {
        ...story,
        eventId: story.eventId && story.eventId.trim() !== '' ? story.eventId : null
      };

      const { data, error } = await supabase
        .from('stories')
        .update(storyData)
        .eq('id', id)
        .select();

      if (error) throw error;

      return data[0] as Story;
    },
    onSuccess: (updatedStory) => {
      // Mettre à jour le cache React Query
      queryClient.setQueryData(['stories', hotelId, isSuperAdmin], (oldStories: Story[] = []) =>
        oldStories.map(s => s.id === updatedStory.id ? updatedStory : s)
      );

      toast({
        title: 'Success',
        description: 'Story updated successfully',
      });
    },
    onError: (error) => {
      console.error('Error updating story:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update story',
      });
    }
  });

  const updateStory = useCallback(async (id: string, story: Partial<Story>) => {
    return updateStoryMutation.mutateAsync({ id, story });
  }, [updateStoryMutation]);

  // Mutation pour supprimer une story
  const deleteStoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return id;
    },
    onSuccess: (id) => {
      // Mettre à jour le cache React Query
      queryClient.setQueryData(['stories', hotelId, isSuperAdmin], (oldStories: Story[] = []) =>
        oldStories.filter(s => s.id !== id)
      );

      toast({
        title: 'Success',
        description: 'Story deleted successfully',
      });
    },
    onError: (error) => {
      console.error('Error deleting story:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete story',
      });
    }
  });

  const deleteStory = useCallback(async (id: string) => {
    return deleteStoryMutation.mutateAsync(id);
  }, [deleteStoryMutation]);

  // Mutation pour marquer une story comme vue
  const markAsSeenMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('stories')
        .update({ seen: true })
        .eq('id', id);

      if (error) throw error;

      return id;
    },
    onSuccess: (id) => {
      // Mettre à jour le cache React Query
      queryClient.setQueryData(['stories'], (oldStories: Story[] = []) =>
        oldStories.map(s => s.id === id ? { ...s, seen: true } : s)
      );
    }
  });

  const markAsSeen = useCallback(async (id: string) => {
    return markAsSeenMutation.mutateAsync(id);
  }, [markAsSeenMutation]);

  return {
    stories,
    loading,
    fetchStories: refetch,
    createStory,
    updateStory,
    deleteStory,
    markAsSeen,
  };
};
