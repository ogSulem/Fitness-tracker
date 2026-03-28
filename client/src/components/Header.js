import React, { useContext, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Header = () => {
    const { isAuthenticated, user, logout } = useContext(AuthContext);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        setMobileMenuOpen(false);
        navigate('/login');
    };

    const navLinkClass = ({ isActive }) =>
        `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
            isActive
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`;

    return (
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 shrink-0">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center shadow-sm">
                            <span className="text-white text-base">⚡</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900">FitTrack</span>
                    </Link>

                    {/* Desktop navigation */}
                    {isAuthenticated && (
                        <nav className="hidden md:flex items-center gap-1">
                            <NavLink to="/" end className={navLinkClass}>
                                <span>🏠</span>
                                <span>Главная</span>
                            </NavLink>
                            <NavLink to="/nutrition" className={navLinkClass}>
                                <span>🥗</span>
                                <span>Питание</span>
                            </NavLink>
                            <NavLink to="/analytics" className={navLinkClass}>
                                <span>📊</span>
                                <span>Аналитика</span>
                            </NavLink>
                            <NavLink to="/profile" className={navLinkClass}>
                                <span>👤</span>
                                <span>Профиль</span>
                            </NavLink>
                        </nav>
                    )}

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        {isAuthenticated ? (
                            <>
                                <div className="hidden md:flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-semibold">
                                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Выйти
                                </button>
                                {/* Mobile hamburger */}
                                <button
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
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
                                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-primary-600 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all">
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
                <div className="md:hidden bg-white border-t border-gray-100 shadow-lg animate-fadeIn">
                    <div className="px-4 py-3 space-y-1">
                        <div className="flex items-center gap-2 pb-3 mb-2 border-b border-gray-100">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-semibold">
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <span className="text-sm font-medium text-gray-700">{user?.name}</span>
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
                            className="w-full flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all mt-2"
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
