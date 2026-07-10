
import React, { useEffect, useRef } from 'react';
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

// Public routes that should always be accessible (defined outside component to be stable)
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
  const { loading, authorized } = useAuthGuard(adminRequired);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { resolvePath } = useHotelPath();
  // Guard: only fire the redirect toast once per unauthorized state
  const redirectedRef = useRef(false);

  // Inline helper — NOT a dependency because it uses location.pathname from closure
  const pathname = location.pathname;
  const isOnAuthPage = pathname.includes('/auth/');

  const isPublicRoute = PUBLIC_ROUTES.some(route => {
    const resolved = resolvePath(route);
    return pathname === resolved || pathname.startsWith(resolved + '/');
  });

  useEffect(() => {
    // Reset redirect guard when we become authorized again
    if (authorized) {
      redirectedRef.current = false;
    }

    // Don't do anything on auth pages or public routes
    if (isOnAuthPage || isPublicRoute || publicAccess) return;

    // Super Admin isolation: redirect to platform dashboard
    const isSuperAdminEmail = user?.email === 'projects@hotelgenius.app';
    const isGuestPath = !pathname.includes('/admin') && !pathname.startsWith('/administration') && !pathname.startsWith('/ae');
    if (isSuperAdminEmail && isGuestPath) {
      navigate('/administration/super/dashboard', { replace: true });
      return;
    }

    // Account Executive isolation: redirect to AE dashboard
    const userRole = (user as any)?.user_metadata?.role || (user as any)?.app_metadata?.role;
    const isAEPath = pathname.startsWith('/ae');
    if (!isAEPath && !pathname.includes('/admin') && !pathname.startsWith('/administration')) {
      // We'll let the role check happen in AERoleGuard; this handles post-login redirect only
      // by checking if the user was navigated to a guest route, which AEs shouldn't see
    }

    // Standard unauthorized redirect — only fire once per session
    if (!authorized && !loading && !redirectedRef.current) {
      redirectedRef.current = true;
      toast({
        title: t('auth.authRequired'),
        description: t('auth.authRequiredDesc'),
        variant: 'destructive',
      });
      const loginTarget = adminRequired
        ? resolvePath('/auth/login')
        : resolvePath('/guests/auth/login');
      navigate(loginTarget, { state: { from: pathname } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorized, loading]);

  // Show spinner only during initial load
  if (loading && !authorized) {
    return <LoadingSpinner />;
  }

  // Render children if authorized, on auth page, or on a public route
  if (authorized || isOnAuthPage || isPublicRoute || publicAccess) {
    return <>{children}</>;
  }

  return null;
};

export default AuthGuard;
