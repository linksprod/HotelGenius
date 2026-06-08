
import { supabase } from '@/integrations/supabase/client';
import { UserData } from '../types/userTypes';
import { formatDateToString } from '../utils/validationUtils';
import { validateGuestId } from './guestValidation';

/**
 * Synchronise les données d'un invité avec Supabase
 * Utilise un UPSERT atomique sur user_id pour éviter les doublons
 */
export const syncGuestData = async (userId: string, userData: UserData): Promise<boolean> => {
  try {
    console.log('Syncing guest data for user ID:', userId);

    if (!validateGuestId(userId)) {
      return false;
    }

    // Data sanitization: convert empty strings to null for database compatibility
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sanitize = (val: any) => {
      if (val === undefined || val === null) return null;
      if (typeof val === 'string' && val.trim() === '') return null;
      return val;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const guestData: any = {
      user_id: userId,
      first_name: sanitize(userData.first_name) || 'Utilisateur',
      last_name: sanitize(userData.last_name) || '',
      email: sanitize(userData.email),
      room_number: sanitize(userData.room_number) || '',
      birth_date: formatDateToString(userData.birth_date),
      nationality: sanitize(userData.nationality),
      check_in_date: formatDateToString(userData.check_in_date),
      check_out_date: formatDateToString(userData.check_out_date),
      profile_image: sanitize(userData.profile_image),
      phone: sanitize(userData.phone),
      guest_type: sanitize(userData.guest_type) || 'Standard Guest',
    };

    // Validate hotel_id as UUID or null
    if (userData.hotel_id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userData.hotel_id)) {
      guestData.hotel_id = userData.hotel_id;
    } else {
      console.warn('[guestSyncService] Invalid or missing hotel_id UUID, setting to null:', userData.hotel_id);
      guestData.hotel_id = null;
    }

    // If we have an internal record ID, use it for the upsert to be safe
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((userData as any).internal_id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      guestData.id = (userData as any).internal_id;
    }

    console.log('[guestSyncService] Attempting upsert with payload:', {
      id: guestData.id,
      user_id: guestData.user_id,
      hotel_id: guestData.hotel_id,
      email: guestData.email
    });

    const { error } = await supabase
      .from('guests')
      .upsert(guestData, { onConflict: guestData.id ? 'id' : 'user_id' });

    if (error) {
      console.error('[guestSyncService] Database error during sync:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    console.log('[guestSyncService] Guest data synchronized successfully');

    // Update local preview/cache
    const finalData = { ...userData, ...guestData };
    localStorage.setItem('user_data', JSON.stringify(finalData));
    if (userData.room_number) {
      localStorage.setItem('user_room_number', userData.room_number);
    }

    return true;
  } catch (error) {
    console.error('Exception when syncing guest data:', error);
    return false;
  }
};

// Re-export for backward compatibility
export { cleanupDuplicateGuestRecords } from './guestCleanupService';
