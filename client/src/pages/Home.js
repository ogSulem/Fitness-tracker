import React, { useContext, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import 'dayjs/locale/en';
import { AuthContext } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import Calendar from '../components/Calendar';
import CalorieCalculator from '../components/CalorieCalculator';
import DailyStats from '../components/DailyStats';
import WorkoutRecommendations from '../components/WorkoutRecommendations';

const QUOTES_RU = [
    { text: 'Каждая тренировка — это шаг ближе к лучшей версии себя.',              author: 'Аноним'          },
    { text: 'Боль, которую ты чувствуешь сегодня, — это сила, которую ты почувствуешь завтра.', author: 'Аноним' },
    { text: 'Не считай дни — делай дни счастливыми.',                                author: 'Мухаммед Али'    },
    { text: 'Успех — это сумма маленьких усилий, повторяемых день за днем.',          author: 'Роберт Коллиер'  },
    { text: 'Тело способно на большее. Убеди в этом свой разум.',                    author: 'Аноним'          },
    { text: 'Тяжело в тренировке — легко в бою.',                                    author: 'А. В. Суворов'   },
    { text: 'Хочешь изменить тело — начни с мысли.',                                 author: 'Аноним'          },
    { text: 'Единственная плохая тренировка — та, которую ты пропустил.',             author: 'Аноним'          },
];

const QUOTES_EN = [
    { text: 'Every workout is a step closer to the best version of yourself.',        author: 'Anonymous'       },
    { text: "The pain you feel today is the strength you'll feel tomorrow.",           author: 'Anonymous'       },
    { text: "Don't count the days — make the days count.",                             author: 'Muhammad Ali'    },
    { text: 'Success is the sum of small efforts repeated day after day.',            author: 'Robert Collier'  },
    { text: 'Your body can do it. It is your mind you need to convince.',             author: 'Anonymous'       },
    { text: 'Train hard, fight easy.',                                                author: 'A. V. Suvorov'   },
    { text: 'Want to change your body — start with your mind.',                       author: 'Anonymous'       },
    { text: 'The only bad workout is the one that did not happen.',                   author: 'Anonymous'       },
];

const MotivationCard = () => {
    const { lang, t } = useLang();
    const QUOTES = lang === 'en' ? QUOTES_EN : QUOTES_RU;
    const [idx, setIdx] = useState(() => Math.floor(Math.random() * QUOTES_RU.length));
    const [visible, setVisible] = useState(true);
    const q = QUOTES[idx];

    const next = () => {
        setVisible(false);
        setTimeout(() => {
            setIdx(i => (i + 1) % QUOTES.length);
            setVisible(true);
        }, 250);
    };

    return (
        <div className="card relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-violet-400/20 to-pink-400/20 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-start gap-3">
                <span className="text-2xl mt-0.5 animate-float">✨</span>
                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium text-gray-700 dark:text-slate-200 leading-relaxed transition-opacity duration-250 ${visible ? 'opacity-100' : 'opacity-0'}`}>
                        «{q.text}»
                    </p>
                    <p className={`text-xs text-gray-400 dark:text-slate-500 mt-1 transition-opacity duration-250 ${visible ? 'opacity-100' : 'opacity-0'}`}>
                        — {q.author}
                    </p>
                </div>
            </div>
            <button
                onClick={next}
                className="mt-3 text-xs text-violet-500 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 font-medium transition-colors"
            >
                {t('home_motivation_next')}
            </button>
        </div>
    );
};

const QuickActionCard = ({ icon, title, description, onClick, gradient }) => (
    <button
        onClick={onClick}
        className="w-full text-left p-4 rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-md hover:scale-[1.02] transition-all duration-200 group"
    >
        <div className={`w-10 h-10 rounded-xl ${gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
            <span className="text-xl">{icon}</span>
        </div>
        <p className="font-semibold text-gray-800 dark:text-slate-100 text-sm">{title}</p>
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{description}</p>
    </button>
);

const Home = () => {
    const { user } = useContext(AuthContext);
    const { lang, t } = useLang();
    const navigate = useNavigate();
    const calendarRef = useRef(null);

    // Set dayjs locale dynamically
    dayjs.locale(lang === 'en' ? 'en' : 'ru');

    const targetCalories = (() => {
        if (!user) return 2000;
        let bmr;
        if (user.gender === 'male') {
            bmr = 10 * (user.weight || 70) + 6.25 * (user.height || 175) - 5 * (user.age || 25) + 5;
        } else {
            bmr = 10 * (user.weight || 60) + 6.25 * (user.height || 165) - 5 * (user.age || 25) - 161;
        }
        const activityMultipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, veryActive: 1.9 };
        const multiplier = activityMultipliers[user.activityLevel] || 1.55;
        return Math.round(bmr * multiplier);
    })();

    const today = dayjs().format('dddd, D MMMM YYYY');
    const capitalToday = today.charAt(0).toUpperCase() + today.slice(1);

    const quickActions = [
        {
            icon: '🏋️',
            title: t('home_quick_add_workout'),
            description: t('home_quick_desc_workout'),
            gradient: 'bg-gradient-to-br from-primary-100 to-primary-200',
            onClick: () => calendarRef.current?.scrollIntoView({ behavior: 'smooth' }),
        },
        {
            icon: '🥗',
            title: t('home_quick_add_nutrition'),
            description: t('home_quick_desc_nutrition'),
            gradient: 'bg-gradient-to-br from-green-100 to-emerald-200',
            onClick: () => navigate('/nutrition'),
        },
        {
            icon: '📊',
            title: t('home_quick_view_analytics'),
            description: t('home_quick_desc_analytics'),
            gradient: 'bg-gradient-to-br from-sky-100 to-blue-200',
            onClick: () => navigate('/analytics'),
        },
    ];

    return (
        <div className="container mx-auto px-4 py-8 animate-fadeIn">
            {/* Greeting header */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                            {t('home_greeting')} <span className="gradient-text">{user?.name?.split(' ')[0] || t('home_user_fallback')}</span>! 👋
                        </h1>
                        <p className="text-gray-400 dark:text-slate-500 mt-1 capitalize">{capitalToday}</p>
                    </div>
                    <div className="flex gap-2">
                        <span className="badge-primary text-sm px-3 py-1.5">
                            🎯 {t('home_goal_label')} {targetCalories} {t('home_kcal')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Daily Stats */}
            <div className="mb-8">
                <DailyStats targetCalories={targetCalories} />
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Calendar - takes 2/3 */}
                <div ref={calendarRef} className="lg:col-span-2">
                    <Calendar />
                </div>

                {/* Right sidebar */}
                <div className="space-y-6">
                    <MotivationCard />

                    {/* Quick Actions */}
                    <div className="card">
                        <h3 className="text-base font-semibold text-gray-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                            <span>⚡</span> {t('home_recommendations')}
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                            {quickActions.map((action) => (
                                <QuickActionCard key={action.title} {...action} />
                            ))}
                        </div>
                    </div>

                    <CalorieCalculator />
                    <WorkoutRecommendations />
                </div>
            </div>
        </div>
    );
};

export default Home;
