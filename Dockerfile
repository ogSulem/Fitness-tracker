# ─── Stage 1: Build React ────────────────────────────────────────────────────
FROM node:18-alpine AS client-build

WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci --silent

COPY client/ ./
# REACT_APP_API_URL не нужен: в production сервер сам отдаёт фронт (один домен)
RUN npm run build

# ─── Stage 2: Production server ──────────────────────────────────────────────
FROM node:18-alpine AS production

WORKDIR /app/server

# Зависимости сервера
COPY server/package*.json ./
RUN npm ci --only=production --silent

# Исходный код сервера
COPY server/ ./

# Скопировать собранный фронтенд в папку, откуда сервер отдаёт статику
COPY --from=client-build /app/client/build ../client/build

ENV NODE_ENV=production
EXPOSE 5001

CMD ["node", "server.js"]
