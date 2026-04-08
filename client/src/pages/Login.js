import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useContext(AuthContext);
    const { t } = useLang();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(formData);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || t('error_generic'));
        } finally {
            setLoading(false);
        }
    };

    const features = [
        { icon: '🏋️', labelKey: 'login_features_workouts' },
        { icon: '🥗',  labelKey: 'login_features_nutrition' },
        { icon: '📈',  labelKey: 'login_features_progress'  },
    ];

    return (
        <div className="min-h-screen flex bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
            {/* Left decorative panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-600 via-violet-700 to-violet-900 flex-col items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
                </div>
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 text-9xl">💪</div>
                    <div className="absolute bottom-20 right-10 text-8xl">🏃</div>
                    <div className="absolute top-1/2 left-1/4 text-7xl">🥗</div>
                    <div className="absolute top-1/4 right-1/4 text-6xl">📊</div>
                    <div className="absolute bottom-10 left-20 text-5xl">🎯</div>
                </div>
                <div className="relative z-10 text-center text-white">
                    <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6 shadow-xl">
                        <span className="text-4xl">⚡</span>
                    </div>
                    <h1 className="text-5xl font-bold mb-4 tracking-tight">FitTrack</h1>
                    <p className="text-violet-200 text-lg max-w-xs leading-relaxed">
                        {t('login_slogan')}
                    </p>
                    <div className="mt-12 grid grid-cols-3 gap-4 text-center">
                        {features.map(item => (
                            <div key={item.labelKey} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 hover:bg-white/15 transition-all">
                                <div className="text-3xl mb-2">{item.icon}</div>
                                <div className="text-xs text-violet-200 font-medium">{t(item.labelKey)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right form panel */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-slate-800 transition-colors duration-300">
                <div className="w-full max-w-md animate-slideUp">
                    <div className="flex items-center gap-2 mb-8 lg:hidden">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center">
                            <span className="text-white text-sm">⚡</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">FitTrack</span>
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('login_title')}</h2>
                    <p className="text-gray-400 dark:text-slate-500 mb-8">{t('login_subtitle')}</p>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-6 flex items-center gap-2 text-sm">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="label">{t('login_email')}</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="input"
                                placeholder="example@mail.ru"
                                required
                            />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label htmlFor="password" className="label mb-0">{t('login_password')}</label>
                                <Link
                                    to="/forgot-password"
                                    className="text-xs text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium transition-colors"
                                >
                                    {t('login_forgot')}
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="input pr-12"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? t('login_hide_pass') : t('login_show_pass')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full justify-center"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    {t('login_loading')}
                                </span>
                            ) : `${t('login_submit')} →`}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-500 dark:text-slate-500">
                        {t('login_no_account')}{' '}
                        <Link to="/register" className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-semibold">
                            {t('login_signup')}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
