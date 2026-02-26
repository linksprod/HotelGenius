
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { useCurrentHotelId } from '@/hooks/useCurrentHotelId';
import LoadingSpinner from './auth/LoadingSpinner';

interface TenantGuardProps {
    children: React.ReactNode;
}

/**
 * Guard to ensure that a logged-in user (guest or staff)
 * is only accessing the hotel they are associated with.
 * Super admins are exempt from this check.
 */
const TenantGuard = ({ children }: TenantGuardProps) => {
    const { hotelId: assignedHotelId, loading, isSuperAdmin, hotelSlug, role } = useUserRole();
    const { hotelId: contextHotelId } = useCurrentHotelId();
    const location = useLocation();

    if (loading) {
        return <LoadingSpinner />;
    }

    // If user is not logged in, we let AuthGuard handle it or allow public if it passed AuthGuard
    if (!assignedHotelId && !isSuperAdmin) {
        return <>{children}</>;
    }

    // Super admins can access any hotel
    if (isSuperAdmin) {
        return <>{children}</>;
    }

    // If the user's assigned hotel doesn't match the current context hotel
    if (assignedHotelId && contextHotelId && assignedHotelId !== contextHotelId) {
        console.warn(`[TenantGuard] Cross-tenant access denied. User assigned to ${assignedHotelId}, trying to access ${contextHotelId}`);

        // Redirect to their own hotel's home page
        const redirectSlug = hotelSlug || assignedHotelId;
        return <Navigate to={`/${redirectSlug}`} replace />;
    }

    return <>{children}</>;
};

export default TenantGuard;
