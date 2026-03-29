import React, { useContext, useState, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

const Header = () => {
    const { isAuthenticated, user, logout } = useContext(AuthContext);
    const { isDark, toggleTheme } = useContext(ThemeContext);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [iconAnimating, setIconAnimating] = useState(false);
    const navigate = useNavigate();
    const toggleBtnRef = useRef(null);

    const handleLogout = () => {
        logout();
        setMobileMenuOpen(false);
        navigate('/login');
    };

    const handleToggleTheme = (e) => {
        // Spin the icon
        setIconAnimating(true);
        setTimeout(() => setIconAnimating(false), 500);
        // Pass raw event so ThemeContext can read click coordinates
        toggleTheme(e);
    };

    const navLinkClass = ({ isActive }) =>
        `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
            isActive
                ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300'
                : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-slate-200'
        }`;

    return (
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700/60 shadow-sm sticky top-0 z-40 transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 shrink-0 group">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center shadow-sm group-hover:shadow-violet-300 dark:group-hover:shadow-violet-900 group-hover:scale-105 transition-all duration-200">
                            <span className="text-white text-base">⚡</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">FitTrack</span>
                    </Link>

                    {/* Desktop navigation */}
                    {isAuthenticated && (
                        <nav className="hidden md:flex items-center gap-1">
                            <NavLink to="/" end className={navLinkClass}>
                                <span>🏠</span><span>Главная</span>
                            </NavLink>
                            <NavLink to="/nutrition" className={navLinkClass}>
                                <span>🥗</span><span>Питание</span>
                            </NavLink>
                            <NavLink to="/analytics" className={navLinkClass}>
                                <span>📊</span><span>Аналитика</span>
                            </NavLink>
                            <NavLink to="/profile" className={navLinkClass}>
                                <span>👤</span><span>Профиль</span>
                            </NavLink>
                        </nav>
                    )}

                    {/* Right side */}
                    <div className="flex items-center gap-2">
                        {/* Theme toggle */}
                        <button
                            ref={toggleBtnRef}
                            onClick={handleToggleTheme}
                            className="relative p-2 rounded-xl text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-150 overflow-hidden"
                            aria-label="Переключить тему"
                        >
                            {/* Ripple ring on button itself */}
                            <span className={`absolute inset-0 rounded-xl ${iconAnimating ? 'animate-ping bg-violet-400/20' : ''}`} />
                            <span className={`relative block ${iconAnimating ? 'theme-icon-animate' : ''}`}>
                                {isDark ? (
                                    /* Sun */
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.66-9H21m-18 0H3m15.36-5.36l-.7.7M6.34 17.66l-.7.7m12.02 0l-.7-.7M6.34 6.34l-.7-.7M12 6a6 6 0 100 12A6 6 0 0012 6z" />
                                    </svg>
                                ) : (
                                    /* Moon */
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                                    </svg>
                                )}
                            </span>
                        </button>

                        {isAuthenticated ? (
                            <>
                                <div className="hidden md:flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-white text-sm font-semibold ring-2 ring-white dark:ring-slate-800">
                                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{user?.name}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-150"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Выйти
                                </button>
                                <button
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    className="md:hidden p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                                    aria-label="Меню"
                                >
                                    {mobileMenuOpen ? (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                        </svg>
                                    )}
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link to="/login" className="text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-all">
                                    Войти
                                </Link>
                                <Link to="/register" className="btn-primary text-sm py-2 px-4">
                                    Регистрация
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isAuthenticated && mobileMenuOpen && (
                <div className="md:hidden bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-700 shadow-lg animate-fadeIn">
                    <div className="px-4 py-3 space-y-1">
                        <div className="flex items-center gap-2 pb-3 mb-2 border-b border-gray-100 dark:border-slate-700">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-white text-sm font-semibold">
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{user?.name}</span>
                        </div>
                        <NavLink to="/" end className={navLinkClass} onClick={() => setMobileMenuOpen(false)}>
                            <span>🏠</span><span>Главная</span>
                        </NavLink>
                        <NavLink to="/nutrition" className={navLinkClass} onClick={() => setMobileMenuOpen(false)}>
                            <span>🥗</span><span>Питание</span>
                        </NavLink>
                        <NavLink to="/analytics" className={navLinkClass} onClick={() => setMobileMenuOpen(false)}>
                            <span>📊</span><span>Аналитика</span>
                        </NavLink>
                        <NavLink to="/profile" className={navLinkClass} onClick={() => setMobileMenuOpen(false)}>
                            <span>👤</span><span>Профиль</span>
                        </NavLink>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all mt-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Выйти
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
