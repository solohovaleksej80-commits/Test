# Инструкция по установке и запуску

## Требования

- Node.js 18+ (рекомендуется 20+)
- PostgreSQL 14+
- npm или yarn

## Шаг 1: Настройка базы данных

1. Установите PostgreSQL, если еще не установлен
2. Создайте базу данных:

```bash
createdb farm_game
```

Или через psql:

```sql
CREATE DATABASE farm_game;
```

## Шаг 2: Настройка Backend

1. Перейдите в директорию backend:

```bash
cd backend
```

2. Установите зависимости:

```bash
npm install
```

3. Создайте файл `.env` на основе `.env.example`:

```bash
cp ../.env.example .env
```

4. Отредактируйте `.env` файл, добавив свои настройки:

```env
NODE_ENV=development
PORT=3000

# Замените на вашу реальную строку подключения к PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/farm_game?schema=public"

# Сгенерируйте сильный секретный ключ для JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Telegram Bot (опционально для MVP, можно оставить пустым)
TELEGRAM_BOT_TOKEN=
TELEGRAM_BOT_USERNAME=

FRONTEND_URL=http://localhost:5173

# Игровая конфигурация
INITIAL_TOKENS=500
REFERRAL_REWARD=100
REFEREE_REWARD=50
```

5. Сгенерируйте Prisma клиент:

```bash
npm run prisma:generate
```

6. Запустите миграции базы данных:

```bash
npm run prisma:migrate
```

Введите название миграции, например: `initial`

7. Заполните базу начальными данными (оборудование, задания):

```bash
npm run prisma:seed
```

8. Запустите backend сервер:

```bash
npm run dev
```

Backend должен запуститься на `http://localhost:3000`

## Шаг 3: Настройка Frontend

1. Откройте новый терминал и перейдите в директорию frontend:

```bash
cd frontend
```

2. Установите зависимости:

```bash
npm install
```

3. Создайте файл `.env` (опционально):

```bash
echo "VITE_API_URL=http://localhost:3000/api" > .env
```

4. Запустите frontend сервер:

```bash
npm run dev
```

Frontend должен запуститься на `http://localhost:5173`

## Шаг 4: Проверка работы

1. Откройте браузер и перейдите на `http://localhost:5173`
2. Зарегистрируйте новый аккаунт
3. После регистрации вы будете перенаправлены на главную страницу фермы
4. Проверьте основные функции:
   - Перейдите в магазин и купите оборудование
   - Разместите оборудование на ферме (пока только через API, в MVP нет drag-and-drop)
   - Проверьте задания
   - Посмотрите профиль и реферальную ссылку

## Использование Prisma Studio (опционально)

Для просмотра и редактирования данных в базе данных используйте Prisma Studio:

```bash
cd backend
npm run prisma:studio
```

Откроется браузер с графическим интерфейсом базы данных.

## Типичные проблемы

### Backend не запускается

- Проверьте, что PostgreSQL запущен
- Проверьте строку подключения DATABASE_URL в `.env`
- Убедитесь, что база данных создана
- Проверьте, что миграции выполнены успешно

### Frontend не может подключиться к backend

- Убедитесь, что backend запущен на порту 3000
- Проверьте настройки CORS в backend (файл `backend/src/server.ts`)
- Проверьте переменную VITE_API_URL в frontend

### Ошибки Prisma

- Попробуйте пересоздать клиент: `npm run prisma:generate`
- Проверьте схему: `npx prisma validate`
- Сбросьте базу (ВНИМАНИЕ: удалит все данные): `npx prisma migrate reset`

## Дальнейшая разработка

### Добавление нового оборудования

Отредактируйте файл `backend/prisma/seed.ts` и запустите:

```bash
npm run prisma:seed
```

### Добавление новых заданий

Аналогично, отредактируйте `backend/prisma/seed.ts` в разделе quests.

### Интеграция с Telegram

1. Создайте бота через @BotFather в Telegram
2. Получите токен бота
3. Добавьте токен в `.env` файл backend
4. Настройте Telegram Mini App (требуется HTTPS для production)

## Production Deploy

Для деплоя в production:

1. Используйте переменные окружения для секретов
2. Настройте HTTPS
3. Используйте реверс-прокси (nginx)
4. Настройте автоматический запуск (PM2, systemd)
5. Настройте регулярные бэкапы базы данных
6. Включите логирование и мониторинг
