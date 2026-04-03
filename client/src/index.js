import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import axios from 'axios';

// В production с раздельным деплоем (Vercel frontend + Railway backend)
// установите REACT_APP_API_URL=https://your-backend.railway.app в настройках Vercel
if (process.env.REACT_APP_API_URL) {
    axios.defaults.baseURL = process.env.REACT_APP_API_URL;
}

const token = localStorage.getItem('token');
if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <ThemeProvider>
            <Router>
                <NotificationProvider>
                    <AuthProvider>
                        <App />
                    </AuthProvider>
                </NotificationProvider>
            </Router>
        </ThemeProvider>
    </React.StrictMode>
);
