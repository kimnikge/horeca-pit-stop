"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Job, Application, User } from "@/types"
import { getJobById, getJobApplications, updateApplicationStatus } from "@/lib/supabase-service"

interface ApplicationsPageProps {
  params: {
    id: string
  }
}

export default function ApplicationsPage({ params }: ApplicationsPageProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [job, setJob] = useState<Job | null>(null)
  const [applications, setApplications] = useState<(Application & { user: User })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [params.id])

  const loadData = async () => {
    try {
      const [jobData, applicationsData] = await Promise.all([
        getJobById(params.id),
        getJobApplications(params.id)
      ])

      if (jobData.employer_id !== user?.id) {
        router.push("/dashboard")
        return
      }

      setJob(jobData)
      setApplications(applicationsData)
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error)
      setError("Ошибка при загрузке данных")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusUpdate = async (applicationId: string, status: Application["status"]) => {
    try {
      await updateApplicationStatus(applicationId, status)
      setApplications(applications.map(app => 
        app.id === applicationId ? { ...app, status } : app
      ))
    } catch (error) {
      console.error("Ошибка при обновлении статуса:", error)
      setError("Ошибка при обновлении статуса")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Загрузка данных...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xl text-muted-foreground">Вакансия не найдена</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="mt-4 text-primary hover:underline"
            >
              Вернуться в личный кабинет
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="text-primary hover:underline mb-6"
          >
            ← Назад
          </button>

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-md">
              {error}
            </div>
          )}

          <div className="bg-card p-6 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
            <p className="text-xl text-muted-foreground mb-6">{job.company}</p>

            <h2 className="text-xl font-semibold mb-4">Отклики на вакансию</h2>

            {applications.length === 0 ? (
              <p className="text-muted-foreground">
                Пока нет откликов на эту вакансию
              </p>
            ) : (
              <div className="space-y-6">
                {applications.map(application => (
                  <div key={application.id} className="border-b pb-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-medium">{application.user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {application.user.email}
                        </p>
                        {application.user.city && (
                          <p className="text-sm text-muted-foreground">
                            {application.user.city}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          Статус:{" "}
                          <span className={
                            application.status === "accepted" ? "text-green-600" :
                            application.status === "rejected" ? "text-red-600" :
                            "text-yellow-600"
                          }>
                            {
                              application.status === "accepted" ? "Принят" :
                              application.status === "rejected" ? "Отклонен" :
                              "На рассмотрении"
                            }
                          </span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(application.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {application.user.experience && (
                      <div className="mb-4">
                        <p className="font-medium mb-1">Опыт работы:</p>
                        <p className="text-sm">{application.user.experience}</p>
                      </div>
                    )}

                    {application.user.skills && (
                      <div className="mb-4">
                        <p className="font-medium mb-1">Навыки:</p>
                        <p className="text-sm">{application.user.skills}</p>
                      </div>
                    )}

                    {application.user.resume_url && (
                      <div className="mb-4">
                        <a
                          href={application.user.resume_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Просмотреть резюме
                        </a>
                      </div>
                    )}

                    {application.status === "pending" && (
                      <div className="flex space-x-4">
                        <button
                          onClick={() => handleStatusUpdate(application.id, "accepted")}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          Принять
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(application.id, "rejected")}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          Отклонить
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
} 