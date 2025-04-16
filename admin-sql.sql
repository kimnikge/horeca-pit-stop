-- Получаем текущее ограничение
SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = 'profiles_role_check';

-- Удаляем ограничение
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Добавляем новое ограничение
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('job_seeker', 'employer', 'admin', 'moderator'));

-- Создаем пользователя напрямую (пароль - admin123)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES 
  (gen_random_uuid(), '77071422089@yandex.ru', '$2a$10$zx.qmMzlqOQlX0Ey6Bup.OtDrZiJgIWgCajhudUmKw8NN7KdUC4JC', NOW(), NOW(), NOW(), '{"name":"SuperAdmin","role":"admin"}');

-- Получаем ID только что созданного пользователя
SELECT id FROM auth.users WHERE email = '77071422089@yandex.ru';

-- Создаем профиль для этого пользователя
INSERT INTO public.profiles (id, email, role, name, created_at, updated_at)
SELECT id, email, 'admin', 'SuperAdmin', NOW(), NOW()
FROM auth.users
WHERE email = '77071422089@yandex.ru';

-- Проверяем созданный профиль
SELECT * FROM public.profiles WHERE email = '77071422089@yandex.ru'; 