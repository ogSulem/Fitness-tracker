import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Проверка аутентификации при загрузке
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Получаем данные пользователя из API
                const token = localStorage.getItem('token');

                if (token) {
                    // Установка токена для всех запросов axios
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                    // Получаем профиль пользователя
                    const response = await axios.get('/api/auth/user');
                    setUser(response.data);
                    setIsAuthenticated(true);
                }
            } catch (err) {
                console.error('Ошибка аутентификации:', err);
                // Удаляем токен при ошибке
                localStorage.removeItem('token');
                delete axios.defaults.headers.common['Authorization'];
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    // Регистрация пользователя
    const register = async (userData) => {
        try {
            setError(null);
            const response = await axios.post('/api/auth/register', userData);
            const { token, user } = response.data;

            // Сохраняем токен
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            setUser(user);
            setIsAuthenticated(true);
            return user;
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
            throw err;
        }
    };

    // Вход пользователя
    const login = async (userData) => {
        try {
            setError(null);
            const response = await axios.post('/api/auth/login', userData);
            const { token, user } = response.data;

            // Сохраняем токен
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            setUser(user);
            setIsAuthenticated(true);
            return user;
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
            throw err;
        }
    };

    // Выход пользователя
    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        setIsAuthenticated(false);
    };

    // Обновление данных пользователя
    const updateUser = async (userData) => {
        try {
            setError(null);
            const response = await axios.put('/api/users/profile', userData);
            const updatedUser = response.data;
            setUser(updatedUser);
            return updatedUser;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
            throw err;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                loading,
                error,
                register,
                login,
                logout,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}; 