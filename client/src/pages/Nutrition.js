import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { NotificationContext } from '../context/NotificationContext';
import { useLang } from '../context/LanguageContext';

const MEAL_TYPES_STATIC = {
    breakfast: { icon: '🌅', color: 'from-orange-50 to-amber-50', accent: 'text-amber-600', badge: 'bg-amber-100 text-amber-700' },
    lunch:     { icon: '☀️', color: 'from-yellow-50 to-lime-50',  accent: 'text-lime-600',  badge: 'bg-lime-100 text-lime-700' },
    dinner:    { icon: '🌙', color: 'from-indigo-50 to-violet-50', accent: 'text-violet-600', badge: 'bg-violet-100 text-violet-700' },
    snack:     { icon: '🍎', color: 'from-green-50 to-emerald-50', accent: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
};

const emptyForm = { name: '', calories: '', protein: '', fat: '', carbs: '', portion: '100', mealType: 'breakfast' };

const Nutrition = () => {
    const { showNotification } = useContext(NotificationContext);
    const { t } = useLang();
    const MEAL_TYPES = {
        breakfast: { label: t('nutr_meal_breakfast'), ...MEAL_TYPES_STATIC.breakfast },
        lunch:     { label: t('nutr_meal_lunch'),     ...MEAL_TYPES_STATIC.lunch },
        dinner:    { label: t('nutr_meal_dinner'),    ...MEAL_TYPES_STATIC.dinner },
        snack:     { label: t('nutr_meal_snack'),     ...MEAL_TYPES_STATIC.snack },
    };
    const [data, setData] = useState({ meals: [], dailyTotals: { calories: 0, protein: 0, fat: 0, carbs: 0 } });
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);

    const fetchEntries = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/api/nutrition/entries?date=${selectedDate}`);
            setData(res.data || { meals: [], dailyTotals: { calories: 0, protein: 0, fat: 0, carbs: 0 } });
        } catch (err) {
            console.error('Ошибка загрузки питания:', err);
            setData({ meals: [], dailyTotals: { calories: 0, protein: 0, fat: 0, carbs: 0 } });
        } finally {
            setLoading(false);
        }
    }, [selectedDate]);

    useEffect(() => { fetchEntries(); }, [fetchEntries]);

    const handleSearch = async (q) => {
        setSearchQuery(q);
        if (!q.trim()) { setSearchResults([]); return; }
        setSearching(true);
        try {
            const res = await axios.get(`/api/nutrition/foods/search?q=${encodeURIComponent(q)}`);
            setSearchResults(res.data || []);
        } catch { setSearchResults([]); }
        finally { setSearching(false); }
    };

    const fillFromSearch = (food) => {
        const portion = Number(formData.portion) || 100;
        const factor = portion / 100;
        setFormData(prev => ({
            ...prev,
            name: food.name,
            calories: Math.round(food.calories * factor),
            protein: Math.round(food.protein * factor * 10) / 10,
            fat: Math.round(food.fat * factor * 10) / 10,
            carbs: Math.round(food.carbs * factor * 10) / 10,
        }));
        setSearchResults([]);
        setSearchQuery('');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePortionChange = (e) => {
        setFormData(prev => ({ ...prev, portion: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.calories) {
            showNotification(t('nutr_err_fields'), 'error');
            return;
        }
        setSubmitting(true);
        try {
            await axios.post('/api/nutrition/entries', {
                date: selectedDate,
                mealType: formData.mealType,
                products: [{
                    name: formData.name.trim(),
                    portion: Number(formData.portion) || 100,
                    calories: Number(formData.calories),
                    protein: Number(formData.protein) || 0,
                    fat: Number(formData.fat) || 0,
                    carbs: Number(formData.carbs) || 0,
                }],
            });
            showNotification(t('nutr_added'), 'success');
            setFormData(emptyForm);
            setShowForm(false);
            fetchEntries();
        } catch (err) {
            showNotification(err.response?.data?.message || t('nutr_err_add'), 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/nutrition/entries/${id}`);
            showNotification(t('nutr_deleted'), 'success');
            fetchEntries();
        } catch {
            showNotification(t('nutr_err_delete'), 'error');
        }
    };

    const goToday = () => setSelectedDate(dayjs().format('YYYY-MM-DD'));
    const changeDay = (delta) => setSelectedDate(dayjs(selectedDate).add(delta, 'day').format('YYYY-MM-DD'));

    const { dailyTotals } = data;
    const isToday = selectedDate === dayjs().format('YYYY-MM-DD');

    const getMealEntries = (mealType) =>
        (data.meals || []).find(m => m.mealType === mealType);

    const totalEntries = (data.meals || []).reduce((sum, m) => sum + (m.entries || []).length, 0);

    return (
        <div className="container mx-auto px-4 py-8 animate-fadeIn max-w-4xl">
            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">🥗 {t('nutr_title')}</h1>
                    <p className="text-gray-400 dark:text-slate-500 mt-0.5 text-sm">{t('nutr_subtitle')}</p>
                </div>
                <button onClick={() => { setShowForm(!showForm); setSearchQuery(''); setSearchResults([]); }} className="btn-primary shrink-0">
                    {showForm ? t('nutr_cancel_btn') : t('nutr_add_btn')}
                </button>
            </div>

            {/* Date navigation */}
            <div className="card mb-6 p-4 flex items-center justify-between">
                <button onClick={() => changeDay(-1)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="flex items-center gap-3">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={e => setSelectedDate(e.target.value)}
                        className="input w-auto text-sm text-center"
                    />
                    {!isToday && (
                        <button onClick={goToday} className="text-xs text-primary-600 hover:underline font-medium">{t('nutr_today')}</button>
                    )}
                </div>
                <button onClick={() => changeDay(1)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>

            {/* Add form */}
            {showForm && (
                <div className="card mb-6 animate-slideUp">
                    <h3 className="text-base font-semibold text-gray-800 dark:text-slate-100 mb-4">{t('nutr_add_meal_title')}</h3>

                    {/* Food search */}
                    <div className="mb-4 relative">
                        <label className="label">{t('nutr_search_label')}</label>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => handleSearch(e.target.value)}
                            className="input"
                            placeholder={t('nutr_search_placeholder')}
                        />
                        {searching && <p className="text-xs text-gray-400 mt-1">{t('nutr_searching')}</p>}
                        {searchResults.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl shadow-lg max-h-52 overflow-y-auto">
                                {searchResults.map(food => (
                                    <button
                                        key={food.name}
                                        type="button"
                                        onClick={() => fillFromSearch(food)}
                                        className="w-full text-left px-4 py-2.5 hover:bg-primary-50 dark:hover:bg-violet-900/30 transition-colors text-sm border-b border-gray-50 dark:border-slate-700 last:border-0"
                                    >
                                        <span className="font-medium text-gray-800 dark:text-slate-100">{food.name}</span>
                                        <span className="text-gray-400 dark:text-slate-500 ml-2 text-xs">{food.calories} {t('nutr_per100g')} · Б{food.protein} Ж{food.fat} У{food.carbs}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="label">{t('nutr_dish_label')}</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} className="input" placeholder={t('nutr_dish_placeholder')} required />
                            </div>
                            <div>
                                <label className="label">{t('nutr_meal_type')}</label>
                                <select name="mealType" value={formData.mealType} onChange={handleChange} className="input">
                                    {Object.entries(MEAL_TYPES).map(([k, v]) => (
                                        <option key={k} value={k}>{v.icon} {v.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            <div>
                                <label className="label">{t('nutr_portion')}</label>
                                <input type="number" name="portion" value={formData.portion} onChange={handlePortionChange} className="input" min="1" placeholder="г" />
                            </div>
                            <div>
                                <label className="label">{t('nutr_calories_label')}</label>
                                <input type="number" name="calories" value={formData.calories} onChange={handleChange} className="input" placeholder="ккал" min="0" required />
                            </div>
                            <div>
                                <label className="label">{t('nutr_protein')}</label>
                                <input type="number" name="protein" value={formData.protein} onChange={handleChange} className="input" placeholder="г" min="0" step="0.1" />
                            </div>
                            <div>
                                <label className="label">{t('nutr_fat')}</label>
                                <input type="number" name="fat" value={formData.fat} onChange={handleChange} className="input" placeholder="г" min="0" step="0.1" />
                            </div>
                            <div>
                                <label className="label">{t('nutr_carbs')}</label>
                                <input type="number" name="carbs" value={formData.carbs} onChange={handleChange} className="input" placeholder="г" min="0" step="0.1" />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-1">
                            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">{t('nutr_cancel')}</button>
                            <button type="submit" disabled={submitting} className="btn-primary">
                                {submitting ? t('nutr_saving') : t('nutr_save')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Daily summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                    { label: t('nutr_total_calories'), value: Math.round(dailyTotals.calories || 0), unit: t('nutr_kcal'), bg: 'from-violet-50 to-purple-50 dark:from-violet-950/60 dark:to-purple-950/40', text: 'text-violet-700 dark:text-violet-300', icon: '🔥' },
                    { label: t('nutr_total_protein'),   value: Math.round(dailyTotals.protein || 0),  unit: 'г',    bg: 'from-blue-50 to-sky-50 dark:from-blue-950/60 dark:to-sky-950/40',        text: 'text-blue-700 dark:text-blue-300',   icon: '💪' },
                    { label: t('nutr_total_fat'),    value: Math.round(dailyTotals.fat || 0),      unit: 'г',    bg: 'from-amber-50 to-yellow-50 dark:from-amber-950/60 dark:to-yellow-950/40', text: 'text-amber-700 dark:text-amber-300',  icon: '🧈' },
                    { label: t('nutr_total_carbs'),value: Math.round(dailyTotals.carbs || 0),    unit: 'г',    bg: 'from-green-50 to-emerald-50 dark:from-green-950/60 dark:to-emerald-950/40', text: 'text-green-700 dark:text-green-300',  icon: '🌾' },
                ].map(stat => (
                    <div key={stat.label} className={`bg-gradient-to-br ${stat.bg} rounded-2xl p-4 border border-white dark:border-slate-700/60`}>
                        <div className="text-xl mb-1">{stat.icon}</div>
                        <p className={`text-xl font-bold ${stat.text}`}>{stat.value}<span className="text-sm font-normal ml-1">{stat.unit}</span></p>
                        <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Entries by meal */}
            {loading ? (
                <div className="space-y-4 animate-pulse">
                    {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-gray-100 rounded-2xl" />)}
                </div>
            ) : totalEntries === 0 ? (
                <div className="card text-center py-16">
                    <div className="text-5xl mb-4">🥗</div>
                    <p className="text-gray-600 dark:text-slate-300 font-semibold text-lg">{t('nutr_no_entries')}</p>
                    <p className="text-gray-400 dark:text-slate-500 text-sm mt-1">{t('nutr_no_entries_hint')}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {Object.entries(MEAL_TYPES).map(([type, meta]) => {
                        const mealData = getMealEntries(type);
                        if (!mealData || !mealData.entries || mealData.entries.length === 0) return null;
                        const mealCals = Math.round(mealData.totals?.calories || 0);
                        return (
                            <div key={type} className={`bg-gradient-to-br ${meta.color} dark:bg-none dark:bg-slate-800/80 rounded-2xl border border-white dark:border-slate-700 shadow-sm overflow-hidden`}>
                                <div className="flex items-center justify-between px-5 py-4 border-b border-white/60 dark:border-slate-700">
                                    <h3 className="font-semibold text-gray-800 dark:text-slate-100 flex items-center gap-2">
                                        <span className="text-xl">{meta.icon}</span>
                                        {meta.label}
                                    </h3>
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${meta.badge}`}>{mealCals} {t('nutr_kcal')}</span>
                                </div>
                                <div className="p-3 space-y-2">
                                    {mealData.entries.map(entry =>
                                        (entry.products || []).map((product, pi) => (
                                            <div key={`${entry._id}-${pi}`} className="flex items-center justify-between bg-white/70 dark:bg-slate-700/60 backdrop-blur-sm rounded-xl px-4 py-3 hover:bg-white/90 dark:hover:bg-slate-700 transition-colors group">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-800 dark:text-slate-100 text-sm truncate">{product.name}</p>
                                                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                                                        {product.portion}г · Б{product.protein || 0} Ж{product.fat || 0} У{product.carbs || 0}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3 ml-3">
                                                    <span className={`text-sm font-semibold ${meta.accent}`}>{product.calories} {t('nutr_kcal')}</span>
                                                    <button
                                                        onClick={() => handleDelete(entry._id)}
                                                        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all"
                                                        title={t('nutr_delete_entry')}
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Nutrition;
