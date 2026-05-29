
import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { useCurrentHotelId } from '@/hooks/useCurrentHotelId';
import { useHotel } from '@/features/hotels/context/HotelContext';
import { isCustomDomain } from '@/utils/domain';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/features/auth/hooks/useAuthContext';
import LoadingSpinner from './auth/LoadingSpinner';

interface TenantGuardProps {
    children: React.ReactNode;
}

/**
 * SECURITY RULES
 * 1. Admin/staff email addresses have ZERO access to the guest app — on any domain.
 *    They are hard-redirected to the admin panel at all times.
 * 2. On custom domains: users belonging to a different hotel are force-logged out.
 * 3. On the standard platform: cross-hotel access is blocked.
 */
const TenantGuard = ({ children }: TenantGuardProps) => {
    const { hotelId: assignedHotelId, loading: roleLoading, isSuperAdmin, isAdmin, hotelSlug, role } = useUserRole();
    const { hotelId: contextHotelId } = useCurrentHotelId();
    const { hotel, isLoading: hotelLoading } = useHotel();
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    const onCustomDomain = isCustomDomain();
    const [loggingOut, setLoggingOut] = useState(false);

    const isStillLoading = roleLoading || hotelLoading;
    const isOnAdminRoute = location.pathname.includes('/admin');
    const isOnAuthRoute = location.pathname.includes('/auth/');

    // ── Global Rule: Admin/staff accounts can NEVER access the guest app ──────
    // This runs on ALL domains — custom or standard.
    // Admins are allowed on /admin/* and /auth/* routes only.
    if (!isStillLoading && isAuthenticated && !isSuperAdmin && !loggingOut) {
        const isStaffOrAdmin = role === 'admin' || role === 'hotel_admin' || role === 'staff' || role === 'moderator';

        if (isStaffOrAdmin && !isOnAdminRoute && !isOnAuthRoute) {
            // Admin is browsing the guest app — hard-redirect to their admin panel
            console.warn(`[TenantGuard] Staff account (${role}) attempted to access guest app. Redirecting to admin.`);

            if (onCustomDomain) {
                // On custom domains, admins are completely blocked — sign them out
                if (!loggingOut) {
                    setLoggingOut(true);
                    supabase.auth.signOut().then(() => {
                        localStorage.clear();
                        sessionStorage.clear();
                        window.location.replace('/auth/login');
                    });
                }
                return <LoadingSpinner />;
            }

            // On standard platform, redirect to their hotel admin panel
            const slug = hotelSlug || assignedHotelId;
            return <Navigate to={slug ? `/${slug}/admin` : '/auth/login'} replace />;
        }
    }
    // ─────────────────────────────────────────────────────────────────────────

    // Show spinner while data loads
    if (isStillLoading || loggingOut) {
        return <LoadingSpinner />;
    }

    // ── Custom domain guard ───────────────────────────────────────────────────
    if (onCustomDomain) {
        if (isAuthenticated && !isSuperAdmin) {
            // User belongs to a DIFFERENT hotel → force logout
            if (assignedHotelId && hotel?.id && assignedHotelId !== hotel.id) {
                if (!loggingOut) {
                    setLoggingOut(true);
                    supabase.auth.signOut().then(() => {
                        localStorage.clear();
                        sessionStorage.clear();
                        window.location.replace('/auth/login');
                    });
                }
                return <LoadingSpinner />;
            }
        }
        return <>{children}</>;
    }
    // ─────────────────────────────────────────────────────────────────────────

    // ── Standard platform: cross-hotel guard ─────────────────────────────────
    if (!assignedHotelId || isSuperAdmin) {
        return <>{children}</>;
    }

    if (assignedHotelId && contextHotelId && assignedHotelId !== contextHotelId) {
        console.warn(`[TenantGuard] Cross-tenant access denied. Redirecting to /${hotelSlug}`);
        return <Navigate to={`/${hotelSlug || assignedHotelId}`} replace />;
    }
    // ─────────────────────────────────────────────────────────────────────────

    return <>{children}</>;
};

export default TenantGuard;
