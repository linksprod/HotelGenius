import React from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User, UserRound, Languages, Check } from "lucide-react";
import { Link, useNavigate } from 'react-router-dom';
import GuestStatusBadge from './GuestStatusBadge';
import { logoutUser } from '@/features/auth/services/authService';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/features/auth/hooks/useAuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useHotelPath } from '@/hooks/useHotelPath';


const UserMenu = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userData, isAuthenticated } = useAuth();
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const { resolvePath } = useHotelPath();


  const changeLanguage = async (lng: string) => {
    console.log('Attempting to change language to:', lng);
    console.log('Current language before change:', i18n.language);

    try {
      await i18n.changeLanguage(lng);
      localStorage.setItem('language', lng);
      console.log('Language change completed. New language:', i18n.language);
      console.log('Translation test:', t('common.english'), t('common.french'));
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };


  const handleLogout = async () => {
    try {
      console.log("=== DÉBUT PROCESSUS DE DÉCONNEXION ===");

      // 1. Appeler notre fonction de service pour la déconnexion
      const logoutResult = await logoutUser();
      if (!logoutResult.success) {
        throw new Error(logoutResult.error || "Erreur pendant la déconnexion");
      }
      console.log("Service de déconnexion terminé avec succès");

      // 2. Double vérification: Appeler directement l'API Supabase
      const { error: supabaseError } = await supabase.auth.signOut();
      if (supabaseError) {
        console.warn("Avertissement: Erreur secondaire de Supabase:", supabaseError);
        // Continuer malgré l'erreur - on a déjà nettoyé via logoutUser()
      }

      // 3. Nettoyage manuel du localStorage pour être certain
      try {
        console.log("Nettoyage manuel du localStorage");
        localStorage.removeItem('user_data');
        localStorage.removeItem('user_id');
        sessionStorage.clear(); // Aussi nettoyer sessionStorage
      } catch (storageError) {
        console.error("Erreur lors du nettoyage du stockage:", storageError);
        // Continuer malgré l'erreur
      }

      // 4. Notification à l'utilisateur
      toast({
        title: t('auth.logoutSuccess'),
        description: t('auth.logoutSuccessDesc')
      });

      // 5. Forcer une redirection complète (pas seulement via React Router)
      console.log("Redirection vers la page de connexion avec refresh complet");
      setTimeout(() => {
        // Le délai permet à la toast de s'afficher avant le rechargement
        window.location.href = resolvePath('/auth/login');
      }, 300);
    } catch (error) {
      console.error("=== ERREUR CRITIQUE DE DÉCONNEXION ===", error);

      // Notification d'erreur
      toast({
        variant: "destructive",
        title: t('auth.logoutError'),
        description: t('auth.logoutErrorDesc')
      });

      // Tentative de nettoyage d'urgence et redirection forcée
      console.log("Démarrage procédure de nettoyage d'urgence");
      try {
        // Tout nettoyer manuellement
        localStorage.clear();
        sessionStorage.clear();

        // Dernier recours - redirection forcée avec reload
        console.log("Redirection d'urgence");
        setTimeout(() => {
          window.location.href = resolvePath('/auth/login') + '?emergency=true';
        }, 300);
      } catch (e) {
        console.error("Échec critique du nettoyage d'urgence:", e);
        alert("Problème de déconnexion. Veuillez fermer votre navigateur et réessayer.");
        navigate('/auth/login');
      }
    }
  };

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!userData || !userData.first_name) return '?';
    return `${userData.first_name?.charAt(0) || ''}${userData.last_name?.charAt(0) || ''}`;
  };

  // Get user full name
  const getFullName = () => {
    if (!userData) return '';
    return `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
  };

  // Si l'utilisateur n'est pas authentifié, afficher une icône utilisateur au lieu d'un bouton
  if (!isAuthenticated || !userData) {
    return (
      <Button
        variant="ghost"
        onClick={() => navigate(resolvePath('/auth/login'))}
        className="rounded-full p-2 h-9 w-9"
        size="icon"
      >
        <UserRound className="h-5 w-5 text-secondary" />
      </Button>
    );
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar>
            {userData?.profile_image ? (
              <AvatarImage src={userData.profile_image} alt={t('user.profileImage')} />
            ) : (
              <AvatarImage src="/placeholder.svg" />
            )}
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-card border-border">
        <DropdownMenuLabel className="flex flex-col gap-1">
          <span>{getFullName()}</span>
          <GuestStatusBadge />
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link to={resolvePath("/my-room")}>
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>{t('nav.myRoom')}</span>
          </DropdownMenuItem>
        </Link>
        <Link to={resolvePath("/profile")}>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>{t('nav.profile')}</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => changeLanguage('en')}
          className={i18n.language === 'en' ? 'bg-accent' : ''}
        >
          <Languages className="mr-2 h-4 w-4" />
          <span>{t('common.english')}</span>
          {i18n.language === 'en' && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => changeLanguage('fr')}
          className={i18n.language === 'fr' ? 'bg-accent' : ''}
        >
          <Languages className="mr-2 h-4 w-4" />
          <span>{t('common.french')}</span>
          {i18n.language === 'fr' && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('common.logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
