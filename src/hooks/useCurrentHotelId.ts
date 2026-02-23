
import { useHotel } from '@/features/hotels/context/HotelContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useLocation } from 'react-router-dom';

/**
 * A unified hook to get the current hotel ID regardless of whether
 * the user is in a guest route (/h/:slug) or an admin route (/admin/*).
 */
export const useCurrentHotelId = () => {
    const { hotelId: guestHotelId } = useHotel();
    const { hotelId: adminHotelId, role, isSuperAdmin } = useUserRole();
    const location = useLocation();

    const isAdminRoute = location.pathname.includes('/admin');

    // For admin routes (e.g. /h/fiesta/admin/spa), we prefer the hotelId from the URL slug
    // because it ensures consistency with what the user is currently viewing.
    // If that's not available (e.g. /admin/* global routes), we fall back to the admin's assigned hotelId.
    const effectiveHotelId = guestHotelId || adminHotelId;

    if (isAdminRoute) {
        return { hotelId: effectiveHotelId, isSuperAdmin };
    }

    // Otherwise, use the hotelId from the URL slug (Guest Context)
    return { hotelId: effectiveHotelId, isSuperAdmin: false };
};
