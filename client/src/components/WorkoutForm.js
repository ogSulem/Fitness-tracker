import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';

const WORKOUT_TYPES = [
    { value: 'силовая',    label: '🏋️ Силовая',    defaultCal: 300 },
    { value: 'кардио',     label: '🏃 Кардио',      defaultCal: 400 },
    { value: 'растяжка',   label: '🤸 Растяжка',    defaultCal: 100 },
    { value: 'йога',       label: '🧘 Йога',         defaultCal: 150 },
    { value: 'плавание',   label: '🏊 Плавание',    defaultCal: 350 },
    { value: 'велосипед',  label: '🚴 Велосипед',   defaultCal: 380 },
    { value: 'бег',        label: '🏃 Бег',         defaultCal: 450 },
    { value: 'другое',     label: '⚡ Другое',       defaultCal: 200 },
];

const INTENSITY_OPTIONS = [
    { value: 'low',    label: '🟢 Низкая',    multiplier: 0.8 },
    { value: 'medium', label: '🟡 Средняя',   multiplier: 1.0 },
    { value: 'high',   label: '🔴 Высокая',   multiplier: 1.3 },
];

const WorkoutForm = ({ onSubmit, initialDate }) => {
    const [formData, setFormData] = useState({
        type: 'кардио',
        date: '',
        time: '09:00',
        duration: 45,
        intensity: 'medium',
        caloriesBurned: '',
        comment: '',
    });

    useEffect(() => {
        const date = initialDate ? initialDate.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');
        setFormData(prev => ({ ...prev, date }));
    }, [initialDate]);

    // Auto-calculate calories when type/duration/intensity change
    useEffect(() => {
        const typeInfo = WORKOUT_TYPES.find(t => t.value === formData.type);
        const intensityInfo = INTENSITY_OPTIONS.find(i => i.value === formData.intensity);
        if (typeInfo && intensityInfo && formData.duration) {
            const base = typeInfo.defaultCal;
            const mins = Number(formData.duration);
            const estimated = Math.round((base / 60) * mins * intensityInfo.multiplier);
            setFormData(prev => ({ ...prev, caloriesBurned: estimated }));
        }
    }, [formData.type, formData.duration, formData.intensity]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            duration: Number(formData.duration),
            caloriesBurned: Number(formData.caloriesBurned) || 0,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type */}
            <div>
                <label className="label">Тип тренировки *</label>
                <select name="type" value={formData.type} onChange={handleChange} className="input" required>
                    {WORKOUT_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                </select>
            </div>

            {/* Date + Time */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="label">Дата *</label>
                    <input type="date" name="date" value={formData.date} onChange={handleChange} className="input" required />
                </div>
                <div>
                    <label className="label">Время *</label>
                    <input type="time" name="time" value={formData.time} onChange={handleChange} className="input" required />
                </div>
            </div>

            {/* Duration + Intensity */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="label">Длительность, мин *</label>
                    <input type="number" name="duration" value={formData.duration} onChange={handleChange} className="input" min="5" max="480" required />
                </div>
                <div>
                    <label className="label">Интенсивность</label>
                    <select name="intensity" value={formData.intensity} onChange={handleChange} className="input">
                        {INTENSITY_OPTIONS.map(i => (
                            <option key={i.value} value={i.value}>{i.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Calories burned */}
            <div>
                <label className="label">Сожжено калорий (авторасчёт)</label>
                <div className="relative">
                    <input
                        type="number"
                        name="caloriesBurned"
                        value={formData.caloriesBurned}
                        onChange={handleChange}
                        className="input pr-14"
                        min="0"
                        placeholder="0"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">ккал</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Рассчитывается автоматически, можно изменить вручную</p>
            </div>

            {/* Comment */}
            <div>
                <label className="label">Комментарий</label>
                <textarea
                    name="comment"
                    rows="2"
                    value={formData.comment}
                    onChange={handleChange}
                    className="input resize-none"
                    placeholder="Заметки о тренировке..."
                />
            </div>

            <button type="submit" className="btn-primary w-full">
                Сохранить тренировку
            </button>
        </form>
    );
};

export default WorkoutForm;

    const [formData, setFormData] = useState({
        type: 'силовая',
        date: '',
        time: '09:00',
        duration: 60,
        comment: '',
    });

    // Установка начальной даты, если она передана
    useEffect(() => {
        if (initialDate) {
            setFormData(prev => ({
                ...prev,
                date: initialDate.format('YYYY-MM-DD')
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                date: dayjs().format('YYYY-MM-DD')
            }));
        }
    }, [initialDate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    Тип тренировки *
                </label>
                <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                    required
                >
                    <option value="силовая">Силовая</option>
                    <option value="кардио">Кардио</option>
                    <option value="растяжка">Растяжка</option>
                    <option value="йога">Йога</option>
                    <option value="плавание">Плавание</option>
                    <option value="другое">Другое</option>
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                        Дата *
                    </label>
                    <input
                        type="date"
                        id="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                        Время *
                    </label>
                    <input
                        type="time"
                        id="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                        required
                    />
                </div>
            </div>

            <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                    Продолжительность (минут) (необязательно)
                </label>
                <input
                    type="number"
                    id="duration"
                    name="duration"
                    min="5"
                    max="300"
                    value={formData.duration}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="По умолчанию: 60 минут"
                />
            </div>

            <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                    Комментарий (необязательно)
                </label>
                <textarea
                    id="comment"
                    name="comment"
                    rows="3"
                    value={formData.comment}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="Дополнительная информация о тренировке"
                />
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
    );
};

export default WorkoutForm; 