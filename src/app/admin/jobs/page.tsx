"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase"

type Job = {
  id: string
  title: string
  company: string
  location: string
  status: string
  created_at: string
  employer_id: string
  employer_name?: string
}

export default function JobsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
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
          // Только админы и модераторы могут просматривать вакансии
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

  // Загружаем список вакансий
  useEffect(() => {
    const fetchJobs = async () => {
      if (authChecking) return

      try {
        // Получаем вакансии с информацией о работодателе
        const { data: jobsData, error: jobsError } = await supabase
          .from("jobs")
          .select("id, title, company, location, status, created_at, employer_id")
          .order("created_at", { ascending: false })

        if (jobsError) throw jobsError

        // Получаем информацию о работодателях
        const employerIds = [...new Set(jobsData?.map(job => job.employer_id) || [])]
        
        if (employerIds.length > 0) {
          const { data: employersData, error: employersError } = await supabase
            .from("profiles")
            .select("id, name")
            .in("id", employerIds)

          if (employersError) throw employersError

          // Добавляем имена работодателей к вакансиям
          const jobsWithEmployers = jobsData?.map(job => {
            const employer = employersData?.find(emp => emp.id === job.employer_id)
            return {
              ...job,
              employer_name: employer?.name || "Неизвестный"
            }
          })

          setJobs(jobsWithEmployers || [])
        } else {
          setJobs(jobsData || [])
        }
      } catch (error) {
        console.error("Ошибка при загрузке вакансий:", error)
        setError("Не удалось загрузить список вакансий")
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [authChecking])

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("jobs")
        .update({ status })
        .eq("id", id)

      if (error) throw error

      setJobs(jobs.map(job => 
        job.id === id ? { ...job, status } : job
      ))
    } catch (error) {
      console.error("Ошибка при обновлении статуса:", error)
      setError("Не удалось обновить статус вакансии")
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
        <h1 className="text-2xl font-bold">Управление вакансиями</h1>
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
      ) : jobs.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-lg shadow">
          <p className="text-gray-500">Вакансии не найдены</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Название
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Компания
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Работодатель
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Локация
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата создания
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{job.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{job.company}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{job.employer_name || "—"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{job.location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${job.status === 'active' ? 'bg-green-100 text-green-800' : 
                      job.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'}`}>
                      {job.status === 'active' ? 'Активна' : 
                      job.status === 'pending' ? 'На модерации' : 
                      'Отклонена'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(job.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {job.status !== 'active' && (
                        <button
                          onClick={() => handleStatusChange(job.id, 'active')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Одобрить
                        </button>
                      )}
                      {job.status !== 'rejected' && (
                        <button
                          onClick={() => handleStatusChange(job.id, 'rejected')}
                          className="text-red-600 hover:text-red-900"
                        >
                          Отклонить
                        </button>
                      )}
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