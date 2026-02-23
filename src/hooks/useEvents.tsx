
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/types/event';
import { useToast } from './use-toast';
import { isBefore, startOfDay } from 'date-fns';
import { useQuery } from '@tanstack/react-query';

import { useCurrentHotelId } from './useCurrentHotelId';

export const useEvents = (filterBySpaFacility = false) => {
  const { toast } = useToast();
  const { hotelId, isSuperAdmin } = useCurrentHotelId();

  const { data: events = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: ['events', { filterBySpaFacility, hotelId, isSuperAdmin }],
    queryFn: async () => {
      if (!hotelId && !isSuperAdmin) {
        return [];
      }

      console.log('Fetching events from Supabase...', filterBySpaFacility ? 'Filtering by spa facility' : 'All events', 'Hotel ID:', hotelId, 'isSuperAdmin:', isSuperAdmin);

      let query: any = supabase
        .from('events')
        .select('*');

      // Only filter by hotel_id if a hotelId is present AND the user is NOT a super admin
      if (hotelId && !isSuperAdmin) {
        query = query.eq('hotel_id', hotelId);
      }

      query = query.order('created_at', { ascending: false });

      // Si on filtre par spa, on ne récupère que les événements liés à un spa
      if (filterBySpaFacility) {
        query = query.not('spa_facility_id', 'is', null);
      }

      const { data, error } = await query.limit(100);

      if (error) {
        console.error('Error in fetchEvents:', error);
        throw error;
      }

      console.log('Events fetched successfully:', data);
      return data as Event[];
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const upcomingEvents = useMemo(() => {
    const today = startOfDay(new Date());
    return (events || []).filter(event => {
      // Include daily recurring events (always upcoming)
      if (event.recurrence_type === 'daily') {
        return true;
      }
      // For one-time events, check if the date is today or in the future
      if (event.date) {
        const eventDate = startOfDay(new Date(event.date));
        return !isBefore(eventDate, today);
      }
      return false;
    });
  }, [events]);

  const createEvent = useCallback(async (event: Omit<Event, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Creating new event:', event);

      const { data, error } = await supabase
        .from('events')
        .insert([event])   // hotel_id set by DB trigger
        .select();

      if (error) {
        console.error('Error in createEvent:', error);
        throw error;
      }

      console.log('Event created successfully:', data);

      await refetch();

      toast({
        title: 'Succès',
        description: 'Événement créé avec succès',
      });

      return data[0];
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de créer l\'événement',
      });
      throw error;
    }
  }, [toast, refetch]);

  const updateEvent = useCallback(async (id: string, event: Partial<Event>) => {
    try {
      console.log('Updating event:', id, event);

      const { data, error } = await supabase
        .from('events')
        .update(event)
        .eq('id', id)
        .select();

      if (error) {
        console.error('Error in updateEvent:', error);
        throw error;
      }

      console.log('Event updated successfully:', data);

      await refetch();

      toast({
        title: 'Succès',
        description: 'Événement mis à jour avec succès',
      });

      return data[0];
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de mettre à jour l\'événement',
      });
      throw error;
    }
  }, [toast, refetch]);

  const deleteEvent = useCallback(async (id: string) => {
    try {
      console.log('Deleting event:', id);

      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error in deleteEvent:', error);
        throw error;
      }

      console.log('Event deleted successfully');

      await refetch();

      toast({
        title: 'Succès',
        description: 'Événement supprimé avec succès',
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de supprimer l\'événement',
      });
      throw error;
    }
  }, [toast, refetch]);

  return {
    events,
    upcomingEvents,
    loading,
    error,
    fetchEvents: refetch,
    refetch,  // Make sure to expose refetch
    createEvent,
    updateEvent,
    deleteEvent,
  };
};
