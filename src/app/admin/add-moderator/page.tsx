"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase"
import { toast } from "react-hot-toast"

export default function AddModeratorPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    // Проверяем авторизацию
    const checkAuth = async () => {
      if (!user) {
        router.push("/admin/login")
        return
      }

      try {
        // Получаем профиль пользователя
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()

        if (!profile || profile.role !== "admin") {
          // Перенаправляем на страницу входа, если пользователь не администратор
          router.push("/admin/login")
          return
        }

        setIsAuthorized(true)
      } catch (error) {
        console.error("Ошибка при проверке доступа:", error)
        router.push("/admin/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [user, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // 1. Регистрируем нового пользователя
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (error) throw error

      // 2. Обновляем профиль с ролью модератора
      if (data.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            role: "moderator",
            name: formData.name,
          })
          .eq("id", data.user.id)

        if (profileError) throw profileError

        toast.success("Модератор успешно добавлен")
        setFormData({ email: "", name: "", password: "" })
      }
    } catch (error) {
      console.error("Ошибка при добавлении модератора:", error)
      toast.error("Ошибка при добавлении модератора")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Загрузка...</div>
  }

  if (!isAuthorized) {
    return null // Перенаправление произойдет в useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Добавить модератора</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Назад
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow max-w-md mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Имя
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Пароль
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {submitting ? "Добавление..." : "Добавить модератора"}
          </button>
        </form>
      </div>
    </div>
  )
} 