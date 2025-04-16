"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase"

type Moderator = {
  id: string
  name: string
  email: string
  created_at: string
}

export default function ModeratorsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [moderators, setModerators] = useState<Moderator[]>([])
  const [loading, setLoading] = useState(true)
  const [authChecking, setAuthChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Проверяем наличие прав администратора
  useEffect(() => {
    const checkAdminAccess = async () => {
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

        if (!profile || profile.role !== "admin") {
          // Только админы могут просматривать модераторов
          router.push("/admin/dashboard")
        }
      } catch (error) {
        console.error("Ошибка при проверке доступа:", error)
        router.push("/admin/dashboard")
      } finally {
        setAuthChecking(false)
      }
    }

    checkAdminAccess()
  }, [user, router])

  // Загружаем список модераторов
  useEffect(() => {
    const fetchModerators = async () => {
      if (authChecking) return

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, name, email, created_at")
          .eq("role", "moderator")
          .order("created_at", { ascending: false })

        if (error) throw error

        setModerators(data || [])
      } catch (error) {
        console.error("Ошибка при загрузке модераторов:", error)
        setError("Не удалось загрузить список модераторов")
      } finally {
        setLoading(false)
      }
    }

    fetchModerators()
  }, [authChecking])

  // Удаление модератора
  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить этого модератора?")) {
      return
    }

    setDeleteId(id)
    setDeleteLoading(true)

    try {
      // 1. Обновляем роль в profiles на "user"
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ role: "user" })
        .eq("id", id)

      if (profileError) throw profileError

      // 2. Удаляем модератора из списка
      setModerators(moderators.filter(mod => mod.id !== id))

    } catch (error) {
      console.error("Ошибка при удалении модератора:", error)
      setError("Не удалось удалить модератора")
    } finally {
      setDeleteId(null)
      setDeleteLoading(false)
    }
  }

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
        <h1 className="text-2xl font-bold">Управление модераторами</h1>
        <div className="flex gap-4">
          <Link 
            href="/admin/dashboard"
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
          >
            Назад
          </Link>
          <Link 
            href="/admin/add-moderator"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Добавить модератора
          </Link>
        </div>
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
      ) : moderators.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-lg shadow">
          <p className="text-gray-500">Модераторы не найдены</p>
          <p className="mt-2 text-sm text-gray-400">Вы можете добавить нового модератора, нажав на кнопку выше</p>
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
                  Дата добавления
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {moderators.map((moderator) => (
                <tr key={moderator.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{moderator.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{moderator.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(moderator.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(moderator.id)}
                      disabled={deleteLoading && deleteId === moderator.id}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                      {deleteLoading && deleteId === moderator.id ? "Удаление..." : "Удалить"}
                    </button>
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