
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

    // ── Hotel-scoped access check ──────────────────────────────────────────
    // Fetch all roles for this user across all hotels
    if (hotelId) {
      const { data: allRoles, error: roleError } = await supabase
        .from('user_roles')
        .select('hotel_id, role')
        .eq('user_id', authData.user.id);

      if (!roleError && allRoles && allRoles.length > 0) {
        // Filter out global/guest roles ('user' and 'super_admin') to check only hotel-scoped roles
        const hotelScopedRoles = allRoles.filter(r => r.role !== 'user' && r.role !== 'super_admin');

        if (hotelScopedRoles.length > 0) {
          // This is a staff/admin account — check if they belong to THIS hotel
          const hasAccessToThisHotel = hotelScopedRoles.some(r => r.hotel_id === hotelId);

          if (!hasAccessToThisHotel) {
            console.warn(`[loginService] Admin/staff ${email} is not listed for hotel ${hotelId}. Blocking.`);
            await supabase.auth.signOut();
            return {
              success: false,
              error: 'Your account does not have access to this hotel. Please use the correct hotel portal or a separate guest account.',
            };
          }
        }
      }
      // If allRoles is empty → regular guest account, allow through
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
      guest_type: guestData.guest_type || 'Standard Guest',
      hotel_id: guestData.hotel_id || hotelId || null
    } : {
      id: authData.user.id,
      email: email,
      first_name: authData.user.user_metadata?.first_name || 'Utilisateur',
      last_name: authData.user.user_metadata?.last_name || '',
      room_number: '',
      guest_type: 'Standard Guest',
      hotel_id: hotelId || null
    };

    localStorage.setItem('user_data', JSON.stringify(userData));
    localStorage.setItem('user_id', authData.user.id);

    if (!guestData || !guestData.room_number) {
      await syncGuestData(authData.user.id, userData);
    }

    console.log('User logged in successfully');
    return { success: true, userData };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error during login:', error);
    return { success: false, error: error.message || 'Une erreur est survenue lors de la connexion' };
  }
};
