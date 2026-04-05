import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';

const CalorieCalculator = () => {
    const { user } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        activityLevel: 'moderate',
        goal: 'maintain'
    });
    const [result, setResult] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const calculateCalories = useCallback(() => {
        if (!user) return;

        // Mifflin-St Jeor formula (most accurate for BMR estimation)
        let bmr;
        if (user.gender === 'male') {
            bmr = 10 * user.weight + 6.25 * user.height - 5 * user.age + 5;
        } else {
            bmr = 10 * user.weight + 6.25 * user.height - 5 * user.age - 161;
        }

        const activityMultipliers = {
            sedentary: 1.2,
            light: 1.375,
            moderate: 1.55,
            active: 1.725,
            veryActive: 1.9
        };

        // Fixed calorie adjustments per goal (standard clinical recommendations)
        const goalAdjustments = {
            lose:     -500, // deficit −500 kcal/day ≈ −0.5 kg/week
            maintain:    0,
            gain:     +300, // surplus +300 kcal/day for lean muscle gain
        };

        const tdee = bmr * activityMultipliers[formData.activityLevel];
        const targetCalories = Math.round(tdee + goalAdjustments[formData.goal]);

        const protein = Math.round((targetCalories * 0.30) / 4);
        const fat = Math.round((targetCalories * 0.30) / 9);
        const carbs = Math.round((targetCalories * 0.40) / 4);

        setResult({
            bmr: Math.round(bmr),
            tdee: Math.round(tdee),
            targetCalories,
            protein,
            fat,
            carbs
        });
    }, [user, formData.activityLevel, formData.goal]);

    useEffect(() => {
        if (user) calculateCalories();
    }, [user, calculateCalories]);

    if (!user) {
        return (
            <div className="card">
                <p className="text-gray-500 dark:text-slate-400 text-sm">Войдите, чтобы использовать калькулятор</p>
            </div>
        );
    }

    return (
        <div className="card">
            <h3 className="text-base font-semibold text-gray-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <span className="text-lg">🔢</span> Калькулятор калорий
            </h3>

            <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                    <label className="label text-xs">Активность</label>
                    <select
                        name="activityLevel"
                        value={formData.activityLevel}
                        onChange={handleChange}
                        className="input text-sm py-2"
                    >
                        <option value="sedentary">Сидячий</option>
                        <option value="light">Лёгкая</option>
                        <option value="moderate">Умеренная</option>
                        <option value="active">Высокая</option>
                        <option value="veryActive">Очень высокая</option>
                    </select>
                </div>
                <div>
                    <label className="label text-xs">Цель</label>
                    <select
                        name="goal"
                        value={formData.goal}
                        onChange={handleChange}
                        className="input text-sm py-2"
                    >
                        <option value="lose">Похудение</option>
                        <option value="maintain">Поддержание</option>
                        <option value="gain">Набор массы</option>
                    </select>
                </div>
            </div>

            {result && (
                <div className="space-y-3">
                    <div className="bg-gradient-to-r from-violet-50 to-violet-100 dark:from-violet-900/30 dark:to-violet-800/20 rounded-xl p-4 text-center">
                        <p className="text-xs text-violet-600 dark:text-violet-400 font-medium mb-1">Рекомендуемая норма</p>
                        <p className="text-3xl font-bold text-violet-700 dark:text-violet-300">{result.targetCalories}</p>
                        <p className="text-xs text-violet-500 dark:text-violet-400">ккал / день</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-2">
                            <p className="text-xs text-blue-500 dark:text-blue-400 font-medium">Белки</p>
                            <p className="text-base font-bold text-blue-700 dark:text-blue-300">{result.protein}г</p>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-2">
                            <p className="text-xs text-amber-500 dark:text-amber-400 font-medium">Жиры</p>
                            <p className="text-base font-bold text-amber-700 dark:text-amber-300">{result.fat}г</p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-2">
                            <p className="text-xs text-green-500 dark:text-green-400 font-medium">Углеводы</p>
                            <p className="text-base font-bold text-green-700 dark:text-green-300">{result.carbs}г</p>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400">
                            <span>Белки (30%)</span>
                            <span>{result.protein}г</span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill bg-blue-400" style={{ width: '30%' }} />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400">
                            <span>Жиры (30%)</span>
                            <span>{result.fat}г</span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill bg-amber-400" style={{ width: '30%' }} />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400">
                            <span>Углеводы (40%)</span>
                            <span>{result.carbs}г</span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill bg-green-400" style={{ width: '40%' }} />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-1">
                        <div className="flex-1 text-center">
                            <p className="text-xs text-gray-400 dark:text-slate-500">БОВ</p>
                            <p className="text-sm font-semibold text-gray-600 dark:text-slate-300">{result.bmr}</p>
                        </div>
                        <div className="w-px bg-gray-100 dark:bg-slate-700" />
                        <div className="flex-1 text-center">
                            <p className="text-xs text-gray-400 dark:text-slate-500">TDEE</p>
                            <p className="text-sm font-semibold text-gray-600 dark:text-slate-300">{result.tdee}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalorieCalculator;
