
import { useEffect } from 'react';
import { useHotel } from '@/features/hotels/context/HotelContext';

/**
 * Utility to convert Hex color to HSL components
 */
const hexToHslComponents = (hex: string): { h: number; s: number; l: number } => {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
};

const ThemeCustomizer = () => {
    const { hotel } = useHotel();

    useEffect(() => {
        if (!hotel) return;

        const root = document.documentElement;

        // Define default colors if not provided or if too dark/generic
        const primaryHex = hotel.primary_color || '#94b3a3';
        let secondaryHex = hotel.secondary_color || '#8b5cf6';
        
        // If secondary color is black/near-black, fallback to a matching theme color
        if (secondaryHex === '#000000' || secondaryHex === '#1a1a1a' || secondaryHex === '#111111') {
            const p = hexToHslComponents(primaryHex);
            if (p.l > 30) {
                secondaryHex = primaryHex;
            } else {
                secondaryHex = '#C5A059'; // premium gold
            }
        }

        try {
            const p = hexToHslComponents(primaryHex);
            const s = hexToHslComponents(secondaryHex);

            // Determine if dark mode is active
            const isDark = root.classList.contains('dark') || 
                           document.body.classList.contains('dark') ||
                           localStorage.getItem('theme') === 'dark';

            // Enhance secondary color visibility depending on contrast needs
            let adjustedL = s.l;
            if (isDark) {
                // In dark mode, ensure secondary color is vibrant and has at least 50% lightness so it glows
                if (s.l < 45) {
                    adjustedL = 55;
                }
            } else {
                // In light mode, ensure secondary color is not too washed out on light backgrounds
                if (s.l > 80) {
                    adjustedL = 60;
                } else if (s.l < 15) {
                    adjustedL = 25; // don't let it become pure black
                }
            }

            const primaryHsl = `${p.h} ${p.s}% ${p.l}%`;
            const secondaryHsl = `${s.h} ${s.s}% ${adjustedL}%`;

            // Calculate readable foregrounds
            const primaryFg = p.l > 65 ? '220 40% 2%' : '0 0% 100%';
            // Use dark text for warm colors (gold/yellow/orange) if lightness is above 45% to ensure readable contrast
            const secondaryFg = (adjustedL > 45 && s.h >= 30 && s.h <= 75) || adjustedL > 65 
                ? '220 40% 2%' 
                : '0 0% 100%';

            // Apply variables
            root.style.setProperty('--primary', primaryHsl);
            root.style.setProperty('--ring', primaryHsl);
            root.style.setProperty('--sidebar-primary', primaryHsl);
            root.style.setProperty('--primary-foreground', primaryFg);

            root.style.setProperty('--secondary', secondaryHsl);
            root.style.setProperty('--secondary-foreground', secondaryFg);

            // Map accent variables to secondary colors for beautiful highlights
            root.style.setProperty('--accent', secondaryHsl);
            root.style.setProperty('--accent-foreground', secondaryFg);

            // Subtle sidebar rail active indicator highlight
            root.style.setProperty('--sidebar-accent', `${s.h} ${s.s}% ${isDark ? '15%' : '93%'}`);
            root.style.setProperty('--sidebar-accent-foreground', `${s.h} ${s.s}% ${isDark ? '90%' : '20%'}`);

        } catch (error) {
            console.error('Error applying theme colors:', error);
        }
    }, [hotel]);

    return null;
};

export default ThemeCustomizer;
