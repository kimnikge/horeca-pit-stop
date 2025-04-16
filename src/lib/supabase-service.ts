import { supabase } from "./supabase"
import { User, Job, Application } from "@/types"

// Пользователи
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()

  if (error) throw error
  return data as User
}

export async function updateUserProfile(userId: string, profile: Partial<User>) {
  const { data, error } = await supabase
    .from("profiles")
    .update(profile)
    .eq("id", userId)
    .select()
    .single()

  if (error) throw error
  return data as User
}

// Вакансии
export async function getJobs() {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as Job[]
}

export async function getJobById(jobId: string) {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .single()

  if (error) throw error
  return data as Job
}

export async function createJob(job: Omit<Job, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase
    .from("jobs")
    .insert(job)
    .select()
    .single()

  if (error) throw error
  return data as Job
}

export async function updateJob(jobId: string, job: Partial<Job>) {
  const { data, error } = await supabase
    .from("jobs")
    .update(job)
    .eq("id", jobId)
    .select()
    .single()

  if (error) throw error
  return data as Job
}

export async function deleteJob(jobId: string) {
  const { error } = await supabase
    .from("jobs")
    .delete()
    .eq("id", jobId)

  if (error) throw error
}

// Отклики на вакансии
export async function createApplication(application: Omit<Application, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase
    .from("applications")
    .insert(application)
    .select()
    .single()

  if (error) throw error
  return data as Application
}

export async function getUserApplications(userId: string) {
  const { data, error } = await supabase
    .from("applications")
    .select(`
      *,
      job:jobs(*)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as (Application & { job: Job })[]
}

export async function getJobApplications(jobId: string) {
  const { data, error } = await supabase
    .from("applications")
    .select(`
      *,
      user:users(*)
    `)
    .eq("job_id", jobId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as (Application & { user: User })[]
}

export async function updateApplicationStatus(applicationId: string, status: Application["status"]) {
  const { data, error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", applicationId)
    .select()
    .single()

  if (error) throw error
  return data as Application
}

// Загрузка файлов
export async function uploadResume(userId: string, file: File) {
  const fileExt = file.name.split(".").pop()
  const fileName = `${userId}-${Math.random()}.${fileExt}`
  const filePath = `resumes/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from("resumes")
    .upload(filePath, file)

  if (uploadError) throw uploadError

  const { data: { publicUrl } } = supabase.storage
    .from("resumes")
    .getPublicUrl(filePath)

  return publicUrl
} 