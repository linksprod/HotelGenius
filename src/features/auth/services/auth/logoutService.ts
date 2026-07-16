
import { supabase } from '@/integrations/supabase/client';

/**
 * Déconnexion de l'utilisateur
 */
export const logoutUser = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Starting logout process in authService');
    
    // Set status to offline in guests table before signing out
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        await supabase
          .from('guests')
          .update({ status: 'offline', updated_at: new Date().toISOString() })
          .eq('user_id', session.user.id);
        console.log('Set guest status to offline before signing out');
      }
    } catch (e) {
      console.error('Error setting guest status to offline on logout:', e);
    }

    // Déconnexion de Supabase Auth
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Erreur lors de la déconnexion Supabase dans authService:', error);
      return { 
        success: false, 
        error: error.message || 'Erreur lors de la déconnexion' 
      };
    }
    
    // Nettoyer localStorage de manière synchrone pour être sûr
    try {
      console.log('Clearing local storage data in authService');
      localStorage.removeItem('user_data');
      localStorage.removeItem('user_id');
      sessionStorage.clear(); // Nettoyer aussi le sessionStorage par précaution
    } catch (e) {
      console.error('Erreur lors du nettoyage du localStorage dans authService:', e);
    }
    
    console.log('User logged out successfully in authService');
    return { success: true };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error during logout in authService:', error);
    return { 
      success: false, 
      error: error.message || 'Une erreur est survenue lors de la déconnexion' 
    };
  }
};
