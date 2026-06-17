
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useHotel } from '@/features/hotels/context/HotelContext';
import { isCustomDomain } from '@/utils/domain';

export interface HotelConfig {
  id: string;
  name: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  enabled_features?: string[];
  contact_email?: string;
  contact_phone?: string;
  feedback_hero_image?: string;
  home_hero_title?: string;
  home_hero_subtitle?: string;
  home_hero_image?: string;
  hotel_id?: string | null;
  featured_experiences?: any[] | null;
  created_at?: string;
  updated_at?: string;
}

function getResolvedHotelCacheKey(): string | null {
  if (typeof window === 'undefined') return null;

  const hostname = window.location.hostname;
  if (isCustomDomain()) {
    return hostname.replace(/^www\./, '');
  }

  const pathname = window.location.pathname;
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length > 0) {
    const firstPart = parts[0];
    const reservedWords = ['login', 'auth', 'administration', 'admin', 'api', 'static'];
    if (!reservedWords.includes(firstPart)) {
      return firstPart;
    }
  }
  return null;
}

export function useHotelConfig() {
  const queryClient = useQueryClient();
  const { hotelId } = useHotel();
  const cacheKey = getResolvedHotelCacheKey();

  const { data, isLoading, error } = useQuery({
    queryKey: ['hotelConfig', hotelId],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query: any = supabase
        .from('hotel_config')
        .select('*');

      if (hotelId) {
        query = query.eq('hotel_id', hotelId);
      } else {
        query = query.is('hotel_id', null);
      }

      const { data, error } = await query.maybeSingle();

      if (error) throw error;

      if (data && cacheKey) {
        localStorage.setItem(`hotel_config_${cacheKey}`, JSON.stringify(data));
      }

      return data as HotelConfig;
    },
    enabled: !cacheKey || !!hotelId,
    initialData: () => {
      if (cacheKey) {
        const cached = localStorage.getItem(`hotel_config_${cacheKey}`);
        if (cached) {
          try {
            return JSON.parse(cached) as HotelConfig;
          } catch (e) {
            return undefined;
          }
        }
      }
      return undefined;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  React.useEffect(() => {
    // Enable realtime updates for this specific hotel
    const channel = supabase
      .channel('public:hotel_config')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hotel_config',
          filter: hotelId ? `hotel_id=eq.${hotelId}` : 'hotel_id=is.null',
        },
        () => {
          // When a change is detected, invalidate the query to refetch
          queryClient.invalidateQueries({ queryKey: ['hotelConfig', hotelId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [hotelId, queryClient]);

  const updateConfig = useMutation({
    mutationFn: async (newConfig: Partial<HotelConfig>) => {
      // Find existing config for this hotel
      let query = supabase.from('hotel_config').select('id');
      if (hotelId) {
        query = query.eq('hotel_id', hotelId);
      } else {
        // Fallback for global admin or when hotelId is not resolved
        query = query.is('hotel_id', null);
      }
      
      const { data: existingConfig } = await query.maybeSingle();

      let result;

      if (existingConfig) {
        // Update existing config
        const { data, error } = await supabase
          .from('hotel_config')
          .update(newConfig)
          .eq('id', existingConfig.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Create new config - ensure required fields are present
        const configToInsert = {
          name: newConfig.name || 'Hotel Genius',
          primary_color: newConfig.primary_color || '#1e40af',
          secondary_color: newConfig.secondary_color || '#4f46e5',
          hotel_id: hotelId || null,
          ...newConfig
        };

        const { data, error } = await supabase
          .from('hotel_config')
          .insert(configToInsert)
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      if (result && cacheKey) {
        localStorage.setItem(`hotel_config_${cacheKey}`, JSON.stringify(result));
      }

      return result as HotelConfig;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotelConfig'] });
    }
  });

  return {
    config: data,
    isLoading: isLoading && !data,
    error,
    updateConfig: updateConfig.mutate
  };
}

