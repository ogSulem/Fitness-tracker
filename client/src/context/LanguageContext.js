import React, { createContext, useContext, useState } from 'react';

export const LanguageContext = createContext();

// ─── Translations dictionary ──────────────────────────────────────────────────
const translations = {
    ru: {
        // Header / Nav
        nav_home:       'Главная',
        nav_nutrition:  'Питание',
        nav_analytics:  'Аналитика',
        nav_profile:    'Профиль',
        nav_login:      'Войти',
        nav_register:   'Регистрация',
        nav_logout:     'Выйти',
        toggle_theme:   'Переключить тему',
        toggle_lang:    'EN',

        // Login
        login_title:        'Добро пожаловать',
        login_subtitle:     'Войдите в аккаунт, чтобы продолжить',
        login_email:        'Email',
        login_password:     'Пароль',
        login_show_pass:    'Показать пароль',
        login_hide_pass:    'Скрыть пароль',
        login_forgot:       'Забыли пароль?',
        login_submit:       'Войти',
        login_loading:      'Вход...',
        login_no_account:   'Нет аккаунта?',
        login_signup:       'Зарегистрироваться',
        login_slogan:       'Твой персональный помощник в достижении фитнес-целей',
        login_features_workouts: 'Тренировки',
        login_features_nutrition: 'Питание',
        login_features_progress: 'Прогресс',

        // Register
        reg_title:          'Создать аккаунт',
        reg_subtitle:       'Начни путь к лучшей форме',
        reg_step_account:   'Аккаунт',
        reg_step_profile:   'Профиль',
        reg_name:           'Имя',
        reg_email:          'Email',
        reg_password:       'Пароль',
        reg_confirm:        'Подтвердите пароль',
        reg_gender:         'Пол',
        reg_male:           'Мужской',
        reg_female:         'Женский',
        reg_age:            'Возраст (лет)',
        reg_weight:         'Вес (кг)',
        reg_height:         'Рост (см)',
        reg_next:           'Далее',
        reg_back:           'Назад',
        reg_submit:         'Зарегистрироваться',
        reg_loading:        'Регистрация...',
        reg_has_account:    'Уже есть аккаунт?',
        reg_signin:         'Войти',

        // Home
        home_greeting:      'Привет,',
        home_user_fallback: 'Пользователь',
        home_goal_label:    'Цель:',
        home_kcal:          'ккал',
        home_motivation_next: 'Следующая \u2192',
        home_quick_add_workout:      'Добавить тренировку',
        home_quick_add_nutrition:    'Записать питание',
        home_quick_view_analytics:   'Посмотреть аналитику',
        home_quick_desc_workout:     'Зафиксируй активность',
        home_quick_desc_nutrition:   'Внеси прием пищи',
        home_quick_desc_analytics:   'Посмотри прогресс',
        home_recommendations:        'Рекомендации',

        // Motivational quotes
        quote_0: 'Каждая тренировка \u2014 это шаг ближе к лучшей версии себя.',
        quote_0a: 'Аноним',
        quote_1: 'Боль, которую ты чувствуешь сегодня, \u2014 это сила, которую ты почувствуешь завтра.',
        quote_1a: 'Аноним',
        quote_2: 'Не считай дни \u2014 делай дни счастливыми.',
        quote_2a: 'Мухаммед Али',
        quote_3: 'Успех \u2014 это сумма маленьких усилий, повторяемых день за днем.',
        quote_3a: 'Роберт Коллиер',
        quote_4: 'Тело способно на большее. Убеди в этом свой разум.',
        quote_4a: 'Аноним',
        quote_5: 'Тяжело в тренировке \u2014 легко в бою.',
        quote_5a: 'А. В. Суворов',
        quote_6: 'Хочешь изменить тело \u2014 начни с мысли.',
        quote_6a: 'Аноним',
        quote_7: 'Единственная плохая тренировка \u2014 та, которую ты пропустил.',
        quote_7a: 'Аноним',

        // Footer
        footer_rights:   'Все права защищены.',
        footer_about:    'О проекте',
        footer_about_body:
            'Данная работа выполнена студентом Казанского Федерального Университета, ' +
            'направление Прикладная информатика, группа 09-253, ' +
            'Богдановым Артуром Владимировичем.',
        footer_close:    'Закрыть',

        // Common
        loading:         'Загрузка...',
        save:            'Сохранить',
        cancel:          'Отмена',
        delete_:         'Удалить',
        edit_:           'Редактировать',
        add_:            'Добавить',
        close_:          'Закрыть',
        search_:         'Поиск...',
        no_data:         'Нет данных',
    },

    en: {
        // Header / Nav
        nav_home:       'Home',
        nav_nutrition:  'Nutrition',
        nav_analytics:  'Analytics',
        nav_profile:    'Profile',
        nav_login:      'Log in',
        nav_register:   'Sign up',
        nav_logout:     'Log out',
        toggle_theme:   'Toggle theme',
        toggle_lang:    'RU',

        // Login
        login_title:        'Welcome back',
        login_subtitle:     'Sign in to your account to continue',
        login_email:        'Email',
        login_password:     'Password',
        login_show_pass:    'Show password',
        login_hide_pass:    'Hide password',
        login_forgot:       'Forgot password?',
        login_submit:       'Sign in',
        login_loading:      'Signing in...',
        login_no_account:   'No account?',
        login_signup:       'Sign up',
        login_slogan:       'Your personal assistant for achieving fitness goals',
        login_features_workouts: 'Workouts',
        login_features_nutrition: 'Nutrition',
        login_features_progress: 'Progress',

        // Register
        reg_title:          'Create account',
        reg_subtitle:       'Start your journey to a better shape',
        reg_step_account:   'Account',
        reg_step_profile:   'Profile',
        reg_name:           'Name',
        reg_email:          'Email',
        reg_password:       'Password',
        reg_confirm:        'Confirm password',
        reg_gender:         'Gender',
        reg_male:           'Male',
        reg_female:         'Female',
        reg_age:            'Age (years)',
        reg_weight:         'Weight (kg)',
        reg_height:         'Height (cm)',
        reg_next:           'Next',
        reg_back:           'Back',
        reg_submit:         'Create account',
        reg_loading:        'Creating account...',
        reg_has_account:    'Already have an account?',
        reg_signin:         'Sign in',

        // Home
        home_greeting:      'Hello,',
        home_user_fallback: 'User',
        home_goal_label:    'Goal:',
        home_kcal:          'kcal',
        home_motivation_next: 'Next \u2192',
        home_quick_add_workout:      'Add workout',
        home_quick_add_nutrition:    'Log nutrition',
        home_quick_view_analytics:   'View analytics',
        home_quick_desc_workout:     'Record your activity',
        home_quick_desc_nutrition:   'Log your meal',
        home_quick_desc_analytics:   'Check your progress',
        home_recommendations:        'Recommendations',

        // Motivational quotes
        quote_0: 'Every workout is a step closer to the best version of yourself.',
        quote_0a: 'Anonymous',
        quote_1: "The pain you feel today is the strength you'll feel tomorrow.",
        quote_1a: 'Anonymous',
        quote_2: "Don't count the days \u2014 make the days count.",
        quote_2a: 'Muhammad Ali',
        quote_3: 'Success is the sum of small efforts repeated day after day.',
        quote_3a: 'Robert Collier',
        quote_4: 'Your body can do it. It is your mind you need to convince.',
        quote_4a: 'Anonymous',
        quote_5: 'Train hard, fight easy.',
        quote_5a: 'A. V. Suvorov',
        quote_6: 'Want to change your body \u2014 start with your mind.',
        quote_6a: 'Anonymous',
        quote_7: 'The only bad workout is the one that did not happen.',
        quote_7a: 'Anonymous',

        // Footer
        footer_rights:   'All rights reserved.',
        footer_about:    'About',
        footer_about_body:
            'This project was developed by a student of Kazan Federal University, ' +
            'Applied Informatics program, group 09-253, ' +
            'Artur Bogdanov.',
        footer_close:    'Close',

        // Common
        loading:         'Loading...',
        save:            'Save',
        cancel:          'Cancel',
        delete_:         'Delete',
        edit_:           'Edit',
        add_:            'Add',
        close_:          'Close',
        search_:         'Search...',
        no_data:         'No data',
    },
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useLang = () => useContext(LanguageContext);

// ─── Provider ─────────────────────────────────────────────────────────────────
export const LanguageProvider = ({ children }) => {
    const [lang, setLang] = useState(() => {
        return localStorage.getItem('lang') || 'ru';
    });

    const toggleLang = () => {
        const next = lang === 'ru' ? 'en' : 'ru';
        setLang(next);
        localStorage.setItem('lang', next);
    };

    // t(key) — returns translation for the current language
    const t = (key) => translations[lang]?.[key] ?? translations['ru']?.[key] ?? key;

    return (
        <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
};
