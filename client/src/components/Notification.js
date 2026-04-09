import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

const Notification = () => {
    const [notification, setNotification] = useState(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const checkTodayWorkouts = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const today = dayjs().format('YYYY-MM-DD');
                const res = await axios.get(`/api/workouts/date/${today}`);

                if (res.data && res.data.length > 0) {
                    setNotification({
                        type: 'workout',
                        message: `У вас запланирована тренировка на сегодня: ${res.data[0].type} в ${res.data[0].time}`
                    });
                    setVisible(true);
                }
            } catch (err) {
                console.error('Ошибка при проверке тренировок:', err);
            }
        };

        checkTodayWorkouts();

        // Скрыть уведомление через 10 секунд
        const timer = setTimeout(() => {
            setVisible(false);
        }, 10000);

        return () => clearTimeout(timer);
    }, []);

    if (!visible || !notification) return null;

    const bgColor = notification.type === 'workout' ? 'bg-primary-600' : 'bg-emerald-600';

    return (
        <div className={`fixed bottom-4 right-4 ${bgColor} text-white p-4 rounded-lg shadow-lg max-w-sm z-50`}>
            <div className="flex justify-between items-start">
                <div className="flex-1 mr-4">
                    <p className="font-medium">{notification.message}</p>
                </div>
                <button
                    onClick={() => setVisible(false)}
                    className="text-white hover:text-gray-200"
                >
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default Notification; 