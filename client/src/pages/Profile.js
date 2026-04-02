import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { ThemeContext } from '../context/ThemeContext';
import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, PointElement, LineElement,
    Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);
dayjs.locale('ru');

const TABS = [
    { key: 'profile',  label: 'Профиль',         icon: '👤' },
    { key: 'weight',   label: 'Динамика веса',    icon: '⚖️' },
    { key: 'goals',    label: 'Цели',              icon: '🎯' },
    { key: 'workouts', label: 'Тренировки',        icon: '🏋️' },
];

const StatPill = ({ label, value }) => (
    <div className="bg-gray-50 dark:bg-slate-700 rounded-xl px-4 py-3 text-center">
        <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
        <p className="text-xs text-gray-400 dark:text-slate-400 mt-0.5">{label}</p>
    </div>
);

const Profile = () => {
    const { user, updateUser } = useContext(AuthContext);
    const { isDark } = useContext(ThemeContext);
    const { showNotification } = useContext(NotificationContext);
    const [activeTab, setActiveTab] = useState('profile');
    const [workouts, setWorkouts] = useState([]);
    const [goals, setGoals] = useState([]);
    const [weightHistory, setWeightHistory] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '', gender: '', age: '', weight: '', height: '', activityLevel: 'moderate',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                gender: user.gender || 'male',
                age: user.age || '',
                weight: user.weight || '',
                height: user.height || '',
                activityLevel: user.activityLevel || 'moderate',
            });
        }
    }, [user]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [workoutsRes, goalsRes, weightRes] = await Promise.allSettled([
                    axios.get('/api/workouts'),
                    axios.get('/api/goals'),
                    axios.get('/api/users/weight-history'),
                ]);
                if (workoutsRes.status === 'fulfilled') setWorkouts(workoutsRes.value.data || []);
                if (goalsRes.status === 'fulfilled')    setGoals(goalsRes.value.data || []);
                if (weightRes.status === 'fulfilled')   setWeightHistory(weightRes.value.data || []);
            } catch (err) {
                console.error('Ошибка при загрузке данных:', err);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCancelEdit = () => {
        setEditMode(false);
        setFormData({
            name: user.name || '',
            gender: user.gender || 'male',
            age: user.age || '',
            weight: user.weight || '',
            height: user.height || '',
            activityLevel: user.activityLevel || 'moderate',
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateUser(formData);
            const weightRes = await axios.get('/api/users/weight-history');
            setWeightHistory(weightRes.data || []);
            setEditMode(false);
            showNotification('Профиль обновлён!', 'success');
        } catch (err) {
            showNotification(err.response?.data?.message || 'Ошибка при сохранении', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteGoal = async (id) => {
        try {
            await axios.delete(`/api/goals/${id}`);
            setGoals(prev => prev.filter(g => g._id !== id));
            showNotification('Цель удалена', 'success');
        } catch {
            showNotification('Ошибка при удалении цели', 'error');
        }
    };

    // Chart data
    const weightLabels = weightHistory.map(h => dayjs(h.date).format('D MMM'));
    const weightValues = weightHistory.map(h => h.weight);

    const weightChartData = {
        labels: weightLabels,
        datasets: [{
            label: 'Вес, кг',
            data: weightValues,
            borderColor: '#7c3aed',
            backgroundColor: 'rgba(124, 58, 237, 0.08)',
            borderWidth: 2.5,
            pointBackgroundColor: '#7c3aed',
            pointRadius: 4,
            fill: true,
            tension: 0.4,
        }],
    };

    const chartOptions = {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { display: false }, ticks: { font: { size: 11 }, color: isDark ? '#94a3b8' : '#6b7280' } },
            y: { grid: { color: isDark ? '#334155' : '#f1f5f9' }, ticks: { font: { size: 11 }, color: isDark ? '#94a3b8' : '#6b7280' } },
        },
    };

    const totalWorkouts   = workouts.length;
    const totalMinutes    = workouts.reduce((s, w) => s + (w.duration || 0), 0);
    const totalCalBurned  = workouts.reduce((s, w) => s + (w.caloriesBurned || 0), 0);
    const completedGoals  = goals.filter(g => g.completed).length;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl animate-fadeIn">
            {/* Hero card */}
            <div className="card mb-6 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                    <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-bold shrink-0">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">{user?.name}</h1>
                        <p className="text-primary-200 text-sm mt-0.5">{user?.email}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                            <span className="bg-white/20 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                                {user?.gender === 'male' ? '👨 Мужской' : '👩 Женский'}
                            </span>
                            <span className="bg-white/20 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                                {user?.age} лет
                            </span>
                            <span className="bg-white/20 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                                {user?.weight} кг · {user?.height} см
                            </span>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 border-t border-white/20 pt-5">
                    {[
                        { label: 'Тренировок', value: totalWorkouts },
                        { label: 'Минут', value: totalMinutes },
                        { label: 'Ккал сожжено', value: totalCalBurned },
                        { label: 'Целей выполнено', value: `${completedGoals}/${goals.length}` },
                    ].map(s => (
                        <div key={s.label} className="text-center">
                            <p className="text-xl font-bold">{s.value}</p>
                            <p className="text-primary-200 text-xs mt-0.5">{s.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 dark:bg-slate-700 rounded-xl p-1 mb-6 overflow-x-auto">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                            activeTab === tab.key
                                ? 'bg-white dark:bg-slate-600 text-primary-600 dark:text-violet-300 shadow-sm'
                                : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
                        }`}
                    >
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab: Profile */}
            {activeTab === 'profile' && (
                <div className="card animate-fadeIn">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-slate-100">Личные данные</h2>
                        {!editMode && (
                            <button onClick={() => setEditMode(true)} className="btn-secondary text-sm py-2 px-4">
                                ✏️ Редактировать
                            </button>
                        )}
                    </div>

                    {editMode ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Имя</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="input" required />
                                </div>
                                <div>
                                    <label className="label">Пол</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[{ value: 'male', label: '👨 Мужской' }, { value: 'female', label: '👩 Женский' }].map(opt => (
                                            <label key={opt.value} className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border-2 cursor-pointer transition-all text-sm font-medium ${
                                                formData.gender === opt.value
                                                    ? 'border-primary-500 bg-primary-50 dark:bg-violet-900/30 text-primary-700 dark:text-violet-300'
                                                    : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-400 hover:border-primary-200'
                                            }`}>
                                                <input type="radio" name="gender" value={opt.value} checked={formData.gender === opt.value} onChange={handleChange} className="hidden" />
                                                {opt.label}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="label">Возраст</label>
                                    <input type="number" name="age" value={formData.age} onChange={handleChange} className="input" min="15" max="100" required />
                                </div>
                                <div>
                                    <label className="label">Вес, кг</label>
                                    <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="input" min="30" max="300" step="0.1" required />
                                </div>
                                <div>
                                    <label className="label">Рост, см</label>
                                    <input type="number" name="height" value={formData.height} onChange={handleChange} className="input" min="100" max="250" required />
                                </div>
                            </div>
                            <div>
                                <label className="label">Уровень активности</label>
                                <select name="activityLevel" value={formData.activityLevel} onChange={handleChange} className="input">
                                    <option value="sedentary">🪑 Сидячий образ жизни</option>
                                    <option value="light">🚶 Лёгкая активность (1–2 раза/нед)</option>
                                    <option value="moderate">🏃 Умеренная активность (3–5 раз/нед)</option>
                                    <option value="active">💪 Высокая активность (6–7 раз/нед)</option>
                                    <option value="veryActive">🔥 Очень высокая (спорт + физ. работа)</option>
                                </select>
                            </div>
                            <div className="flex gap-3 justify-end pt-2">
                                <button type="button" onClick={handleCancelEdit} className="btn-secondary">Отмена</button>
                                <button type="submit" disabled={saving} className="btn-primary">
                                    {saving ? 'Сохранение...' : 'Сохранить'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {[
                                { label: 'Имя', value: user?.name },
                                { label: 'Email', value: user?.email },
                                { label: 'Пол', value: user?.gender === 'male' ? 'Мужской' : 'Женский' },
                                { label: 'Возраст', value: `${user?.age} лет` },
                                { label: 'Вес', value: `${user?.weight} кг` },
                                { label: 'Рост', value: `${user?.height} см` },
                                { label: 'Активность', value: { sedentary: 'Сидячий', light: 'Лёгкая', moderate: 'Умеренная', active: 'Высокая', veryActive: 'Очень высокая' }[user?.activityLevel] || 'Умеренная' },
                            ].map(item => (
                                <div key={item.label} className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4">
                                    <p className="text-xs text-gray-400 dark:text-slate-400 font-medium mb-1">{item.label}</p>
                                    <p className="text-gray-800 dark:text-slate-100 font-semibold">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Tab: Weight */}
            {activeTab === 'weight' && (
                <div className="card animate-fadeIn">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-slate-100 mb-6">Динамика веса</h2>
                    {weightHistory.length > 1 ? (
                        <>
                            <div className="mb-4">
                                <Line data={weightChartData} options={chartOptions} />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <StatPill label="Начальный вес" value={`${weightValues[0]} кг`} />
                                <StatPill label="Текущий вес" value={`${weightValues[weightValues.length - 1]} кг`} />
                                <StatPill label="Изменение" value={`${(weightValues[weightValues.length - 1] - weightValues[0]).toFixed(1)} кг`} />
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-5xl mb-4">⚖️</div>
                            <p className="text-gray-500 dark:text-slate-400 font-medium">Пока нет истории изменений веса</p>
                            <p className="text-gray-400 dark:text-slate-500 text-sm mt-1">Обновите профиль с новым весом, чтобы увидеть динамику</p>
                        </div>
                    )}
                </div>
            )}

            {/* Tab: Goals */}
            {activeTab === 'goals' && (
                <div className="card animate-fadeIn">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-slate-100 mb-6">Мои цели</h2>
                    {goals.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-5xl mb-4">🎯</div>
                            <p className="text-gray-500 dark:text-slate-400 font-medium">Нет активных целей</p>
                            <p className="text-gray-400 dark:text-slate-500 text-sm mt-1">Добавьте цель через календарь на главной странице</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {goals.map(goal => {
                                const range   = goal.targetValue - goal.startValue;
                                const progress = range !== 0
                                    ? Math.min(100, Math.max(0, Math.round(((goal.currentValue - goal.startValue) / range) * 100)))
                                    : goal.completed ? 100 : 0;
                                const daysLeft = dayjs(goal.deadline).diff(dayjs(), 'day');
                                return (
                                    <div key={goal._id} className={`rounded-2xl border p-5 ${goal.completed ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-white dark:bg-slate-700/50 border-gray-100 dark:border-slate-700'}`}>
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div>
                                                <h3 className="font-semibold text-gray-800 dark:text-slate-100">{goal.title}</h3>
                                                {goal.description && <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{goal.description}</p>}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                                    goal.completed
                                                        ? 'bg-green-100 text-green-700'
                                                        : daysLeft < 0
                                                        ? 'bg-red-100 text-red-700'
                                                        : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {goal.completed ? '✓ Выполнено' : daysLeft < 0 ? 'Просрочено' : `${daysLeft} дн.`}
                                                </span>
                                                <button
                                                    onClick={() => handleDeleteGoal(goal._id)}
                                                    className="text-gray-300 hover:text-red-500 transition-colors"
                                                    title="Удалить цель"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="progress-bar mb-2">
                                            <div
                                                className={`progress-fill ${goal.completed ? 'bg-green-500' : 'bg-primary-500'}`}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-400 dark:text-slate-500">
                                            <span>{goal.startValue} {goal.unit}</span>
                                            <span className="font-medium text-gray-600 dark:text-slate-300">{progress}%</span>
                                            <span>{goal.targetValue} {goal.unit}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Tab: Workouts */}
            {activeTab === 'workouts' && (
                <div className="card animate-fadeIn">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-slate-100 mb-6">История тренировок</h2>
                    {workouts.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-5xl mb-4">🏋️</div>
                            <p className="text-gray-500 dark:text-slate-400 font-medium">Тренировки ещё не добавлены</p>
                            <p className="text-gray-400 dark:text-slate-500 text-sm mt-1">Добавьте тренировку через календарь на главной странице</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {workouts.map(w => (
                                <div key={w._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-violet-900/40 flex items-center justify-center text-lg">🏋️</div>
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-slate-100 text-sm">{w.type}</p>
                                            <p className="text-xs text-gray-400 dark:text-slate-500">{dayjs(w.date).format('D MMMM YYYY')} · {w.time}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                        {w.caloriesBurned > 0 && (
                                            <span className="text-amber-600 dark:text-amber-400 font-medium">{w.caloriesBurned} ккал</span>
                                        )}
                                        <span className="text-gray-400 dark:text-slate-500">{w.duration} мин</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Notifications widget — always visible at bottom */}
            <NotificationsWidget />
        </div>
    );
};

// ─── Browser Notification Reminders ─────────────────────────────────────────
const NotificationsWidget = () => {
    const [permission, setPermission] = useState(() =>
        'Notification' in window ? Notification.permission : 'unsupported'
    );
    const [mealTime, setMealTime] = useState(() => localStorage.getItem('notif_mealTime') || '08:00');
    const [workoutTime, setWorkoutTime] = useState(() => localStorage.getItem('notif_workoutTime') || '18:00');
    const [mealEnabled, setMealEnabled] = useState(() => localStorage.getItem('notif_mealEnabled') === 'true');
    const [workoutEnabled, setWorkoutEnabled] = useState(() => localStorage.getItem('notif_workoutEnabled') === 'true');

    const requestPermission = async () => {
        if (!('Notification' in window)) return;
        const result = await Notification.requestPermission();
        setPermission(result);
    };

    // Simple daily reminder via setTimeout until next occurrence
    const scheduleNotification = (title, body, timeStr) => {
        const [h, m] = timeStr.split(':').map(Number);
        const now = new Date();
        const target = new Date();
        target.setHours(h, m, 0, 0);
        if (target <= now) target.setDate(target.getDate() + 1);
        const delay = target - now;
        setTimeout(() => {
            if (Notification.permission === 'granted') {
                new Notification(title, { body, icon: '/favicon.ico' });
            }
        }, delay);
    };

    const save = () => {
        if (permission !== 'granted') return;
        localStorage.setItem('notif_mealEnabled', mealEnabled);
        localStorage.setItem('notif_workoutEnabled', workoutEnabled);
        localStorage.setItem('notif_mealTime', mealTime);
        localStorage.setItem('notif_workoutTime', workoutTime);
        if (mealEnabled) {
            scheduleNotification('🥗 Время поесть!', `Не забудьте записать приём пищи в FitTrack`, mealTime);
        }
        if (workoutEnabled) {
            scheduleNotification('🏋️ Время тренировки!', `Сегодня запланирована тренировка — вперёд!`, workoutTime);
        }
    };

    if (permission === 'unsupported') return null;

    return (
        <div className="card animate-fadeIn mt-6">
            <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🔔</span>
                <h2 className="text-lg font-bold text-gray-800 dark:text-slate-100">Напоминания</h2>
                {permission === 'granted' && (
                    <span className="badge-accent ml-auto">Разрешены</span>
                )}
            </div>

            {permission !== 'granted' ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                        Разрешите уведомления, чтобы получать напоминания о приёмах пищи и тренировках.
                    </p>
                    <button
                        onClick={requestPermission}
                        className="btn-primary text-sm py-2 shrink-0"
                    >
                        Разрешить уведомления
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Meal reminder */}
                    <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                        <input
                            type="checkbox"
                            id="meal-reminder"
                            checked={mealEnabled}
                            onChange={(e) => setMealEnabled(e.target.checked)}
                            className="w-4 h-4 accent-violet-600 cursor-pointer"
                        />
                        <label htmlFor="meal-reminder" className="flex-1 text-sm font-medium text-gray-700 dark:text-slate-200 cursor-pointer">
                            🥗 Напоминание о приёме пищи
                        </label>
                        <input
                            type="time"
                            value={mealTime}
                            onChange={(e) => setMealTime(e.target.value)}
                            disabled={!mealEnabled}
                            className="input w-32 text-sm py-1.5 disabled:opacity-50"
                        />
                    </div>

                    {/* Workout reminder */}
                    <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                        <input
                            type="checkbox"
                            id="workout-reminder"
                            checked={workoutEnabled}
                            onChange={(e) => setWorkoutEnabled(e.target.checked)}
                            className="w-4 h-4 accent-violet-600 cursor-pointer"
                        />
                        <label htmlFor="workout-reminder" className="flex-1 text-sm font-medium text-gray-700 dark:text-slate-200 cursor-pointer">
                            🏋️ Напоминание о тренировке
                        </label>
                        <input
                            type="time"
                            value={workoutTime}
                            onChange={(e) => setWorkoutTime(e.target.value)}
                            disabled={!workoutEnabled}
                            className="input w-32 text-sm py-1.5 disabled:opacity-50"
                        />
                    </div>

                    <button
                        onClick={save}
                        disabled={!mealEnabled && !workoutEnabled}
                        className="btn-primary text-sm py-2"
                    >
                        Сохранить напоминания
                    </button>
                    <p className="text-xs text-gray-400 dark:text-slate-500">
                        Уведомления работают, пока браузер открыт. Они придут в указанное время.
                    </p>
                </div>
            )}
        </div>
    );
};

export default Profile;
