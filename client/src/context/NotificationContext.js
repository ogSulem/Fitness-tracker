import React, { createContext, useState } from 'react';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState(null);

    const showNotification = (message, type = 'info') => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification(null);
        }, 3000);
    };

    return (
        <NotificationContext.Provider value={{ notification, showNotification }}>
            {children}
            {notification && (
                <div className={`fixed bottom-4 right-4 p-4 rounded-2xl shadow-xl max-w-sm z-50 animate-slideUp flex items-start gap-3 ${
                    notification.type === 'success' ? 'bg-emerald-600' :
                    notification.type === 'error'   ? 'bg-red-600'     :
                    'bg-primary-600'
                } text-white`}>
                    <span className="text-lg shrink-0">
                        {notification.type === 'success' ? '✅' : notification.type === 'error' ? '❌' : 'ℹ️'}
                    </span>
                    <p className="flex-1 font-medium text-sm">{notification.message}</p>
                    <button
                        onClick={() => setNotification(null)}
                        className="text-white/70 hover:text-white transition-colors shrink-0"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}
        </NotificationContext.Provider>
    );
}; 