import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';

const Register = () => {
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', confirmPassword: '',
        gender: 'male', age: '', weight: '', height: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { register } = useContext(AuthContext);
    const { t } = useLang();
    const navigate = useNavigate();

    const STEPS = [t('reg_step_account'), t('reg_step_profile')];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateStep0 = () => {
        if (!formData.name.trim()) return 'Введите имя / Enter name';
        if (!formData.email.trim()) return 'Введите email';
        if (!formData.password) return 'Введите пароль / Enter password';
        if (formData.password.length < 6) return 'Пароль не менее 6 символов';
        if (formData.password !== formData.confirmPassword) return 'Пароли не совпадают';
        return null;
    };

    const handleNext = (e) => {
        if (e) e.preventDefault();
        const err = validateStep0();
        if (err) { setError(err); return; }
        setError('');
        setStep(1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (Number(formData.age) < 15 || Number(formData.age) > 100) {
            setError('Возраст от 15 до 100 лет');
            return;
        }
        setLoading(true);
        try {
            const { confirmPassword, ...registerData } = formData;
            await register(registerData);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка при регистрации.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-600 via-violet-700 to-violet-900 flex-col items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
                </div>
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 text-9xl">🏆</div>
                    <div className="absolute bottom-20 right-10 text-8xl">🚴</div>
                    <div className="absolute top-1/2 left-1/4 text-7xl">💪</div>
                    <div className="absolute top-1/4 right-1/3 text-6xl">🔥</div>
                    <div className="absolute bottom-10 left-20 text-5xl">🥇</div>
                </div>
                <div className="relative z-10 text-center text-white">
                    <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6 shadow-xl">
                        <span className="text-4xl">⚡</span>
                    </div>
                    <h1 className="text-5xl font-bold mb-4 tracking-tight">FitTrack</h1>
                    <p className="text-violet-200 text-lg max-w-xs leading-relaxed">{t('reg_subtitle')}</p>
                    <div className="mt-12 space-y-3 text-left max-w-xs mx-auto">
                        {[
                            { icon: '✅', ru: 'Отслеживай тренировки',   en: 'Track your workouts'     },
                            { icon: '✅', ru: 'Контролируй питание',      en: 'Control your nutrition'  },
                            { icon: '✅', ru: 'Анализируй прогресс',      en: 'Analyze your progress'   },
                            { icon: '✅', ru: 'Достигай целей',           en: 'Achieve your goals'      },
                        ].map((item) => (
                            <div key={item.ru} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5">
                                <span>{item.icon}</span>
                                <span className="text-sm text-violet-100 font-medium">
                                    {t('toggle_lang') === 'RU' ? item.ru : item.en}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-slate-800 transition-colors duration-300">
                <div className="w-full max-w-md animate-slideUp">
                    <div className="flex items-center gap-2 mb-8 lg:hidden">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center">
                            <span className="text-white text-sm">⚡</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">FitTrack</span>
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('reg_title')}</h2>
                    <p className="text-gray-400 dark:text-slate-500 mb-6">
                        {t('toggle_lang') === 'RU'
                            ? `Шаг ${step + 1} из ${STEPS.length}: ${STEPS[step]}`
                            : `Step ${step + 1} of ${STEPS.length}: ${STEPS[step]}`}
                    </p>

                    <div className="flex gap-2 mb-8">
                        {STEPS.map((s, i) => (
                            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-violet-600' : 'bg-gray-200 dark:bg-slate-600'}`} />
                        ))}
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-6 flex items-center gap-2 text-sm">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    {step === 0 && (
                        <form className="space-y-5" onSubmit={handleNext}>
                            <div>
                                <label className="label">{t('reg_name')} *</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} className="input" placeholder="Ivan Ivanov" required />
                            </div>
                            <div>
                                <label className="label">{t('reg_email')} *</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} className="input" placeholder="example@mail.ru" required />
                            </div>
                            <div>
                                <label className="label">{t('reg_password')} *</label>
                                <div className="relative">
                                    <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} className="input pr-12" placeholder="••••••••" required />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                                        {showPassword ? '🙈' : '👁️'}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="label">{t('reg_confirm')} *</label>
                                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="input" placeholder="••••••••" required />
                            </div>
                            <button type="submit" className="btn-primary w-full justify-center">{t('reg_next')} →</button>
                        </form>
                    )}

                    {step === 1 && (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="label">{t('reg_gender')} *</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { value: 'male',   label: `👨 ${t('reg_male')}`   },
                                        { value: 'female', label: `�� ${t('reg_female')}` },
                                    ].map(opt => (
                                        <label key={opt.value} className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all text-sm font-medium ${formData.gender === opt.value ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300' : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-400 hover:border-violet-200'}`}>
                                            <input type="radio" name="gender" value={opt.value} checked={formData.gender === opt.value} onChange={handleChange} className="hidden" />
                                            {opt.label}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="label">{t('reg_age')} *</label>
                                    <input type="number" name="age" value={formData.age} onChange={handleChange} className="input" placeholder="25" min="15" max="100" required />
                                </div>
                                <div>
                                    <label className="label">{t('reg_weight')} *</label>
                                    <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="input" placeholder="70" min="30" max="300" step="0.1" required />
                                </div>
                                <div>
                                    <label className="label">{t('reg_height')} *</label>
                                    <input type="number" name="height" value={formData.height} onChange={handleChange} className="input" placeholder="175" min="100" max="250" required />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => { setStep(0); setError(''); }} className="btn-secondary flex-1 justify-center">← {t('reg_back')}</button>
                                <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            {t('reg_loading')}
                                        </span>
                                    ) : t('reg_submit')}
                                </button>
                            </div>
                        </form>
                    )}

                    <p className="mt-6 text-center text-sm text-gray-500 dark:text-slate-500">
                        {t('reg_has_account')}{' '}
                        <Link to="/login" className="text-violet-600 dark:text-violet-400 hover:text-violet-700 font-semibold">{t('reg_signin')}</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
