"use client"

/**
 * Imports React hooks for managing component state and side effects.
 * - useState: Allows functional components to add and manage local state
 * - useEffect: Enables performing side effects in functional components
 */
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { getJobs, createApplication } from "@/lib/supabase-service"
import type { Job } from "@/types"

export default function JobsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async () => {
    try {
      const jobsData = await getJobs()
      setJobs(jobsData)
    } catch (err) {
      setError("Ошибка при загрузке вакансий")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApply = async (jobId: string) => {
    if (!user) {
      router.push("/login")
      return
    }

    try {
      await createApplication({
        job_id: jobId,
        user_id: user.id,
        status: "pending",
        message: ""
      })
      alert("Заявка успешно отправлена!")
    } catch (err) {
      console.error("Ошибка при отправке заявки:", err)
      alert("Произошла ошибка при отправке заявки")
    }
  }

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = !selectedType || job.type === selectedType
    return matchesSearch && matchesType
  })

  if (isLoading) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Загрузка...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-red-600">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">Поиск вакансий</h1>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Поиск по названию, компании или городу"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Все типы занятости</option>
                <option value="full-time">Полная занятость</option>
                <option value="part-time">Частичная занятость</option>
                <option value="contract">Контракт</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="p-4 sm:p-6">
                <h2 className="text-xl font-semibold mb-2">{job.title}</h2>
                <p className="text-gray-600 mb-2">{job.company}</p>
                <p className="text-gray-500 text-sm mb-4">{job.location}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {job.type === "full-time" ? "Полная занятость" :
                     job.type === "part-time" ? "Частичная занятость" : "Контракт"}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {job.salary}
                  </span>
                </div>

                <p className="text-gray-700 mb-4 line-clamp-3">{job.description}</p>

                <button
                  onClick={() => handleApply(job.id)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300"
                >
                  Откликнуться
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            Вакансии не найдены
          </div>
        )}
      </div>
    </div>
  )
} 