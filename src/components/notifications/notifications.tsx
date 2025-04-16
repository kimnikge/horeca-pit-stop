"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase"
import { Application, Job } from "@/types"

export function Notifications() {
  const router = useRouter()
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [notifications, setNotifications] = useState<{
    id: string
    type: "new_application" | "application_status"
    job: Job
    application: Application
    created_at: string
    read: boolean
  }[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user) {
      loadNotifications()
      subscribeToNotifications()
    }
  }, [user])

  // Добавляем обработчик клика вне компонента для закрытия уведомлений
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select(`
          *,
          job:jobs(*),
          application:applications(*)
        `)
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) throw error

      setNotifications(data)
      setUnreadCount(data.filter(n => !n.read).length)
    } catch (error) {
      console.error("Ошибка при загрузке уведомлений:", error)
    }
  }

  const subscribeToNotifications = () => {
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user!.id}`
        },
        (payload) => {
          setNotifications(prev => [payload.new as any, ...prev])
          setUnreadCount(prev => prev + 1)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId)

      if (error) throw error

      setNotifications(notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      ))
      setUnreadCount(prev => prev - 1)
    } catch (error) {
      console.error("Ошибка при обновлении уведомления:", error)
    }
  }

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }

    if (notification.type === "new_application") {
      router.push(`/jobs/${notification.job.id}/applications`)
    } else {
      router.push("/dashboard")
    }
    
    // Закрываем уведомления после клика
    setIsOpen(false)
  }

  const toggleNotifications = () => {
    setIsOpen(!isOpen)
  }

  if (!user) return null

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="relative p-2 text-muted-foreground hover:text-foreground"
        onClick={toggleNotifications}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-primary rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-card rounded-lg shadow-lg z-50">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Уведомления</h3>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-muted-foreground hover:text-foreground"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            {notifications.length === 0 ? (
              <p className="text-muted-foreground text-center">
                Нет новых уведомлений
              </p>
            ) : (
              <div className="space-y-4">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-md cursor-pointer ${
                      notification.read ? "bg-muted/50" : "bg-muted"
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <p className="text-sm">
                      {notification.type === "new_application"
                        ? `Новый отклик на вакансию "${notification.job.title}"`
                        : `Статус вашего отклика на вакансию "${notification.job.title}" изменен`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 