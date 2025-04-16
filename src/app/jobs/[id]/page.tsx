"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Job } from "@/types"
import { getJobById, createApplication } from "@/lib/supabase-service"

interface JobPageProps {
  params: {
    id: string
  }
}

export default function JobPage({ params }: JobPageProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isApplying, setIsApplying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadJob()
  }, [params.id])

  const loadJob = async () => {
    try {
      const data = await getJobById(params.id)
      setJob(data)
    } catch (error) {
      console.error("Ошибка при загрузке вакансии:", error)
      setError("Ошибка при загрузке вакансии")
    } finally {
      setIsLoading(false)
    }
  }

  const handleApply = async () => {
    if (!user || !job) return

    setIsApplying(true)
    setError(null)

    try {
      await createApplication({
        job_id: job.id,
        user_id: user.id,
        status: "pending"
      })
      router.push("/dashboard")
    } catch (error) {
      console.error("Ошибка при отправке отклика:", error)
      setError("Ошибка при отправке отклика")
    } finally {
      setIsApplying(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Загрузка вакансии...</p>
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
              onClick={() => router.push("/jobs")}
              className="mt-4 text-primary hover:underline"
            >
              Вернуться к списку вакансий
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
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
          <p className="text-xl text-muted-foreground mb-4">{job.company}</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="font-medium">Местоположение</p>
              <p className="text-muted-foreground">{job.location}</p>
            </div>
            <div>
              <p className="font-medium">Зарплата</p>
              <p className="text-muted-foreground">{job.salary}</p>
            </div>
            <div>
              <p className="font-medium">Тип занятости</p>
              <p className="text-muted-foreground">{job.type}</p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Описание вакансии</h2>
            <p className="whitespace-pre-wrap">{job.description}</p>
          </div>

          {user && (
            <button
              onClick={handleApply}
              disabled={isApplying}
              className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {isApplying ? "Отправка..." : "Откликнуться на вакансию"}
            </button>
          )}

          {!user && (
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Чтобы откликнуться на вакансию, необходимо войти в систему
              </p>
              <button
                onClick={() => router.push("/login")}
                className="text-primary hover:underline"
              >
                Войти
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 