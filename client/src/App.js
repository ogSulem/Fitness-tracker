import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import Nutrition from './pages/Nutrition';
import Analytics from './pages/Analytics';
import NotFound from './pages/NotFound';

import Header from './components/Header';
import Footer from './components/Footer';
import ScrollProgress from './components/ScrollProgress';

import useAxiosInterceptor from './hooks/useAxiosInterceptor';

const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useContext(AuthContext);
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-900">
                <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }
    return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
    useAxiosInterceptor();

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
            <ScrollProgress />
            <Header />
            <main className="flex-grow">
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />
                    <Route path="/" element={
                        <PrivateRoute><Home /></PrivateRoute>
                    } />
                    <Route path="/nutrition" element={
                        <PrivateRoute><Nutrition /></PrivateRoute>
                    } />
                    <Route path="/analytics" element={
                        <PrivateRoute><Analytics /></PrivateRoute>
                    } />
                    <Route path="/profile" element={
                        <PrivateRoute><Profile /></PrivateRoute>
                    } />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </main>
            <Footer />
        </div>
    );
}

export default App;
