<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-7-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
</p>

<h1 align="center">⚡ FitTrack — Фитнес-трекер</h1>

<p align="center">
  Полнофункциональная платформа для отслеживания тренировок, питания и фитнес-целей.<br/>
  Тёмная и светлая тема · JWT-аутентификация · Docker-ready
</p>

---

## 🚀 Быстрый старт — VPS + Docker (рекомендуется)

Самый простой и надёжный способ. Один домен — нет проблем с CORS.

### Требования
- VPS с Linux (Ubuntu 22.04 / Debian 12)
- Docker Engine 24+ и Docker Compose v2

```bash
# Установка Docker одной командой (если ещё не установлен)
curl -fsSL https://get.docker.com | sh
```

### 1. Клонировать репозиторий

```bash
git clone https://github.com/ogSulem/Fitness-tracker.git
cd Fitness-tracker
```

### 2. Создать файл переменных окружения

```bash
cp server/.env.example .env
```

Откройте `.env` и заполните **обязательные** поля:

```env
JWT_SECRET=сгенерируйте_минимум_32_случайных_символа
CLIENT_URL=https://ваш-домен.com
```

> 💡 Быстрая генерация секрета: `openssl rand -hex 32`

### 3. Запустить

```bash
docker compose up -d --build
```

Приложение доступно на **http://IP:5001** (или по домену, если настроен Nginx-прокси).

### Управление

```bash
docker compose logs -f          # логи в реальном времени
docker compose ps               # статус контейнеров
docker compose down             # остановить
docker compose down -v          # остановить + удалить данные MongoDB
docker compose pull && \
  docker compose up -d --build  # обновить до последней версии
```

---

## 🌐 HTTPS + Nginx (production)

Для работы по HTTPS поставьте Nginx как reverse proxy.

```nginx
# /etc/nginx/sites-available/fittrack
server {
    listen 80;
    server_name ваш-домен.com www.ваш-домен.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name ваш-домен.com www.ваш-домен.com;

    ssl_certificate     /etc/letsencrypt/live/ваш-домен.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ваш-домен.com/privkey.pem;

    location / {
        proxy_pass         http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Получить SSL-сертификат Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d ваш-домен.com
sudo nginx -t && sudo systemctl reload nginx
```

После настройки Nginx обновите `.env`:
```env
CLIENT_URL=https://ваш-домен.com
```
И пересоберите: `docker compose up -d --build`

---

## 🔑 Переменные окружения

Файл `.env` лежит в **корне проекта** (рядом с `docker-compose.yml`).  
Шаблон: `server/.env.example`.

| Переменная | Обязательна | По умолчанию | Описание |
|---|---|---|---|
| `JWT_SECRET` | ✅ | — | Секрет для подписи JWT, ≥ 32 символа |
| `MONGO_URI` | — | `mongodb://mongo:27017/fittrack` | Строка подключения MongoDB |
| `CLIENT_URL` | — | `http://localhost:5001` | URL сайта (нужен для ссылки сброса пароля) |
| `PORT` | — | `5001` | Порт сервера |
| `NODE_ENV` | — | `production` (в Docker) | Окружение |
| `ALLOWED_ORIGINS` | только split | — | URL фронтенда при раздельном деплое |

---

## 💻 Локальный запуск (разработка)

### Требования
- Node.js 18+
- MongoDB (локально или Atlas)

### 1. Установить зависимости

```bash
git clone https://github.com/ogSulem/Fitness-tracker.git
cd Fitness-tracker

cd server && npm install
cd ../client && npm install
```

### 2. Настроить окружение

```bash
cp server/.env.example server/.env
```

Минимальный `server/.env` для локальной разработки:

```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/fittrack
JWT_SECRET=local_dev_secret_key_12345678
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### 3. Запустить

```bash
# Терминал 1 — Backend (с авто-перезапуском)
cd server && npm run dev

# Терминал 2 — Frontend
cd client && npm start
```

Приложение откроется на **http://localhost:3000**.  
Frontend проксирует `/api/*` на `localhost:5001` через `"proxy"` в `client/package.json`.

### 4. Заполнить базу рекомендациями тренировок

```bash
cd server && npm run init-recommendations
```

---

## ✨ Возможности

| 🏋️ Тренировки | 🥗 Питание | 📊 Аналитика | 👤 Профиль |
|---|---|---|---|
| Календарь тренировок | Дневник по приёмам | Графики за 7/30/365 дней | Личные данные |
| Добавление активностей | Поиск продуктов из базы | Калории и длительность | Динамика веса |
| Расход калорий | Б/Ж/У | Doughnut по типам | История тренировок |
| Рекомендации | Навигация по датам | Питание vs. активность | Редактирование |
| Цели + прогресс-бар | Удаление записей | Список тренировок | Цели |

**🌙 Тёмная/Светлая тема** — автоопределение системы, сохранение в localStorage.  
**🔐 Аутентификация** — JWT, rate limiting, восстановление пароля по токену.

---

## 🏗️ Архитектура

```
Fitness-tracker/
├── Dockerfile               # Multi-stage: сборка React → Node.js сервер
├── docker-compose.yml       # app + MongoDB
├── .dockerignore
│
├── client/                  # React 18 (CRA)
│   ├── .env.example         # только для раздельного деплоя
│   └── src/
│       ├── components/      # Header, Calendar, DailyStats, WorkoutForm…
│       ├── context/         # AuthContext, ThemeContext, NotificationContext
│       ├── hooks/           # useAxiosInterceptor, useAuth, useCountUp
│       ├── pages/           # Home, Nutrition, Analytics, Profile, Login…
│       └── services/
│
└── server/                  # Node.js + Express
    ├── .env.example
    ├── server.js            # Точка входа (CORS, helmet, MongoDB, маршруты)
    ├── middleware/
    │   └── auth.js          # JWT middleware
    ├── models/              # User, Workout, FoodEntry, Goal, Recommendation
    ├── routes/              # auth, users, workouts, goals, nutrition, recommendations
    └── scripts/
        └── initRecommendations.js
```

В production `NODE_ENV=production` сервер сам отдаёт `client/build` — один домен, CORS не нужен.

---

## 📡 API

| Метод | URL | Описание | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Регистрация | — |
| `POST` | `/api/auth/login` | Вход | — |
| `GET` | `/api/auth/user` | Текущий пользователь | ✅ |
| `POST` | `/api/auth/forgot-password` | Запрос сброса пароля | — |
| `POST` | `/api/auth/reset-password/:token` | Сброс пароля | — |
| `PUT` | `/api/users/profile` | Обновление профиля | ✅ |
| `GET/POST` | `/api/workouts` | Тренировки | ✅ |
| `DELETE` | `/api/workouts/:id` | Удалить тренировку | ✅ |
| `GET` | `/api/workouts/date/:date` | Тренировки за дату | ✅ |
| `GET/POST` | `/api/nutrition/entries` | Питание | ✅ |
| `DELETE` | `/api/nutrition/entries/:id` | Удалить запись | ✅ |
| `GET/POST` | `/api/goals` | Цели | ✅ |
| `GET` | `/api/recommendations/:goal/:level` | Рекомендации | ✅ |
| `GET` | `/api/health` | Health check | — |

---

## 🛠️ Стек

| | Технология | Версия |
|---|---|---|
| **Frontend** | React | 18 |
| | Tailwind CSS | 3 |
| | Chart.js + react-chartjs-2 | 4 / 5 |
| | React Router | v6 |
| | Axios | 1.x |
| | Day.js | 1.x |
| **Backend** | Node.js + Express | 18 / 4.x |
| | MongoDB + Mongoose | 7 |
| | jsonwebtoken | 9.x |
| | bcryptjs | 2.x |
| | express-rate-limit | 7.x |
| | helmet | 7.x |
| | compression | 1.x |
| **Infra** | Docker + Compose | v2 |

---

## 🤝 Вклад в проект

```bash
git checkout -b feature/my-feature
git commit -m 'feat: my feature'
git push origin feature/my-feature
# → открыть Pull Request
```

---

## 📄 Лицензия

MIT — см. [LICENSE](LICENSE)

---

<p align="center">Сделано с ❤️ для достижения фитнес-целей</p>
