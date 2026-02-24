
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { UserData } from '@/features/users/types/userTypes';
import { getCurrentSession, isAuthenticated } from '../services/authService';
import { getGuestData, syncGuestData } from '@/features/users/services/guestService';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  isAuthenticated: boolean;
  refreshUserData: () => Promise<UserData | null>;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  userData: null,
  loading: true,
  isAuthenticated: false,
  refreshUserData: async () => null,
  setUserData: () => { }
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const { toast } = useToast();

  const fetchUserData = async (userId: string) => {
    try {
      console.log('Récupération des données utilisateur depuis Supabase pour:', userId);

      const guestData = await getGuestData(userId);

      if (guestData) {
        console.log(`[AuthContext] Fresh guest data for ${userId}:`, {
          hasImage: !!guestData.profile_image,
          imageLength: guestData.profile_image?.length || 0
        });

        setUserData(prev => {
          // Only update if data actually changed to avoid unnecessary re-renders
          if (JSON.stringify(prev) === JSON.stringify(guestData)) {
            return prev;
          }
          return guestData;
        });

        localStorage.setItem('user_data', JSON.stringify(guestData));
        if (guestData.room_number) {
          localStorage.setItem('user_room_number', guestData.room_number);
        }
        return guestData;
      } else {
        console.warn(`[AuthContext] No guest data found in DB for ${userId}`);
      }

      // Check for data in localStorage
      const userDataString = localStorage.getItem('user_data');
      if (userDataString) {
        try {
          const localUserData = JSON.parse(userDataString) as UserData;
          setUserData(localUserData);
          console.log('Données récupérées depuis localStorage:', localUserData);

          // Stocker le numéro de chambre uniquement s'il existe
          if (localUserData.room_number) {
            console.log('Stockage du numéro de chambre depuis localStorage:', localUserData.room_number);
            localStorage.setItem('user_room_number', localUserData.room_number);
          }

          await syncGuestData(userId, localUserData);

          return localUserData;
        } catch (error) {
          console.error('Error parsing user data from localStorage:', error);
        }
      }

      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  const refreshUserData = async () => {
    if (!user) {
      console.log('Aucun utilisateur, impossible de rafraîchir les données');
      return null;
    }

    const userId = user.id;
    if (userId) {
      console.log('Refreshing user data for:', userId);
      return await fetchUserData(userId);
    }
    return null;
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);

      try {
        // Ensuite, vérifier la session existante
        const { data } = await supabase.auth.getSession();
        console.log('Session initiale:', data.session);

        setSession(data.session);
        setUser(data.session?.user || null);

        if (data.session?.user) {
          setIsUserAuthenticated(true);
          const userId = data.session.user.id;
          localStorage.setItem('user_id', userId);
          await fetchUserData(userId);
        } else {
          const authStatus = await isAuthenticated();
          setIsUserAuthenticated(authStatus);

          // Essayer de récupérer l'ID utilisateur du localStorage si pas de session
          const userId = localStorage.getItem('user_id');
          if (userId && authStatus) {
            await fetchUserData(userId);
          } else {
            setUserData(null);
            localStorage.removeItem('user_data');
          }
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'authentification:', error);
        setUserData(null);
        toast({
          variant: "destructive",
          title: "Erreur d'authentification",
          description: "Un problème est survenu lors de l'initialisation de l'authentification"
        });
      } finally {
        setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event);
        setSession(newSession);
        setUser(newSession?.user || null);

        if (newSession?.user) {
          setIsUserAuthenticated(true);
          setTimeout(async () => {
            await fetchUserData(newSession.user!.id);
          }, 0);
        } else {
          setIsUserAuthenticated(false);
          setUserData(null);
          localStorage.removeItem('user_data');
          localStorage.removeItem('user_id');
        }
      }
    );

    initializeAuth();

    // Clean up subscription correctly
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        userData,
        loading,
        isAuthenticated: isUserAuthenticated,
        refreshUserData,
        setUserData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
