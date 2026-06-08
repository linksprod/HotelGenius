
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/features/auth/hooks/useAuthContext';
import { UserInfo } from './types';
import { getUserInfoFromDatabase, syncAuthUserToGuest } from './databaseUtils';
import { getLocalUserInfo, saveUserInfo, ensureValidUserInfo } from './localStorageUtils';
import { cleanupDuplicateGuestRecords } from '@/features/users/services/guestCleanupService';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useUserInfo(room: any = null) {
  const { userData } = useAuth();
  const [userInfo, setUserInfo] = useState<UserInfo>({ 
    name: '', 
    roomNumber: userData?.room_number || room?.room_number || '' 
  });

  // Load user profile data when component mounts
  useEffect(() => {
    const loadUserData = async () => {
      // First try to get authenticated user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Si l'utilisateur est authentifié, d'abord nettoyer les doublons potentiels
        if (session.user.id) {
          await cleanupDuplicateGuestRecords(session.user.id);
        }
        
        // User is authenticated, check if they have a guest record
        const info = await getUserInfoFromDatabase(session.user.id, userData, room);
        if (info) {
          setUserInfo(info);
          // Ensure the room number is stored in localStorage
          if (info.roomNumber) {
            localStorage.setItem('user_room_number', info.roomNumber);
          }
        } else {
          // No guest record yet, create basic info from auth data and sync it
          const roomNumber = userData?.room_number || room?.room_number || localStorage.getItem('user_room_number') || '000';
          const authInfo = {
            name: session.user.user_metadata?.first_name 
              ? `${session.user.user_metadata.first_name || ''} ${session.user.user_metadata.last_name || ''}`.trim()
              : session.user.email?.split('@')[0] || 'Guest',
            roomNumber: roomNumber,
            email: session.user.email
          };
          setUserInfo(authInfo);
          localStorage.setItem('user_room_number', roomNumber);
          
          // Create a basic guest record from auth info using saveUserInfo
          await saveUserInfo(authInfo);
        }
      } else {
        // Not authenticated, try to get from local info
        const localInfo = getLocalUserInfo();
        setUserInfo(localInfo);
        if (localInfo.roomNumber) {
          localStorage.setItem('user_room_number', localInfo.roomNumber);
        }
      }
    };
    
    loadUserData();
  }, [room, userData]);

  return {
    userInfo,
    setUserInfo,
    getLocalUserInfo,
    saveUserInfo,
    ensureValidUserInfo
  };
}
