
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { CompanionData, UserData } from '@/features/users/types/userTypes';
import { getCompanions, syncCompanions } from '@/features/users/services/companionService';
import { syncGuestData } from '@/features/users/services/guestService';
import { useAuth } from '@/features/auth/hooks/useAuthContext';
import { calculateStayDuration } from '../utils/dateUtils';
import { useNotifications } from '@/hooks/useNotifications';
import { useCurrentHotelId } from '@/hooks/useCurrentHotelId';

export const useProfileData = () => {
  const { toast } = useToast();
  const { userData: authUserData, user, refreshUserData, setUserData: setGlobalUserData } = useAuth();
  const { hotelId } = useCurrentHotelId();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [companions, setCompanions] = useState<CompanionData[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Get real notifications from the notification system
  const { notifications: systemNotifications } = useNotifications();

  useEffect(() => {
    // Ne pas écraser l'état local si nous sommes en train de faire une mise à jour
    if (authUserData && !isUpdating) {
      console.log('Syncing profile local state from AuthContext:', authUserData.profile_image);
      setUserData(authUserData);
    }
  }, [authUserData, isUpdating]);

  useEffect(() => {
    const userId = user?.id || localStorage.getItem('user_id');
    if (userId) {
      fetchCompanions(userId);
    }
  }, [user]);

  const fetchCompanions = async (userId: string) => {
    try {
      const companionsList = await getCompanions(userId);
      setCompanions(companionsList);
    } catch (error) {
      console.error('Error fetching companions:', error);
    }
  };

  const addCompanion = async (companion: CompanionData) => {
    const userId = user?.id || localStorage.getItem('user_id');
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Utilisateur non authentifié."
      });
      return false;
    }

    try {
      const newCompanions = [...companions, companion];
      await syncCompanions(userId, newCompanions);
      setCompanions(newCompanions);

      toast({
        title: "Accompagnateur ajouté",
        description: "L'accompagnateur a été ajouté avec succès."
      });
      return true;
    } catch (error) {
      console.error('Error adding companion:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'ajouter l'accompagnateur."
      });
      return false;
    }
  };

  // Updated to handle string IDs
  const dismissNotification = (id: string) => {
    // We don't need to handle this locally anymore as the real 
    // notifications system will handle this
    toast({
      title: "Notification dismissed",
      description: "The notification has been removed",
    });
  };

  const handleProfileImageChange = async (imageData: string | null) => {
    if (!userData) return;

    // 1. Mise à jour immédiate de l'UI (optimiste)
    const originalImage = userData.profile_image;
    const optimisticData = {
      ...userData,
      profile_image: imageData
    };

    setUserData(optimisticData);
    setGlobalUserData(optimisticData); // <--- GLOBAL UPDATE FOR NAVBAR

    const userId = user?.id || localStorage.getItem('user_id');
    if (!userId) return;

    setIsUpdating(true);
    try {
      let finalImageUrl = imageData;

      // 2. Si on a une nouvelle image (base64 du cropper), on l'uploade vers le storage
      if (imageData && imageData.startsWith('data:')) {
        console.log('[useProfileData] New image detected, uploading to storage...');
        const { uploadProfileImage } = await import('@/features/users/services/profileImageService');
        const uploadedUrl = await uploadProfileImage(userId, imageData);

        if (!uploadedUrl) {
          throw new Error("Échec de l'upload vers le storage");
        }
        finalImageUrl = uploadedUrl;
        console.log('[useProfileData] Upload successful, URL:', finalImageUrl);
      }

      // 3. Mise à jour de la table 'guests' avec l'URL persistante
      const updatedUserData = {
        ...userData,
        profile_image: finalImageUrl,
        hotel_id: hotelId || userData.hotel_id
      };

      console.log('[useProfileData] Syncing guest data with URL:', finalImageUrl, 'for hotel:', updatedUserData.hotel_id);
      const syncSuccess = await syncGuestData(userId, updatedUserData);

      if (!syncSuccess) {
        throw new Error("Échec de la synchronisation avec la base de données");
      }

      // 4. Update global context and local state immediately with guaranteed fresh data
      console.log('[useProfileData] Sync successful, updating states with:', finalImageUrl);
      setGlobalUserData(updatedUserData);
      setUserData(updatedUserData);

      // Trigger a silent background refresh just in case, but we don't depend on its result
      refreshUserData().catch(err => console.warn('[useProfileData] Background refresh failed:', err));

      toast({
        title: "Profil mis à jour",
        description: "Votre photo de profil a été enregistrée sur le serveur."
      });
    } catch (error) {
      console.error('[useProfileData] Error syncing profile image:', error);
      // Rétablir l'image originale en cas d'erreur
      setGlobalUserData(authUserData);
      setUserData(userData);

      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'enregistrer votre photo de profil.",
        variant: "destructive"
      });
    } finally {
      // Delay clearing isUpdating to allow any background refreshes to settle
      // and ensure the useEffect skip-logic remains active long enough.
      setTimeout(() => {
        console.log('[useProfileData] Updating session complete, clearing isUpdating guard');
        setIsUpdating(false);
      }, 500);
    }
  };

  const stayDuration = userData ?
    calculateStayDuration(userData.check_in_date, userData.check_out_date) :
    null;

  // Convert system notifications to the format expected by NotificationsList
  // Ensure ID is preserved as-is, without forcing number conversion
  const notifications = systemNotifications
    .slice(0, 5)
    .map(notification => ({
      id: notification.id, // Keep the original string ID
      message: notification.title,
      time: typeof notification.time === 'string'
        ? notification.time
        : new Intl.DateTimeFormat('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit'
        }).format(notification.time)
    }));

  return {
    userData,
    companions,
    notifications,
    stayDuration,
    dismissNotification,
    handleProfileImageChange,
    addCompanion
  };
};
