# 🎓 Система управления конференциями

Современное веб-приложение для подачи заявок на участие в научных, образовательных и профессиональных конференциях. Построено на Next.js 15 с использованием Appwrite в качестве backend-сервиса.

## ✨ Основные возможности

### Для участников:

- 📝 **Регистрация и авторизация** с подтверждением email
- 🔍 **Просмотр конференций** с фильтрацией по дате, тематике, формату
- 📄 **Подача заявок** с информацией о докладах и презентациях
- 📊 **Отслеживание статуса** заявок в реальном времени
- ✏️ **Редактирование заявок** до дедлайна
- 🏆 **Получение сертификатов** после участия
- ⏰ **Напоминания** о дедлайнах и датах мероприятий

### Для организаторов:

- 🎯 **Создание конференций** с детальными настройками
- 👥 **Модерация заявок** участников
- 👨‍🏫 **Назначение рецензентов** для оценки заявок
- 📅 **Управление программой** конференции
- 📈 **Аналитика и отчеты** по заявкам
- 💬 **Система комментариев** для обратной связи

### Для администраторов:

- 🛡️ **Управление пользователями** и их активацией
- ⚙️ **Системные настройки** и конфигурация
- 📊 **Полная аналитика** системы
- 🔐 **Контроль безопасности** и прав доступа

## 🛠 Технологический стек

- **Frontend**: Next.js 15 (App Router), React 19
- **Styling**: Tailwind CSS 4.1
- **Backend**: Appwrite (Database, Auth, Storage)
- **State Management**: Zustand
- **Data Fetching**: TanStack Query v5
- **UI Components**: Headless UI, Lucide React
- **Forms**: React Hook Form
- **Notifications**: React Toastify
- **Charts**: Chart.js, Recharts
- **TypeScript**: Полная типизация

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18.17.0 или выше
- npm 9.0.0 или выше
- Аккаунт Appwrite (Cloud или Self-hosted)

### 1. Клонирование проекта

```bash
git clone https://github.com/your-username/conference-management-system.git
cd conference-management-system
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Настройка переменных окружения

Создайте файл `.env.local` на основе `.env.example`:

```bash
cp .env.example .env.local
```

Заполните необходимые переменные:

```env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
APPWRITE_API_KEY=your_api_key

# Collections IDs
NEXT_PUBLIC_USERS_COLLECTION_ID=users
NEXT_PUBLIC_CONFERENCES_COLLECTION_ID=conferences
NEXT_PUBLIC_APPLICATIONS_COLLECTION_ID=applications
NEXT_PUBLIC_APPLICATION_COMMENTS_COLLECTION_ID=application_comments
NEXT_PUBLIC_APPLICATION_HISTORY_COLLECTION_ID=application_history
NEXT_PUBLIC_CONFERENCE_SCHEDULE_COLLECTION_ID=conference_schedule
```

### 4. Настройка Appwrite

1. Создайте проект в [Appwrite Console](https://cloud.appwrite.io)
2. Создайте базу данных
3. Получите API ключ с правами Database, Users
4. Добавьте домен в Platform settings

### 5. Создание коллекций в базе данных

```bash
# Проверка подключения к Appwrite
npm run db:test

# Создание всех коллекций и индексов
npm run db:setup

# Или пересоздание (удаление и создание заново)
npm run db:reset-setup
```

### 6. Запуск проекта

```bash
# Режим разработки
npm run dev

# Сборка для продакшена
npm run build
npm start
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## 📚 Структура проекта

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Страницы аутентификации
│   ├── (dashboard)/         # Защищенные страницы
│   └── api/                 # API маршруты
├── components/              # React компоненты
│   ├── applications/        # Компоненты заявок
│   ├── conferences/         # Компоненты конференций
│   ├── dashboard/           # Компоненты дашборда
│   └── common/              # Общие компоненты
├── hooks/                   # Custom React hooks
├── services/                # API сервисы и React Query
├── store/                   # Zustand store
├── types/                   # TypeScript типы
├── utils/                   # Утилитарные функции
└── constants/               # Константы и конфигурация
```

## 🔐 Роли пользователей

### SUPER_ADMIN (Супер администратор)

- Полный доступ ко всем функциям системы
- Управление пользователями и системными настройками
- Первый зарегистрированный пользователь автоматически получает эту роль

### ORGANIZER (Организатор)

- Создание и управление конференциями
- Модерация заявок участников
- Назначение рецензентов
- Формирование программы конференций

### REVIEWER (Рецензент)

- Рецензирование назначенных заявок
- Оставление комментариев и рекомендаций
- Участие в процессе отбора докладов

### PARTICIPANT (Участник)

- Просмотр доступных конференций
- Подача заявок на участие
- Отслеживание статуса заявок
- Получение сертификатов

## 🎨 Дизайн-система

Проект использует согласованную дизайн-систему с:

- **Цветовая палитра**: Основана на Indigo (синий) с акцентными цветами
- **Типографика**: System fonts с резервными шрифтами
- **Компоненты**: Переиспользуемые UI компоненты
- **Иконки**: Lucide React для консистентности
- **Анимации**: Subtle transitions и hover effects
- **Адаптивность**: Mobile-first подход

## 📱 Адаптивность

- **Desktop**: Полнофункциональный интерфейс
- **Tablet**: Адаптированная навигация и компоновка
- **Mobile**: Оптимизированный для сенсорного управления

## 🔧 Полезные команды

```bash
# Разработка
npm run dev                  # Запуск в режиме разработки
npm run lint                 # Проверка кода ESLint
npm run lint:fix            # Автоисправление ESLint
npm run type-check          # Проверка типов TypeScript

# База данных
npm run db:test             # Проверка подключения к Appwrite
npm run db:setup            # Создание коллекций
npm run db:reset            # Удаление коллекций
npm run db:reset-setup      # Пересоздание коллекций

# Сборка
npm run build               # Сборка для продакшена
npm run start               # Запуск продакшен сборки
npm run analyze             # Анализ размера бандла
```

## 🐛 Отладка

### Частые проблемы:

1. **Ошибки подключения к Appwrite**

   ```bash
   npm run db:test  # Проверьте подключение
   ```

2. **Проблемы с коллекциями**

   ```bash
   npm run db:reset-setup  # Пересоздайте коллекции
   ```

3. **Ошибки типизации**
   ```bash
   npm run type-check  # Проверьте типы
   ```

## 🤝 Участие в разработке

1. Fork проекта
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект распространяется под лицензией MIT. Подробности в файле [LICENSE](LICENSE).

## 🆘 Поддержка

- 📧 Email: support@conference-system.com
- 💬 GitHub Issues: [Создать issue](https://github.com/your-username/conference-management-system/issues)
- 📖 Wiki: [Документация](https://github.com/your-username/conference-management-system/wiki)

## 🎯 Roadmap

- [ ] 📱 Мобильное приложение (React Native)
- [ ] 🔗 Интеграция с календарями (Google Calendar, Outlook)
- [ ] 📊 Расширенная аналитика и машинное обучение
- [ ] 🌐 Мультиязычность (i18n)
- [ ] 🎥 Интеграция с видеоконференциями (Zoom, Teams)
- [ ] 📝 Система peer-review
- [ ] 🏆 Gamification и рейтинги
- [ ] 🔌 API для внешних интеграций

---

Made with ❤️ for the academic and professional community
