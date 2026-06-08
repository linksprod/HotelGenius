
import { supabase } from '@/integrations/supabase/client';
import { UserData } from '@/features/users/types/userTypes';
import { syncGuestData } from '@/features/users/services/guestService';

/**
 * Inscription d'un utilisateur avec email et mot de passe et synchronisation des données
 */
export const registerUser = async (
  email: string,
  password: string,
  userData: Omit<UserData, 'email'>
): Promise<{ success: boolean; error?: string; userId?: string }> => {
  try {
    console.log('Registering user with email:', email);
    
    // Créer un utilisateur dans Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData.first_name,
          last_name: userData.last_name,
        }
      }
    });

    if (authError) {
      console.error('Erreur lors de l\'inscription:', authError);
      
      // Gestion spécifique de l'erreur "Signups not allowed"
      if (authError.message?.includes('Signups not allowed') || authError.code === 'signup_disabled') {
        return { 
          success: false, 
          error: 'Les inscriptions sont actuellement désactivées. Veuillez contacter l\'administrateur du système.' 
        };
      }
      
      return { 
        success: false, 
        error: authError.message || 'Erreur lors de l\'inscription' 
      };
    }

    if (!authData.user) {
      return { 
        success: false, 
        error: 'Erreur de création de compte' 
      };
    }

    // Stocker aussi les données dans le localStorage pour la compatibilité avec le code existant
    const fullUserData = {
      ...userData,
      email,
      id: authData.user.id
    };
    
    localStorage.setItem('user_data', JSON.stringify(fullUserData));
    localStorage.setItem('user_id', authData.user.id);

    // Synchroniser les données avec la table guests dans Supabase
    await syncGuestData(authData.user.id, fullUserData);

    console.log('User registered successfully');
    return { 
      success: true,
      userId: authData.user.id
    };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error during registration:', error);
    return { 
      success: false, 
      error: error.message || 'Une erreur est survenue lors de l\'inscription' 
    };
  }
};
