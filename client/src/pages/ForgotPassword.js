import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    // Dev helper — reset link returned by the backend in non-production mode
    const [devLink, setDevLink] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);
        setDevLink(null);

        try {
            const res = await axios.post('/api/auth/forgot-password', { email });
            setMessage(res.data.message);
            if (res.data.resetLink) {
                setDevLink(res.data.resetLink);
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.errors?.[0]?.msg ||
                'Произошла ошибка. Попробуйте ещё раз.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-violet-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 px-4">
            <div className="w-full max-w-md animate-slideUp">
                {/* Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 p-8">
                    {/* Logo */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center shadow-lg mb-3">
                            <span className="text-white text-2xl">🔑</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Восстановление пароля</h1>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 text-center">
                            Укажите email — пришлём ссылку для сброса
                        </p>
                    </div>

                    {/* Success state */}
                    {message && (
                        <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-xl text-sm text-emerald-700 dark:text-emerald-300">
                            <div className="flex items-start gap-2">
                                <span className="text-lg">✅</span>
                                <span>{message}</span>
                            </div>
                            {devLink && (
                                <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg">
                                    <p className="text-xs text-amber-700 dark:text-amber-300 font-semibold mb-1">
                                        🛠 Dev-режим — ссылка для сброса:
                                    </p>
                                    <Link
                                        to={devLink.replace(window.location.origin, '')}
                                        className="text-xs text-violet-600 dark:text-violet-400 underline break-all"
                                    >
                                        {devLink}
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl text-sm text-red-600 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    {!message && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="label">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="input"
                                    required
                                    autoFocus
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full justify-center py-3"
                            >
                                {loading ? (
                                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                ) : 'Отправить ссылку'}
                            </button>
                        </form>
                    )}

                    {/* Back link */}
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

export default ForgotPassword;
