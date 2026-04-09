import React, { useState, useEffect, useContext } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import 'dayjs/locale/en';
import Modal from './Modal';
import WorkoutForm from './WorkoutForm';
import GoalForm from './GoalForm';
import { NotificationContext } from '../context/NotificationContext';
import { useLang } from '../context/LanguageContext';
import axios from 'axios';
import useAuth from '../hooks/useAuth';

const Calendar = () => {
    const { showNotification } = useContext(NotificationContext);
    const { isAuthenticated } = useAuth();
    const { lang, t } = useLang();
    dayjs.locale(lang === 'en' ? 'en' : 'ru');
    const [currentDate, setCurrentDate] = useState(dayjs());
    const [calendarDays, setCalendarDays] = useState([]);
    const [workouts, setWorkouts] = useState([]);
    const [goals, setGoals] = useState([]);
    const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedWorkout, setSelectedWorkout] = useState(null);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [isViewWorkoutModalOpen, setIsViewWorkoutModalOpen] = useState(false);
    const [isViewGoalModalOpen, setIsViewGoalModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!isAuthenticated) return;

                const startOfMonth = currentDate.startOf('month').format('YYYY-MM-DD');
                const endOfMonth = currentDate.endOf('month').format('YYYY-MM-DD');

                const workoutsRes = await axios.get('/api/workouts');
                const allWorkouts = workoutsRes.data;

                const filteredWorkouts = allWorkouts.filter(workout => {
                    const workoutDate = dayjs(workout.date);
                    return workoutDate.isAfter(dayjs(startOfMonth).subtract(1, 'day')) &&
                        workoutDate.isBefore(dayjs(endOfMonth).add(1, 'day'));
                });

                const goalsRes = await axios.get('/api/goals');
                const allGoals = goalsRes.data;

                setWorkouts(filteredWorkouts);
                setGoals(allGoals);
            } catch (err) {
                console.error('[Calendar] load error:', err);
                showNotification(t('cal_load_err'), 'error');
            }
        };

        fetchData();
    }, [currentDate, isAuthenticated, showNotification]);

    useEffect(() => {
        const firstDayOfMonth = currentDate.startOf('month');
        const lastDayOfMonth = currentDate.endOf('month');
        const startDay = firstDayOfMonth.day() === 0 ? 6 : firstDayOfMonth.day() - 1;

        const days = [];

        for (let i = startDay - 1; i >= 0; i--) {
            days.push({
                date: firstDayOfMonth.subtract(i + 1, 'day'),
                isCurrentMonth: false
            });
        }

        for (let i = 0; i < lastDayOfMonth.date(); i++) {
            days.push({
                date: firstDayOfMonth.add(i, 'day'),
                isCurrentMonth: true
            });
        }

        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            days.push({
                date: lastDayOfMonth.add(i, 'day'),
                isCurrentMonth: false
            });
        }

        setCalendarDays(days);
    }, [currentDate]);

    const goToPreviousMonth = () => setCurrentDate(currentDate.subtract(1, 'month'));
    const goToNextMonth = () => setCurrentDate(currentDate.add(1, 'month'));

    const openWorkoutModal = (date) => {
        setSelectedDate(date || dayjs());
        setIsWorkoutModalOpen(true);
    };

    const openGoalModal = () => setIsGoalModalOpen(true);

    const openViewWorkoutModal = (workout, e) => {
        e.stopPropagation();
        setSelectedWorkout(workout);
        setIsViewWorkoutModalOpen(true);
    };

    const openViewGoalModal = (goal, e) => {
        e.stopPropagation();
        setSelectedGoal(goal);
        setIsViewGoalModalOpen(true);
    };

    const handleAddWorkout = async (workoutData) => {
        try {
            if (!isAuthenticated) {
                showNotification(t('cal_login_req'), 'error');
                ...workoutData,
                duration: Number(workoutData.duration)
            };

            const response = await axios.post('/api/workouts', numericWorkoutData);
            const newWorkout = response.data;
            setWorkouts([...workouts, newWorkout]);
            setIsWorkoutModalOpen(false);
            showNotification(t('cal_workout_added'), 'success');
        } catch (err) {
            console.error('[Calendar] add workout error:', err.response?.data || err.message);
            showNotification(
                err.response?.data?.message || t('cal_workout_add_err'),
                'error'
            );
        }
    };

    const handleAddGoal = async (goalData) => {
        try {
            if (!isAuthenticated) {
                showNotification(t('cal_login_req'), 'error');
                return;
            }

            const numericGoalData = {
                ...goalData,
                startValue: Number(goalData.startValue),
                currentValue: Number(goalData.currentValue || goalData.startValue),
                targetValue: Number(goalData.targetValue)
            };

            const response = await axios.post('/api/goals', numericGoalData);
            const newGoal = response.data;
            setGoals([...goals, newGoal]);
            setIsGoalModalOpen(false);
            showNotification(t('cal_goal_added'), 'success');
        } catch (err) {
            console.error('[Calendar] add goal error:', err.response?.data || err.message);
            showNotification(
                err.response?.data?.message || t('cal_goal_add_err'),
                'error'
            );
        }
    };

    const handleDeleteWorkout = async (workoutId) => {
        try {
            await axios.delete(`/api/workouts/${workoutId}`);
            setWorkouts(prev => prev.filter(w => w._id !== workoutId));
            setIsViewWorkoutModalOpen(false);
            showNotification(t('cal_deleted'), 'success');
        } catch (err) {
            console.error('[Calendar] delete workout error:', err);
            showNotification(t('cal_delete_err'), 'error');
        }
    };

    const getWorkoutsForDay = (date) => {
        return workouts.filter(workout =>
            dayjs(workout.date).format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
        );
    };

    const getGoalsForDay = (date) => {
        return goals.filter(goal =>
            dayjs(goal.deadline).format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
        );
    };

    // Locale-aware Mon→Sun header: dayjs day() 0=Sun,1=Mon…6=Sat; we shift +1 mod 7
    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = dayjs().day((i + 1) % 7).format('dd');
        return d.charAt(0).toUpperCase() + d.slice(1);
    });

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 transition-colors duration-200">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">
                    {currentDate.format('MMMM YYYY')}
                </h2>
                <div className="flex space-x-2">
                    <button
                        onClick={goToPreviousMonth}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 transition-colors"
                    >
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={goToNextMonth}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 transition-colors"
                    >
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1">
                {weekDays.map(day => (
                    <div key={day} className="text-center py-2 font-semibold text-sm text-gray-600 dark:text-slate-400">
                        {day}
                    </div>
                ))}

                {calendarDays.map((day, index) => {
                    const dayWorkouts = getWorkoutsForDay(day.date);
                    const dayGoals = getGoalsForDay(day.date);
                    const isToday = day.date.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD');

                    return (
                        <div
                            key={index}
                            onClick={() => openWorkoutModal(day.date)}
                            className={`
                                min-h-[100px] p-1 border cursor-pointer transition-colors duration-150
                                ${!day.isCurrentMonth
                                    ? 'bg-gray-50 dark:bg-slate-800/50 border-gray-100 dark:border-slate-700/50'
                                    : 'border-gray-200 dark:border-slate-600 hover:bg-violet-50/30 dark:hover:bg-violet-900/10'
                                }
                                ${isToday ? 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-700' : ''}
                            `}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span
                                    className={`text-sm font-medium rounded-full w-6 h-6 flex items-center justify-center
                                        ${isToday ? 'bg-violet-600 text-white' : ''}
                                        ${!day.isCurrentMonth ? 'text-gray-400 dark:text-slate-600' : 'text-gray-700 dark:text-slate-300'}
                                    `}
                                >
                                    {day.date.date()}
                                </span>
                                {dayWorkouts.length > 0 && (
                                    <span className="bg-violet-600 text-xs text-white px-1.5 py-0.5 rounded-full font-medium">
                                        {dayWorkouts.length}
                                    </span>
                                )}
                            </div>

                            <div className="space-y-1">
                                {dayWorkouts.slice(0, 2).map(workout => (
                                    <div
                                        key={workout._id}
                                        onClick={(e) => openViewWorkoutModal(workout, e)}
                                        className="text-xs p-1 rounded bg-violet-100 dark:bg-violet-900/40 text-violet-800 dark:text-violet-300 truncate"
                                    >
                                        {workout.time} - {workout.type}
                                    </div>
                                ))}
                                {dayWorkouts.length > 2 && (
                                    <div className="text-xs text-gray-500 dark:text-slate-500">
                                        +{dayWorkouts.length - 2} еще
                                    </div>
                                )}

                                {dayGoals.map(goal => (
                                    <div
                                        key={goal._id}
                                        onClick={(e) => openViewGoalModal(goal, e)}
                                        className="text-xs p-1 rounded bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 truncate"
                                    >
                                        {goal.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-between items-center mt-4">
                <button
                    onClick={openGoalModal}
                    className="btn-secondary"
                >
                    🎯 {t('cal_add_goal')}
                </button>
                <button
                    onClick={() => openWorkoutModal()}
                    className="btn-primary"
                >
                    + {t('cal_add_workout')}
                </button>
            </div>

            {/* Workout add modal */}
            <Modal
                isOpen={isWorkoutModalOpen}
                onClose={() => setIsWorkoutModalOpen(false)}
                title="Добавление тренировки"
            >
                <WorkoutForm
                    onSubmit={handleAddWorkout}
                    initialDate={selectedDate}
                />
            </Modal>

            {/* Goal add modal */}
            <Modal
                isOpen={isGoalModalOpen}
                onClose={() => setIsGoalModalOpen(false)}
                title="Добавление цели"
            >
                <GoalForm onSubmit={handleAddGoal} />
            </Modal>

            {/* Workout view modal */}
            <Modal
                isOpen={isViewWorkoutModalOpen}
                onClose={() => setIsViewWorkoutModalOpen(false)}
                title="Информация о тренировке"
            >
                {selectedWorkout && (
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                {selectedWorkout.type}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-slate-400">
                                {dayjs(selectedWorkout.date).format('DD.MM.YYYY')} в {selectedWorkout.time}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500 dark:text-slate-400">Продолжительность</p>
                            <p className="font-medium text-gray-800 dark:text-slate-200">{selectedWorkout.duration} минут</p>
                        </div>

                        {selectedWorkout.caloriesBurned > 0 && (
                            <div>
                                <p className="text-sm text-gray-500 dark:text-slate-400">Сожжено калорий</p>
                                <p className="font-medium text-gray-800 dark:text-slate-200">{selectedWorkout.caloriesBurned} ккал</p>
                            </div>
                        )}

                        {selectedWorkout.comment && (
                            <div>
                                <p className="text-sm text-gray-500 dark:text-slate-400">Комментарий</p>
                                <p className="font-medium text-gray-800 dark:text-slate-200">{selectedWorkout.comment}</p>
                            </div>
                        )}

                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => handleDeleteWorkout(selectedWorkout._id)}
                                className="btn-danger text-sm py-2 px-4"
                            >
                                🗑️ {t('cal_delete')}
                            </button>
                            <button
                                onClick={() => setIsViewWorkoutModalOpen(false)}
                                className="btn-secondary"
                            >
                                Закрыть
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Goal view modal */}
            <Modal
                isOpen={isViewGoalModalOpen}
                onClose={() => setIsViewGoalModalOpen(false)}
                title="Информация о цели"
            >
                {selectedGoal && (
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                {selectedGoal.title}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-slate-400">
                                Дедлайн: {dayjs(selectedGoal.deadline).format('DD.MM.YYYY')}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500 dark:text-slate-400">Прогресс</p>
                            <div className="progress-bar mt-1">
                                <div
                                    className="progress-fill bg-violet-500"
                                    style={{
                                        width: `${Math.min(100, Math.max(0, ((selectedGoal.currentValue - selectedGoal.startValue) / (selectedGoal.targetValue - selectedGoal.startValue)) * 100))}%`
                                    }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400 mt-1">
                                <span>{selectedGoal.startValue}</span>
                                <span>{selectedGoal.currentValue}</span>
                                <span>{selectedGoal.targetValue}</span>
                            </div>
                        </div>

                        {selectedGoal.description && (
                            <div>
                                <p className="text-sm text-gray-500 dark:text-slate-400">Описание</p>
                                <p className="font-medium text-gray-800 dark:text-slate-200">{selectedGoal.description}</p>
                            </div>
                        )}

                        <div className="flex justify-end">
                            <button
                                onClick={() => setIsViewGoalModalOpen(false)}
                                className="btn-secondary"
                            >
                                Закрыть
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Calendar;
