
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface Hotel {
    id: string;
    name: string;
    slug: string;
    logo_url?: string;
    primary_color?: string; // may not exist in all DB instances
}

interface HotelContextType {
    hotel: Hotel | null;
    hotelId: string | null;
    isLoading: boolean;
    error: string | null;
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

export const HotelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [hotel, setHotel] = useState<Hotel | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const lastSlugRef = React.useRef<string | null>(null);

    // Try to get slug from URL if we are in a /h/:slug route
    const { slug } = useParams<{ slug?: string }>();
    const location = useLocation();

    useEffect(() => {
        const resolveHotel = async () => {
            let currentSlug = slug;

            // Fallback: extract slug from pathname for cases where useParams might be empty
            if (!currentSlug && location.pathname.startsWith('/h/')) {
                currentSlug = location.pathname.split('/')[2];
            }

            if (!currentSlug) {
                setHotel(null);
                setIsLoading(false);
                lastSlugRef.current = null;
                return;
            }

            // Optimization: avoid re-fetching if slug hasn't changed
            if (currentSlug === lastSlugRef.current) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                // Use RPC (SECURITY DEFINER) to bypass RLS — guarantees guest reads work
                // Cast needed until migration is applied and types regenerated
                const { data: rows, error: fetchError } = await (supabase as any)
                    .rpc('get_hotel_by_slug', { p_slug: currentSlug });

                if (fetchError) throw fetchError;

                const hotelRows = rows as Hotel[] | null;
                const data = hotelRows && hotelRows.length > 0 ? hotelRows[0] : null;

                if (!data) {
                    setError(`Hotel with slug "${currentSlug}" not found`);
                    setHotel(null);
                } else {
                    setHotel(data);
                    lastSlugRef.current = currentSlug;
                }
            } catch (err: any) {
                console.error('Error resolving hotel:', err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }

        };

        resolveHotel();
        // `hotel` intentionally excluded from deps — slug and pathname are sufficient triggers
    }, [slug, location.pathname]);



    return (
        <HotelContext.Provider value={{ hotel, hotelId: hotel?.id || null, isLoading, error }}>
            {children}
        </HotelContext.Provider>
    );
};

export const useHotel = () => {
    const context = useContext(HotelContext);
    if (context === undefined) {
        throw new Error('useHotel must be used within a HotelProvider');
    }
    return context;
};
