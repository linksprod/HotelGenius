import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/features/auth/hooks/useAuthContext';
import { useToast } from '@/hooks/use-toast';

export interface StaffNote {
  id: string;
  guest_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

/**
 * Admin-only hook to manage staff notes for a guest.
 * Notes are NEVER exposed to guests — only visible through admin panels.
 * Scoped per guest (which belongs to a specific hotel → multi-tenant safe).
 */
export const useStaffNotes = (guestId: string) => {
  const { toast } = useToast();
  const { user, userData } = useAuth();
  const queryClient = useQueryClient();

  const notesQuery = useQuery({
    queryKey: ['staff-notes', guestId],
    queryFn: async () => {
      const { data, error } = await supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from('guest_staff_notes' as any)
        .select('*')
        .eq('guest_id', guestId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as StaffNote[];
    },
    enabled: !!guestId,
  });

  const addNote = useMutation({
    mutationFn: async (content: string) => {
      const authorName =
        (userData?.first_name && userData?.last_name)
          ? `${userData.first_name} ${userData.last_name}`
          : user?.email?.split('@')[0] || 'Staff';

      const { error } = await supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from('guest_staff_notes' as any)
        .insert({ guest_id: guestId, author_name: authorName, content });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-notes', guestId] });
      toast({ title: 'Note ajoutée' });
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible d\'ajouter la note' });
    },
  });

  const deleteNote = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from('guest_staff_notes' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-notes', guestId] });
      toast({ title: 'Note supprimée' });
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer la note' });
    },
  });

  return {
    notes: notesQuery.data ?? [],
    isLoading: notesQuery.isLoading,
    addNote,
    deleteNote,
  };
};
