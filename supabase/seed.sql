-- После регистрации пользователя с email 77071422089@yandex.ru
-- выполните этот скрипт, чтобы сделать его администратором
UPDATE profiles 
SET role = 'admin' 
WHERE email = '77071422089@yandex.ru'; 