import { useState, useEffect, useRef } from 'react';

/**
 * Animates a number from 0 → `target` using requestAnimationFrame.
 *
 * @param {number} target    - Final value to count up to.
 * @param {number} duration  - Animation duration in ms (default 900).
 * @param {boolean} enabled  - Set false to skip animation and return target immediately.
 * @returns {number} Current animated value.
 */
const useCountUp = (target, duration = 900, enabled = true) => {
    const [count, setCount] = useState(0);
    const rafRef = useRef(null);
    const prevTarget = useRef(0);

    useEffect(() => {
        if (!enabled) {
            setCount(target);
            return;
        }

        // If target didn't change, nothing to do
        if (target === prevTarget.current) return;
        prevTarget.current = target;

        if (target === 0) {
            setCount(0);
            return;
        }

        const startTime = performance.now();
        const startValue = 0;

        const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(startValue + (target - startValue) * eased));
            if (progress < 1) {
                rafRef.current = requestAnimationFrame(animate);
            }
        };

        rafRef.current = requestAnimationFrame(animate);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [target, duration, enabled]);

    return count;
};

export default useCountUp;
