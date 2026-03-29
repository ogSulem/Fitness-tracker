import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, ArcElement, Title, Tooltip, Legend, Filler
);
dayjs.locale('ru');

const StatSummaryCard = ({ icon, label, value, unit, sub, color }) => (
    <div className={`card border-l-4 ${color}`}>
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">{label}</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-slate-100 mt-1">{value}<span className="text-sm font-normal text-gray-400 dark:text-slate-500 ml-1">{unit}</span></p>
                {sub && <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{sub}</p>}
            </div>
            <span className="text-3xl">{icon}</span>
        </div>
    </div>
);

const Analytics = () => {
    const [workouts, setWorkouts]       = useState([]);
    const [nutritionSummary, setNutritionSummary] = useState([]);
    const [period, setPeriod]           = useState('week');
    const [loading, setLoading]         = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [workoutsRes, nutritionRes] = await Promise.allSettled([
                    axios.get('/api/workouts'),
                    axios.get(`/api/nutrition/summary?start=${dayjs().subtract(365, 'day').format('YYYY-MM-DD')}&end=${dayjs().format('YYYY-MM-DD')}`),
                ]);
                if (workoutsRes.status === 'fulfilled') setWorkouts(workoutsRes.value.data || []);
                if (nutritionRes.status === 'fulfilled') setNutritionSummary(nutritionRes.value.data || []);
            } catch (err) {
                console.error('Ошибка загрузки данных:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getDaysBack = () => ({ week: 7, month: 30, year: 365 }[period] || 7);

    const filteredWorkouts = workouts.filter(w => {
        const workoutDate = dayjs(w.date);
        return workoutDate.isAfter(dayjs().subtract(getDaysBack(), 'day'));
    });

    const generateLabels = () => {
        const days = getDaysBack();
        return Array.from({ length: days }, (_, i) =>
            dayjs().subtract(days - 1 - i, 'day').format(days <= 7 ? 'dd' : 'D MMM')
        );
    };

    const labels = generateLabels();

    const getWorkoutsForDay = (label) => {
        return filteredWorkouts.filter(w => {
            const dayIndex = labels.indexOf(label);
            const targetDate = dayjs().subtract(getDaysBack() - 1 - dayIndex, 'day').format('YYYY-MM-DD');
            return dayjs(w.date).format('YYYY-MM-DD') === targetDate;
        });
    };

    const caloriesData = labels.map(l => {
        const dayWorkouts = getWorkoutsForDay(l);
        return dayWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
    });

    const durationData = labels.map(l => {
        const dayWorkouts = getWorkoutsForDay(l);
        return dayWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    });

    const workoutTypes = filteredWorkouts.reduce((acc, w) => {
        const type = w.type || 'Другое';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});

    const totalCaloriesBurned = filteredWorkouts.reduce((s, w) => s + (w.caloriesBurned || 0), 0);
    const totalDuration = filteredWorkouts.reduce((s, w) => s + (w.duration || 0), 0);
    const avgCalories = filteredWorkouts.length > 0 ? Math.round(totalCaloriesBurned / filteredWorkouts.length) : 0;

    const chartOptions = {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { display: false }, ticks: { font: { size: 11 } } },
            y: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 11 } } },
        },
    };

    const caloriesChartData = {
        labels,
        datasets: [{
            label: 'Калории',
            data: caloriesData,
            backgroundColor: 'rgba(124, 58, 237, 0.15)',
            borderColor: '#7c3aed',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#7c3aed',
            pointRadius: 4,
        }],
    };

    const durationChartData = {
        labels,
        datasets: [{
            label: 'Минуты',
            data: durationData,
            backgroundColor: 'rgba(16, 185, 129, 0.7)',
            borderColor: '#059669',
            borderWidth: 0,
            borderRadius: 6,
        }],
    };

    const doughnutData = {
        labels: Object.keys(workoutTypes),
        datasets: [{
            data: Object.values(workoutTypes),
            backgroundColor: ['#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'],
            borderWidth: 0,
        }],
    };

    const doughnutOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'bottom', labels: { font: { size: 12 }, padding: 16 } },
        },
        cutout: '65%',
    };

    // Nutrition chart data
    const filteredNutrition = nutritionSummary.filter(n =>
        dayjs(n.date).isAfter(dayjs().subtract(getDaysBack(), 'day'))
    );
    const nutritionCaloriesData = labels.map(l => {
        const dayIndex = labels.indexOf(l);
        const targetDate = dayjs().subtract(getDaysBack() - 1 - dayIndex, 'day').format('YYYY-MM-DD');
        const entry = filteredNutrition.find(n => n.date === targetDate);
        return entry ? Math.round(entry.calories) : 0;
    });

    const nutritionChartData = {
        labels,
        datasets: [{
            label: 'Калории',
            data: nutritionCaloriesData,
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            borderColor: '#10b981',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#10b981',
            pointRadius: 4,
        }],
    };

    const totalConsumedCalories = filteredNutrition.reduce((s, n) => s + (n.calories || 0), 0);
    const avgConsumedCalories   = filteredNutrition.length > 0 ? Math.round(totalConsumedCalories / filteredNutrition.length) : 0;

    return (
        <div className="container mx-auto px-4 py-8 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        📊 Аналитика
                    </h1>
                    <p className="text-gray-400 dark:text-slate-500 mt-1 text-sm">Анализируй свой прогресс и достижения</p>
                </div>
                <div className="flex gap-2 bg-gray-100 dark:bg-slate-700 rounded-xl p-1">
                    {[
                        { key: 'week', label: '7 дней' },
                        { key: 'month', label: '30 дней' },
                        { key: 'year', label: 'Год' },
                    ].map(opt => (
                        <button
                            key={opt.key}
                            onClick={() => setPeriod(opt.key)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                period === opt.key
                                    ? 'bg-white dark:bg-slate-600 text-primary-600 dark:text-violet-300 shadow-sm'
                                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse mb-8">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-100 dark:bg-slate-700 rounded-2xl" />)}
                </div>
            ) : (
                <>
                    {/* Summary stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <StatSummaryCard
                            icon="🏋️"
                            label="Тренировок"
                            value={filteredWorkouts.length}
                            unit="шт"
                            sub={`за ${getDaysBack()} дней`}
                            color="border-primary-400"
                        />
                        <StatSummaryCard
                            icon="🔥"
                            label="Сожжено"
                            value={totalCaloriesBurned}
                            unit="ккал"
                            sub={`~${avgCalories} за тренировку`}
                            color="border-amber-400"
                        />
                        <StatSummaryCard
                            icon="⏱️"
                            label="Время"
                            value={totalDuration}
                            unit="мин"
                            sub={filteredWorkouts.length > 0 ? `~${Math.round(totalDuration / filteredWorkouts.length)} мин/тренировка` : ''}
                            color="border-green-400"
                        />
                        <StatSummaryCard
                            icon="🥗"
                            label="Съедено"
                            value={Math.round(totalConsumedCalories)}
                            unit="ккал"
                            sub={avgConsumedCalories > 0 ? `~${avgConsumedCalories} ккал/день` : 'нет данных'}
                            color="border-emerald-400"
                        />
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        <div className="lg:col-span-2 card">
                            <h3 className="text-base font-semibold text-gray-800 dark:text-slate-100 mb-4">🔥 Сожжённые калории (тренировки)</h3>
                            <Line data={caloriesChartData} options={chartOptions} />
                        </div>
                        <div className="card">
                            <h3 className="text-base font-semibold text-gray-800 dark:text-slate-100 mb-4">🏷️ Типы тренировок</h3>
                            {Object.keys(workoutTypes).length > 0 ? (
                                <Doughnut data={doughnutData} options={doughnutOptions} />
                            ) : (
                                <div className="flex items-center justify-center h-48 text-gray-400 dark:text-slate-500 text-sm">
                                    Нет данных
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <div className="card">
                            <h3 className="text-base font-semibold text-gray-800 dark:text-slate-100 mb-4">⏱️ Длительность тренировок (мин)</h3>
                            <Bar data={durationChartData} options={chartOptions} />
                        </div>
                        <div className="card">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-semibold text-gray-800 dark:text-slate-100">🥗 Калории из питания</h3>
                                {avgConsumedCalories > 0 && (
                                    <span className="badge-primary text-xs">~{avgConsumedCalories} ккал/день</span>
                                )}
                            </div>
                            {nutritionCaloriesData.some(v => v > 0) ? (
                                <Line data={nutritionChartData} options={chartOptions} />
                            ) : (
                                <div className="flex items-center justify-center h-48 text-gray-400 dark:text-slate-500 text-sm">
                                    Нет данных о питании
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Workout list */}
                    {filteredWorkouts.length > 0 && (
                        <div className="card mt-2">
                            <h3 className="text-base font-semibold text-gray-800 dark:text-slate-100 mb-4">📋 Последние тренировки</h3>
                            <div className="space-y-2">
                                {filteredWorkouts.slice(0, 10).map(w => (
                                    <div key={w._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-violet-900/40 flex items-center justify-center text-primary-600 font-bold text-sm">
                                                🏋️
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800 dark:text-slate-100 text-sm">{w.type || 'Тренировка'}</p>
                                                <p className="text-xs text-gray-400 dark:text-slate-500">{dayjs(w.date).format('D MMM YYYY')}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm">
                                            <span className="text-amber-600 dark:text-amber-400 font-medium">{w.caloriesBurned || 0} ккал</span>
                                            <span className="text-gray-400 dark:text-slate-500">{w.duration || 0} мин</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {filteredWorkouts.length === 0 && (
                        <div className="card text-center py-12 mt-2">
                            <div className="text-5xl mb-4">📊</div>
                            <p className="text-gray-500 dark:text-slate-400 font-medium">Нет данных за выбранный период</p>
                            <p className="text-gray-400 dark:text-slate-500 text-sm mt-1">Добавьте тренировки в календарь, чтобы увидеть статистику</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Analytics;
