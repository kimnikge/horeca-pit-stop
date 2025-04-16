"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase"

type User = {
  id: string
  email: string
  name: string
  role: string
  created_at: string
}

export default function UsersPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [authChecking, setAuthChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Проверяем наличие прав администратора или модератора
  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        router.push("/admin/login")
        return
      }

      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()

        if (!profile || (profile.role !== "admin" && profile.role !== "moderator")) {
          // Только админы и модераторы могут просматривать пользователей
          router.push("/admin/dashboard")
        }
      } catch (error) {
        console.error("Ошибка при проверке доступа:", error)
        router.push("/admin/dashboard")
      } finally {
        setAuthChecking(false)
      }
    }

    checkAccess()
  }, [user, router])

  // Загружаем список пользователей
  useEffect(() => {
    const fetchUsers = async () => {
      if (authChecking) return

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, email, name, role, created_at")
          .order("created_at", { ascending: false })

        if (error) throw error

        setUsers(data || [])
      } catch (error) {
        console.error("Ошибка при загрузке пользователей:", error)
        setError("Не удалось загрузить список пользователей")
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [authChecking])

  if (authChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Управление пользователями</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Назад
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-lg shadow">
          <p className="text-gray-500">Пользователи не найдены</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Имя
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Роль
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата регистрации
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.name || "Без имени"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                      user.role === 'moderator' ? 'bg-blue-100 text-blue-800' : 
                      user.role === 'employer' ? 'bg-green-100 text-green-800' : 
                      'bg-gray-100 text-gray-800'}`}>
                      {user.role === 'admin' ? 'Администратор' : 
                      user.role === 'moderator' ? 'Модератор' : 
                      user.role === 'employer' ? 'Работодатель' : 
                      'Соискатель'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
} 