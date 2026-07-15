
import { useState, useEffect } from 'react';
import { Room } from '@/hooks/useRoom';

interface UserInfo {
  name: string;
  roomNumber: string;
}

export const useUserInfo = (room: Room | null) => {
  const [userInfo, setUserInfo] = useState<UserInfo>({ 
    name: 'Guest', 
    roomNumber: room?.room_number || '' 
  });

  useEffect(() => {
    const storedInfo = getUserInfo();
    setUserInfo(storedInfo);
  }, [room]);

  const getUserInfo = (): UserInfo => {
    // Try to get from localStorage
    const userInfoStr = localStorage.getItem('userInfo');
    if (userInfoStr) {
      try {
        const parsed = JSON.parse(userInfoStr);
        return {
          name: parsed.name || 'Guest',
          roomNumber: parsed.roomNumber || (room?.room_number || '')
        };
      } catch (error) {
        console.error("Error parsing user info:", error);
      }
    }

    // Try to get from user_data (used in other parts of the app)
    const userDataStr = localStorage.getItem('user_data');
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        return {
          name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Guest',
          roomNumber: userData.room_number || (room?.room_number || '')
        };
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }

    // Default values
    return {
      name: 'Guest',
      roomNumber: room?.room_number || ''
    };
  };

  return {
    userInfo,
    getUserInfo
  };
};
