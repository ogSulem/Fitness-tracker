import React from 'react';
import { Link } from 'react-router-dom';

const FLOATING_ITEMS = [
    { emoji: '🏋️', style: 'top-[8%] left-[6%]', size: 'text-5xl', delay: '0s', duration: '6s' },
    { emoji: '🥗', style: 'top-[12%] right-[8%]', size: 'text-4xl', delay: '1.5s', duration: '7s' },
    { emoji: '🔥', style: 'top-[55%] left-[4%]', size: 'text-3xl', delay: '0.8s', duration: '5.5s' },
    { emoji: '📊', style: 'top-[70%] right-[5%]', size: 'text-4xl', delay: '2s', duration: '8s' },
    { emoji: '🎯', style: 'bottom-[15%] left-[12%]', size: 'text-3xl', delay: '1.2s', duration: '6.5s' },
    { emoji: '💪', style: 'top-[30%] right-[3%]', size: 'text-3xl', delay: '0.4s', duration: '7.5s' },
];

const NotFound = () => (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-130px)] px-4 overflow-hidden animate-fadeIn">
        {/* Decorative ambient blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-violet-400/10 dark:bg-violet-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[200px] rounded-full bg-pink-400/10 dark:bg-pink-600/10 blur-3xl pointer-events-none" />

        {/* Floating emoji decorations */}
        {FLOATING_ITEMS.map((item, i) => (
            <span
                key={i}
                className={`absolute select-none pointer-events-none opacity-20 dark:opacity-10 ${item.size} ${item.style}`}
                style={{ animation: `float ${item.duration} ease-in-out ${item.delay} infinite` }}
            >
                {item.emoji}
            </span>
        ))}

        {/* Main content */}
        <div className="relative z-10 text-center max-w-lg">
            {/* Giant 404 with gradient */}
            <div className="relative inline-block mb-6">
                <span className="text-[9rem] md:text-[12rem] font-black leading-none select-none pointer-events-none"
                    style={{
                        background: 'linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        filter: 'drop-shadow(0 8px 32px rgba(124,58,237,0.25))',
                    }}
                >
                    404
                </span>
                {/* Dumbbell floating over the 0 */}
                <span
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl pointer-events-none"
                    style={{ animation: 'float 4s ease-in-out infinite' }}
                >
                    🏋️
                </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Страница не найдена
            </h1>
            <p className="text-gray-500 dark:text-slate-400 mb-8 leading-relaxed">
                Похоже, эта страница решила пропустить тренировку.<br className="hidden sm:block" />
                Возвращайтесь на главную!
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/" className="btn-primary">
                    ← На главную
                </Link>
                <Link
                    to="/analytics"
                    className="btn-secondary"
                >
                    📊 Аналитика
                </Link>
            </div>
        </div>
    </div>
);

export default NotFound;
