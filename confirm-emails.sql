-- Автоматически подтверждаем email для всех неподтвержденных пользователей
UPDATE auth.users
SET email_confirmed_at = now(),
    is_sso_user = false,
    confirmed_at = now()
WHERE email_confirmed_at IS NULL;

-- Проверяем, что все email подтверждены
SELECT id, email, email_confirmed_at
FROM auth.users
WHERE email_confirmed_at IS NULL; 