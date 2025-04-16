"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { User } from "@/types"
import { getUserProfile, updateUserProfile, uploadResume } from "@/lib/supabase-service"

export default function ProfilePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [profile, setProfile] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const data = await getUserProfile(user!.id)
      setProfile(data)
    } catch (error) {
      console.error("Ошибка при загрузке профиля:", error)
      setError("Ошибка при загрузке профиля")
      
      // Создаем базовый профиль, если он отсутствует
      try {
        if (user) {
          const basicProfile = {
            name: '',
            email: user.email || '',
            role: 'job_seeker' as const,
          }
          const newProfile = await updateUserProfile(user.id, basicProfile)
          setProfile(newProfile)
          setError(null)
        }
      } catch (createError) {
        console.error("Ошибка при создании профиля:", createError)
        setError("Не удалось создать профиль пользователя")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user || !profile) return

    setIsSaving(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const resumeFile = formData.get("resume") as File | null

    try {
      let resume_url = profile.resume_url

      if (resumeFile && resumeFile.size > 0) {
        resume_url = await uploadResume(user.id, resumeFile)
      }

      const updatedProfile = {
        name: formData.get("name") as string,
        phone: formData.get("phone") as string,
        city: formData.get("city") as string,
        experience: formData.get("experience") as string,
        skills: formData.get("skills") as string,
        resume_url
      }

      await updateUserProfile(user.id, updatedProfile)
      router.push("/dashboard")
    } catch (error) {
      console.error("Ошибка при обновлении профиля:", error)
      setError("Ошибка при сохранении профиля")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Загрузка профиля...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-8">Профиль</h1>

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Имя
              </label>
              <input
                type="text"
                id="name"
                name="name"
                defaultValue={profile?.name}
                required
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                Телефон
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                defaultValue={profile?.phone}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium mb-2">
                Город
              </label>
              <input
                type="text"
                id="city"
                name="city"
                defaultValue={profile?.city}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>

            <div>
              <label htmlFor="experience" className="block text-sm font-medium mb-2">
                Опыт работы
              </label>
              <textarea
                id="experience"
                name="experience"
                defaultValue={profile?.experience}
                rows={4}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>

            <div>
              <label htmlFor="skills" className="block text-sm font-medium mb-2">
                Навыки
              </label>
              <input
                type="text"
                id="skills"
                name="skills"
                defaultValue={profile?.skills}
                className="w-full px-4 py-2 border rounded-md"
                placeholder="Например: приготовление блюд, обслуживание гостей"
              />
            </div>

            <div>
              <label htmlFor="resume" className="block text-sm font-medium mb-2">
                Резюме
              </label>
              <input
                type="file"
                id="resume"
                name="resume"
                accept=".pdf,.doc,.docx"
                className="w-full px-4 py-2 border rounded-md"
              />
              {profile?.resume_url && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Текущее резюме: <a href={profile.resume_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Просмотреть</a>
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border rounded-md hover:bg-muted"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                {isSaving ? "Сохранение..." : "Сохранить"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  )
} 