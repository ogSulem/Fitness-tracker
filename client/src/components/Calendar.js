import React, { useState, useEffect, useContext } from 'react';
import dayjs from 'dayjs';
import Modal from './Modal';
import WorkoutForm from './WorkoutForm';
import GoalForm from './GoalForm';
import { NotificationContext } from '../context/NotificationContext';
import axios from 'axios';
import useAuth from '../hooks/useAuth';

const Calendar = () => {
    const { showNotification } = useContext(NotificationContext);
    const { isAuthenticated } = useAuth();
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

    // Получение данных о тренировках и целях
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!isAuthenticated) return;

                const startOfMonth = currentDate.startOf('month').format('YYYY-MM-DD');
                const endOfMonth = currentDate.endOf('month').format('YYYY-MM-DD');

                // Получаем тренировки из API
                const workoutsRes = await axios.get('/api/workouts');
                const allWorkouts = workoutsRes.data;

                // Фильтруем тренировки для текущего месяца
                const filteredWorkouts = allWorkouts.filter(workout => {
                    const workoutDate = dayjs(workout.date);
                    return workoutDate.isAfter(dayjs(startOfMonth).subtract(1, 'day')) &&
                        workoutDate.isBefore(dayjs(endOfMonth).add(1, 'day'));
                });

                // Получаем цели из API
                const goalsRes = await axios.get('/api/goals');
                const allGoals = goalsRes.data;

                setWorkouts(filteredWorkouts);
                setGoals(allGoals);
            } catch (err) {
                console.error('Ошибка при загрузке данных:', err);
                showNotification(`Ошибка при загрузке данных: ${err.response?.data?.message || err.message}`, 'error');
            }
        };

        fetchData();
    }, [currentDate, isAuthenticated, showNotification]);

    // Генерация дней календаря
    useEffect(() => {
        const firstDayOfMonth = currentDate.startOf('month');
        const lastDayOfMonth = currentDate.endOf('month');
        const startDay = firstDayOfMonth.day() === 0 ? 6 : firstDayOfMonth.day() - 1; // Понедельник - 0, Воскресенье - 6

        const days = [];

        // Добавление дней предыдущего месяца
        for (let i = startDay - 1; i >= 0; i--) {
            days.push({
                date: firstDayOfMonth.subtract(i + 1, 'day'),
                isCurrentMonth: false
            });
        }

        // Добавление дней текущего месяца
        for (let i = 0; i < lastDayOfMonth.date(); i++) {
            days.push({
                date: firstDayOfMonth.add(i, 'day'),
                isCurrentMonth: true
            });
        }

        // Добавление дней следующего месяца
        const remainingDays = 42 - days.length; // 6 строк по 7 дней
        for (let i = 1; i <= remainingDays; i++) {
            days.push({
                date: lastDayOfMonth.add(i, 'day'),
                isCurrentMonth: false
            });
        }

        setCalendarDays(days);
    }, [currentDate]);

    // Переход к предыдущему месяцу
    const goToPreviousMonth = () => {
        setCurrentDate(currentDate.subtract(1, 'month'));
    };

    // Переход к следующему месяцу
    const goToNextMonth = () => {
        setCurrentDate(currentDate.add(1, 'month'));
    };

    // Открытие модального окна для добавления тренировки
    const openWorkoutModal = (date) => {
        setSelectedDate(date || dayjs());
        setIsWorkoutModalOpen(true);
    };

    // Открытие модального окна для добавления цели
    const openGoalModal = () => {
        setIsGoalModalOpen(true);
    };

    // Открытие модального окна для просмотра тренировки
    const openViewWorkoutModal = (workout, e) => {
        e.stopPropagation();
        setSelectedWorkout(workout);
        setIsViewWorkoutModalOpen(true);
    };

    // Открытие модального окна для просмотра цели
    const openViewGoalModal = (goal, e) => {
        e.stopPropagation();
        setSelectedGoal(goal);
        setIsViewGoalModalOpen(true);
    };

    // Добавление новой тренировки
    const handleAddWorkout = async (workoutData) => {
        try {
            console.log('Отправляемые данные тренировки:', workoutData);

            if (!isAuthenticated) {
                showNotification('Необходимо войти в систему', 'error');
                return;
            }

            // Преобразуем duration в число
            const numericWorkoutData = {
                ...workoutData,
                duration: Number(workoutData.duration)
            };

            // Сохраняем тренировку через API
            const response = await axios.post('/api/workouts', numericWorkoutData);
            console.log('Ответ сервера при добавлении тренировки:', response.data);

            const newWorkout = response.data;
            setWorkouts([...workouts, newWorkout]);
            setIsWorkoutModalOpen(false);
            showNotification('Тренировка успешно добавлена', 'success');
        } catch (err) {
            console.error('Ошибка при добавлении тренировки:', err.response?.data || err.message);

            // Показываем детальное сообщение об ошибке
            const errorMessage = err.response?.data?.errors
                ? `Ошибка: ${err.response.data.errors.map(e => e.msg).join(', ')}`
                : err.response?.data?.message || 'Ошибка при добавлении тренировки';

            showNotification(errorMessage, 'error');
        }
    };

    // Добавление новой цели
    const handleAddGoal = async (goalData) => {
        try {
            console.log('Отправляемые данные цели:', goalData);

            if (!isAuthenticated) {
                showNotification('Необходимо войти в систему', 'error');
                return;
            }

            // Преобразуем числовые поля из строк в числа
            const numericGoalData = {
                ...goalData,
                startValue: Number(goalData.startValue),
                currentValue: Number(goalData.currentValue || goalData.startValue),
                targetValue: Number(goalData.targetValue)
            };

            // Сохраняем цель через API
            const response = await axios.post('/api/goals', numericGoalData);
            console.log('Ответ сервера при добавлении цели:', response.data);

            const newGoal = response.data;
            setGoals([...goals, newGoal]);
            setIsGoalModalOpen(false);
            showNotification('Цель успешно добавлена', 'success');
        } catch (err) {
            console.error('Ошибка при добавлении цели:', err.response?.data || err.message);

            // Показываем детальное сообщение об ошибке
            const errorMessage = err.response?.data?.errors
                ? `Ошибка: ${err.response.data.errors.map(e => e.msg).join(', ')}`
                : err.response?.data?.message || 'Ошибка при добавлении цели';

            showNotification(errorMessage, 'error');
        }
    };

    // Получение тренировок для конкретного дня
    const getWorkoutsForDay = (date) => {
        return workouts.filter(workout =>
            dayjs(workout.date).format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
        );
    };

    // Получение целей для конкретного дня
    const getGoalsForDay = (date) => {
        return goals.filter(goal =>
            dayjs(goal.deadline).format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
        );
    };

    // Дни недели
    const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">
                        {currentDate.format('MMMM YYYY')}
                    </h2>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={goToPreviousMonth}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                    >
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={goToNextMonth}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                    >
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1">
                {weekDays.map(day => (
                    <div key={day} className="text-center py-2 font-semibold text-sm text-gray-600">
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
                                min-h-[100px] p-1 border border-gray-200 cursor-pointer
                                ${!day.isCurrentMonth ? 'bg-gray-50' : ''}
                                ${isToday ? 'bg-purple-50 border-purple-200' : ''}
                            `}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span
                                    className={`text-sm font-medium rounded-full w-6 h-6 flex items-center justify-center
                                        ${isToday ? 'bg-primary-600 text-white' : ''}
                                        ${!day.isCurrentMonth ? 'text-gray-400' : ''}
                                    `}
                                >
                                    {day.date.date()}
                                </span>
                                {dayWorkouts.length > 0 && (
                                    <span className="bg-primary-600 text-xs text-white px-1.5 py-0.5 rounded-full font-medium">
                                        {dayWorkouts.length}
                                    </span>
                                )}
                            </div>

                            <div className="space-y-1">
                                {dayWorkouts.slice(0, 2).map(workout => (
                                    <div
                                        key={workout._id}
                                        onClick={(e) => openViewWorkoutModal(workout, e)}
                                        className="text-xs p-1 rounded bg-purple-100 text-purple-800 truncate"
                                    >
                                        {workout.time} - {workout.type}
                                    </div>
                                ))}
                                {dayWorkouts.length > 2 && (
                                    <div className="text-xs text-gray-500">
                                        +{dayWorkouts.length - 2} еще
                                    </div>
                                )}

                                {dayGoals.map(goal => (
                                    <div
                                        key={goal._id}
                                        onClick={(e) => openViewGoalModal(goal, e)}
                                        className="text-xs p-1 rounded bg-green-100 text-green-800 truncate"
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
                    🎯 Добавить цель
                </button>
                <button
                    onClick={() => openWorkoutModal()}
                    className="btn-primary"
                >
                    + Добавить тренировку
                </button>
            </div>

            {/* Модальное окно для добавления тренировки */}
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

            {/* Модальное окно для добавления цели */}
            <Modal
                isOpen={isGoalModalOpen}
                onClose={() => setIsGoalModalOpen(false)}
                title="Добавление цели"
            >
                <GoalForm onSubmit={handleAddGoal} />
            </Modal>

            {/* Модальное окно для просмотра тренировки */}
            <Modal
                isOpen={isViewWorkoutModalOpen}
                onClose={() => setIsViewWorkoutModalOpen(false)}
                title="Информация о тренировке"
            >
                {selectedWorkout && (
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">
                                {selectedWorkout.type}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {dayjs(selectedWorkout.date).format('DD.MM.YYYY')} в {selectedWorkout.time}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Продолжительность</p>
                            <p className="font-medium">{selectedWorkout.duration} минут</p>
                        </div>

                        {selectedWorkout.comment && (
                            <div>
                                <p className="text-sm text-gray-500">Комментарий</p>
                                <p className="font-medium">{selectedWorkout.comment}</p>
                            </div>
                        )}

                        <div className="flex justify-end">
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

            {/* Модальное окно для просмотра цели */}
            <Modal
                isOpen={isViewGoalModalOpen}
                onClose={() => setIsViewGoalModalOpen(false)}
                title="Информация о цели"
            >
                {selectedGoal && (
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">
                                {selectedGoal.title}
                            </h3>
                            <p className="text-sm text-gray-500">
                                Дедлайн: {dayjs(selectedGoal.deadline).format('DD.MM.YYYY')}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Прогресс</p>
                            <div className="progress-bar mt-1">
                                <div
                                    className="progress-fill bg-primary-500"
                                    style={{
                                        width: `${Math.min(100, Math.max(0, ((selectedGoal.currentValue - selectedGoal.startValue) / (selectedGoal.targetValue - selectedGoal.startValue)) * 100))}%`
                                    }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>{selectedGoal.startValue}</span>
                                <span>{selectedGoal.currentValue}</span>
                                <span>{selectedGoal.targetValue}</span>
                            </div>
                        </div>

                        {selectedGoal.description && (
                            <div>
                                <p className="text-sm text-gray-500">Описание</p>
                                <p className="font-medium">{selectedGoal.description}</p>
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