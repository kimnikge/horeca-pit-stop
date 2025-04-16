"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase"

export default function AdminLoginPage() {
  const router = useRouter()
  const { signIn } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await signIn(email, password)
      
      // Проверяем, существует ли профиль пользователя в базе данных
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error("Не удалось получить данные пользователя")
      }

      // Принудительная проверка профиля
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()
      
      if (profileError || !profile) {
        // Если профиль не найден, выполняем выход и показываем ошибку
        await supabase.auth.signOut()
        throw new Error("Профиль пользователя не найден. Возможно, учётная запись была удалена.")
      }
      
      // Проверяем, является ли пользователь модератором или админом
      if (profile.role !== "moderator" && profile.role !== "admin") {
        // Если пользователь не имеет прав, выходим из системы
        await supabase.auth.signOut()
        throw new Error("У вас нет доступа к панели администратора")
      }
      
      // Устанавливаем интервал проверки профиля
      const checkProfileInterval = setInterval(async () => {
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        
        if (!currentUser) {
          clearInterval(checkProfileInterval)
          return
        }
        
        const { data: currentProfile, error: currentProfileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", currentUser.id)
          .single()
        
        if (currentProfileError || !currentProfile) {
          await supabase.auth.signOut()
          clearInterval(checkProfileInterval)
          window.location.reload()
        }
      }, 15000)

      // Сохраняем интервал для последующей очистки
      window.sessionStorage.setItem('profileCheckInterval', String(checkProfileInterval))
      
      // Перенаправляем на панель администратора
      router.push("/admin/dashboard")
      
    } catch (error) {
      console.error("Ошибка входа:", error)
      setError(
        error instanceof Error ? error.message : "Произошла ошибка при входе"
      )
      setLoading(false)
    }
  }

  // Очищаем интервал проверки профиля при размонтировании компонента
  useEffect(() => {
    return () => {
      const intervalId = window.sessionStorage.getItem('profileCheckInterval')
      if (intervalId) {
        clearInterval(parseInt(intervalId))
        window.sessionStorage.removeItem('profileCheckInterval')
      }
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Вход для администраторов</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-3 py-2 border rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Пароль
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 border rounded-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Вход..." : "Войти"}
          </button>
        </form>
        
        <div className="mt-4 text-center text-sm text-gray-600">
          <Link href="/" className="hover:underline">
            Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  )
} 