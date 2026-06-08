
import { UserInfo } from './types';
import { supabase } from '@/integrations/supabase/client';
import { syncAuthUserToGuest } from './databaseUtils';

/**
 * Get user info from local storage or defaults
 */
export const getLocalUserInfo = (): UserInfo => {
  // First try to get user data from localStorage
  const userDataString = localStorage.getItem('user_data');
  if (userDataString) {
    try {
      const userData = JSON.parse(userDataString);
      if (userData) {
        // Format full name from first_name and last_name fields
        const fullName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
        // Get room number from userData or fall back to room prop or Auth context
        const storedRoomNumber = localStorage.getItem('user_room_number');
        const roomNumber = userData.room_number || storedRoomNumber || '000';
        // Get phone number if available
        const phone = userData.phone || '';
        const email = userData.email || '';
        
        // Ensure room number is stored in localStorage
        if (roomNumber && roomNumber !== storedRoomNumber) {
          localStorage.setItem('user_room_number', roomNumber);
        }
        
        return {
          name: fullName || 'Guest',
          roomNumber: roomNumber,
          phone: phone,
          email: email
        };
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }
  
  // If no user data in localStorage, use default values
  const defaultRoomNumber = localStorage.getItem('user_room_number') || '000';
  
  // Ensure room number is stored in localStorage
  if (defaultRoomNumber) {
    localStorage.setItem('user_room_number', defaultRoomNumber);
  }
  
  return { 
    name: 'Guest', 
    roomNumber: defaultRoomNumber
  };
};

/**
 * Save user info to localStorage and sync to database if authenticated
 */
export const saveUserInfo = async (info: UserInfo): Promise<void> => {
  // Store user info in local storage with proper fields
  const userDataToSave = {
    first_name: info.name.split(' ')[0],
    last_name: info.name.split(' ').slice(1).join(' '),
    room_number: info.roomNumber,
    phone: info.phone || '',
    email: info.email || ''
  };
  
  localStorage.setItem('user_data', JSON.stringify(userDataToSave));
  localStorage.setItem('user_room_number', info.roomNumber);
  
  // If authenticated, also sync to guests table
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await syncAuthUserToGuest(session.user.id, info);
    }
  } catch (error) {
    console.error("Error syncing user info with guest table:", error);
  }
};

/**
 * Ensure user info is valid, filling in defaults if needed
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ensureValidUserInfo = async (userData?: any, room?: any): Promise<UserInfo> => {
  const currentInfo = getLocalUserInfo();
  
  // If either name or room number is missing, save with defaults
  if (!currentInfo.name || !currentInfo.roomNumber) {
    const roomNumber = userData?.room_number || room?.room_number || localStorage.getItem('user_room_number') || '000';
    const updatedInfo = {
      name: currentInfo.name || 'Guest',
      roomNumber: currentInfo.roomNumber || roomNumber,
      phone: currentInfo.phone,
      email: currentInfo.email
    };
    
    await saveUserInfo(updatedInfo);
    return updatedInfo;
  }
  
  return currentInfo;
};
