
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { useCurrentHotelId } from '@/hooks/useCurrentHotelId';
import { useHotel } from '@/features/hotels/context/HotelContext';
import { isCustomDomain } from '@/utils/domain';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/features/auth/hooks/useAuthContext';
import LoadingSpinner from './auth/LoadingSpinner';

function getLevenshteinDistance(a: string, b: string): number {
    const tmp = [];
    let i, j;
    for (i = 0; i <= a.length; i++) {
        tmp.push([i]);
    }
    for (j = 1; j <= b.length; j++) {
        tmp[0].push(j);
    }
    for (i = 1; i <= a.length; i++) {
        for (j = 1; j <= b.length; j++) {
            tmp[i][j] = Math.min(
                tmp[i - 1][j] + 1,
                tmp[i][j - 1] + 1,
                tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
            );
        }
    }
    return tmp[a.length][b.length];
}

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
    const [suggestion, setSuggestion] = useState<{ name: string; slug: string } | null>(null);

    useEffect(() => {
        if (!hotel && !hotelLoading) {
            const currentSlug = location.pathname.split('/')[1];
            if (currentSlug && !['login', 'auth', 'administration', 'demo'].includes(currentSlug)) {
                supabase
                    .from('hotels')
                    .select('name, slug')
                    .then(({ data }) => {
                        if (data && data.length > 0) {
                            let bestMatch = null;
                            let minDistance = Infinity;

                            for (const h of data) {
                                const dist = getLevenshteinDistance(currentSlug.toLowerCase(), h.slug.toLowerCase());
                                const isSubstring = h.slug.toLowerCase().includes(currentSlug.toLowerCase()) || 
                                                    currentSlug.toLowerCase().includes(h.slug.toLowerCase());
                                
                                if (dist < minDistance && (dist <= 4 || isSubstring)) {
                                    minDistance = dist;
                                    bestMatch = h;
                                }
                            }
                            setSuggestion(bestMatch);
                        }
                    });
            }
        }
    }, [hotel, hotelLoading, location.pathname]);

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

    // Check if the hotel exists
    if (!hotel) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <div className="text-center p-8 bg-card rounded-lg shadow-sm border border-border max-w-md w-full">
                    <h1 className="text-3xl font-bold mb-2 text-foreground">Hôtel Non Trouvé</h1>
                    <h2 className="text-lg font-medium mb-4 text-muted-foreground">Hotel Not Found</h2>
                    <p className="text-muted-foreground mb-6 text-sm">
                        L'hôtel auquel vous tentez d'accéder n'existe pas ou a été désactivé. Veuillez vérifier l'adresse saisie.
                        <br /><br />
                        The hotel you are trying to access does not exist or has been disabled. Please check the entered address.
                    </p>
                    {suggestion && (
                        <div className="mt-2 mb-6 p-4 bg-primary/10 border border-primary/25 rounded-md text-left">
                            <p className="text-xs font-semibold text-primary mb-1.5 uppercase tracking-wider">💡 Vouliez-vous dire / Did you mean :</p>
                            <button
                                onClick={() => window.location.href = `/${suggestion.slug}/guests/auth/login`}
                                className="text-primary hover:underline font-bold text-base block text-left"
                            >
                                {suggestion.name}
                            </button>
                        </div>
                    )}
                    <button 
                        onClick={() => window.location.href = '/login'} 
                        className="w-full px-6 py-2.5 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity font-medium text-sm"
                    >
                        Retour à la page de connexion / Go to Login
                    </button>
                </div>
            </div>
        );
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

    if (assignedHotelId && assignedHotelId !== contextHotelId) {
        console.warn(`[TenantGuard] Cross-tenant access denied or invalid hotel. Redirecting to /${hotelSlug}`);
        const isStaffOrAdmin = role === 'admin' || role === 'hotel_admin' || role === 'staff' || role === 'moderator';
        const targetPath = isStaffOrAdmin 
            ? `/${hotelSlug || assignedHotelId}/admin` 
            : `/${hotelSlug || assignedHotelId}`;
            
        return <Navigate to={targetPath} replace />;
    }
    // ─────────────────────────────────────────────────────────────────────────

    return <>{children}</>;
};

export default TenantGuard;
