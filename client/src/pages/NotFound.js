import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center py-24 px-4 animate-fadeIn">
            <div className="text-8xl mb-4">🏋️</div>
            <h1 className="text-7xl font-bold text-primary-600 mb-4">404</h1>
            <p className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Страница не найдена</p>
            <p className="text-gray-400 dark:text-slate-400 mb-8 text-center max-w-md">
                Страница, которую вы ищете, не существует или была перемещена.
            </p>
            <Link to="/" className="btn-primary">
                ← Вернуться на главную
            </Link>
        </div>
    );
};

export default NotFound;
