# Руководство по установке и запуску Fitness Tracker локально

## 📋 Требования

Перед началом убедитесь, что у вас установлены:

### 1. Node.js (версия 18+)
- **Скачать:** https://nodejs.org/
- **Проверка:** Откройте терминал и выполните:
  ```bash
  node --version
  npm --version
  ```

### 2. MySQL (версия 8.0+)
- **Скачать:** https://www.mysql.com/downloads/
- **Проверка:** 
  ```bash
  mysql --version
  ```

### 3. VS Code (рекомендуется)
- **Скачать:** https://code.visualstudio.com/

## 🚀 Быстрый старт (5 минут)

### Шаг 1: Распаковать проект
```bash
# Распакуй архив fitness-tracker.zip
unzip fitness-tracker.zip
cd fitness-tracker
```

### Шаг 2: Установить зависимости
```bash
npm install
```

### Шаг 3: Создать .env файл
Создай файл `.env` в корне проекта с содержимым:

```env
DATABASE_URL="mysql://root:root@localhost:3306/fitness_tracker"
JWT_SECRET="your-secret-key"
NODE_ENV="development"
PORT=3000
VITE_APP_ID="local_app"
OAUTH_SERVER_URL="http://localhost:3000"
VITE_OAUTH_PORTAL_URL="http://localhost:3000"
OWNER_OPEN_ID="test_user"
OWNER_NAME="Test User"
VITE_ANALYTICS_ENDPOINT="http://localhost:3000"
VITE_ANALYTICS_WEBSITE_ID="local"
BUILT_IN_FORGE_API_URL="http://localhost:3000"
BUILT_IN_FORGE_API_KEY="test_key"
VITE_FRONTEND_FORGE_API_URL="http://localhost:3000"
VITE_FRONTEND_FORGE_API_KEY="test_key"
```

### Шаг 4: Создать БД
```bash
mysql -u root -p
# Введи пароль (по умолчанию: root)

# В MySQL консоли выполни:
CREATE DATABASE fitness_tracker;
EXIT;
```

### Шаг 5: Запустить миграции
```bash
npm run db:push
```

### Шаг 6: Запустить приложение
```bash
npm run dev
```

**Готово!** Открой http://localhost:3000 в браузере.

## 🔧 Детальная инструкция по установке

### Windows

#### Установка Node.js
1. Перейди на https://nodejs.org/
2. Скачай LTS версию
3. Запусти установщик и следуй инструкциям
4. Перезагрузи компьютер

#### Установка MySQL
1. Перейди на https://www.mysql.com/downloads/
2. Скачай MySQL Server
3. Запусти установщик
4. При установке установи пароль для root пользователя (например: root)
5. Убедись, что MySQL запущена (должна быть в Services)

#### Запуск проекта
1. Откройте PowerShell или Command Prompt
2. Перейди в папку проекта:
   ```bash
   cd C:\Users\YourName\Desktop\fitness-tracker
   ```
3. Следуй шагам "Быстрый старт" выше

### Mac

#### Установка Node.js
```bash
# Используя Homebrew
brew install node
```

#### Установка MySQL
```bash
# Используя Homebrew
brew install mysql
brew services start mysql
```

#### Запуск проекта
1. Откройте Terminal
2. Перейди в папку проекта:
   ```bash
   cd ~/Desktop/fitness-tracker
   ```
3. Следуй шагам "Быстрый старт" выше

### Linux (Ubuntu/Debian)

#### Установка Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Установка MySQL
```bash
sudo apt-get install mysql-server
sudo mysql_secure_installation
```

#### Запуск проекта
1. Откройте Terminal
2. Перейди в папку проекта:
   ```bash
   cd ~/fitness-tracker
   ```
3. Следуй шагам "Быстрый старт" выше

## 📁 Структура проекта

```
fitness-tracker/
├── client/                    # React приложение (фронтенд)
│   ├── src/
│   │   ├── pages/            # Страницы приложения
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Workouts.tsx
│   │   │   ├── Nutrition.tsx
│   │   │   ├── Appointments.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── AdminPanel.tsx
│   │   │   └── ...
│   │   ├── components/       # React компоненты
│   │   ├── App.tsx           # Главный компонент
│   │   ├── main.tsx          # Entry point
│   │   └── index.css         # Глобальные стили
│   ├── index.html
│   └── package.json
├── server/                    # Node.js приложение (бэкенд)
│   ├── routers.ts            # tRPC процедуры (API endpoints)
│   ├── db.ts                 # Функции работы с БД
│   ├── storage.ts            # Работа с файлами
│   ├── _core/                # Внутренние файлы фреймворка
│   │   ├── index.ts
│   │   ├── context.ts
│   │   ├── trpc.ts
│   │   └── ...
│   └── package.json
├── drizzle/                   # Миграции БД
│   ├── schema.ts             # Определение таблиц
│   └── migrations/           # SQL миграции
├── shared/                    # Общие типы и константы
├── package.json              # Корневой package.json
├── tsconfig.json             # TypeScript конфиг
├── vite.config.ts            # Vite конфиг
├── .env                      # Переменные окружения (создать самостоятельно)
├── README_SETUP.md           # Инструкция по запуску
└── INSTALLATION_GUIDE.md     # Этот файл
```

## 🗄️ Структура БД

Приложение использует 10 таблиц MySQL:

1. **users** - Пользователи системы
2. **user_profiles** - Профили пользователей (возраст, вес, рост)
3. **exercises** - Справочник упражнений
4. **workouts** - Дневник тренировок
5. **workout_exercises** - Упражнения в тренировке
6. **foods** - Справочник продуктов
7. **meals** - Приемы пищи
8. **meal_items** - Продукты в приеме пищи
9. **trainers** - Информация о тренерах
10. **appointments** - Записи к тренерам

## 🔐 Переменные окружения

| Переменная | Описание | Пример |
|-----------|---------|--------|
| DATABASE_URL | Строка подключения к MySQL | mysql://root:root@localhost:3306/fitness_tracker |
| JWT_SECRET | Секретный ключ для JWT токенов | your-secret-key |
| NODE_ENV | Окружение (development/production) | development |
| PORT | Порт приложения | 3000 |
| VITE_APP_ID | ID приложения | local_app |
| OAUTH_SERVER_URL | URL OAuth сервера | http://localhost:3000 |

## 🐛 Решение проблем

### Проблема: "npm: command not found"
**Решение:** Node.js не установлен. Установи его с https://nodejs.org/

### Проблема: "mysql: command not found"
**Решение:** MySQL не установлен или не добавлен в PATH. Переустанови MySQL.

### Проблема: "Connection refused" при подключении к БД
**Решение:** 
```bash
# Проверь, запущена ли MySQL
mysql -u root -p
# Если не работает, перезагрузи MySQL:
# Windows: Services → MySQL → Restart
# Mac: brew services restart mysql
# Linux: sudo systemctl restart mysql
```

### Проблема: "Port 3000 is already in use"
**Решение:** Измени PORT в .env файле:
```env
PORT=3001
```

### Проблема: "Database does not exist"
**Решение:**
```bash
mysql -u root -p
CREATE DATABASE fitness_tracker;
EXIT;
npm run db:push
```

### Проблема: "Cannot find module"
**Решение:**
```bash
npm install
```

## 📚 Дополнительные команды

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

# Посмотреть логи
npm run dev 2>&1 | tee app.log
```

## 🎓 Для преподавателя

Приложение полностью готово к использованию. Все функции работают:

✅ Аутентификация пользователей  
✅ Логирование тренировок  
✅ Дневник питания с расчетом КБЖУ  
✅ Запись к тренерам  
✅ Редактирование профиля  
✅ Графики прогресса  
✅ Панель администратора  
✅ Экспорт данных  
✅ Валидация форм  

## 📞 Поддержка

Если возникли вопросы:
1. Проверь раздел "Решение проблем" выше
2. Посмотри логи приложения
3. Обратись к разработчику проекта

---

**Версия:** 1.0.0  
**Дата:** 2026-04-14  
**Статус:** Готово к защите дипломного проекта
