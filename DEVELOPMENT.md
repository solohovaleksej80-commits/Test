# Руководство разработчика

## Структура проекта

```
/
├── backend/              # Node.js + Express + TypeScript
│   ├── prisma/          # Схема БД и миграции
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── controllers/ # Обработчики HTTP запросов
│   │   ├── middleware/  # Middleware (auth, validation, errors)
│   │   ├── routes/      # Определение маршрутов
│   │   ├── services/    # Бизнес-логика
│   │   ├── types/       # TypeScript типы и интерфейсы
│   │   ├── utils/       # Утилиты (jwt, password, telegram)
│   │   └── server.ts    # Главный файл сервера
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/            # React + Vite + TypeScript
│   ├── public/         # Статические файлы
│   ├── src/
│   │   ├── api/        # API клиент (axios)
│   │   ├── components/ # React компоненты
│   │   ├── pages/      # Страницы приложения
│   │   ├── store/      # Zustand store (state management)
│   │   ├── types/      # TypeScript типы
│   │   ├── App.tsx     # Главный компонент с роутингом
│   │   └── main.tsx    # Точка входа
│   ├── package.json
│   └── vite.config.ts
│
├── .env.example        # Пример переменных окружения
├── .gitignore
├── README.md
├── SETUP.md            # Инструкция по установке
└── DEVELOPMENT.md      # Это руководство
```

## Архитектура Backend

### Слои приложения

1. **Routes** (`src/routes/`) - определяют URL endpoints
2. **Controllers** (`src/controllers/`) - обрабатывают HTTP запросы/ответы
3. **Services** (`src/services/`) - содержат бизнес-логику
4. **Prisma ORM** - взаимодействие с базой данных

### Потоки данных

```
HTTP Request
    ↓
Routes → Middleware (auth, validation)
    ↓
Controllers → Валидация входных данных
    ↓
Services → Бизнес-логика
    ↓
Prisma → База данных
    ↓
Response
```

### Основные сервисы

- **AuthService** - регистрация, вход, привязка Telegram
- **GameService** - управление фермой и оборудованием
- **ShopService** - покупка товаров
- **QuestService** - система заданий
- **ReferralService** - реферальная программа

## Архитектура Frontend

### State Management

Используется **Zustand** для управления глобальным состоянием:

- `token` и `isAuthenticated` - состояние аутентификации
- `profile` - данные профиля игрока
- `farm` - состояние фермы
- `shopItems`, `quests`, `referralStats` - данные для разных разделов

### Компоненты

- **Header** - верхняя панель с уровнем и токенами
- **BottomNav** - нижняя навигация

### Страницы

- **Login/Register** - аутентификация
- **Farm** - главный экран с фермой (сетка 5x5)
- **Shop** - магазин оборудования
- **Quests** - список заданий
- **Profile** - профиль игрока и реферальная система

## API Endpoints

### Authentication

- `POST /api/auth/register` - регистрация
- `POST /api/auth/login` - вход
- `POST /api/auth/telegram` - авторизация через Telegram
- `POST /api/auth/link-telegram` - привязка Telegram (требует auth)

### Game

- `GET /api/game/profile` - профиль игрока
- `GET /api/game/farm` - состояние фермы
- `POST /api/game/equipment` - разместить оборудование
- `POST /api/game/equipment/:id/collect` - собрать ресурсы
- `POST /api/game/collect-all` - собрать со всего оборудования
- `DELETE /api/game/equipment/:id` - удалить оборудование

### Shop

- `GET /api/shop/items` - список товаров
- `POST /api/shop/buy` - купить товар

### Quests

- `GET /api/quests` - список заданий
- `POST /api/quests/:id/claim` - получить награду

### Referral

- `GET /api/referral/link` - получить реферальную ссылку
- `GET /api/referral/stats` - статистика рефералов
- `GET /api/referral/list` - список рефералов

## Добавление новых функций

### Добавление нового API endpoint

1. Создайте метод в соответствующем **Service** (`backend/src/services/`)
2. Создайте метод в **Controller** (`backend/src/controllers/`)
3. Добавьте маршрут в **Routes** (`backend/src/routes/`)
4. Добавьте метод в API клиент (`frontend/src/api/client.ts`)
5. Обновите store, если нужно (`frontend/src/store/index.ts`)

### Добавление новой страницы

1. Создайте компонент в `frontend/src/pages/`
2. Добавьте CSS файл для стилей
3. Добавьте маршрут в `frontend/src/App.tsx`
4. Добавьте ссылку в навигацию, если нужно

### Изменение схемы базы данных

1. Отредактируйте `backend/prisma/schema.prisma`
2. Создайте миграцию: `npx prisma migrate dev --name описание_изменения`
3. Обновите seed файл, если нужно: `backend/prisma/seed.ts`
4. Обновите TypeScript типы в `backend/src/types/` и `frontend/src/types/`

## Безопасность

### Backend

- Все пароли хэшируются с помощью bcrypt (10 раундов)
- JWT токены для аутентификации
- Валидация входных данных с express-validator
- Проверка авторизации в middleware
- CORS настроен для разрешения только с frontend URL

### Frontend

- Токены хранятся в localStorage
- Автоматическое добавление токена в заголовки запросов
- Защищенные маршруты с редиректом на login
- Валидация форм на клиенте

## Тестирование

### Backend

Для тестирования API можно использовать:

- Postman
- curl
- Thunder Client (VS Code extension)

Пример curl запроса:

```bash
# Регистрация
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}'

# Вход
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}'

# Получить профиль (с токеном)
curl http://localhost:3000/api/game/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Frontend

- Ручное тестирование в браузере
- React DevTools для отладки компонентов
- Zustand DevTools для отладки состояния

## Известные ограничения MVP

1. **Размещение оборудования** - в MVP нужно указывать координаты вручную через API. В будущем добавить drag-and-drop интерфейс на frontend.

2. **Telegram интеграция** - базовая поддержка есть, но требуется дополнительная настройка для полной интеграции.

3. **Производство ресурсов** - рассчитывается в момент сбора. Нет фоновых процессов.

4. **Валидация размещения** - проверяется на backend, но визуальная обратная связь на frontend минимальна.

5. **Изображения оборудования** - используются emoji вместо реальных изображений.

## Планы развития

- [ ] Drag-and-drop размещение оборудования
- [ ] Реальные изображения для оборудования
- [ ] Анимации производства
- [ ] Звуковые эффекты
- [ ] Push уведомления через Telegram
- [ ] Система улучшения оборудования
- [ ] Расширение фермы
- [ ] Достижения с уникальными наградами
- [ ] Социальные функции (посещение ферм друзей)
- [ ] События и сезонные обновления
