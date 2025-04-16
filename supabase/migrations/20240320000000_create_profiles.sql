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