# Fitness Tracker - Инструкция по запуску локально

## Описание проекта

**Fitness Tracker** - это веб-приложение для учета тренировок и питания в фитнес-клубе. Приложение позволяет пользователям логировать тренировки, отслеживать питание с расчетом КБЖУ, записываться к тренерам и просматривать прогресс.

## Требования

Перед запуском убедитесь, что на вашем компьютере установлены:

1. **Node.js** (версия 18 или выше)
   - Скачать: https://nodejs.org/
   - Проверить установку: `node --version`

2. **MySQL** (версия 8.0 или выше)
   - Скачать: https://www.mysql.com/downloads/
   - Или использовать Docker: `docker run -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root mysql:8.0`

3. **VS Code** (опционально, но рекомендуется)
   - Скачать: https://code.visualstudio.com/

4. **Git** (опционально, для клонирования)
   - Скачать: https://git-scm.com/

## Пошаговая инструкция по запуску

### Шаг 1: Распаковать архив

Распакуй архив `fitness-tracker.zip` в удобное место на диске:
```bash
unzip fitness-tracker.zip
cd fitness-tracker
```

### Шаг 2: Установить зависимости

Открой терминал в папке проекта и выполни команду:
```bash
npm install
```

Или если у тебя установлен pnpm:
```bash
pnpm install
```

Это займет 2-3 минуты.

### Шаг 3: Создать файл .env

Создай файл `.env` в корне проекта (рядом с package.json) со следующим содержимым:

```env
# Database
DATABASE_URL="mysql://root:root@localhost:3306/fitness_tracker"

# Auth
JWT_SECRET="your-secret-key-change-this-in-production"

# Environment
NODE_ENV="development"
PORT=3000

# OAuth (для локального развития используй эти значения)
VITE_APP_ID="local_app"
OAUTH_SERVER_URL="http://localhost:3000"
VITE_OAUTH_PORTAL_URL="http://localhost:3000"
OWNER_OPEN_ID="test_user"
OWNER_NAME="Test User"

# Analytics (опционально)
VITE_ANALYTICS_ENDPOINT="http://localhost:3000"
VITE_ANALYTICS_WEBSITE_ID="local"

# Storage (опционально)
BUILT_IN_FORGE_API_URL="http://localhost:3000"
BUILT_IN_FORGE_API_KEY="test_key"
VITE_FRONTEND_FORGE_API_URL="http://localhost:3000"
VITE_FRONTEND_FORGE_API_KEY="test_key"
```

**Важно:** Измени `root:root` на твои учетные данные MySQL, если они отличаются.

### Шаг 4: Создать базу данных MySQL

Открой MySQL консоль:
```bash
mysql -u root -p
```

Введи пароль (по умолчанию `root`).

В MySQL консоли выполни:
```sql
CREATE DATABASE fitness_tracker;
EXIT;
```

### Шаг 5: Запустить миграции БД

Вернись в терминал проекта и выполни:
```bash
npm run db:push
```

Это создаст все необходимые таблицы в БД.

### Шаг 6: Запустить приложение

Выполни команду:
```bash
npm run dev
```

Приложение запустится и будет доступно по адресу:
```
http://localhost:3000
```

Открой этот адрес в браузере.

## Использование приложения

### Первый вход

При первом входе тебе нужно будет создать аккаунт. Используй любой email и пароль.

### Основные функции

1. **Панель управления** - просмотр статистики и графиков
2. **Тренировки** - логирование упражнений с количеством подходов и повторений
3. **Питание** - добавление приемов пищи с автоматическим расчетом КБЖУ
4. **Записи** - запись к тренерам на определенное время
5. **Профиль** - редактирование личных данных и целей тренировок
6. **Панель администратора** - управление пользователями и упражнениями (для администраторов)

### Тестовые данные

В БД уже загружены:
- 12 упражнений (жим лежа, приседания, становая тяга и т.д.)
- 22 продукта (курица, рыба, овощи, фрукты и т.д.)

## Решение проблем

### Ошибка: "Cannot find module 'mysql2'"
```bash
npm install
```

### Ошибка: "Connection refused" для БД
Проверь, что MySQL запущен:
```bash
# На Windows
mysql -u root -p

# На Mac/Linux
sudo service mysql status
```

### Ошибка: "Port 3000 is already in use"
Измени PORT в файле .env на другой, например 3001:
```env
PORT=3001
```

### Ошибка: "Database does not exist"
Убедись, что ты создал БД:
```bash
mysql -u root -p
CREATE DATABASE fitness_tracker;
EXIT;
```

## Структура проекта

```
fitness-tracker/
├── client/                 # React фронтенд
│   ├── src/
│   │   ├── pages/         # Страницы приложения
│   │   ├── components/    # React компоненты
│   │   ├── App.tsx        # Главный компонент
│   │   └── index.css      # Глобальные стили
│   └── index.html
├── server/                # Node.js бэкенд
│   ├── routers.ts         # tRPC процедуры (API endpoints)
│   ├── db.ts              # Функции работы с БД
│   └── _core/             # Внутренние файлы фреймворка
├── drizzle/               # Миграции БД
│   └── schema.ts          # Схема БД
├── package.json           # Зависимости проекта
├── .env                   # Переменные окружения
└── README_SETUP.md        # Этот файл
```

## Технологический стек

- **Фронтенд:** React 19, TypeScript, Tailwind CSS 4, shadcn/ui
- **Бэкенд:** Node.js, Express, tRPC
- **БД:** MySQL
- **Визуализация:** Recharts
- **Аутентификация:** JWT

## Дополнительные команды

```bash
# Проверить TypeScript ошибки
npm run check

# Запустить тесты
npm run test

# Форматировать код
npm run format

# Построить для продакшена
npm run build

# Запустить продакшн версию
npm start
```

## Контакт

Если у тебя возникли вопросы, обратись к преподавателю или разработчику проекта.

---

**Дата создания:** 2026-04-14
**Версия:** 1.0.0
**Статус:** Готово к защите дипломного проекта
