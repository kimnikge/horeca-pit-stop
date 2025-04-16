<!DOCTYPE html>
<html>
<head>
  <title>Регистрация Admin</title>
  <script src="https://unpkg.com/@supabase/supabase-js@2"></script>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    .container { max-width: 500px; margin: 0 auto; }
    h1 { color: #333; }
    button { padding: 10px 15px; background: #4CAF50; color: white; border: none; cursor: pointer; }
    pre { background: #f4f4f4; padding: 10px; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Создание администратора</h1>
    <button id="createAdmin">Создать администратора</button>
    <div id="result" style="margin-top: 20px;"></div>
  </div>

  <script>
    const supabaseUrl = 'http://127.0.0.1:54321';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
    const supabase = supabase.createClient(supabaseUrl, supabaseKey);

    document.getElementById('createAdmin').addEventListener('click', async () => {
      try {
        const resultDiv = document.getElementById('result');
        resultDiv.innerHTML = '<p>Регистрация...</p>';

        // 1. Регистрируем пользователя
        const { data, error } = await supabase.auth.signUp({
          email: '77071422089@yandex.ru',
          password: 'admin123',
          options: {
            data: {
              name: 'SuperAdmin',
              role: 'admin'
            }
          }
        });

        if (error) throw error;

        resultDiv.innerHTML += `<p>Пользователь создан!</p>`;
        resultDiv.innerHTML += `<pre>${JSON.stringify(data, null, 2)}</pre>`;

        // 2. Вручную меняем роль в БД
        resultDiv.innerHTML += `<p>Выполните SQL запрос в SQL Editor из Supabase Studio:</p>`;
        resultDiv.innerHTML += `<pre>
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('job_seeker', 'employer', 'admin', 'moderator'));

-- После этого обновите роль
UPDATE profiles SET role = 'admin' WHERE email = '77071422089@yandex.ru';
        </pre>`;

      } catch (error) {
        document.getElementById('result').innerHTML = `<p>Ошибка: ${error.message}</p>`;
      }
    });
  </script>
</body>
</html> 