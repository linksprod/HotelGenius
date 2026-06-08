
import { supabase } from '@/integrations/supabase/client';
import { UserInfo } from './types';
import { syncGuestData } from '@/features/users/services/guestService';

/**
 * Try to get user info directly from the database
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getUserInfoFromDatabase = async (userId: string, userData?: any, room?: any): Promise<UserInfo | null> => {
  try {
    const { data, error } = await supabase
      .from('guests')
      .select('first_name, last_name, room_number, phone, email')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error || !data) {
      console.error("Error fetching guest data:", error);
      return null;
    }
    
    const fullName = `${data.first_name || ''} ${data.last_name || ''}`.trim();
    const roomNumber = data.room_number || userData?.room_number || room?.room_number || localStorage.getItem('user_room_number') || '000';
    
    return {
      name: fullName || 'Guest',
      roomNumber: roomNumber,
      phone: data.phone || '',
      email: data.email || ''
    };
  } catch (error) {
    console.error("Error in getUserInfoFromDatabase:", error);
    return null;
  }
};

/**
 * Sync authenticated user to guest table
 */
export const syncAuthUserToGuest = async (userId: string, userInfo: UserInfo): Promise<boolean> => {
  try {
    // Convert UserInfo to UserData
    const userData = {
      id: userId,
      first_name: userInfo.name.split(' ')[0] || '',
      last_name: userInfo.name.split(' ').slice(1).join(' ') || '',
      email: userInfo.email || '',
      room_number: userInfo.roomNumber || '',
      phone: userInfo.phone || ''
    };
    
    // Use our improved function that handles duplicates
    await syncGuestData(userId, userData);
    return true;
  } catch (error) {
    console.error("Failed to sync auth user to guest:", error);
    return false;
  }
};
