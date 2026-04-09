import { useState, useEffect } from 'react';

/**
 * Thin gradient bar fixed at the very top of the viewport that fills as
 * the user scrolls down the page.  z-index 9999 keeps it above the header.
 */
const ScrollProgress = () => {
    const [width, setWidth] = useState(0);

    useEffect(() => {
        const onScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight =
                document.documentElement.scrollHeight - window.innerHeight;
            setWidth(docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0);
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    if (width === 0) return null;

    return (
        <div
            className="scroll-progress"
            style={{ width: `${width}%` }}
            aria-hidden="true"
        />
    );
};

export default ScrollProgress;
