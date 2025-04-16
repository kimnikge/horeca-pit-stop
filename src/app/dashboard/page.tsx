"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { User, Job, Application } from "@/types"
import { getUserProfile, getUserApplications, getJobs } from "@/lib/supabase-service"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ImageIcon, BriefcaseIcon, UserIcon, MessageSquareIcon } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [profile, setProfile] = useState<User | null>(null)
  const [applications, setApplications] = useState<(Application & { job: Job })[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    try {
      const [profileData, applicationsData, jobsData] = await Promise.all([
        getUserProfile(user!.id),
        getUserApplications(user!.id),
        getJobs()
      ])

      setProfile(profileData)
      setApplications(applicationsData)
      setJobs(jobsData.filter(job => job.employer_id === user!.id))
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error)
      setError("Ошибка при загрузке данных")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Загрузка данных...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-8">Личный кабинет</h1>
          
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Профиль */}
            <div className="bg-card p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Профиль</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Email:</span> {user?.email}</p>
                <p><span className="font-medium">Имя:</span> {profile?.name || "Не указано"}</p>
                <p><span className="font-medium">Город:</span> {profile?.city || "Не указан"}</p>
                <button
                  onClick={() => router.push("/profile")}
                  className="text-primary hover:underline"
                >
                  Редактировать профиль
                </button>
              </div>
            </div>

            {/* Мои отклики */}
            <div className="bg-card p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Мои отклики</h2>
              {applications.length === 0 ? (
                <p className="text-muted-foreground">
                  У вас пока нет откликов на вакансии
                </p>
              ) : (
                <div className="space-y-4">
                  {applications.map(application => (
                    <div key={application.id} className="border-b pb-4">
                      <p className="font-medium">{application.job.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {application.job.company}
                      </p>
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
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => router.push("/jobs")}
                className="mt-4 text-primary hover:underline"
              >
                Найти вакансии
              </button>
            </div>

            {/* Мои вакансии (для работодателей) */}
            <div className="bg-card p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Мои вакансии</h2>
              {jobs.length === 0 ? (
                <p className="text-muted-foreground">
                  У вас пока нет размещенных вакансий
                </p>
              ) : (
                <div className="space-y-4">
                  {jobs.map(job => (
                    <div key={job.id} className="border-b pb-4">
                      <p className="font-medium">{job.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {job.company}
                      </p>
                      <p className="text-sm">{job.location}</p>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => router.push("/jobs/create")}
                className="mt-4 text-primary hover:underline"
              >
                Создать вакансию
              </button>
            </div>
          </div>

          {/* Дополнительные разделы */}
          <div className="mt-10">
            <h2 className="text-2xl font-semibold mb-6">Управление аккаунтом</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col h-full">
                  <ImageIcon className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Мои баннеры</h3>
                  <p className="text-muted-foreground text-sm mb-4 flex-grow">
                    Создавайте рекламные баннеры для продвижения ваших услуг
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full mt-auto"
                    onClick={() => router.push("/dashboard/banners")}
                  >
                    Управление баннерами
                  </Button>
                </div>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col h-full">
                  <MessageSquareIcon className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Сообщения</h3>
                  <p className="text-muted-foreground text-sm mb-4 flex-grow">
                    Общайтесь с кандидатами и работодателями
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full mt-auto"
                    onClick={() => router.push("/dashboard/messages")}
                  >
                    Перейти к сообщениям
                  </Button>
                </div>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col h-full">
                  <BriefcaseIcon className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Мои резюме</h3>
                  <p className="text-muted-foreground text-sm mb-4 flex-grow">
                    Создавайте и редактируйте свои профессиональные резюме
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full mt-auto"
                    onClick={() => router.push("/dashboard/resumes")}
                  >
                    Управление резюме
                  </Button>
                </div>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col h-full">
                  <UserIcon className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Настройки</h3>
                  <p className="text-muted-foreground text-sm mb-4 flex-grow">
                    Безопасность, уведомления и другие настройки аккаунта
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full mt-auto"
                    onClick={() => router.push("/dashboard/settings")}
                  >
                    Изменить настройки
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
} 