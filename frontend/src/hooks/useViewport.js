import { useState, useEffect, useCallback } from 'react';

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

/**
 * Returns `{ isMobile, isTablet }` and updates on window resize.
 * isMobile  — viewport width < 768 px
 * isTablet  — viewport width in [768, 1024)
 */
export default function useViewport() {
    const [viewport, setViewport] = useState({ isMobile: false, isTablet: false });

    const measure = useCallback(() => {
        const w = window.innerWidth;
        setViewport({
            isMobile: w < MOBILE_BREAKPOINT,
            isTablet: w >= MOBILE_BREAKPOINT && w < TABLET_BREAKPOINT,
        });
    }, []);

    useEffect(() => {
        measure();
        window.addEventListener('resize', measure, { passive: true });
        return () => window.removeEventListener('resize', measure);
    }, [measure]);

    return viewport;
}
