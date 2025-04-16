Найдено 5 файлов миграций.

=== SQL-код для выполнения в веб-интерфейсе Supabase ===

-- Файл: 20240320000000_create_profiles.sql
-- Файл: 20240320000001_create_jobs.sql
-- Файл: 20240320000002_create_applications.sql
-- Файл: 20240320000003_create_notifications.sql
-- Файл: 20240320000004_create_messages.sql

-- ================ 20240320000000_create_profiles.sql ================
-- Create profiles table
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

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user creation with metadata
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
  user_name TEXT;
BEGIN
  -- Получаем данные из метаданных, если они есть
  user_role := (NEW.raw_user_meta_data->>'role')::TEXT;
  user_name := (NEW.raw_user_meta_data->>'name')::TEXT;
  
  -- Если роль не указана, используем значение по умолчанию
  IF user_role IS NULL OR user_role = '' OR (user_role != 'job_seeker' AND user_role != 'employer') THEN
    user_role := 'job_seeker';
  END IF;
  
  -- Вставляем запись в profiles
  INSERT INTO profiles (id, email, role, name)
  VALUES (NEW.id, NEW.email, user_role, user_name);
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to create profile on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user(); 


-- ================ 20240320000001_create_jobs.sql ================
-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  salary TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('full_time', 'part_time', 'contract')),
  employer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on employer_id for faster queries
CREATE INDEX IF NOT EXISTS jobs_employer_id_idx ON jobs(employer_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 


-- ================ 20240320000002_create_applications.sql ================
-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(job_id, user_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS applications_job_id_idx ON applications(job_id);
CREATE INDEX IF NOT EXISTS applications_user_id_idx ON applications(user_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 


-- ================ 20240320000003_create_notifications.sql ================
-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('new_application', 'application_status')),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to create notification on new application
CREATE OR REPLACE FUNCTION create_application_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, type, job_id, application_id)
  SELECT j.employer_id, 'new_application', NEW.job_id, NEW.id
  FROM jobs j
  WHERE j.id = NEW.job_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to create notification on new application
CREATE TRIGGER create_application_notification_trigger
  AFTER INSERT ON applications
  FOR EACH ROW
  EXECUTE FUNCTION create_application_notification();

-- Create function to create notification on application status change
CREATE OR REPLACE FUNCTION create_status_change_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status != NEW.status THEN
    INSERT INTO notifications (user_id, type, job_id, application_id)
    VALUES (NEW.user_id, 'application_status', NEW.job_id, NEW.id);
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to create notification on application status change
CREATE TRIGGER create_status_change_notification_trigger
  AFTER UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION create_status_change_notification(); 


-- ================ 20240320000004_create_messages.sql ================
-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_receiver_id_idx ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS messages_application_id_idx ON messages(application_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 



=== Инструкция по выполнению SQL в Supabase ===
1. Войдите в проект Supabase: https://app.supabase.com/project/rqxwhzumrcvtfyittrrr
2. Перейдите в раздел "SQL Editor"
3. Создайте новый запрос ("New query")
4. Вставьте весь SQL-код, скопированный выше
5. Нажмите "Run" для выполнения запроса
6. Проверьте, что все таблицы созданы в разделе "Table editor"
