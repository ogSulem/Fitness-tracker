<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-7-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" />
</p>

<h1 align="center">⚡ FitTrack — Фитнес-трекер</h1>

<p align="center">
  Полнофункциональная платформа для отслеживания тренировок, питания и достижения фитнес-целей.<br/>
  Современный дизайн с поддержкой <strong>тёмной и светлой темы</strong>.
</p>

---

## ✨ Возможности

| 🏋️ Тренировки | 🥗 Питание | 📊 Аналитика | 👤 Профиль |
|---|---|---|---|
| Календарь тренировок | Дневник питания по приёмам | Графики за 7/30/365 дней | Личные данные |
| Добавление активностей | Поиск продуктов из базы | Сожжённые калории | Динамика веса |
| Расход калорий и длительность | Белки / Жиры / Углеводы | Типы тренировок (Doughnut) | История тренировок |
| Рекомендации тренировок | Навигация по датам | Питание vs. активность | Цели и прогресс |
| Цели с прогресс-баром | Удаление записей | — | Редактирование профиля |

### 🌙 Тёмная / Светлая тема
- Автоматическое определение предпочтения системы
- Сохранение выбора в `localStorage`
- Мгновенное переключение кнопкой в шапке

### 🔐 Аутентификация
- JWT-токены
- Защищённые маршруты (`PrivateRoute`)
- Rate limiting на входе и регистрации

---

## 🚀 Локальный запуск

### Требования
- Node.js 18+
- MongoDB (локально или [Atlas](https://atlas.mongodb.com))

### 1. Клонирование

```bash
git clone -b copilot/add-user-registration-authentication \
  https://github.com/ogSulem/Fitness-tracker.git
cd Fitness-tracker
```

> Хотите основную ветку — уберите `-b copilot/...`

### 2. Установка зависимостей

```bash
# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### 3. Переменные окружения

```bash
cp server/.env.example server/.env
```

Откройте `server/.env` и заполните:

```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/fittrack
JWT_SECRET=придумайте_длинную_строку
NODE_ENV=development
```

> `ALLOWED_ORIGINS` в development оставьте пустым — по умолчанию разрешены `localhost:3000` и `localhost:3001`.

### 4. Запуск

```bash
# Терминал 1 — Backend
cd server && npm run dev     # nodemon (с авто-перезапуском)
# или: npm start             # node (без авто-перезапуска)

# Терминал 2 — Frontend
cd client && npm start
```

Приложение: **http://localhost:3000** → проксируется на сервер `http://localhost:5001`.

### 5. (Опционально) Заполнить базу рекомендациями тренировок

```bash
cd server && npm run init-recommendations
```

---

## 🌐 Деплой в production

Есть **два варианта**. Выбирайте тот, что удобнее.

---

### Вариант A — единый сервер (Railway) ✅ Рекомендуется

Сервер сам отдаёт собранный React. CORS вообще не нужен — всё на одном домене.

```
Railway
 └─ Node.js сервер (Express)
     ├─ /api/*  — REST API
     └─ /*      — отдаёт client/build/index.html
```

**Шаги:**

1. **Создайте проект на [Railway](https://railway.app)**
   - «New Project» → «Deploy from GitHub repo»
   - Выберите репозиторий

2. **Укажите корневую директорию: `server`**
   - Settings → Source → Root Directory: `server`

3. **Добавьте переменные окружения на Railway:**

   | Переменная | Значение |
   |---|---|
   | `PORT` | Railway подставит сам |
   | `MONGO_URI` | строка подключения Atlas (см. ниже) |
   | `JWT_SECRET` | длинная случайная строка |
   | `NODE_ENV` | `production` |

4. **Сборка фронтенда перед деплоем** — добавьте в Railway команду сборки:
   - Build Command: `cd ../client && npm install && npm run build`
   - Start Command: `node server.js`
   
   Или добавьте в `server/package.json`:
   ```json
   "scripts": {
       "build": "cd ../client && npm install && npm run build",
       "start": "node server.js"
   }
   ```

5. **MongoDB Atlas:**
   - [atlas.mongodb.com](https://atlas.mongodb.com) → создайте кластер M0 (бесплатно)
   - Database Access → добавьте пользователя
   - Network Access → `0.0.0.0/0` (разрешить откуда угодно)
   - Connect → Drivers → скопируйте строку вида:
     `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/fittrack?retryWrites=true&w=majority`
   - Вставьте в `MONGO_URI` на Railway

**Результат:** одна ссылка вида `https://fitness-tracker-xxxx.up.railway.app` — и фронт, и апи.

---

### Вариант B — раздельный деплой (Vercel + Railway)

```
Vercel              Railway
 └─ React SPA  →   └─ Express API (/api/*)
```

Здесь CORS **нужен**: браузер делает запросы с домена Vercel на Railway.

**Backend (Railway)** — то же, что в варианте A, но без сборки фронтенда. Добавьте одну дополнительную переменную:

| Переменная | Значение |
|---|---|
| `ALLOWED_ORIGINS` | `https://ваш-проект.vercel.app` |

> Несколько доменов через запятую: `https://fittrack.vercel.app,https://www.fittrack.vercel.app`

**Frontend (Vercel):**

1. «New Project» → импортируйте репо, укажите **Root Directory: `client`**
2. Добавьте переменную окружения в настройках Vercel:

   | Переменная | Значение |
   |---|---|
   | `REACT_APP_API_URL` | `https://ваш-бэкенд.up.railway.app` |

3. Deploy. Vercel автоматически запустит `npm run build`.

> **Почему нужен `REACT_APP_API_URL`?** В production-сборке React нет dev-прокси (`"proxy"` в `package.json` работает только в `npm start`). Без базового URL все запросы `/api/...` уйдут на сам Vercel и получат 404. Переменная задаётся до сборки, поэтому пересобирать при смене URL обязательно.

---

## 🔑 Переменные окружения — шпаргалка

### `server/.env`

| Переменная | Обязательна | Описание |
|---|---|---|
| `MONGO_URI` | ✅ | Строка подключения MongoDB |
| `JWT_SECRET` | ✅ | Секрет для JWT, минимум 32 символа |
| `PORT` | — | По умолчанию `5001` |
| `NODE_ENV` | — | `development` / `production` |
| `ALLOWED_ORIGINS` | только вариант B | URL(ы) фронтенда через запятую |

### `client/.env` (только вариант B)

| Переменная | Описание |
|---|---|
| `REACT_APP_API_URL` | Полный URL Railway-бэкенда без слеша в конце |

---

## 🏗️ Структура проекта

```
Fitness-tracker/
├── client/                        # React 18 (CRA)
│   ├── .env.example
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── Calendar.js        # Календарь тренировок
│       │   ├── CalorieCalculator.js
│       │   ├── DailyStats.js      # Суточная статистика
│       │   ├── Footer.js
│       │   ├── GoalForm.js
│       │   ├── Header.js          # Навигация + переключатель темы
│       │   ├── Modal.js
│       │   ├── Notification.js
│       │   ├── ScrollProgress.js
│       │   ├── WorkoutForm.js
│       │   └── WorkoutRecommendations.js
│       ├── context/
│       │   ├── AuthContext.js     # JWT-аутентификация
│       │   ├── NotificationContext.js
│       │   └── ThemeContext.js    # Тёмная / светлая тема
│       ├── hooks/
│       │   ├── useAuth.js
│       │   ├── useAxiosInterceptor.js  # Глобальные перехватчики axios
│       │   └── useCountUp.js
│       ├── pages/
│       │   ├── Analytics.js
│       │   ├── ForgotPassword.js
│       │   ├── Home.js            # Дашборд
│       │   ├── Login.js
│       │   ├── NotFound.js
│       │   ├── Nutrition.js
│       │   ├── Profile.js
│       │   ├── Register.js
│       │   └── ResetPassword.js
│       └── services/
│           └── localStorageService.js
│
└── server/                        # Node.js + Express
    ├── .env.example
    ├── middleware/
    │   └── auth.js                # JWT middleware
    ├── models/
    │   ├── FoodEntry.js
    │   ├── Goal.js
    │   ├── User.js
    │   ├── Workout.js
    │   └── WorkoutRecommendation.js
    ├── routes/
    │   ├── auth.js                # /api/auth/*
    │   ├── goals.js               # /api/goals/*
    │   ├── nutrition.js           # /api/nutrition/*
    │   ├── users.js               # /api/users/*
    │   ├── workoutRecommendations.js  # /api/recommendations/*
    │   └── workouts.js            # /api/workouts/*
    ├── scripts/
    │   └── initRecommendations.js
    └── server.js                  # Точка входа
```

---

## 🛠️ Технологический стек

### Frontend
| Библиотека | Версия | Назначение |
|---|---|---|
| React | 18 | UI |
| Tailwind CSS | 3 | Стилизация (`darkMode: 'class'`) |
| Chart.js + react-chartjs-2 | 4 / 5 | Графики |
| React Router | v6 | Маршрутизация |
| Axios | 1.x | HTTP-клиент |
| Day.js | 1.x | Работа с датами |

### Backend
| Библиотека | Назначение |
|---|---|
| Express | REST API |
| Mongoose | ODM для MongoDB |
| jsonwebtoken | JWT |
| bcryptjs | Хэширование паролей |
| express-rate-limit | Защита от брутфорса |
| helmet | Security headers |
| compression | GZIP |
| cors | CORS (читает `ALLOWED_ORIGINS` из `.env`) |

---

## 📡 API — эндпоинты

| Метод | URL | Описание | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Регистрация | — |
| `POST` | `/api/auth/login` | Вход | — |
| `GET` | `/api/auth/user` | Текущий пользователь | ✅ |
| `POST` | `/api/auth/forgot-password` | Запрос сброса пароля | — |
| `POST` | `/api/auth/reset-password/:token` | Сброс пароля | — |
| `PUT` | `/api/users/profile` | Обновление профиля | ✅ |
| `GET` | `/api/workouts` | Список тренировок | ✅ |
| `POST` | `/api/workouts` | Добавить тренировку | ✅ |
| `DELETE` | `/api/workouts/:id` | Удалить тренировку | ✅ |
| `GET` | `/api/nutrition/entries` | Записи питания | ✅ |
| `GET` | `/api/goals` | Цели | ✅ |
| `POST` | `/api/goals` | Добавить цель | ✅ |
| `GET` | `/api/recommendations/:goal/:level` | Рекомендации тренировок | ✅ |
| `GET` | `/api/health` | Health check | — |

---

## 🤝 Вклад в проект

```bash
git checkout -b feature/my-feature
git commit -m 'feat: add my feature'
git push origin feature/my-feature
# → создайте Pull Request
```

---

## 📄 Лицензия

MIT — см. [LICENSE](LICENSE)

---

<p align="center">Сделано с ❤️ для достижения фитнес-целей</p>
