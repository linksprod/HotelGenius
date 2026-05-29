
import React, { useEffect, useRef } from 'react';
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

/**
 * Guard to ensure that a logged-in user (guest or staff)
 * is only accessing the hotel they are associated with.
 * Super admins are exempt from this check.
 *
 * On custom domains: if the logged-in user belongs to a DIFFERENT hotel,
 * they are force-logged out and redirected to the login page.
 */
const TenantGuard = ({ children }: TenantGuardProps) => {
    const { hotelId: assignedHotelId, loading: roleLoading, isSuperAdmin, hotelSlug } = useUserRole();
    const { hotelId: contextHotelId } = useCurrentHotelId();
    const { hotel, isLoading: hotelLoading } = useHotel();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const hasLoggedOut = useRef(false);

    const onCustomDomain = isCustomDomain();

    useEffect(() => {
        // Only run this check on custom domains for authenticated users
        if (!onCustomDomain || !isAuthenticated || roleLoading || hotelLoading || isSuperAdmin) return;

        // Wait until both pieces of data are available
        if (!hotel?.id || assignedHotelId === undefined) return;

        // If user is logged in but belongs to a DIFFERENT hotel → force logout
        if (assignedHotelId && assignedHotelId !== hotel.id && !hasLoggedOut.current) {
            hasLoggedOut.current = true;
            console.warn(`[TenantGuard] Custom domain mismatch: user assigned to ${assignedHotelId}, domain hotel is ${hotel.id}. Forcing logout.`);
            supabase.auth.signOut().then(() => {
                localStorage.clear();
                sessionStorage.clear();
                navigate('/auth/login', { replace: true });
            });
        }
    }, [onCustomDomain, isAuthenticated, roleLoading, hotelLoading, isSuperAdmin, hotel?.id, assignedHotelId, navigate]);

    if (roleLoading || hotelLoading) {
        return <LoadingSpinner />;
    }

    // Standard platform mode: slug-based cross-hotel check
    if (!onCustomDomain) {
        if (!assignedHotelId && !isSuperAdmin) {
            return <>{children}</>;
        }
        if (isSuperAdmin) {
            return <>{children}</>;
        }
        if (assignedHotelId && contextHotelId && assignedHotelId !== contextHotelId) {
            console.warn(`[TenantGuard] Cross-tenant access denied. User assigned to ${assignedHotelId}, trying to access ${contextHotelId}`);
            const redirectSlug = hotelSlug || assignedHotelId;
            return <Navigate to={`/${redirectSlug}`} replace />;
        }
    }

    return <>{children}</>;
};

export default TenantGuard;
