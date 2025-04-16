# HoReCa Pit Stop

Платформа для поиска работы в сфере HoReCa (отели, рестораны, кафе).

## Обзор проекта

HoReCa Pit Stop — это специализированная платформа для соискателей и работодателей в индустрии гостеприимства. Проект позволяет:
- Размещать и искать вакансии в сфере HoReCa
- Создавать профили соискателей и работодателей
- Управлять откликами на вакансии
- Получать уведомления о новых вакансиях и откликах

## Технический стек

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS + Shadcn UI
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Дополнительно**: React Hook Form, Zod для валидации, Lucide иконки

## Установка и запуск

1. Клонировать репозиторий:
```bash
git clone https://github.com/your-username/horeca-pit-stop.git
cd horeca-pit-stop
```

2. Установить зависимости:
```bash
npm install
```

3. Создать файл `.env.local` на основе `.env.example`:
```bash
cp .env.example .env.local
```

4. Указать переменные окружения Supabase в файле `.env.local`

5. Запустить проект локально:
```bash
npm run dev
```

6. Открыть проект в браузере: [http://localhost:3000](http://localhost:3000)

## Структура базы данных

Проект использует Supabase в качестве бэкэнда. Основные таблицы:
- `profiles` - профили пользователей (соискатели, работодатели)
- `jobs` - объявления о вакансиях
- `applications` - отклики на вакансии
- `messages` - сообщения между соискателями и работодателями
- `notifications` - уведомления для пользователей

## Деплой

### Подготовка к деплою

1. Создать проект на Supabase и получить API ключи
2. Обновить переменные окружения в настройках хостинга
3. Запустить миграции из директории `supabase/migrations`

### Деплой на Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fhoreca-pit-stop)

## Лицензия

[MIT](LICENSE)
