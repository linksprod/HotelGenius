
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

import { useHotel } from '@/features/hotels/context/HotelContext';

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

export function useHotelConfig() {
  const queryClient = useQueryClient();
  const { hotelId } = useHotel();

  const { data, isLoading, error } = useQuery({
    queryKey: ['hotelConfig', hotelId],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query: any = supabase
        .from('hotel_config')
        .select('*');

      if (hotelId) {
        query = query.eq('hotel_id', hotelId);
      }

      const { data, error } = await query.maybeSingle();

      if (error) throw error;

      return data as HotelConfig;
    }
  });

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

      return result as HotelConfig;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotelConfig'] });
    }
  });

  return {
    config: data,
    isLoading,
    error,
    updateConfig: updateConfig.mutate
  };
}
