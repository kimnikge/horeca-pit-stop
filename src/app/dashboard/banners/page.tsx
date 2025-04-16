"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/hooks/use-auth"
import { getUserBanners, createBanner, reactivateBanner } from "@/services/banner-service"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Edit, RefreshCw, AlertTriangle } from "lucide-react"

export default function BannersPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [banners, setBanners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    link: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Загрузка баннеров пользователя
  useEffect(() => {
    const fetchBanners = async () => {
      if (!user) {
        router.push("/login")
        return
      }

      try {
        const data = await getUserBanners(user.id)
        setBanners(data)
      } catch (err) {
        console.error("Ошибка при загрузке баннеров:", err)
        setError("Не удалось загрузить ваши баннеры")
      } finally {
        setLoading(false)
      }
    }

    fetchBanners()
  }, [user, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      if (!user) throw new Error("Необходимо авторизоваться")

      // Проверка, что все поля заполнены
      if (!formData.title || !formData.image_url || !formData.link) {
        throw new Error("Заполните все обязательные поля")
      }

      const bannerData = {
        ...formData,
        user_id: user.id,
      }

      const { success, error } = await createBanner(bannerData)

      if (!success) throw new Error(error)

      // Обновляем список баннеров
      const updatedBanners = await getUserBanners(user.id)
      setBanners(updatedBanners)
      
      // Сбрасываем форму
      setFormData({
        title: "",
        description: "",
        image_url: "",
        link: "",
      })
      setShowForm(false)
    } catch (err) {
      console.error("Ошибка при создании баннера:", err)
      setError(err instanceof Error ? err.message : "Не удалось создать баннер")
    } finally {
      setSubmitting(false)
    }
  }

  const handleReactivate = async (bannerId: string) => {
    try {
      const { success, error } = await reactivateBanner(bannerId)
      
      if (!success) throw new Error(error)
      
      // Обновляем список баннеров
      const updatedBanners = await getUserBanners(user.id)
      setBanners(updatedBanners)
    } catch (err) {
      console.error("Ошибка при повторной активации баннера:", err)
      setError(err instanceof Error ? err.message : "Не удалось активировать баннер")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Активен</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">На модерации</Badge>
      case "rejected":
        return <Badge className="bg-red-500">Отклонен</Badge>
      case "expired":
        return <Badge className="bg-gray-500">Истек</Badge>
      default:
        return <Badge>Неизвестно</Badge>
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Мои баннеры</h1>
        <Button onClick={() => setShowForm(!showForm)} className="w-full sm:w-auto">
          {showForm ? "Отменить" : "Добавить баннер"}
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {showForm && (
        <Card className="mb-8 p-4 sm:p-6">
          <h2 className="text-xl font-semibold mb-4">Новый баннер</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Название баннера</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Описание (необязательно)</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <Label htmlFor="image_url">URL изображения</Label>
              <Input
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Рекомендуемый размер: 1920x600 пикселей
              </p>
            </div>
            
            <div>
              <Label htmlFor="link">Ссылка</Label>
              <Input
                id="link"
                name="link"
                value={formData.link}
                onChange={handleChange}
                placeholder="https://example.com"
                required
              />
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowForm(false)}
                className="w-full sm:w-auto"
              >
                Отмена
              </Button>
              <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                {submitting ? "Создание..." : "Создать баннер"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-12">
          <PlusCircle className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
          <h3 className="text-lg font-medium mb-2">У вас еще нет баннеров</h3>
          <p className="text-muted-foreground mb-6">
            Создайте баннер для продвижения ваших предложений
          </p>
          <Button onClick={() => setShowForm(true)}>Создать баннер</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {banners.map((banner) => (
            <Card key={banner.id} className="overflow-hidden">
              <div className="relative aspect-[16/9]">
                <Image
                  src={banner.image_url}
                  alt={banner.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{banner.title}</h3>
                    {banner.description && (
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {banner.description}
                      </p>
                    )}
                  </div>
                  <div>{getStatusBadge(banner.status)}</div>
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    Срок действия: {new Date(banner.expires_at).toLocaleDateString()}
                  </div>
                  
                  {banner.status === "expired" || banner.status === "rejected" ? (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleReactivate(banner.id)}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" /> Активировать
                    </Button>
                  ) : null}
                </div>
                
                {banner.status === "rejected" && (
                  <div className="mt-2 p-2 bg-red-50 rounded text-xs flex items-start">
                    <AlertTriangle className="h-4 w-4 text-red-500 mr-1 flex-shrink-0 mt-0.5" />
                    <span>
                      Этот баннер был отклонен модератором. Внесите изменения перед повторной активацией.
                    </span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 