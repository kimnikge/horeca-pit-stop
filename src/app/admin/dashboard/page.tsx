"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

export default function AdminDashboardPage() {
  const router = useRouter()
  const { user, checkUserExists } = useAuth()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalApplications: 0,
    pendingJobs: 0,
    pendingBanners: 0,
  })

  useEffect(() => {
    // Проверяем авторизацию
    const checkAuth = async () => {
      if (!user) {
        router.push("/admin/login")
        return
      }

      try {
        // Проверяем, существует ли пользователь в базе auth.users
        const { data: authUser, error: authError } = await supabase.auth.getUser()
        
        if (authError || !authUser.user) {
          // Если пользователь не найден в auth.users, выполняем выход
          await supabase.auth.signOut()
          router.push("/admin/login")
          return
        }
        
        // Получаем профиль пользователя
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()

        if (profileError || !profile || (profile.role !== "moderator" && profile.role !== "admin")) {
          // Перенаправляем на страницу входа, если пользователь не администратор и не модератор
          // или если профиль не найден
          await supabase.auth.signOut()
          router.push("/admin/login")
          return
        }

        // Проверяем, является ли пользователь администратором
        setIsAdmin(profile.role === "admin")
        setIsAuthorized(true)
        loadStats()
      } catch (error) {
        console.error("Ошибка при проверке доступа:", error)
        await supabase.auth.signOut()
        router.push("/admin/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [user, router])

  // Периодическая проверка существования профиля
  useEffect(() => {
    if (!user) return;
    
    // Проверяем существование профиля каждые 10 секунд
    const interval = setInterval(async () => {
      const exists = await checkUserExists();
      if (!exists) {
        console.log("Профиль не существует, перенаправление на страницу входа");
        router.push("/admin/login");
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [user, checkUserExists, router]);

  const loadStats = async () => {
    try {
      // Загружаем статистику
      const [usersResponse, jobsResponse, applicationsResponse, pendingJobsResponse, pendingBannersResponse] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("jobs").select("id", { count: "exact", head: true }),
        supabase.from("applications").select("id", { count: "exact", head: true }),
        supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("banners").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ])

      setStats({
        totalUsers: usersResponse.count || 0,
        totalJobs: jobsResponse.count || 0,
        totalApplications: applicationsResponse.count || 0,
        pendingJobs: pendingJobsResponse.count || 0,
        pendingBanners: pendingBannersResponse.count || 0,
      })
    } catch (error) {
      console.error("Ошибка при загрузке статистики:", error)
    }
  }

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center min-h-screen")}>
        <div className={cn("animate-spin rounded-full h-8 w-8 border-b-2 border-primary")}></div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null // Component будет удален при перенаправлении
  }

  return (
    <div className={cn("container mx-auto px-4 py-8")}>
      <h1 className={cn("text-2xl font-bold mb-6")}>Панель администратора</h1>

      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8")}>
        <div className={cn("bg-white p-6 rounded-lg shadow")}>
          <h2 className={cn("text-xl font-semibold mb-2")}>Пользователи</h2>
          <p className={cn("text-3xl font-bold")}>{stats.totalUsers}</p>
          <button 
            className={cn("mt-4 text-sm text-blue-600 hover:underline")}
            onClick={() => router.push("/admin/users")}
          >
            Управление пользователями
          </button>
        </div>

        <div className={cn("bg-white p-6 rounded-lg shadow")}>
          <h2 className={cn("text-xl font-semibold mb-2")}>Вакансии</h2>
          <p className={cn("text-3xl font-bold")}>{stats.totalJobs}</p>
          <button 
            className={cn("mt-4 text-sm text-blue-600 hover:underline")}
            onClick={() => router.push("/admin/jobs")}
          >
            Управление вакансиями
          </button>
        </div>

        <div className={cn("bg-white p-6 rounded-lg shadow")}>
          <h2 className={cn("text-xl font-semibold mb-2")}>Заявки</h2>
          <p className={cn("text-3xl font-bold")}>{stats.totalApplications}</p>
          <button 
            className={cn("mt-4 text-sm text-blue-600 hover:underline")}
            onClick={() => router.push("/admin/applications")}
          >
            Просмотр заявок
          </button>
        </div>

        <div className={cn("bg-white p-6 rounded-lg shadow")}>
          <h2 className={cn("text-xl font-semibold mb-2")}>Ожидают модерации</h2>
          <p className={cn("text-3xl font-bold")}>{stats.pendingJobs}</p>
          <button 
            className={cn("mt-4 text-sm text-blue-600 hover:underline")}
            onClick={() => router.push("/admin/moderation")}
          >
            Модерация вакансий
          </button>
        </div>

        <div className={cn("bg-white p-6 rounded-lg shadow")}>
          <h2 className={cn("text-xl font-semibold mb-2")}>Баннеры</h2>
          <p className={cn("text-3xl font-bold")}>{stats.pendingBanners || 0}</p>
          <button 
            className={cn("mt-4 text-sm text-blue-600 hover:underline")}
            onClick={() => router.push("/admin/banners")}
          >
            Модерация баннеров
          </button>
        </div>
      </div>

      <div className={cn("bg-white p-6 rounded-lg shadow mb-8")}>
        <h2 className={cn("text-xl font-semibold mb-4")}>Быстрые действия</h2>
        <div className={cn("flex flex-wrap gap-4")}>
          {isAdmin && (
            <>
              <button 
                className={cn("px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700")}
                onClick={() => router.push("/admin/add-moderator")}
              >
                Добавить модератора
              </button>
              <button 
                className={cn("px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700")}
                onClick={() => router.push("/admin/moderators")}
              >
                Управление модераторами
              </button>
              <button 
                className={cn("px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700")}
                onClick={() => router.push("/admin/banners")}
              >
                Управление баннерами
              </button>
            </>
          )}
          <button 
            className={cn("px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700")}
            onClick={loadStats}
          >
            Обновить статистику
          </button>
          <button 
            className={cn("px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700")}
            onClick={() => {
              supabase.auth.signOut()
              router.push("/admin/login")
            }}
          >
            Выйти
          </button>
          <button 
            className={cn("px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700")}
            onClick={() => {
              // Полный сброс аутентификации
              supabase.auth.signOut()
              
              // Очищаем все токены в localStorage
              localStorage.clear()
              
              // Очищаем куки
              document.cookie.split(";").forEach(function(c) {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
              });
              
              // Перезагружаем страницу
              window.location.href = "/admin/login";
            }}
          >
            Полный сброс сессии
          </button>
        </div>
      </div>
    </div>
  )
} 