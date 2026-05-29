
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { isCustomDomain } from '@/utils/domain';

interface Hotel {
    id: string;
    name: string;
    slug: string;
    logo_url?: string;
    primary_color?: string;
    secondary_color?: string;
    custom_domain?: string;
    domain_verified?: boolean;
    plan?: string;
    active_modules?: string[];
}

interface HotelContextType {
    hotel: Hotel | null;
    hotelId: string | null;
    isLoading: boolean;
    error: string | null;
    refreshHotel: () => void;
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

export const HotelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [hotel, setHotel] = useState<Hotel | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const lastSlugRef = React.useRef<string | null>(null);
    const [refreshCount, setRefreshCount] = useState(0);

    const refreshHotel = () => {
        lastSlugRef.current = null;
        setRefreshCount(c => c + 1);
    };

    const { slug } = useParams<{ slug?: string }>();
    const location = useLocation();

    useEffect(() => {
        const resolveHotel = async () => {
            const hostname = window.location.hostname;
            const customDomainFlag = isCustomDomain();

            let currentSlug = slug;
            let customDomain: string | undefined;

            if (customDomainFlag) {
                customDomain = hostname;
                // When on custom domain, slug might be empty — use hostname as key
                currentSlug = currentSlug || '_custom_domain_';
            } else {
                if (!currentSlug && location.pathname !== '/') {
                    currentSlug = location.pathname.split('/')[1];
                }
            }

            if (!currentSlug && !customDomain) {
                setHotel(null);
                setIsLoading(false);
                lastSlugRef.current = null;
                return;
            }

            const cacheKey = customDomain || currentSlug;
            if (cacheKey === lastSlugRef.current) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const { data: rows, error: fetchError } = await (supabase as any)
                    .rpc('get_hotel_by_slug', {
                        p_slug: currentSlug || '',
                        p_custom_domain: customDomain || null,
                    });

                if (fetchError) throw fetchError;

                const hotelRows = rows as Hotel[] | null;
                const data = hotelRows && hotelRows.length > 0 ? hotelRows[0] : null;

                if (!data) {
                    setError(`Hotel not found`);
                    setHotel(null);
                } else {
                    setHotel(data);
                    lastSlugRef.current = cacheKey || null;
                }
            } catch (err: any) {
                console.error('Error resolving hotel:', err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        resolveHotel();
    }, [slug, location.pathname, refreshCount]);

    return (
        <HotelContext.Provider value={{ hotel, hotelId: hotel?.id || null, isLoading, error, refreshHotel }}>
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
