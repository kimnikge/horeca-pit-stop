-- Проверяем, существует ли таблица profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('job_seeker', 'employer')),
  name TEXT,
  phone TEXT,
  city TEXT,
  experience TEXT,
  skills TEXT,
  resume_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Создаем функцию для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггер для обновления updated_at
DROP TRIGGER IF EXISTS set_updated_at_timestamp ON profiles;
CREATE TRIGGER set_updated_at_timestamp
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Создаем функцию для автоматического создания профиля при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'job_seeker'),
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$;

-- Создаем или обновляем триггер для автоматического создания профиля при регистрации
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Включаем расширения для работы с UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Проверяем, включены ли RLS (Row Level Security) для таблицы profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Создаем политики доступа
CREATE POLICY "Пользователи могут просматривать все профили"
  ON profiles FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Пользователи могут обновлять только свой профиль"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Проверяем таблицу
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'profiles'
);

-- Проверяем наличие триггеров
SELECT trigger_name
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
AND event_object_table = 'users'
AND trigger_name = 'on_auth_user_created'; 