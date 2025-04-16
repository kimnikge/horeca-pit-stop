"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase"

type Application = {
  id: string
  job_id: string
  applicant_id: string
  status: string
  created_at: string
  job_title?: string
  applicant_name?: string
  applicant_email?: string
}

export default function ApplicationsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
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
          // Только админы и модераторы могут просматривать заявки
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

  // Загружаем список заявок
  useEffect(() => {
    const fetchApplications = async () => {
      if (authChecking) return

      try {
        // Получаем заявки
        const { data: applicationsData, error: applicationsError } = await supabase
          .from("applications")
          .select("id, job_id, applicant_id, status, created_at")
          .order("created_at", { ascending: false })

        if (applicationsError) throw applicationsError

        if (!applicationsData || applicationsData.length === 0) {
          setApplications([])
          setLoading(false)
          return
        }

        // Получаем информацию о вакансиях
        const jobIds = [...new Set(applicationsData.map(app => app.job_id))]
        const { data: jobsData, error: jobsError } = await supabase
          .from("jobs")
          .select("id, title")
          .in("id", jobIds)

        if (jobsError) throw jobsError

        // Получаем информацию о соискателях
        const applicantIds = [...new Set(applicationsData.map(app => app.applicant_id))]
        const { data: applicantsData, error: applicantsError } = await supabase
          .from("profiles")
          .select("id, name, email")
          .in("id", applicantIds)

        if (applicantsError) throw applicantsError

        // Объединяем данные
        const enrichedApplications = applicationsData.map(app => {
          const job = jobsData?.find(j => j.id === app.job_id)
          const applicant = applicantsData?.find(a => a.id === app.applicant_id)
          
          return {
            ...app,
            job_title: job?.title || "Неизвестная вакансия",
            applicant_name: applicant?.name || "Неизвестный",
            applicant_email: applicant?.email || "Нет email"
          }
        })

        setApplications(enrichedApplications)
      } catch (error) {
        console.error("Ошибка при загрузке заявок:", error)
        setError("Не удалось загрузить список заявок")
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
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
        <h1 className="text-2xl font-bold">Просмотр заявок</h1>
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
      ) : applications.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-lg shadow">
          <p className="text-gray-500">Заявки не найдены</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Вакансия
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Соискатель
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата подачи
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.map((application) => (
                <tr key={application.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{application.job_title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{application.applicant_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{application.applicant_email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${application.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                      application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      application.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                      'bg-gray-100 text-gray-800'}`}>
                      {application.status === 'accepted' ? 'Принята' : 
                      application.status === 'pending' ? 'Ожидает' : 
                      application.status === 'rejected' ? 'Отклонена' : 
                      application.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(application.created_at).toLocaleDateString()}
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