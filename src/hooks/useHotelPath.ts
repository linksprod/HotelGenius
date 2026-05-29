import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useHotel } from '@/features/hotels/context/HotelContext';
import { isCustomDomain } from '@/utils/domain';

/**
 * Hook to resolve internal paths dynamically based on the current hotel context.
 * If a hotel is present, it prefixes the path with /h/:slug, unless on a custom domain.
 */
export const useHotelPath = () => {
    const { hotel } = useHotel();
    const location = useLocation();

    const resolvePath = useCallback((path: string) => {
        // If the path is already absolute or doesn't start with /, return it as is
        if (!path.startsWith('/')) return path;

        // Fallback: try to extract slug from current path if hotel context isn't ready
        let slug = hotel?.slug;
        if (!slug && location.pathname !== '/') {
            const pathSlug = location.pathname.split('/')[1];
            // Reserved global routes should not be treated as hotel slugs
            const reservedSlugs = ['administration', 'demo', 'login', 'auth'];
            if (!reservedSlugs.includes(pathSlug)) {
                slug = pathSlug;
            }
        }

        // If we have a slug and we are NOT on a custom domain, prefix the path
        if (slug && !isCustomDomain()) {
            // Avoid double prefixing
            if (path.startsWith(`/${slug}`)) return path;

            // Avoid double slashes if path is '/'
            const cleanPath = path === '/' ? '' : path;
            return `/${slug}${cleanPath}`;
        }

        // Default to absolute path (this naturally handles Custom Domains too!)
        return path;
    }, [hotel?.slug, location.pathname]);

    return { resolvePath };
};
