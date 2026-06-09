
import React, { useEffect } from 'react';
import { useAuthGuard } from '@/features/auth/hooks/useAuthGuard';
import LoadingSpinner from './auth/LoadingSpinner';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { useHotelPath } from '@/hooks/useHotelPath';
import { useAuth } from '@/features/auth/hooks/useAuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  adminRequired?: boolean;
  publicAccess?: boolean;
}

// Public routes that should always be accessible
const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/contact',
  '/destination',
  '/map',
  '/feedback',
];

const AuthGuard = ({
  children,
  adminRequired = false,
  publicAccess = false
}: AuthGuardProps) => {
  const { loading, authorized, isAuthPage } = useAuthGuard(adminRequired);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { resolvePath } = useHotelPath();

  useEffect(() => {
    // Check if the current route is a public route
    const isPublicRoute = PUBLIC_ROUTES.some(route => {
      const resolved = resolvePath(route);
      return location.pathname === resolved || location.pathname.startsWith(resolved + '/');
    });

    // If it's a public route or explicitly marked for public access, allow access
    if (isPublicRoute || publicAccess || isAuthPage()) {
      return;
    }

    // 1. Super Admin Redirection (Isolation)
    const isSuperAdminEmail = user?.email === 'projects@hotelgenius.app';
    const isGuestPath = !location.pathname.includes('/admin') && !location.pathname.startsWith('/administration');
    
    if (isSuperAdminEmail && isGuestPath && !isAuthPage() && !isPublicRoute) {
      console.log('Super Admin detected on guest route, redirecting to platform dashboard');
      navigate('/administration/super/dashboard', { replace: true });
      return;
    }

    // 2. Standard Auth Check
    if (!isAuthPage() && !authorized && !loading) {
      console.log(t('auth.loginRedirectMessage'), location.pathname);

      toast({
        title: t('auth.authRequired'),
        description: t('auth.authRequiredDesc'),
        variant: "destructive"
      });

      // Rediriger vers la page de connexion
      const loginTarget = adminRequired ? resolvePath('/auth/login') : resolvePath('/guests/auth/login');
      navigate(loginTarget, { state: { from: location.pathname } });
    }
  }, [authorized, isAuthPage, loading, navigate, toast, location, PUBLIC_ROUTES, publicAccess]);

  // Only show full-page spinner on initial load, not during navigation when already authorized
  if (loading && !authorized) {
    return <LoadingSpinner />;
  }

  // Allow access if authorized or on auth page or public route
  return (isAuthPage() || authorized || PUBLIC_ROUTES.some(route => {
    const resolved = resolvePath(route);
    return location.pathname === resolved || location.pathname.startsWith(resolved + '/');
  }) ||
    publicAccess) ? <>{children}</> : null;
};

export default AuthGuard;
