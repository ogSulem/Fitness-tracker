import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
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
    <div className="bg-gray-50 rounded-xl px-4 py-3 text-center">
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
);

const Profile = () => {
    const { user, updateUser } = useContext(AuthContext);
    const { showNotification } = useContext(NotificationContext);
    const [activeTab, setActiveTab] = useState('profile');
    const [workouts, setWorkouts] = useState([]);
    const [goals, setGoals] = useState([]);
    const [weightHistory, setWeightHistory] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '', gender: '', age: '', weight: '', height: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                gender: user.gender || 'male',
                age: user.age || '',
                weight: user.weight || '',
                height: user.height || '',
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
            x: { grid: { display: false }, ticks: { font: { size: 11 } } },
            y: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 11 } } },
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
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 overflow-x-auto">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                            activeTab === tab.key
                                ? 'bg-white text-primary-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
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
                        <h2 className="text-lg font-bold text-gray-800">Личные данные</h2>
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
                                                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                                                    : 'border-gray-200 text-gray-600 hover:border-primary-200'
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
                            <div className="flex gap-3 justify-end pt-2">
                                <button type="button" onClick={() => { setEditMode(false); }} className="btn-secondary">Отмена</button>
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
                            ].map(item => (
                                <div key={item.label} className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-xs text-gray-400 font-medium mb-1">{item.label}</p>
                                    <p className="text-gray-800 font-semibold">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Tab: Weight */}
            {activeTab === 'weight' && (
                <div className="card animate-fadeIn">
                    <h2 className="text-lg font-bold text-gray-800 mb-6">Динамика веса</h2>
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
                            <p className="text-gray-500 font-medium">Пока нет истории изменений веса</p>
                            <p className="text-gray-400 text-sm mt-1">Обновите профиль с новым весом, чтобы увидеть динамику</p>
                        </div>
                    )}
                </div>
            )}

            {/* Tab: Goals */}
            {activeTab === 'goals' && (
                <div className="card animate-fadeIn">
                    <h2 className="text-lg font-bold text-gray-800 mb-6">Мои цели</h2>
                    {goals.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-5xl mb-4">🎯</div>
                            <p className="text-gray-500 font-medium">Нет активных целей</p>
                            <p className="text-gray-400 text-sm mt-1">Добавьте цель через календарь на главной странице</p>
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
                                    <div key={goal._id} className={`rounded-2xl border p-5 ${goal.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}>
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div>
                                                <h3 className="font-semibold text-gray-800">{goal.title}</h3>
                                                {goal.description && <p className="text-sm text-gray-500 mt-0.5">{goal.description}</p>}
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
                                        <div className="flex justify-between text-xs text-gray-400">
                                            <span>{goal.startValue} {goal.unit}</span>
                                            <span className="font-medium text-gray-600">{progress}%</span>
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
                    <h2 className="text-lg font-bold text-gray-800 mb-6">История тренировок</h2>
                    {workouts.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-5xl mb-4">🏋️</div>
                            <p className="text-gray-500 font-medium">Тренировки ещё не добавлены</p>
                            <p className="text-gray-400 text-sm mt-1">Добавьте тренировку через календарь на главной странице</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {workouts.map(w => (
                                <div key={w._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-lg">🏋️</div>
                                        <div>
                                            <p className="font-medium text-gray-800 text-sm">{w.type}</p>
                                            <p className="text-xs text-gray-400">{dayjs(w.date).format('D MMMM YYYY')} · {w.time}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                        {w.caloriesBurned > 0 && (
                                            <span className="text-amber-600 font-medium">{w.caloriesBurned} ккал</span>
                                        )}
                                        <span className="text-gray-400">{w.duration} мин</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Profile;


const Profile = () => {
    const { user, updateUser } = useContext(AuthContext);
    const [workouts, setWorkouts] = useState([]);
    const [goals, setGoals] = useState([]);
    const [weightHistory, setWeightHistory] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        gender: '',
        age: '',
        weight: '',
        height: '',
    });
    const [filter, setFilter] = useState({
        startDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
        endDate: dayjs().format('YYYY-MM-DD'),
        type: 'все',
    });

    // Загрузка данных пользователя
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                gender: user.gender || '',
                age: user.age || '',
                weight: user.weight || '',
                height: user.height || '',
            });
        }
    }, [user]);

    // Загрузка тренировок, целей и истории веса
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Загрузка тренировок из MongoDB через API
                const workoutsRes = await axios.get('/api/workouts');
                setWorkouts(workoutsRes.data);

                // Загрузка целей из MongoDB через API
                const goalsRes = await axios.get('/api/goals');
                setGoals(goalsRes.data);

                // Загрузка истории веса из MongoDB через API
                const weightHistoryRes = await axios.get('/api/users/weight-history');
                setWeightHistory(weightHistoryRes.data);
            } catch (err) {
                console.error('Ошибка при загрузке данных:', err);
            }
        };

        fetchData();
    }, []);

    // Обработка изменения формы
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Обработка отправки формы
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await updateUser(formData);
            setEditMode(false);
            
            // Обновляем историю веса после обновления профиля
            try {
                const weightHistoryRes = await axios.get('/api/users/weight-history');
                setWeightHistory(weightHistoryRes.data);
            } catch (err) {
                console.error('Ошибка при обновлении истории веса:', err);
            }
        } catch (err) {
            console.error('Ошибка при обновлении профиля:', err);
        }
    };

    // Обработка изменения фильтра
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter({
            ...filter,
            [name]: value
        });
    };

    // Фильтрация тренировок
    const filteredWorkouts = workouts.filter(workout => {
        const workoutDate = dayjs(workout.date);
        const startDate = dayjs(filter.startDate);
        const endDate = dayjs(filter.endDate);

        const dateInRange = workoutDate.isAfter(startDate) && workoutDate.isBefore(endDate.add(1, 'day'));
        const typeMatches = filter.type === 'все' || workout.type === filter.type;

        return dateInRange && typeMatches;
    });

    // Подготовка данных для графика веса
    const weightChartData = {
        labels: weightHistory.map(item => dayjs(item.date).format('DD.MM.YYYY')),
        datasets: [
            {
                label: 'Вес (кг)',
                data: weightHistory.map(item => item.weight),
                borderColor: '#4a148c',
                backgroundColor: 'rgba(74, 20, 140, 0.1)',
                tension: 0.3,
            },
        ],
    };

    // Подготовка данных для графика тренировок
    const workoutsByWeek = workouts.reduce((acc, workout) => {
        const weekStart = dayjs(workout.date).startOf('week').format('YYYY-MM-DD');
        if (!acc[weekStart]) {
            acc[weekStart] = 0;
        }
        acc[weekStart]++;
        return acc;
    }, {});

    const workoutChartData = {
        labels: Object.keys(workoutsByWeek).map(date => `Неделя с ${dayjs(date).format('DD.MM')}`),
        datasets: [
            {
                label: 'Количество тренировок',
                data: Object.values(workoutsByWeek),
                borderColor: '#4a148c',
                backgroundColor: 'rgba(74, 20, 140, 0.1)',
                tension: 0.3,
            },
        ],
    };

    // Опции для графиков
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
        },
    };

    // Типы тренировок для фильтра
    const workoutTypes = ['все', 'силовая', 'кардио', 'растяжка', 'йога', 'плавание', 'другое'];

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Профиль</h1>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Личные данные</h2>
                    <button
                        onClick={() => setEditMode(!editMode)}
                        className="text-primary hover:text-purple-800"
                    >
                        {editMode ? 'Отмена' : 'Редактировать'}
                    </button>
                </div>

                {editMode ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Имя
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                                    Пол
                                </label>
                                <select
                                    id="gender"
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                                    required
                                >
                                    <option value="">Выберите пол</option>
                                    <option value="male">Мужской</option>
                                    <option value="female">Женский</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                                    Возраст
                                </label>
                                <input
                                    type="number"
                                    id="age"
                                    name="age"
                                    min="15"
                                    max="100"
                                    value={formData.age}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                                    Вес (кг)
                                </label>
                                <input
                                    type="number"
                                    id="weight"
                                    name="weight"
                                    min="30"
                                    max="200"
                                    value={formData.weight}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
                                    Рост (см)
                                </label>
                                <input
                                    type="number"
                                    id="height"
                                    name="height"
                                    min="100"
                                    max="250"
                                    value={formData.height}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="bg-primary hover:bg-purple-800 text-white py-2 px-4 rounded-md"
                            >
                                Сохранить
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Имя</p>
                            <p className="font-medium">{user?.name}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">{user?.email}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Пол</p>
                            <p className="font-medium">{user?.gender === 'male' ? 'Мужской' : 'Женский'}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Возраст</p>
                            <p className="font-medium">{user?.age} лет</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Вес</p>
                            <p className="font-medium">{user?.weight} кг</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Рост</p>
                            <p className="font-medium">{user?.height} см</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Динамика веса</h2>
                {weightHistory.length > 0 ? (
                    <div className="h-64">
                        <Line data={weightChartData} options={chartOptions} />
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-8">История изменения веса пока отсутствует</p>
                )}
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Активность</h2>
                    <div className="flex items-center space-x-2">
                        <select
                            name="type"
                            value={filter.type}
                            onChange={handleFilterChange}
                            className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                        >
                            {workoutTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                        <input
                            type="date"
                            name="startDate"
                            value={filter.startDate}
                            onChange={handleFilterChange}
                            className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                        />
                        <span>-</span>
                        <input
                            type="date"
                            name="endDate"
                            value={filter.endDate}
                            onChange={handleFilterChange}
                            className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                        />
                    </div>
                </div>

                {workouts.length > 0 ? (
                    <>
                        <div className="h-64 mb-6">
                            <Line data={workoutChartData} options={chartOptions} />
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Дата
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Тип
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Время
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Длительность
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredWorkouts.map(workout => (
                                        <tr key={workout._id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {dayjs(workout.date).format('DD.MM.YYYY')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {workout.type}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {workout.time}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {workout.duration} мин
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <p className="text-gray-500 text-center py-8">Тренировки еще не добавлены</p>
                )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Цели</h2>

                {goals.length > 0 ? (
                    <div className="space-y-4">
                        {goals.map(goal => (
                            <div key={goal._id} className="border border-gray-200 rounded-md p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-gray-800">{goal.title}</h3>
                                        <p className="text-sm text-gray-500">
                                            {goal.description || `Цель: ${goal.targetValue} ${goal.unit}`}
                                        </p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded ${goal.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {goal.completed ? 'Выполнено' : `До ${dayjs(goal.deadline).format('DD.MM.YYYY')}`}
                                    </span>
                                </div>

                                <div className="mt-2">
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div
                                            className="bg-primary h-2.5 rounded-full"
                                            style={{
                                                width: `${Math.min(100, Math.max(0, ((goal.currentValue - goal.startValue) / (goal.targetValue - goal.startValue)) * 100))}%`
                                            }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>{goal.startValue} {goal.unit}</span>
                                        <span>{goal.currentValue} {goal.unit}</span>
                                        <span>{goal.targetValue} {goal.unit}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-8">Цели еще не добавлены</p>
                )}
            </div>
        </div>
    );
};

export default Profile; 