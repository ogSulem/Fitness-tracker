import React, { useState } from 'react';
import dayjs from 'dayjs';

const GOAL_TYPES = [
    { value: 'вес',      label: '⚖️ Вес',               unit: 'кг' },
    { value: 'частота',  label: '🔄 Частота тренировок', unit: 'тр/нед' },
    { value: 'дистанция',label: '📏 Дистанция',          unit: 'км' },
    { value: 'сила',     label: '💪 Сила',               unit: 'кг' },
    { value: 'другое',   label: '🎯 Другое',              unit: '' },
];

const GoalForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        title: '',
        type: 'вес',
        startValue: '',
        currentValue: '',
        targetValue: '',
        unit: 'кг',
        deadline: dayjs().add(30, 'day').format('YYYY-MM-DD'),
        description: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        const updated = { ...formData, [name]: value };
        if (name === 'type') {
            const typeInfo = GOAL_TYPES.find(t => t.value === value);
            updated.unit = typeInfo?.unit || '';
        }
        setFormData(updated);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            currentValue: formData.currentValue || formData.startValue,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="label">Название цели *</label>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="input"
                    placeholder="Например: Сбросить 5 кг"
                    required
                />
            </div>

            <div>
                <label className="label">Тип цели *</label>
                <div className="flex flex-wrap gap-2">
                    {GOAL_TYPES.map(t => (
                        <label
                            key={t.value}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 cursor-pointer transition-all text-sm font-medium ${
                                formData.type === t.value
                                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                                    : 'border-gray-200 text-gray-600 hover:border-primary-200'
                            }`}
                        >
                            <input
                                type="radio"
                                name="type"
                                value={t.value}
                                checked={formData.type === t.value}
                                onChange={handleChange}
                                className="hidden"
                            />
                            {t.label}
                        </label>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="label">Начальное значение *</label>
                    <input
                        type="number"
                        name="startValue"
                        value={formData.startValue}
                        onChange={handleChange}
                        className="input"
                        placeholder="Например: 80"
                        step="0.1"
                        required
                    />
                </div>
                <div>
                    <label className="label">Целевое значение *</label>
                    <input
                        type="number"
                        name="targetValue"
                        value={formData.targetValue}
                        onChange={handleChange}
                        className="input"
                        placeholder="Например: 70"
                        step="0.1"
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="label">Единица измерения</label>
                    <input
                        type="text"
                        name="unit"
                        value={formData.unit}
                        onChange={handleChange}
                        className="input"
                        placeholder="кг, км, раз..."
                    />
                </div>
                <div>
                    <label className="label">Дедлайн *</label>
                    <input
                        type="date"
                        name="deadline"
                        value={formData.deadline}
                        onChange={handleChange}
                        className="input"
                        min={dayjs().format('YYYY-MM-DD')}
                        required
                    />
                </div>
            </div>

            <div>
                <label className="label">Описание (необязательно)</label>
                <textarea
                    name="description"
                    rows="2"
                    value={formData.description}
                    onChange={handleChange}
                    className="input resize-none"
                    placeholder="Дополнительная информация о цели..."
                />
            </div>

            <button type="submit" className="btn-primary w-full">
                Сохранить цель
            </button>
        </form>
    );
};

export default GoalForm;
