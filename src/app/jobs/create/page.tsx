"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription 
} from "@/components/ui/form"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"

const jobSchema = z.object({
  title: z.string().min(5, "Название должно быть не менее 5 символов").max(100),
  company: z.string().min(2, "Укажите название компании").max(100),
  location: z.string().min(2, "Укажите местоположение").max(100),
  salary: z.string().min(2, "Укажите зарплату").max(50),
  description: z.string().min(20, "Описание должно быть не менее 20 символов"),
  type: z.enum(["full_time", "part_time", "contract"], {
    required_error: "Выберите тип работы",
  }),
  category: z.string().min(1, "Выберите категорию"),
})

type JobFormValues = z.infer<typeof jobSchema>

export default function CreateJobPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: "",
      company: "",
      location: "",
      salary: "",
      description: "",
      type: undefined,
      category: "",
    },
  })

  async function onSubmit(data: JobFormValues) {
    setIsLoading(true)
    setError(null)

    try {
      // Получаем текущего пользователя
      const { data: { session }, error: authError } = await supabase.auth.getSession()
      
      if (authError) {
        throw authError
      }

      if (!session?.user) {
        router.push("/auth/login")
        return
      }

      // Проверяем, что пользователь имеет роль работодателя
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single()

      if (userError) {
        throw userError
      }

      if (userData.role !== "employer") {
        throw new Error("Только работодатели могут публиковать вакансии")
      }

      // Создаем новую вакансию
      const { error: jobError } = await supabase
        .from("jobs")
        .insert({
          title: data.title,
          company: data.company,
          location: data.location,
          salary: data.salary,
          description: data.description,
          type: data.type,
          category: data.category,
          employer_id: session.user.id,
        })

      if (jobError) {
        throw jobError
      }

      // При успешной публикации перенаправляем на страницу вакансий
      router.push("/jobs")
      router.refresh()
    } catch (error: any) {
      setError(error.message || "Произошла ошибка при публикации вакансии")
    } finally {
      setIsLoading(false)
    }
  }

  const categories = [
    "Рестораны",
    "Отели",
    "Кафе",
    "Бары",
    "Кейтеринг"
  ]

  return (
    <div className="container max-w-3xl mx-auto py-8">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Разместить вакансию</CardTitle>
          <CardDescription>
            Заполните данные о новой вакансии
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название вакансии</FormLabel>
                    <FormControl>
                      <Input placeholder="Шеф-повар итальянской кухни" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Компания</FormLabel>
                    <FormControl>
                      <Input placeholder="Ресторан 'Belissimo'" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Местоположение</FormLabel>
                      <FormControl>
                        <Input placeholder="Москва, центр" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="salary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Зарплата</FormLabel>
                      <FormControl>
                        <Input placeholder="150 000 - 180 000 ₽" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Тип работы</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите тип работы" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="full_time">Полная занятость</SelectItem>
                          <SelectItem value="part_time">Частичная занятость</SelectItem>
                          <SelectItem value="contract">Контракт</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Категория</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите категорию" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Описание вакансии</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Подробное описание обязанностей, требований и условий работы" 
                        className="min-h-32"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Публикация..." : "Опубликовать вакансию"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            Назад
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 