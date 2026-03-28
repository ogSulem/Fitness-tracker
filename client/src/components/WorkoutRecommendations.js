import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GOALS = [
    { value: 'weightLoss',  label: '🔥 Похудение' },
    { value: 'muscleGain',  label: '💪 Набор массы' },
    { value: 'endurance',   label: '🏃 Выносливость' },
];

const LEVELS = [
    { value: 'beginner',     label: '🟢 Начинающий' },
    { value: 'intermediate', label: '🟡 Средний' },
    { value: 'advanced',     label: '🔴 Продвинутый' },
];

const WorkoutRecommendations = () => {
    const [selectedGoal, setSelectedGoal]   = useState('weightLoss');
    const [selectedLevel, setSelectedLevel] = useState('beginner');
    const [recommendation, setRecommendation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState(null);

    useEffect(() => {
        const fetchRecommendation = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`/api/recommendations/${selectedGoal}/${selectedLevel}`);
                setRecommendation(response.data);
            } catch (err) {
                setError('Рекомендации временно недоступны');
                console.error('Ошибка при загрузке рекомендаций:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchRecommendation();
    }, [selectedGoal, selectedLevel]);

    return (
        <div className="card">
            <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>🎯</span> Рекомендации по тренировкам
            </h2>

            <div className="space-y-3 mb-5">
                <div>
                    <label className="label text-xs">Цель</label>
                    <div className="flex flex-wrap gap-2">
                        {GOALS.map(g => (
                            <button
                                key={g.value}
                                onClick={() => setSelectedGoal(g.value)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                                    selectedGoal === g.value
                                        ? 'bg-primary-600 text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {g.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="label text-xs">Уровень</label>
                    <div className="flex flex-wrap gap-2">
                        {LEVELS.map(l => (
                            <button
                                key={l.value}
                                onClick={() => setSelectedLevel(l.value)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                                    selectedLevel === l.value
                                        ? 'bg-primary-600 text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {l.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {loading && (
                <div className="flex items-center justify-center py-6">
                    <svg className="animate-spin w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                </div>
            )}

            {error && !loading && (
                <div className="bg-red-50 text-red-600 rounded-xl p-3 text-sm text-center">{error}</div>
            )}

            {recommendation && !loading && !error && (
                <div className="space-y-4 animate-fadeIn">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-primary-50 rounded-xl p-3">
                            <p className="text-xs font-medium text-primary-500 mb-0.5">Частота</p>
                            <p className="text-sm font-semibold text-primary-800">{recommendation.frequency}</p>
                        </div>
                        <div className="bg-accent-50 rounded-xl p-3">
                            <p className="text-xs font-medium text-accent-600 mb-0.5">Длительность</p>
                            <p className="text-sm font-semibold text-accent-700">{recommendation.duration}</p>
                        </div>
                    </div>

                    {recommendation.types?.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Типы тренировок</p>
                            <div className="flex flex-wrap gap-1.5">
                                {recommendation.types.map((type, i) => (
                                    <span key={i} className="badge-primary text-xs">{type}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {recommendation.tips?.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Советы</p>
                            <ul className="space-y-1.5">
                                {recommendation.tips.map((tip, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                        <span className="text-accent-500 shrink-0 mt-0.5">✓</span>
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default WorkoutRecommendations;
