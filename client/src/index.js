import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Импортируем axios для работы с API
import axios from 'axios';

// Настройка глобальных параметров axios
const token = localStorage.getItem('token');
if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <Router>
            <NotificationProvider>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </NotificationProvider>
        </Router>
    </React.StrictMode>
); 