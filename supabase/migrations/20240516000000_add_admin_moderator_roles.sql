-- Изменяем ограничение для поля role в таблице profiles
ALTER TABLE profiles 
  DROP CONSTRAINT profiles_role_check;

-- Добавляем новое ограничение с доп. ролями
ALTER TABLE profiles 
  ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('job_seeker', 'employer', 'admin', 'moderator')); 