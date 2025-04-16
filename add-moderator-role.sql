-- Обновляем ограничение CHECK для поля role, добавляя роль 'moderator'
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('job_seeker', 'employer', 'moderator'));

-- Проверяем обновленное ограничение
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'profiles_role_check'; 