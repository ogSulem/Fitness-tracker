<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-7-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" />
</p>

<h1 align="center">⚡ FitTrack — Фитнес-трекер</h1>

<p align="center">
  Полнофункциональная платформа для отслеживания тренировок, питания и достижения фитнес-целей. <br/>
  Современный дизайн с поддержкой <strong>тёмной и светлой темы</strong>.
</p>

---

## ✨ Возможности

| 🏋️ Тренировки | 🥗 Питание | 📊 Аналитика | 👤 Профиль |
|---|---|---|---|
| Календарь тренировок | Дневник питания по приёмам | Графики за 7/30/365 дней | Личные данные |
| Добавление активностей | Поиск продуктов из базы | Сожжённые калории | Динамика веса |
| Сжигание калорий и длительность | Белки / Жиры / Углеводы | Типы тренировок (Doughnut) | История тренировок |
| Рекомендации тренировок | Навигация по датам | Питание vs. активность | Цели и прогресс |
| Цели с прогресс-баром | Удаление записей | — | Редактирование профиля |

### 🌙 Тёмная / Светлая тема
- Автоматическое определение предпочтения системы
- Сохранение выбора в `localStorage`
- Мгновенное переключение по кнопке в шапке

### 🔐 Аутентификация
- JWT-токены (access + refresh)
- Защищённые маршруты
- Rate limiting на API

---

## 🚀 Быстрый старт (локально)

### Требования
- Node.js 18+
- MongoDB (локально или Atlas)

### 1. Клонирование и установка зависимостей

```bash
git clone https://github.com/ogSulem/Fitness-tracker.git
cd Fitness-tracker

# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### 2. Настройка окружения

Создайте файл `server/.env`:

```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/fittrack
JWT_SECRET=your_super_secret_key_here
NODE_ENV=development
```

### 3. Запуск

```bash
# Терминал 1 — Backend
cd server && npm start

# Терминал 2 — Frontend
cd client && npm start
```

Приложение откроется по адресу: **http://localhost:3000**

---

## 🌐 Деплой (бесплатно, без VPS)

### Вариант 1: Vercel + Railway + MongoDB Atlas

| Сервис | Что деплоим | Ссылка |
|--------|-------------|--------|
| **Vercel** | React Frontend | https://vercel.com |
| **Railway** | Node.js Backend | https://railway.app |
| **MongoDB Atlas** | База данных | https://atlas.mongodb.com |

**Frontend (Vercel):**
```bash
# В директории client/
npm run build
# Загружаем папку build/ на Vercel через UI или CLI
```

**Backend (Railway):**
1. Создайте проект на Railway
2. Подключите GitHub репозиторий
3. Укажите корневую директорию: `server/`
4. Добавьте переменные окружения (MONGO_URI, JWT_SECRET)

**MongoDB Atlas:**
1. Создайте кластер (M0 Free)
2. Получите строку подключения
3. Вставьте в `MONGO_URI` на Railway

> 💡 **Можно ли запустить прямо здесь (GitHub)?** — Нет. GitHub — хранилище кода, а не сервер для запуска приложений. Нужен хостинг (Vercel/Railway — бесплатно и быстро).

---

## 🏗️ Архитектура

```
Fitness-tracker/
├── client/                   # React Frontend
│   ├── src/
│   │   ├── components/       # Переиспользуемые компоненты
│   │   │   ├── Header.js     # Навигация + тема-переключатель
│   │   │   ├── Footer.js
│   │   │   ├── Calendar.js   # Календарь тренировок
│   │   │   ├── DailyStats.js # Суточная статистика
│   │   │   ├── CalorieCalculator.js
│   │   │   ├── WorkoutForm.js
│   │   │   ├── GoalForm.js
│   │   │   ├── WorkoutRecommendations.js
│   │   │   ├── Modal.js
│   │   │   └── Notification.js
│   │   ├── context/
│   │   │   ├── AuthContext.js      # JWT аутентификация
│   │   │   ├── ThemeContext.js     # 🌙 Тёмная/Светлая тема
│   │   │   └── NotificationContext.js
│   │   ├── hooks/
│   │   │   └── useAxiosInterceptor.js
│   │   ├── pages/
│   │   │   ├── Home.js       # Дашборд
│   │   │   ├── Nutrition.js  # Дневник питания
│   │   │   ├── Analytics.js  # Графики и статистика
│   │   │   ├── Profile.js    # Профиль пользователя
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   └── NotFound.js
│   │   └── services/
│   └── tailwind.config.js
│
└── server/                   # Express Backend
    ├── middleware/
    │   ├── auth.js           # JWT middleware
    │   └── rateLimit.js
    ├── models/
    │   ├── User.js
    │   ├── Workout.js
    │   ├── Goal.js
    │   └── NutritionEntry.js
    ├── routes/
    │   ├── auth.js
    │   ├── users.js
    │   ├── workouts.js
    │   ├── goals.js
    │   └── nutrition.js
    └── index.js
```

---

## 🛠️ Технологический стек

### Frontend
- **React 18** — UI библиотека
- **Tailwind CSS 3** — utility-first стилизация с `darkMode: 'class'`
- **Chart.js + react-chartjs-2** — интерактивные графики
- **React Router v6** — маршрутизация
- **Axios** — HTTP клиент
- **dayjs** — работа с датами

### Backend
- **Node.js + Express** — REST API
- **MongoDB + Mongoose** — база данных
- **JWT** — аутентификация
- **bcryptjs** — хэширование паролей
- **express-rate-limit** — защита от DDoS

---

## 📱 Страницы

### 🏠 Главная (Dashboard)
- Приветствие с именем пользователя и датой
- Суточная статистика (калории, тренировки, вода)
- Календарь тренировок с интерактивными днями
- Быстрые действия
- Калькулятор калорий (BMR + TDEE)
- Рекомендации тренировок

### 🥗 Питание
- Навигация по датам
- Разбивка по приёмам пищи (завтрак/обед/ужин/перекус)
- Поиск продуктов из базы данных
- Макронутриенты: Белки / Жиры / Углеводы
- Суточные итоги с карточками

### 📊 Аналитика
- Период: 7 дней / 30 дней / Год
- График сожжённых калорий (тренировки)
- График длительности тренировок
- Doughnut-диаграмма типов тренировок
- График потреблённых калорий (питание)
- Список последних 10 тренировок

### 👤 Профиль
- Hero-карточка с аватаром и статистикой
- Вкладки: Профиль / Динамика веса / Цели / Тренировки
- График изменения веса со временем
- Прогресс-бары для каждой цели

---

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте ветку: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Создайте Pull Request

---

## 📄 Лицензия

MIT License — см. [LICENSE](LICENSE)

---

<p align="center">
  Сделано с ❤️ для достижения фитнес-целей
</p>
