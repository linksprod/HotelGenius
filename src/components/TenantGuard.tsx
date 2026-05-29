
import React, { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
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

const TenantGuard = ({ children }: TenantGuardProps) => {
    const { hotelId: assignedHotelId, loading: roleLoading, isSuperAdmin, hotelSlug } = useUserRole();
    const { hotelId: contextHotelId } = useCurrentHotelId();
    const { hotel, isLoading: hotelLoading } = useHotel();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const onCustomDomain = isCustomDomain();
    const [loggingOut, setLoggingOut] = useState(false);

    const isStillLoading = roleLoading || hotelLoading;

    // ── Custom domain guard ───────────────────────────────────────────────
    if (onCustomDomain) {
        // Show spinner while loading
        if (isStillLoading || loggingOut) {
            return <LoadingSpinner />;
        }

        // Authenticated user on a custom domain
        if (isAuthenticated) {
            // Super admins can roam freely (you, the platform owner)
            if (isSuperAdmin) {
                return <>{children}</>;
            }

            // User belongs to a hotel, but it's NOT this hotel → force logout
            if (assignedHotelId && hotel?.id && assignedHotelId !== hotel.id) {
                // Trigger async logout — renders spinner until done
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

        // Not authenticated, or correct hotel → render normally
        return <>{children}</>;
    }
    // ─────────────────────────────────────────────────────────────────────

    // ── Standard platform mode (slug-based) ──────────────────────────────
    if (isStillLoading) {
        return <LoadingSpinner />;
    }

    if (!assignedHotelId && !isSuperAdmin) {
        return <>{children}</>;
    }

    if (isSuperAdmin) {
        return <>{children}</>;
    }

    if (assignedHotelId && contextHotelId && assignedHotelId !== contextHotelId) {
        console.warn(`[TenantGuard] Cross-tenant access denied. Redirecting to /${hotelSlug}`);
        return <Navigate to={`/${hotelSlug || assignedHotelId}`} replace />;
    }
    // ─────────────────────────────────────────────────────────────────────

    return <>{children}</>;
};

export default TenantGuard;
