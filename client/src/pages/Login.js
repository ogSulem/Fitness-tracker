import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useContext(AuthContext);
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
            setError(err.response?.data?.message || 'Ошибка при входе. Проверьте данные.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left decorative panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex-col items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 text-9xl">💪</div>
                    <div className="absolute bottom-20 right-10 text-8xl">🏃</div>
                    <div className="absolute top-1/2 left-1/4 text-7xl">🥗</div>
                    <div className="absolute top-1/4 right-1/4 text-6xl">📊</div>
                    <div className="absolute bottom-10 left-20 text-5xl">🎯</div>
                </div>
                <div className="relative z-10 text-center text-white">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-6">
                        <span className="text-3xl">⚡</span>
                    </div>
                    <h1 className="text-4xl font-bold mb-4">FitTrack</h1>
                    <p className="text-primary-200 text-lg max-w-xs leading-relaxed">
                        Твой персональный помощник в достижении фитнес-целей
                    </p>
                    <div className="mt-10 grid grid-cols-3 gap-4 text-center">
                        {[
                            { icon: '🏋️', label: 'Тренировки' },
                            { icon: '🥗', label: 'Питание' },
                            { icon: '📈', label: 'Прогресс' }
                        ].map(item => (
                            <div key={item.label} className="bg-white/10 backdrop-blur rounded-xl p-3">
                                <div className="text-2xl mb-1">{item.icon}</div>
                                <div className="text-xs text-primary-200">{item.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right form panel */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md animate-slideUp">
                    <div className="flex items-center gap-2 mb-8 lg:hidden">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
                            <span className="text-white text-sm">⚡</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900">FitTrack</span>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Добро пожаловать!</h2>
                    <p className="text-gray-400 mb-8">Войдите в свой аккаунт, чтобы продолжить</p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2 text-sm">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="label">Email</label>
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
                            <label htmlFor="password" className="label">Пароль</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="input"
                                placeholder="Введите пароль"
                                required
                            />
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
                                    Вход...
                                </span>
                            ) : 'Войти'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-500">
                        Нет аккаунта?{' '}
                        <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
                            Зарегистрироваться
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login; 