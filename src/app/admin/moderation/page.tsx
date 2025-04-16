"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle } from "lucide-react"
import { updateBannerStatus } from "@/services/banner-service"

type Job = {
  id: string
  title: string
  company: string
  location: string
  description: string
  salary: string
  type: string
  employer_id: string
  created_at: string
  employer_name?: string
}

type BannerStatus = 'pending' | 'active' | 'rejected' | 'expired';

type Banner = {
  id: string
  title: string
  description: string | null
  image_url: string
  link: string
  status: BannerStatus
  user_id: string
  created_at: string
  updated_at: string
  expires_at: string
  user_name?: string
  user_email?: string
}

export default function ModerationPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [pendingJobs, setPendingJobs] = useState<Job[]>([])
  const [pendingBanners, setPendingBanners] = useState<Banner[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null)
  const [loading, setLoading] = useState(true)
  const [bannersLoading, setBannersLoading] = useState(true)
  const [authChecking, setAuthChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("jobs")

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
          // Только админы и модераторы могут модерировать вакансии
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

  // Загружаем список вакансий на модерации
  useEffect(() => {
    const fetchPendingJobs = async () => {
      if (authChecking) return

      try {
        // Получаем вакансии со статусом "на модерации"
        const { data: jobsData, error: jobsError } = await supabase
          .from("jobs")
          .select("*")
          .eq("status", "pending")
          .order("created_at", { ascending: false })

        if (jobsError) throw jobsError

        if (!jobsData || jobsData.length === 0) {
          setPendingJobs([])
          setLoading(false)
          return
        }

        // Получаем информацию о работодателях
        const employerIds = [...new Set(jobsData.map(job => job.employer_id))]
        const { data: employersData, error: employersError } = await supabase
          .from("profiles")
          .select("id, name")
          .in("id", employerIds)

        if (employersError) throw employersError

        // Добавляем имена работодателей к вакансиям
        const jobsWithEmployers = jobsData.map(job => {
          const employer = employersData?.find(emp => emp.id === job.employer_id)
          return {
            ...job,
            employer_name: employer?.name || "Неизвестный"
          }
        })

        setPendingJobs(jobsWithEmployers)
      } catch (error) {
        console.error("Ошибка при загрузке вакансий:", error)
        setError("Не удалось загрузить список вакансий на модерации")
      } finally {
        setLoading(false)
      }
    }

    fetchPendingJobs()
  }, [authChecking])

  // Загружаем список баннеров на модерации
  useEffect(() => {
    const fetchPendingBanners = async () => {
      if (authChecking) return

      try {
        // Получаем баннеры со статусом "на модерации"
        const { data: bannersData, error: bannersError } = await supabase
          .from("banners")
          .select("*")
          .eq("status", "pending")
          .order("created_at", { ascending: false })

        if (bannersError) throw bannersError

        if (!bannersData || bannersData.length === 0) {
          setPendingBanners([])
          setBannersLoading(false)
          return
        }

        // Получаем информацию о пользователях
        const userIds = [...new Set(bannersData.map(banner => banner.user_id))]
        const { data: usersData, error: usersError } = await supabase
          .from("profiles")
          .select("id, name, email")
          .in("id", userIds)

        if (usersError) throw usersError

        // Добавляем имена пользователей к баннерам
        const bannersWithUsers = bannersData.map(banner => {
          const user = usersData?.find(u => u.id === banner.user_id)
          return {
            ...banner,
            user_name: user?.name || "Неизвестный",
            user_email: user?.email || "Нет email",
          }
        }) as Banner[]

        setPendingBanners(bannersWithUsers)
      } catch (error) {
        console.error("Ошибка при загрузке баннеров:", error)
        setError("Не удалось загрузить список баннеров на модерации")
      } finally {
        setBannersLoading(false)
      }
    }

    fetchPendingBanners()
  }, [authChecking])

  const handleJobApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from("jobs")
        .update({ status: "active" })
        .eq("id", id)

      if (error) throw error

      // Обновляем список вакансий после модерации
      setPendingJobs(pendingJobs.filter(job => job.id !== id))
      setSelectedJob(null)
    } catch (error) {
      console.error("Ошибка при одобрении вакансии:", error)
      setError("Не удалось одобрить вакансию")
    }
  }

  const handleJobReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from("jobs")
        .update({ status: "rejected" })
        .eq("id", id)

      if (error) throw error

      // Обновляем список вакансий после модерации
      setPendingJobs(pendingJobs.filter(job => job.id !== id))
      setSelectedJob(null)
    } catch (error) {
      console.error("Ошибка при отклонении вакансии:", error)
      setError("Не удалось отклонить вакансию")
    }
  }

  const handleBannerApprove = async (id: string) => {
    try {
      const { success, error } = await updateBannerStatus(id, "active")

      if (!success) throw new Error(error)

      // Обновляем список баннеров после модерации
      setPendingBanners(pendingBanners.filter(banner => banner.id !== id))
      setSelectedBanner(null)
    } catch (error) {
      console.error("Ошибка при одобрении баннера:", error)
      setError("Не удалось одобрить баннер")
    }
  }

  const handleBannerReject = async (id: string) => {
    try {
      const { success, error } = await updateBannerStatus(id, "rejected")

      if (!success) throw new Error(error)

      // Обновляем список баннеров после модерации
      setPendingBanners(pendingBanners.filter(banner => banner.id !== id))
      setSelectedBanner(null)
    } catch (error) {
      console.error("Ошибка при отклонении баннера:", error)
      setError("Не удалось отклонить баннер")
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
        <h1 className="text-2xl font-bold">Модерация контента</h1>
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

      <div className="w-full mb-6">
        <TabsList className="w-full">
          <TabsTrigger 
            value="jobs" 
            className={`flex-1 ${activeTab === "jobs" ? "bg-background text-foreground shadow-sm" : ""}`}
            onClick={() => setActiveTab("jobs")}
          >
            Вакансии ({pendingJobs.length})
          </TabsTrigger>
          <TabsTrigger 
            value="banners" 
            className={`flex-1 ${activeTab === "banners" ? "bg-background text-foreground shadow-sm" : ""}`}
            onClick={() => setActiveTab("banners")}
          >
            Баннеры ({pendingBanners.length})
          </TabsTrigger>
        </TabsList>

        {activeTab === "jobs" && (
          <div className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Список вакансий */}
              <div className="col-span-1">
                <div className="bg-white p-4 rounded-lg shadow">
                  <h2 className="text-lg font-semibold mb-4">Ожидают модерации ({pendingJobs.length})</h2>
                  
                  {loading ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : pendingJobs.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-gray-500">Нет вакансий для модерации</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {pendingJobs.map((job) => (
                        <div 
                          key={job.id}
                          className={`p-3 rounded border cursor-pointer transition hover:bg-gray-50 ${selectedJob?.id === job.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                          onClick={() => setSelectedJob(job)}
                        >
                          <div className="font-medium">{job.title}</div>
                          <div className="text-sm text-gray-500">{job.company}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(job.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Просмотр и модерация выбранной вакансии */}
              <div className="col-span-2">
                {selectedJob ? (
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="mb-6">
                      <div className="flex justify-between items-start">
                        <h2 className="text-xl font-bold">{selectedJob.title}</h2>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleJobReject(selectedJob.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Отклонить
                          </button>
                          <button
                            onClick={() => handleJobApprove(selectedJob.id)}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Одобрить
                          </button>
                        </div>
                      </div>
                      <div className="text-gray-600 mt-1">{selectedJob.company}</div>
                      <div className="text-sm text-gray-500 mt-1">Работодатель: {selectedJob.employer_name}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-sm">
                        <span className="text-gray-500">Локация:</span> {selectedJob.location}
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Тип:</span> {selectedJob.type}
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Зарплата:</span> {selectedJob.salary}
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Дата создания:</span> {new Date(selectedJob.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="font-semibold mb-2">Описание</h3>
                      <div className="bg-gray-50 p-4 rounded border border-gray-200 whitespace-pre-wrap">
                        {selectedJob.description}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-6 rounded-lg shadow flex items-center justify-center">
                    <div className="text-center py-12">
                      <p className="text-gray-500">Выберите вакансию для просмотра деталей</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "banners" && (
          <div className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Список баннеров */}
              <div className="col-span-1">
                <div className="bg-white p-4 rounded-lg shadow">
                  <h2 className="text-lg font-semibold mb-4">Ожидают модерации ({pendingBanners.length})</h2>
                  
                  {bannersLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : pendingBanners.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-gray-500">Нет баннеров для модерации</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {pendingBanners.map((banner) => (
                        <div 
                          key={banner.id}
                          className={`p-3 rounded border cursor-pointer transition hover:bg-gray-50 ${selectedBanner?.id === banner.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                          onClick={() => setSelectedBanner(banner)}
                        >
                          <div className="font-medium">{banner.title}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(banner.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Просмотр и модерация выбранного баннера */}
              <div className="col-span-2">
                {selectedBanner ? (
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="mb-6">
                      <div className="flex justify-between items-start">
                        <h2 className="text-xl font-bold">{selectedBanner.title}</h2>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleBannerReject(selectedBanner.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
                          >
                            <XCircle className="h-4 w-4 mr-1" /> Отклонить
                          </button>
                          <button
                            onClick={() => handleBannerApprove(selectedBanner.id)}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" /> Одобрить
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Пользователь: {selectedBanner.user_name} ({selectedBanner.user_email})
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="relative aspect-[16/9] overflow-hidden rounded-md">
                        <Image
                          src={selectedBanner.image_url}
                          alt={selectedBanner.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>

                    {selectedBanner.description && (
                      <div className="mb-6">
                        <h3 className="font-semibold mb-2">Описание</h3>
                        <div className="bg-gray-50 p-4 rounded border border-gray-200">
                          {selectedBanner.description}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-sm">
                        <span className="text-gray-500">Ссылка:</span>{" "}
                        <a href={selectedBanner.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {selectedBanner.link}
                        </a>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Срок действия до:</span>{" "}
                        {selectedBanner.expires_at ? new Date(selectedBanner.expires_at).toLocaleDateString() : "Не указан"}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-6 rounded-lg shadow flex items-center justify-center">
                    <div className="text-center py-12">
                      <p className="text-gray-500">Выберите баннер для просмотра деталей</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 