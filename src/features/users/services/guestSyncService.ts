
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

    const guestData: any = {
      user_id: userId,
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      room_number: userData.room_number || '',
      birth_date: formatDateToString(userData.birth_date),
      nationality: userData.nationality,
      check_in_date: formatDateToString(userData.check_in_date),
      check_out_date: formatDateToString(userData.check_out_date),
      profile_image: userData.profile_image,
      phone: userData.phone,
      guest_type: userData.guest_type || 'Standard Guest',
      hotel_id: userData.hotel_id
    };

    // If we have an internal record ID, use it for the upsert to be safe
    if ((userData as any).internal_id) {
      guestData.id = (userData as any).internal_id;
    }

    console.log('[guestSyncService] Upserting guest data:', {
      userId,
      hotelId: guestData.hotel_id,
      hasInternalId: !!guestData.id
    });

    const { error } = await supabase
      .from('guests')
      .upsert(guestData, { onConflict: guestData.id ? 'id' : 'user_id' });

    if (error) {
      console.error('[guestSyncService] Error syncing guest data:', error);

      // If upsert fails because of user_id conflict constraint missing, 
      // we might want an even more manual approach, but typically RLS is the culprit.
      throw error;
    }

    console.log('[guestSyncService] Guest data synchronized successfully');

    localStorage.setItem('user_data', JSON.stringify(userData));
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
