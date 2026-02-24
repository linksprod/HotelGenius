
import { supabase } from '@/integrations/supabase/client';
import { UserData } from '../types/userTypes';
import { validateGuestId } from './guestValidation';

/**
 * Récupère les données d'un invité depuis Supabase
 */
export const getGuestData = async (userId: string): Promise<UserData | null> => {
  try {
    console.log('Fetching guest data for user ID:', userId);

    if (!validateGuestId(userId)) {
      return null;
    }

    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching guest data:', error);
      return null;
    }

    if (!data) {
      console.log('No guest data returned for user ID:', userId);
      return null;
    }

    console.log('Guest data retrieved successfully:', data);

    const userData: UserData = {
      id: data.user_id,
      email: data.email || '',
      first_name: data.first_name || 'Utilisateur',
      last_name: data.last_name || '',
      room_number: data.room_number || '',
      birth_date: data.birth_date,
      nationality: data.nationality,
      check_in_date: data.check_in_date,
      check_out_date: data.check_out_date,
      profile_image: data.profile_image,
      phone: data.phone,
      guest_type: data.guest_type || 'Standard Guest',
      hotel_id: data.hotel_id
    };

    // Store the record's ID in a hidden property if needed or just use for updates
    if (data.id) {
      (userData as any).internal_id = data.id;
    }

    return userData;
  } catch (error) {
    console.error('Exception when fetching guest data:', error);
    return null;
  }
};
