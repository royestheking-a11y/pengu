/**
 * Central configuration for the application
 */
export const SITE_URL = typeof window !== 'undefined'
    ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5173'
        : (window.location.hostname.endsWith('pengui.tech')
            ? `https://${window.location.hostname}`
            : 'https://pengui.tech'))
    : 'https://pengui.tech';

export const FALLBACK_URL = 'https://pengufix.vercel.app';

export const getSiteUrl = () => {
    // If we're on a Vercel URL that isn't the primary, we might want to return that
    if (typeof window !== 'undefined' && window.location.hostname.endsWith('vercel.app')) {
        return `https://${window.location.hostname}`;
    }
    return SITE_URL;
};
