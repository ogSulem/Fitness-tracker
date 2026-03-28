import React, { useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { AuthContext } from '../context/AuthContext';
import Calendar from '../components/Calendar';
import CalorieCalculator from '../components/CalorieCalculator';
import DailyStats from '../components/DailyStats';
import WorkoutRecommendations from '../components/WorkoutRecommendations';

dayjs.locale('ru');

const QuickActionCard = ({ icon, title, description, onClick, gradient }) => (
    <button
        onClick={onClick}
        className={`w-full text-left p-4 rounded-xl border border-gray-100 bg-white hover:shadow-md transition-all duration-200 group`}
    >
        <div className={`w-10 h-10 rounded-xl ${gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
            <span className="text-xl">{icon}</span>
        </div>
        <p className="font-semibold text-gray-800 text-sm">{title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
    </button>
);

const Home = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const calendarRef = useRef(null);

    const targetCalories = (() => {
        if (!user) return 2000;
        let bmr;
        if (user.gender === 'male') {
            bmr = 88.362 + (13.397 * (user.weight || 70)) + (4.799 * (user.height || 175)) - (5.677 * (user.age || 25));
        } else {
            bmr = 447.593 + (9.247 * (user.weight || 60)) + (3.098 * (user.height || 165)) - (4.330 * (user.age || 25));
        }
        return Math.round(bmr * 1.55);
    })();

    const today = dayjs().format('dddd, D MMMM YYYY');
    const capitalToday = today.charAt(0).toUpperCase() + today.slice(1);

    return (
        <div className="container mx-auto px-4 py-8 animate-fadeIn">
            {/* Greeting header */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                            Привет, {user?.name?.split(' ')[0] || 'Пользователь'}! 👋
                        </h1>
                        <p className="text-gray-400 mt-1 capitalize">{capitalToday}</p>
                    </div>
                    <div className="flex gap-2">
                        <span className="badge-primary text-sm px-3 py-1.5">
                            🎯 Цель: {targetCalories} ккал
                        </span>
                    </div>
                </div>
            </div>

            {/* Daily Stats - full width */}
            <div className="mb-8">
                <DailyStats targetCalories={targetCalories} />
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Calendar - takes 2/3 */}
                <div ref={calendarRef} className="lg:col-span-2">
                    <Calendar />
                </div>

                {/* Right sidebar - takes 1/3 */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="card">
                        <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <span>⚡</span> Быстрые действия
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                            <QuickActionCard
                                icon="🏋️"
                                title="Добавить тренировку"
                                description="Записать активность"
                                gradient="bg-gradient-to-br from-primary-100 to-primary-200"
                                onClick={() => calendarRef.current?.scrollIntoView({ behavior: 'smooth' })}
                            />
                            <QuickActionCard
                                icon="🥗"
                                title="Добавить приём пищи"
                                description="Записать питание"
                                gradient="bg-gradient-to-br from-green-100 to-emerald-200"
                                onClick={() => navigate('/nutrition')}
                            />
                            <QuickActionCard
                                icon="📊"
                                title="Посмотреть аналитику"
                                description="Графики и статистика"
                                gradient="bg-gradient-to-br from-sky-100 to-blue-200"
                                onClick={() => navigate('/analytics')}
                            />
                        </div>
                    </div>

                    {/* Calorie Calculator compact */}
                    <CalorieCalculator />

                    {/* Workout Recommendations */}
                    <WorkoutRecommendations />
                </div>
            </div>
        </div>
    );
};

export default Home; 