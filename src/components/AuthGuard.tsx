
import React, { useEffect } from 'react';
import { useAuthGuard } from '@/features/auth/hooks/useAuthGuard';
import LoadingSpinner from './auth/LoadingSpinner';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { useHotelPath } from '@/hooks/useHotelPath';

interface AuthGuardProps {
  children: React.ReactNode;
  adminRequired?: boolean;
  publicAccess?: boolean;
}

const AuthGuard = ({
  children,
  adminRequired = false,
  publicAccess = false
}: AuthGuardProps) => {
  const { loading, authorized, isAuthPage } = useAuthGuard(adminRequired);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { resolvePath } = useHotelPath();

  // Public routes that should always be accessible
  const publicRoutes = [
    '/',
    '/about',
    '/contact',
    '/destination',
    '/rooms',
    '/dining',
    '/spa',
    '/activities',
    '/events',
    '/services',
    '/map',
    '/shops',
    '/feedback',
    '/messages',
    '/notifications'
  ];

  useEffect(() => {
    // Check if the current route is a public route
    const isPublicRoute = publicRoutes.some(route => {
      const resolved = resolvePath(route);
      return location.pathname === resolved || location.pathname.startsWith(resolved === '/' ? '/h/' : resolved + '/');
    });

    // If it's a public route or explicitly marked for public access, allow access
    if (isPublicRoute || publicAccess || isAuthPage()) {
      return;
    }

    // If not authorized and not on an auth page
    if (!isAuthPage() && !authorized && !loading) {
      console.log(t('auth.loginRedirectMessage'), location.pathname);

      toast({
        title: t('auth.authRequired'),
        description: t('auth.authRequiredDesc'),
        variant: "destructive"
      });

      // Rediriger vers la page de connexion
      navigate(resolvePath('/auth/login'), { state: { from: location.pathname } });
    }
  }, [authorized, isAuthPage, loading, navigate, toast, location, publicRoutes, publicAccess]);

  // Only show full-page spinner on initial load, not during navigation when already authorized
  if (loading && !authorized) {
    return <LoadingSpinner />;
  }

  // Allow access if authorized or on auth page or public route
  return (isAuthPage() || authorized || publicRoutes.some(route => {
    const resolved = resolvePath(route);
    return location.pathname === resolved || location.pathname.startsWith(resolved === '/' ? '/h/' : resolved + '/');
  }) ||
    publicAccess) ? <>{children}</> : null;
};

export default AuthGuard;
