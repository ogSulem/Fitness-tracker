import { useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';

/**
 * Хук для настройки глобальных перехватчиков axios
 */
const useAxiosInterceptor = () => {
    const { logout } = useContext(AuthContext);
    const { showNotification } = useContext(NotificationContext);

    useEffect(() => {
        // Настраиваем перехватчик запросов
        const requestInterceptor = axios.interceptors.request.use(
            config => {
                // Получаем токен из localStorage для каждого запроса
                const token = localStorage.getItem('token');
                if (token) {
                    config.headers['Authorization'] = `Bearer ${token}`;
                }
                return config;
            },
            error => {
                console.error('Ошибка запроса:', error);
                return Promise.reject(error);
            }
        );

        // Настраиваем перехватчик ответов
        const responseInterceptor = axios.interceptors.response.use(
            response => {
                return response;
            },
            error => {
                const statusCode = error.response?.status;

                console.error('Ошибка ответа:', statusCode, error.response?.data || error.message);

                // Обрабатываем ошибки аутентификации
                if (statusCode === 401) {
                    showNotification('Сессия истекла. Необходимо войти заново.', 'error');
                    logout(); // Выходим при истечении токена
                } else if (statusCode === 403) {
                    showNotification('У вас нет доступа к этому ресурсу', 'error');
                } else if (statusCode === 404) {
                    showNotification('Запрашиваемый ресурс не найден', 'error');
                } else if (statusCode >= 500) {
                    showNotification('Ошибка сервера. Попробуйте позже', 'error');
                }

                return Promise.reject(error);
            }
        );

        // Очищаем перехватчики при размонтировании компонента
        return () => {
            axios.interceptors.request.eject(requestInterceptor);
            axios.interceptors.response.eject(responseInterceptor);
        };
    }, [logout, showNotification]);
};

export default useAxiosInterceptor; 