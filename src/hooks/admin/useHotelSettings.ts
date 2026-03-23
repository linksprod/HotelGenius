import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCurrentHotelId } from '@/hooks/useCurrentHotelId';

export const useHotelSettings = () => {
  const { hotelId } = useCurrentHotelId();
  const [config, setConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const fetchSettings = async () => {
    if (!hotelId) return;
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('hotels')
        .select('config')
        .eq('id', hotelId)
        .single();

      if (error) throw error;
      setConfig(data.config || {});
    } catch (error) {
      console.error('Error fetching hotel settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfig = async (newConfig: any) => {
    if (!hotelId) return;
    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('hotels')
        .update({ config: { ...config, ...newConfig } })
        .eq('id', hotelId);

      if (error) throw error;

      setConfig({ ...config, ...newConfig });
      toast({
        title: "Settings Saved",
        description: "AI Oracle has been updated with new directives.",
      });
    } catch (error) {
      console.error('Error updating hotel settings:', error);
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [hotelId]);

  return {
    config,
    isLoading,
    isSaving,
    updateConfig,
    refresh: fetchSettings
  };
};
