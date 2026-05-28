export const isCustomDomain = () => {
    // During SSR or build time, window might be undefined
    if (typeof window === 'undefined') return false;
    
    const hostname = window.location.hostname;
    
    return (
        hostname !== 'localhost' &&
        hostname !== '127.0.0.1' &&
        !hostname.includes('hotelgenius') &&
        !hostname.includes('vercel.app') &&
        !hostname.includes('netlify.app')
    );
};
