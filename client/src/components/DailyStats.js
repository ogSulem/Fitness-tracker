import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

const CircleProgress = ({ percent, size = 120, strokeWidth = 10, color = '#7c3aed' }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const clampedPercent = Math.min(100, Math.max(0, percent));
    const offset = circumference - (clampedPercent / 100) * circumference;

    return (
        <svg width={size} height={size} className="rotate-[-90deg]">
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                className="text-gray-100 dark:text-slate-600"
            />
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
            />
        </svg>
    );
};

const MacroBar = ({ label, value, max, color }) => {
    const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs">
                <span className="text-gray-500 dark:text-slate-400 font-medium">{label}</span>
                <span className="text-gray-700 dark:text-slate-300 font-semibold">{value}г</span>
            </div>
            <div className="progress-bar">
                <div
                    className="progress-fill"
                    style={{ width: `${pct}%`, background: color }}
                />
            </div>
        </div>
    );
};

const DailyStats = ({ targetCalories = 2000 }) => {
    const [consumedCalories, setConsumedCalories] = useState(0);
    const [burnedCalories, setBurnedCalories] = useState(0);
    const [macros, setMacros] = useState({ protein: 0, fat: 0, carbs: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const today = dayjs().format('YYYY-MM-DD');

                const [nutritionRes, workoutsRes] = await Promise.allSettled([
                    axios.get(`/api/nutrition/entries?date=${today}`),
                    axios.get(`/api/workouts/date/${today}`)
                ]);

                if (nutritionRes.status === 'fulfilled') {
                    const data = nutritionRes.value.data || {};
                    const dailyTotals = data.dailyTotals || {};
                    setConsumedCalories(Math.round(dailyTotals.calories || 0));
                    setMacros({
                        protein: Math.round(dailyTotals.protein || 0),
                        fat: Math.round(dailyTotals.fat || 0),
                        carbs: Math.round(dailyTotals.carbs || 0)
                    });
                }

                if (workoutsRes.status === 'fulfilled') {
                    const workouts = workoutsRes.value.data || [];
                    const totalBurned = workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
                    setBurnedCalories(Math.round(totalBurned));
                }
            } catch (err) {
                console.error('Ошибка загрузки статистики:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const netCalories = consumedCalories - burnedCalories;
    const remaining = Math.max(0, targetCalories - netCalories);
    const pct = targetCalories > 0 ? Math.round((consumedCalories / targetCalories) * 100) : 0;
    const isOver = netCalories > targetCalories;

    const targetProtein = Math.round((targetCalories * 0.30) / 4);
    const targetFat = Math.round((targetCalories * 0.30) / 9);
    const targetCarbs = Math.round((targetCalories * 0.40) / 4);

    if (loading) {
        return (
            <div className="card animate-pulse">
                <div className="h-6 bg-gray-100 dark:bg-slate-700 rounded w-48 mb-4" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-24 bg-gray-100 dark:bg-slate-700 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="card animate-slideUp">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-800 dark:text-slate-100">Статистика сегодня</h2>
                <span className="badge-primary">{dayjs().format('DD MMMM')}</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Circle progress */}
                <div className="flex flex-col items-center justify-center shrink-0">
                    <div className="relative">
                        <CircleProgress
                            percent={pct}
                            size={140}
                            strokeWidth={12}
                            color={isOver ? '#ef4444' : '#7c3aed'}
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold text-gray-800 dark:text-slate-100">{pct}%</span>
                            <span className="text-xs text-gray-400 dark:text-slate-500">от нормы</span>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 text-center">
                        {consumedCalories} / {targetCalories} ккал
                    </p>
                </div>

                {/* Stat cards */}
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-900/30 dark:to-violet-800/20 rounded-xl p-4">
                        <div className="text-2xl mb-1">🔥</div>
                        <p className="text-xs font-medium text-violet-600 dark:text-violet-400 mb-1">Потреблено</p>
                        <p className="text-xl font-bold text-violet-700 dark:text-violet-300">{consumedCalories}</p>
                        <p className="text-xs text-violet-400 dark:text-violet-500">ккал</p>
                        <div className="progress-bar mt-2">
                            <div
                                className="progress-fill bg-violet-500"
                                style={{ width: `${Math.min(100, pct)}%` }}
                            />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-xl p-4">
                        <div className="text-2xl mb-1">💪</div>
                        <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-1">Сожжено</p>
                        <p className="text-xl font-bold text-amber-700 dark:text-amber-300">{burnedCalories}</p>
                        <p className="text-xs text-amber-400 dark:text-amber-500">ккал</p>
                    </div>

                    <div className={`bg-gradient-to-br rounded-xl p-4 ${isOver ? 'from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20' : 'from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20'}`}>
                        <div className="text-2xl mb-1">⚖️</div>
                        <p className={`text-xs font-medium mb-1 ${isOver ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>Баланс</p>
                        <p className={`text-xl font-bold ${isOver ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'}`}>{netCalories}</p>
                        <p className={`text-xs ${isOver ? 'text-red-400 dark:text-red-500' : 'text-green-400 dark:text-green-500'}`}>ккал</p>
                    </div>

                    <div className="bg-gradient-to-br from-sky-50 to-sky-100 dark:from-sky-900/30 dark:to-sky-800/20 rounded-xl p-4">
                        <div className="text-2xl mb-1">🎯</div>
                        <p className="text-xs font-medium text-sky-600 dark:text-sky-400 mb-1">До цели</p>
                        <p className="text-xl font-bold text-sky-700 dark:text-sky-300">{remaining}</p>
                        <p className="text-xs text-sky-400 dark:text-sky-500">ккал</p>
                    </div>
                </div>
            </div>

            {/* Macros */}
            <div className="mt-6 border-t border-gray-100 dark:border-slate-700 pt-4">
                <h3 className="text-sm font-semibold text-gray-600 dark:text-slate-400 mb-3">Макронутриенты</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <MacroBar
                        label={`Белки (цель ${targetProtein}г)`}
                        value={macros.protein}
                        max={targetProtein}
                        color="#60a5fa"
                    />
                    <MacroBar
                        label={`Жиры (цель ${targetFat}г)`}
                        value={macros.fat}
                        max={targetFat}
                        color="#fbbf24"
                    />
                    <MacroBar
                        label={`Углеводы (цель ${targetCarbs}г)`}
                        value={macros.carbs}
                        max={targetCarbs}
                        color="#34d399"
                    />
                </div>
            </div>
        </div>
    );
};

export default DailyStats;
