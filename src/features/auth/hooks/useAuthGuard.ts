
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
  const [loading, setLoading] = useState<boolean>(() => {
    // For admin routes we MUST verify server-side (user_data in localStorage stores
    // guest info, not admin roles). Always start loading to prevent a premature redirect
    // that fires before checkAuth() has time to call is_staff_member().
    if (adminRequired) return true;
    return !localStorage.getItem('user_id');
  });
  const [authorized, setAuthorized] = useState<boolean>(() => {
    // Admin routes: never trust localStorage for authorization — always verify async
    if (adminRequired) return false;
    return !!localStorage.getItem('user_id');
  });
  const loginUrl = adminRequired ? resolvePath('/auth/login') : resolvePath('/guests/auth/login');

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

    navigate(loginUrl, { replace: true });
    setAuthorized(false);
  };

  useEffect(() => {
    // Ne pas vérifier l'authentification sur les pages d'authentification
    // NOTE: Do NOT set authorized=false here — it would wipe the state right after a successful login
    // when the auth page is shown briefly during redirection.
    if (isAuthPage()) {
      console.log("Page d'authentification, pas de vérification nécessaire");
      setLoading(false);
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
          navigate(loginUrl, { replace: true });
          setAuthorized(false);
          setLoading(false);
          return;
        }

        // Si l'utilisateur est authentifié, nettoyer les doublons potentiels
        if (session?.user?.id) {
          await cleanupDuplicateGuestRecords(session.user.id);
        }

        // 4. Vérification des droits administrateur si requis
        const isSuperAdminEmail = session?.user?.email === 'projects@hotelgenius.app';

        if (adminRequired && session?.user?.id) {
          console.log('Vérification des droits admin requis');

          try {
            // Bypass role check for recovery email
            let isAdmin = isSuperAdminEmail;

            if (!isAdmin) {
              const { data: rpcIsAdmin, error: adminError } = await supabase
                .rpc('is_staff_member', { _user_id: session.user.id });

              if (adminError) {
                console.error('Erreur lors de la vérification admin:', adminError);
              }
              isAdmin = !!rpcIsAdmin;
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

            console.log('Droits admin confirmés');
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
        let userDataString = localStorage.getItem('user_data');
        let userId = localStorage.getItem('user_id');

        if (!userDataString || !userId) {
          console.log('Données utilisateur manquantes dans localStorage, tentative de récupération depuis la DB...');
          try {
            const { data: guestData } = await supabase
              .from('guests')
              .select('*')
              .eq('user_id', session.user.id)
              .maybeSingle();

            const userData = guestData ? {
              id: session.user.id,
              email: session.user.email || '',
              first_name: guestData.first_name || session.user.user_metadata?.first_name || 'Utilisateur',
              last_name: guestData.last_name || session.user.user_metadata?.last_name || '',
              room_number: guestData.room_number || '',
              birth_date: guestData.birth_date || undefined,
              check_in_date: guestData.check_in_date || undefined,
              check_out_date: guestData.check_out_date || undefined,
              nationality: guestData.nationality,
              profile_image: guestData.profile_image,
              guest_type: guestData.guest_type || 'Standard Guest',
              hotel_id: guestData.hotel_id || null
            } : {
              id: session.user.id,
              email: session.user.email || '',
              first_name: session.user.user_metadata?.first_name || 'Utilisateur',
              last_name: session.user.user_metadata?.last_name || '',
              room_number: '',
              guest_type: 'Standard Guest',
              hotel_id: null
            };

            localStorage.setItem('user_data', JSON.stringify(userData));
            localStorage.setItem('user_id', session.user.id);
            userDataString = JSON.stringify(userData);
            userId = session.user.id;
            console.log('Données utilisateur restaurées avec succès dans localStorage !');
          } catch (restoreError) {
            console.error('Échec de la restauration des données utilisateur:', restoreError);
            console.log('Redirection vers login');
            toast({
              variant: "destructive",
              title: "Données de session incomplètes",
              description: "Veuillez vous reconnecter"
            });
            navigate(loginUrl, { replace: true });
            setAuthorized(false);
            setLoading(false);
            return;
          }
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
          navigate(loginUrl, { replace: true });
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
          // If we are on /administration or logged in as projects@, go to global login
          const isSuperPath = window.location.pathname.startsWith('/administration');
          const redirectUrl = isSuperPath ? '/login' : loginUrl;
          navigate(redirectUrl, { replace: true });
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
  // IMPORTANT: Do NOT include location.pathname in deps — it causes the effect to re-run on
  // every navigation, which creates an infinite redirect loop (auth check → redirect → auth check...).
  // Auth state is managed reactively via onAuthStateChange. checkAuth() only runs once on mount.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminRequired]);

  return {
    loading,
    authorized,
    isAuthPage
  };
};
