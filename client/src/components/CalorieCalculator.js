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

        let bmr;
        if (user.gender === 'male') {
            bmr = 88.362 + (13.397 * user.weight) + (4.799 * user.height) - (5.677 * user.age);
        } else {
            bmr = 447.593 + (9.247 * user.weight) + (3.098 * user.height) - (4.330 * user.age);
        }

        const activityMultipliers = {
            sedentary: 1.2,
            light: 1.375,
            moderate: 1.55,
            active: 1.725,
            veryActive: 1.9
        };

        const goalMultipliers = {
            lose: 0.85,
            maintain: 1,
            gain: 1.15
        };

        const tdee = bmr * activityMultipliers[formData.activityLevel];
        const targetCalories = Math.round(tdee * goalMultipliers[formData.goal]);

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
                <p className="text-gray-500 text-sm">Войдите, чтобы использовать калькулятор</p>
            </div>
        );
    }

    return (
        <div className="card">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
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
                    <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-4 text-center">
                        <p className="text-xs text-primary-600 font-medium mb-1">Рекомендуемая норма</p>
                        <p className="text-3xl font-bold text-primary-700">{result.targetCalories}</p>
                        <p className="text-xs text-primary-500">ккал / день</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-blue-50 rounded-xl p-2">
                            <p className="text-xs text-blue-500 font-medium">Белки</p>
                            <p className="text-base font-bold text-blue-700">{result.protein}г</p>
                        </div>
                        <div className="bg-amber-50 rounded-xl p-2">
                            <p className="text-xs text-amber-500 font-medium">Жиры</p>
                            <p className="text-base font-bold text-amber-700">{result.fat}г</p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-2">
                            <p className="text-xs text-green-500 font-medium">Углеводы</p>
                            <p className="text-base font-bold text-green-700">{result.carbs}г</p>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>Белки (30%)</span>
                            <span>{result.protein}г</span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill bg-blue-400" style={{ width: '30%' }} />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>Жиры (30%)</span>
                            <span>{result.fat}г</span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill bg-amber-400" style={{ width: '30%' }} />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>Углеводы (40%)</span>
                            <span>{result.carbs}г</span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill bg-green-400" style={{ width: '40%' }} />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-1">
                        <div className="flex-1 text-center">
                            <p className="text-xs text-gray-400">БОВ</p>
                            <p className="text-sm font-semibold text-gray-600">{result.bmr}</p>
                        </div>
                        <div className="w-px bg-gray-100" />
                        <div className="flex-1 text-center">
                            <p className="text-xs text-gray-400">TDEE</p>
                            <p className="text-sm font-semibold text-gray-600">{result.tdee}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


export default CalorieCalculator;
