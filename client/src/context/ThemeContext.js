import React, { createContext, useState, useEffect } from 'react';
import { flushSync } from 'react-dom';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('theme');
        if (saved) return saved === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    const toggleTheme = (event) => {
        // Coordinates of click (or centre-of-screen as fallback)
        const x = event?.clientX ?? window.innerWidth / 2;
        const y = event?.clientY ?? window.innerHeight / 2;

        // Fallback for browsers that don't support View Transitions API
        if (!document.startViewTransition) {
            setIsDark(prev => !prev);
            return;
        }

        // Pass ripple origin to CSS via custom properties
        document.documentElement.style.setProperty('--ripple-x', `${x}px`);
        document.documentElement.style.setProperty('--ripple-y', `${y}px`);

        // Kick off the view transition
        document.startViewTransition(() => {
            // flushSync makes React apply the state update *synchronously*
            // so the DOM change happens inside the transition callback
            flushSync(() => setIsDark(prev => !prev));
        });
    };

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
