import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface GuestPreference {
  id: string;
  guest_id: string;
  category: string;
  value: string;
  created_at: string;
}

export interface GuestAlert {
  id: string;
  guest_id: string;
  alert_type: string;
  severity: string;
  description: string;
  created_at: string;
}

/**
 * Admin hook to read and manage a specific guest's preferences and alerts.
 * The admin can add/delete preferences and alerts on behalf of the guest.
 * Queries are scoped to the guestId (which already belongs to a specific hotel).
 */
export const useAdminGuestPreferences = (guestId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  /* ─── Preferences ─────────────────────────────────── */
  const preferencesQuery = useQuery({
    queryKey: ['admin-guest-preferences', guestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guest_preferences')
        .select('*')
        .eq('guest_id', guestId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as GuestPreference[];
    },
    enabled: !!guestId,
  });

  const addPreference = useMutation({
    mutationFn: async ({ category, value }: { category: string; value: string }) => {
      const { error } = await supabase
        .from('guest_preferences')
        .insert({ guest_id: guestId, category, value });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-guest-preferences', guestId] });
      toast({ title: 'Préférence ajoutée avec succès' });
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible d\'ajouter la préférence' });
    },
  });

  const deletePreference = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('guest_preferences').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-guest-preferences', guestId] });
      toast({ title: 'Préférence supprimée' });
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer la préférence' });
    },
  });

  /* ─── Alerts ──────────────────────────────────────── */
  const alertsQuery = useQuery({
    queryKey: ['admin-guest-alerts', guestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guest_medical_alerts')
        .select('*')
        .eq('guest_id', guestId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as GuestAlert[];
    },
    enabled: !!guestId,
  });

  const addAlert = useMutation({
    mutationFn: async (alert: { alert_type: string; severity: string; description: string }) => {
      const { error } = await supabase
        .from('guest_medical_alerts')
        .insert({ guest_id: guestId, ...alert });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-guest-alerts', guestId] });
      toast({ title: 'Alerte ajoutée avec succès' });
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible d\'ajouter l\'alerte' });
    },
  });

  const deleteAlert = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('guest_medical_alerts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-guest-alerts', guestId] });
      toast({ title: 'Alerte supprimée' });
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer l\'alerte' });
    },
  });

  return {
    preferences: preferencesQuery.data ?? [],
    isLoadingPreferences: preferencesQuery.isLoading,
    addPreference,
    deletePreference,
    alerts: alertsQuery.data ?? [],
    isLoadingAlerts: alertsQuery.isLoading,
    addAlert,
    deleteAlert,
  };
};
