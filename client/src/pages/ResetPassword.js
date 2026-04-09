import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (password !== confirm) {
            setError('Пароли не совпадают.');
            return;
        }
        if (password.length < 6) {
            setError('Пароль должен содержать не менее 6 символов.');
            return;
        }

        setLoading(true);
        try {
            await axios.post(`/api/auth/reset-password/${token}`, { password });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.errors?.[0]?.msg ||
                'Ссылка недействительна или истекла.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-violet-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 px-4">
            <div className="w-full max-w-md animate-slideUp">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 p-8">
                    {/* Logo */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center shadow-lg mb-3">
                            <span className="text-white text-2xl">🔒</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Новый пароль</h1>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 text-center">
                            Придумайте надёжный пароль для вашего аккаунта
                        </p>
                    </div>

                    {/* Success */}
                    {success && (
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-xl text-sm text-emerald-700 dark:text-emerald-300">
                            <div className="flex items-start gap-2">
                                <span className="text-lg">✅</span>
                                <div>
                                    <p className="font-semibold">Пароль успешно изменён!</p>
                                    <p className="text-xs mt-0.5">Перенаправляем на страницу входа…</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl text-sm text-red-600 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    {!success && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* New password */}
                            <div>
                                <label className="label">Новый пароль</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Минимум 6 символов"
                                        className="input pr-10"
                                        required
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {/* Strength bar */}
                                {password && (
                                    <div className="mt-1.5 h-1 rounded-full bg-gray-100 dark:bg-slate-600 overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-300"
                                            style={{
                                                width: password.length >= 12 ? '100%' : password.length >= 8 ? '66%' : '33%',
                                                background: password.length >= 12 ? '#10b981' : password.length >= 8 ? '#f59e0b' : '#ef4444'
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Confirm password */}
                            <div>
                                <label className="label">Подтвердите пароль</label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    placeholder="Повторите пароль"
                                    className={`input ${confirm && confirm !== password ? 'border-red-400 focus:ring-red-400' : ''}`}
                                    required
                                />
                                {confirm && confirm !== password && (
                                    <p className="text-xs text-red-500 mt-1">Пароли не совпадают</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading || (confirm && confirm !== password)}
                                className="btn-primary w-full justify-center py-3 mt-2"
                            >
                                {loading ? (
                                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                ) : 'Сохранить новый пароль'}
                            </button>
                        </form>
                    )}

                    <div className="mt-6 text-center">
                        <Link
                            to="/login"
                            className="text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium transition-colors"
                        >
                            ← Вернуться к входу
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
