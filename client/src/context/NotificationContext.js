import React, { createContext, useState, useCallback, useEffect } from 'react';

export const NotificationContext = createContext();

let _nextId = 0;
const DURATION = 3500;

const ICON_CONFIGS = {
    success: {
        gradient: 'from-emerald-500 to-emerald-600',
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
        ),
    },
    error: {
        gradient: 'from-red-500 to-red-600',
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
        ),
    },
    warning: {
        gradient: 'from-amber-500 to-amber-600',
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        ),
    },
    info: {
        gradient: 'from-violet-500 to-violet-600',
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
};

const ToastItem = ({ notif, onDismiss }) => {
    const [leaving, setLeaving] = useState(false);

    const handleDismiss = useCallback(() => {
        setLeaving(true);
        setTimeout(() => onDismiss(notif.id), 280);
    }, [notif.id, onDismiss]);

    useEffect(() => {
        const t = setTimeout(handleDismiss, DURATION);
        return () => clearTimeout(t);
    }, [handleDismiss]);

    const cfg = ICON_CONFIGS[notif.type] || ICON_CONFIGS.info;

    return (
        <div
            className={`relative overflow-hidden max-w-sm w-full rounded-2xl text-white
                bg-gradient-to-r ${cfg.gradient}
                shadow-xl shadow-black/25
                transition-all duration-300 ease-in-out
                ${leaving
                    ? 'opacity-0 translate-x-8 scale-95'
                    : 'opacity-100 translate-x-0 scale-100 animate-slideInRight'
                }`}
        >
            <div className="flex items-start gap-3 px-4 pt-3.5 pb-4">
                {/* Icon badge */}
                <span className="shrink-0 mt-0.5 w-7 h-7 flex items-center justify-center rounded-xl bg-white/20">
                    {cfg.icon}
                </span>

                {/* Message */}
                <p className="flex-1 text-sm font-medium leading-relaxed mt-0.5">
                    {notif.message}
                </p>

                {/* Close */}
                <button
                    onClick={handleDismiss}
                    className="shrink-0 mt-0.5 text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                    aria-label="Закрыть"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Progress timer bar */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/20">
                <div
                    className="h-full bg-white/50 rounded-full"
                    style={{ animation: `notifTimer ${DURATION}ms linear forwards` }}
                />
            </div>
        </div>
    );
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const showNotification = useCallback((message, type = 'info') => {
        const id = ++_nextId;
        // Keep at most 3 visible at once
        setNotifications(prev => [...prev.slice(-2), { id, message, type }]);
    }, []);

    const dismiss = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <div
                className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end"
                aria-live="polite"
                aria-label="Уведомления"
            >
                {notifications.map(n => (
                    <ToastItem key={n.id} notif={n} onDismiss={dismiss} />
                ))}
            </div>
        </NotificationContext.Provider>
    );
}; 