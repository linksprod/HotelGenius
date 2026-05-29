
import { supabase } from '@/integrations/supabase/client';
import { UserData } from '@/features/users/types/userTypes';
import { syncGuestData } from '@/features/users/services/guestService';
import { cleanupDuplicateGuestRecords } from '@/features/users/services/guestCleanupService';

/**
 * Connexion d'un utilisateur avec email et mot de passe.
 * @param hotelId - If provided (custom domain), validates that the user belongs to this hotel.
 */
export const loginUser = async (
  email: string,
  password: string,
  hotelId?: string | null
): Promise<{ success: boolean; error?: string; userData?: UserData }> => {
  try {
    console.log('Logging in user with email:', email);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      console.error('Erreur lors de la connexion:', authError);
      return { success: false, error: authError.message || 'Identifiants incorrects' };
    }

    if (!authData.user) {
      return { success: false, error: 'Aucun utilisateur trouvé' };
    }

    // ── Custom domain: hotel-scoped access check ──────────────────────────
    if (hotelId) {
      const { data: roleRows, error: roleError } = await supabase
        .from('user_roles')
        .select('hotel_id')
        .eq('user_id', authData.user.id)
        .eq('hotel_id', hotelId)
        .limit(1);

      if (roleError || !roleRows || roleRows.length === 0) {
        console.warn(`[loginService] User ${email} does not belong to hotel ${hotelId}. Blocking login.`);
        await supabase.auth.signOut();
        return { success: false, error: 'You do not have access to this hotel.' };
      }
    }
    // ─────────────────────────────────────────────────────────────────────

    console.log('User authenticated successfully:', authData.user);

    await cleanupDuplicateGuestRecords(authData.user.id);

    const { data: guestData, error: guestError } = await supabase
      .from('guests')
      .select('*')
      .eq('user_id', authData.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (guestError && guestError.code !== 'PGRST116') {
      console.error('Erreur lors de la récupération des données invité:', guestError);
    }

    const userData: UserData = guestData ? {
      id: authData.user.id,
      email: email,
      first_name: guestData.first_name || authData.user.user_metadata?.first_name || 'Utilisateur',
      last_name: guestData.last_name || authData.user.user_metadata?.last_name || '',
      room_number: guestData.room_number || '',
      birth_date: guestData.birth_date || undefined,
      check_in_date: guestData.check_in_date || undefined,
      check_out_date: guestData.check_out_date || undefined,
      nationality: guestData.nationality,
      profile_image: guestData.profile_image,
      guest_type: guestData.guest_type || 'Standard Guest'
    } : {
      id: authData.user.id,
      email: email,
      first_name: authData.user.user_metadata?.first_name || 'Utilisateur',
      last_name: authData.user.user_metadata?.last_name || '',
      room_number: '',
      guest_type: 'Standard Guest'
    };

    localStorage.setItem('user_data', JSON.stringify(userData));
    localStorage.setItem('user_id', authData.user.id);

    if (!guestData || !guestData.room_number) {
      await syncGuestData(authData.user.id, userData);
    }

    console.log('User logged in successfully');
    return { success: true, userData };
  } catch (error: any) {
    console.error('Error during login:', error);
    return { success: false, error: error.message || 'Une erreur est survenue lors de la connexion' };
  }
};
