# Telegram Farm Game - Mini App

Фермерская игра для Telegram Mini App, разработанная на основе подробного технического задания.

## Структура проекта

- `frontend/` - React приложение (веб-интерфейс игры)
- `backend/` - Node.js API сервер
- `docs/` - Документация проекта

## Технологический стек

### Frontend
- React 18 + TypeScript
- Vite (быстрая сборка)
- Telegram WebApp SDK
- React Router для навигации
- Zustand для state management
- Axios для API запросов
- CSS Modules / Tailwind CSS

### Backend
- Node.js + Express + TypeScript
- Prisma ORM
- PostgreSQL
- JWT аутентификация
- bcrypt для хэширования паролей

## Быстрый старт

### Требования
- Node.js 18+
- PostgreSQL 14+
- npm или yarn

### Установка

1. Клонировать репозиторий
2. Установить зависимости для backend:
```bash
cd backend
npm install
```

3. Настроить переменные окружения:
```bash
cp .env.example .env
# Отредактировать .env файл
```

4. Запустить миграции базы данных:
```bash
npm run prisma:migrate
```

5. Установить зависимости для frontend:
```bash
cd frontend
npm install
```

### Запуск в режиме разработки

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

## Основные возможности MVP

- Регистрация и авторизация пользователей
- Интеграция с Telegram (получение Telegram ID и username)
- Игровое поле 5x5 для размещения оборудования
- 5 типов оборудования с разными характеристиками
- Система токенов (внутриигровая валюта)
- Магазин для покупки оборудования
- Система заданий (обучающие задания)
- Профиль игрока с статистикой
- Реферальная система

## API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `POST /api/auth/telegram` - Авторизация через Telegram

### Игрок
- `GET /api/player/profile` - Профиль игрока
- `GET /api/player/farm` - Состояние фермы

### Оборудование
- `GET /api/equipment` - Список доступного оборудования
- `POST /api/equipment/place` - Разместить оборудование
- `DELETE /api/equipment/:id` - Удалить оборудование
- `POST /api/equipment/:id/collect` - Собрать ресурсы

### Магазин
- `GET /api/shop/items` - Товары в магазине
- `POST /api/shop/buy` - Купить товар

### Задания
- `GET /api/quests` - Список заданий
- `POST /api/quests/:id/complete` - Завершить задание

### Реферальная система
- `GET /api/referral/link` - Получить реферальную ссылку
- `GET /api/referral/stats` - Статистика рефералов

## База данных

Схема базы данных включает следующие таблицы:
- `users` - Пользователи
- `player_profiles` - Профили игроков
- `equipment_templates` - Шаблоны оборудования
- `player_equipment` - Оборудование игроков
- `quests` - Задания
- `player_quests` - Прогресс заданий игроков
- `referrals` - Реферальные связи
- `transactions` - История транзакций

## Разработка

### Принципы разработки
- Все данные хранятся на сервере
- Валидация на стороне сервера
- Безопасность: хэширование паролей, JWT токены
- Адаптивный дизайн (мобильные устройства приоритет)
- Оптимизация производительности

### Структура кода
- Чистый и понятный код
- TypeScript для type safety
- Модульная архитектура
- Разделение логики (контроллеры, сервисы, модели)

## Лицензия

Proprietary
