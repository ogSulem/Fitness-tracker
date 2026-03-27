import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const STEPS = ['Аккаунт', 'Профиль'];

const Register = () => {
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        gender: 'male',
        age: '',
        weight: '',
        height: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateStep0 = () => {
        if (!formData.name.trim()) return 'Введите имя';
        if (!formData.email.trim()) return 'Введите email';
        if (!formData.password) return 'Введите пароль';
        if (formData.password.length < 6) return 'Пароль должен быть не менее 6 символов';
        if (formData.password !== formData.confirmPassword) return 'Пароли не совпадают';
        return null;
    };

    const handleNext = () => {
        const err = validateStep0();
        if (err) { setError(err); return; }
        setError('');
        setStep(1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (Number(formData.age) < 15 || Number(formData.age) > 100) {
            setError('Возраст должен быть от 15 до 100 лет');
            return;
        }

        setLoading(true);
        try {
            const { confirmPassword, ...registerData } = formData;
            await register(registerData);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка при регистрации. Попробуйте ещё раз.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left decorative panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex-col items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 text-9xl">🏆</div>
                    <div className="absolute bottom-20 right-10 text-8xl">🚴</div>
                    <div className="absolute top-1/2 left-1/4 text-7xl">💪</div>
                    <div className="absolute top-1/4 right-1/3 text-6xl">🔥</div>
                    <div className="absolute bottom-10 left-20 text-5xl">🥇</div>
                </div>
                <div className="relative z-10 text-center text-white">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-6">
                        <span className="text-3xl">⚡</span>
                    </div>
                    <h1 className="text-4xl font-bold mb-4">FitTrack</h1>
                    <p className="text-primary-200 text-lg max-w-xs leading-relaxed">
                        Начни свой путь к идеальной форме уже сегодня
                    </p>
                    <div className="mt-10 space-y-3">
                        {[
                            { icon: '✅', text: 'Отслеживай тренировки' },
                            { icon: '✅', text: 'Контролируй питание' },
                            { icon: '✅', text: 'Анализируй прогресс' },
                        ].map(item => (
                            <div key={item.text} className="flex items-center gap-3 text-primary-200">
                                <span>{item.icon}</span>
                                <span>{item.text}</span>
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

                    {/* Step indicator */}
                    <div className="flex items-center gap-2 mb-8">
                        {STEPS.map((s, i) => (
                            <React.Fragment key={s}>
                                <div className="flex items-center gap-2">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                        i <= step ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400'
                                    }`}>
                                        {i < step ? '✓' : i + 1}
                                    </div>
                                    <span className={`text-sm font-medium ${i <= step ? 'text-primary-600' : 'text-gray-400'}`}>{s}</span>
                                </div>
                                {i < STEPS.length - 1 && (
                                    <div className={`flex-1 h-0.5 rounded-full transition-all ${i < step ? 'bg-primary-400' : 'bg-gray-100'}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {step === 0 ? 'Создать аккаунт' : 'Расскажи о себе'}
                    </h2>
                    <p className="text-gray-400 mb-6 text-sm">
                        {step === 0 ? 'Заполни данные для регистрации' : 'Нужно для расчёта калорий и рекомендаций'}
                    </p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 flex items-center gap-2 text-sm">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    {step === 0 ? (
                        <div className="space-y-4">
                            <div>
                                <label className="label">Имя</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="Введите ваше имя"
                                />
                            </div>
                            <div>
                                <label className="label">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="example@mail.ru"
                                />
                            </div>
                            <div>
                                <label className="label">Пароль</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="Минимум 6 символов"
                                    minLength="6"
                                />
                            </div>
                            <div>
                                <label className="label">Подтверждение пароля</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="Повторите пароль"
                                    minLength="6"
                                />
                            </div>
                            <button type="button" onClick={handleNext} className="btn-primary w-full mt-2">
                                Далее →
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="label">Пол</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[{ value: 'male', label: '👨 Мужской' }, { value: 'female', label: '👩 Женский' }].map(opt => (
                                        <label
                                            key={opt.value}
                                            className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all text-sm font-medium ${
                                                formData.gender === opt.value
                                                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                                                    : 'border-gray-200 text-gray-600 hover:border-primary-300'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="gender"
                                                value={opt.value}
                                                checked={formData.gender === opt.value}
                                                onChange={handleChange}
                                                className="hidden"
                                            />
                                            {opt.label}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="label">Возраст</label>
                                    <input
                                        type="number"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="25"
                                        min="15"
                                        max="100"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="label">Вес, кг</label>
                                    <input
                                        type="number"
                                        name="weight"
                                        value={formData.weight}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="70"
                                        min="30"
                                        max="300"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="label">Рост, см</label>
                                    <input
                                        type="number"
                                        name="height"
                                        value={formData.height}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="175"
                                        min="100"
                                        max="250"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-2">
                                <button
                                    type="button"
                                    onClick={() => { setStep(0); setError(''); }}
                                    className="btn-secondary flex-1"
                                >
                                    ← Назад
                                </button>
                                <button type="submit" disabled={loading} className="btn-primary flex-1">
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Регистрация...
                                        </span>
                                    ) : 'Создать аккаунт'}
                                </button>
                            </div>
                        </form>
                    )}

                    <p className="mt-6 text-center text-sm text-gray-500">
                        Уже есть аккаунт?{' '}
                        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                            Войти
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
