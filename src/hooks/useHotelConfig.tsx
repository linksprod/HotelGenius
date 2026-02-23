
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
  created_at?: string;
  updated_at?: string;
}

export function useHotelConfig() {
  const queryClient = useQueryClient();
  const { hotelId } = useHotel();

  const { data, isLoading, error } = useQuery({
    queryKey: ['hotelConfig', hotelId],
    queryFn: async () => {
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
      const { data: existingConfig } = await supabase
        .from('hotel_config')
        .select('id')
        .single();

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
