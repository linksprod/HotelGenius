
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { isAuthenticated } from '@/features/auth/services/authService';
import { syncUserData } from '@/features/users/services/userService';
import { cleanupDuplicateGuestRecords } from '@/features/users/services/guestService';
import { useToast } from '@/hooks/use-toast';
import { useHotelPath } from '@/hooks/useHotelPath';

/**
 * Hook custom pour la gestion de l'authentification et des autorisations
 */
export const useAuthGuard = (adminRequired: boolean = false) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { resolvePath } = useHotelPath();
  const [loading, setLoading] = useState<boolean>(true);
  const [authorized, setAuthorized] = useState<boolean>(false);

  // Track if initial auth check has completed
  const initialAuthDone = useRef(false);

  // Fonction pour vérifier si la page actuelle est une page d'authentification
  const isAuthPage = () => location.pathname.includes('/auth/');

  // Fonction pour gérer les erreurs d'authentification
  const handleAuthError = (errorMessage: string) => {
    console.error(errorMessage);
    toast({
      variant: "destructive",
      title: "Erreur d'authentification",
      description: "Veuillez vous reconnecter"
    });

    // Nettoyage d'urgence et redirection
    try {
      localStorage.removeItem('user_data');
      localStorage.removeItem('user_id');
    } catch (e) {
      console.error("Erreur de nettoyage:", e);
    }

    navigate(resolvePath('/auth/login'), { replace: true });
    setAuthorized(false);
  };

  useEffect(() => {
    // Ne pas vérifier l'authentification sur les pages d'authentification
    if (isAuthPage()) {
      console.log("Page d'authentification, pas de vérification nécessaire");
      setLoading(false);
      setAuthorized(false);
      return;
    }

    // If already authorized and initial auth is done, skip re-check
    if (initialAuthDone.current && authorized) {
      return;
    }

    const checkAuth = async () => {
      // Only show loading spinner on initial load
      if (!initialAuthDone.current) {
        setLoading(true);
      }
      console.log("Vérification de l'authentification pour la route:", location.pathname);
      console.log("adminRequired:", adminRequired);

      try {
        // 1. Vérifier si l'utilisateur est authentifié via Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Erreur lors de la récupération de la session:", sessionError);
          throw new Error("Erreur de session");
        }

        console.log("État de la session Supabase:", session ? "Active" : "Inactive");

        // 2. Vérifier aussi avec notre fonction isAuthenticated (double contrôle)
        const auth = await isAuthenticated();
        console.log("État d'authentification global:", auth);

        if (!session && !auth) {
          console.log('Utilisateur non authentifié, redirection vers login');
          navigate(resolvePath('/auth/login'), { replace: true });
          setAuthorized(false);
          setLoading(false);
          return;
        }

        // Si l'utilisateur est authentifié, nettoyer les doublons potentiels
        if (session?.user?.id) {
          await cleanupDuplicateGuestRecords(session.user.id);
        }

        // 4. Vérification des droits administrateur si requis
        if (adminRequired && session?.user?.id) {
          console.log('Vérification des droits admin requis');

          try {
            const { data: isAdmin, error: adminError } = await supabase
              .rpc('is_staff_member', { _user_id: session.user.id });

            if (adminError) {
              console.error('Erreur lors de la vérification admin:', adminError);
              toast({
                variant: "destructive",
                title: "Erreur de vérification",
                description: "Impossible de vérifier les droits d'accès"
              });
              navigate(resolvePath('/'), { replace: true });
              setAuthorized(false);
              setLoading(false);
              return;
            }

            if (!isAdmin) {
              console.log('Utilisateur non-admin, redirection vers la page d\'accueil');
              toast({
                variant: "destructive",
                title: "Accès restreint",
                description: "Vous n'avez pas les droits administrateur nécessaires"
              });
              navigate(resolvePath('/'), { replace: true });
              setAuthorized(false);
              setLoading(false);
              return;
            }

            console.log('Droits admin confirmés - accès autorisé sans localStorage requis');
            // Admin users (created via Edge Function) may not have localStorage data.
            // Since they passed the DB role check, grant access immediately.
            setAuthorized(true);
            initialAuthDone.current = true;
            setLoading(false);
            return;
          } catch (error) {
            console.error("Erreur lors de la vérification des droits admin:", error);
            navigate(resolvePath('/'), { replace: true });
            setAuthorized(false);
            setLoading(false);
            return;
          }
        }

        // 3. Validation des données utilisateur dans localStorage (guests only)
        const userDataString = localStorage.getItem('user_data');
        const userId = localStorage.getItem('user_id');

        if (!userDataString || !userId) {
          console.log('Données utilisateur manquantes, redirection vers login');
          toast({
            variant: "destructive",
            title: "Données de session incomplètes",
            description: "Veuillez vous reconnecter"
          });
          navigate(resolvePath('/auth/login'), { replace: true });
          setAuthorized(false);
          setLoading(false);
          return;
        }

        try {
          // 5. Traiter et synchroniser les données utilisateur
          const userData = JSON.parse(userDataString);

          if (!userId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            // Format UUID incorrect, générer un nouveau
            const newUserId = uuidv4();
            localStorage.setItem('user_id', newUserId);
            console.log("ID utilisateur invalide, nouveau généré:", newUserId);
          }

          // Synchroniser les données utilisateur avec Supabase
          syncUserData(userData).then(success => {
            if (success) {
              console.log("Données utilisateur synchronisées avec succès");
            } else {
              console.warn("Échec de synchronisation des données utilisateur");
            }
          });

          setAuthorized(true);
          initialAuthDone.current = true;
        } catch (parseError) {
          console.error("Erreur d'analyse des données utilisateur:", parseError);
          toast({
            variant: "destructive",
            title: "Erreur de données",
            description: "Format de données incorrect, reconnexion nécessaire"
          });
          navigate(resolvePath('/auth/login'), { replace: true });
          setAuthorized(false);
        }
      } catch (error) {
        handleAuthError("Erreur critique de vérification d'authentification:" + error);
      } finally {
        setLoading(false);
      }
    };

    // Configurer un écouteur pour les changements d'état d'authentification
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Changement d'état d'authentification:", event);

      if (event === 'SIGNED_OUT') {
        console.log("Événement de déconnexion détecté");
        setAuthorized(false);

        // Rediriger vers la page de connexion si on n'y est pas déjà
        if (!isAuthPage()) {
          navigate(resolvePath('/auth/login'), { replace: true });
        }
      } else if (event === 'SIGNED_IN' && session) {
        console.log("Événement de connexion détecté");
        // Nettoyer les doublons potentiels lors de la connexion
        if (session.user) {
          cleanupDuplicateGuestRecords(session.user.id);
        }
        setAuthorized(true);
      }
    });

    checkAuth();

    // Nettoyer l'écouteur
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, toast, location.pathname, adminRequired]);

  return {
    loading,
    authorized,
    isAuthPage
  };
};
