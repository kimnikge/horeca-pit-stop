import { createClient } from "@supabase/supabase-js"

/**
 * Получаем URL и API ключ из переменных окружения
 * В продакшн эти значения должны быть установлены на платформе деплоя (Vercel, Netlify и т.д.)
 * В локальной разработке они берутся из файла .env.local
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Проверяем наличие обязательных переменных окружения
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Отсутствуют переменные окружения Supabase. Убедитесь, что они правильно настроены.")
}

/**
 * Создаем клиент Supabase для использования во всем приложении
 * persistSession: true - сохраняет сессию в localStorage
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true
  }
})

/**
 * Создание клиента с сервисной ролью для административных операций
 * Этот клиент не должен использоваться на стороне клиента, только в серверных компонентах или API routes
 */
export const getServiceSupabase = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {
    throw new Error('Отсутствует ключ сервисной роли Supabase');
  }

  return createClient(supabaseUrl, serviceRoleKey);
}; 