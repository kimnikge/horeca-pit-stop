"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase"
import { updateBannerStatus } from "@/services/banner-service"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, Clock, Calendar, Link as LinkIcon, Eye, EyeOff, Edit, Trash2, Plus, X, ArrowUp, ArrowDown } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"

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
  priority: number
  is_active: boolean
  starts_at: string
}

export default function AdminBannersPage() {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const [banners, setBanners] = useState<Banner[]>([])
  const [filteredBanners, setFilteredBanners] = useState<Banner[]>([])
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null)
  const [loading, setLoading] = useState(true)
  const [authChecking, setAuthChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("pending")
  const [newBanner, setNewBanner] = useState({
    title: "",
    description: "",
    image_url: "",
    link: "",
    priority: 0,
    is_active: true,
    starts_at: new Date().toISOString().slice(0, 16),
    expires_at: ""
  })
  const [isAdding, setIsAdding] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

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
          // Только админы и модераторы могут модерировать баннеры
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

  // Загружаем список баннеров
  useEffect(() => {
    const fetchBanners = async () => {
      if (authChecking) return

      try {
        // Получаем баннеры
        const { data: bannersData, error: bannersError } = await supabase
          .from("banners")
          .select("*")
          .order("priority", { ascending: false })
          .order("created_at", { ascending: false })

        if (bannersError) throw bannersError

        if (!bannersData || bannersData.length === 0) {
          setBanners([])
          setFilteredBanners([])
          setLoading(false)
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
            status: banner.status as BannerStatus
          }
        }) as Banner[]

        setBanners(bannersWithUsers)
        // Фильтруем баннеры по активной вкладке
        filterBannersByTab(bannersWithUsers, activeTab)
      } catch (error) {
        console.error("Ошибка при загрузке баннеров:", error)
        setError("Не удалось загрузить список баннеров")
      } finally {
        setLoading(false)
      }
    }

    fetchBanners()
  }, [authChecking, activeTab])

  // Фильтрация баннеров по статусу (вкладке)
  const filterBannersByTab = (banners: Banner[], tab: string) => {
    if (tab === "all") {
      setFilteredBanners(banners)
      return
    }
    
    setFilteredBanners(banners.filter(banner => banner.status === tab))
  }

  // Обработка смены вкладки
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    filterBannersByTab(banners, value)
  }

  // Одобрение баннера
  const handleBannerApprove = async (id: string) => {
    try {
      const { success, error } = await updateBannerStatus(id, "active")

      if (!success) throw new Error(error)

      // Обновляем список баннеров
      const updatedBanners = banners.map(banner => 
        banner.id === id ? { ...banner, status: "active" as BannerStatus } : banner
      )
      
      setBanners(updatedBanners)
      filterBannersByTab(updatedBanners, activeTab)
      
      if (selectedBanner?.id === id) {
        setSelectedBanner({ ...selectedBanner, status: "active" as BannerStatus })
      }
    } catch (error) {
      console.error("Ошибка при одобрении баннера:", error)
      setError("Не удалось одобрить баннер")
    }
  }

  // Отклонение баннера
  const handleBannerReject = async (id: string) => {
    try {
      const { success, error } = await updateBannerStatus(id, "rejected")

      if (!success) throw new Error(error)

      // Обновляем список баннеров
      const updatedBanners = banners.map(banner => 
        banner.id === id ? { ...banner, status: "rejected" as BannerStatus } : banner
      )
      
      setBanners(updatedBanners)
      filterBannersByTab(updatedBanners, activeTab)
      
      if (selectedBanner?.id === id) {
        setSelectedBanner({ ...selectedBanner, status: "rejected" as BannerStatus })
      }
    } catch (error) {
      console.error("Ошибка при отклонении баннера:", error)
      setError("Не удалось отклонить баннер")
    }
  }

  async function toggleBannerStatus(id: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from("banners")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      
      toast({
        title: "Успех",
        description: `Баннер ${!currentStatus ? "активирован" : "деактивирован"}`,
      });
      
      // Обновляем список баннеров локально
      const updatedBanners = banners.map(banner => 
        banner.id === id ? { ...banner, is_active: !currentStatus } : banner
      );
      
      setBanners(updatedBanners);
      filterBannersByTab(updatedBanners, activeTab);
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось обновить статус баннера",
        variant: "destructive"
      });
    }
  }

  async function deleteBanner(id: string) {
    if (!confirm("Вы уверены, что хотите удалить этот баннер?")) return;
    
    try {
      const { error } = await supabase
        .from("banners")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast({
        title: "Успех",
        description: "Баннер удален",
      });
      
      // Удаляем баннер из локального состояния
      const updatedBanners = banners.filter(banner => banner.id !== id);
      setBanners(updatedBanners);
      filterBannersByTab(updatedBanners, activeTab);
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось удалить баннер",
        variant: "destructive"
      });
    }
  }

  async function changePriority(id: string, currentPriority: number, direction: "up" | "down") {
    const newPriority = direction === "up" ? currentPriority + 1 : currentPriority - 1;
    
    try {
      const { error } = await supabase
        .from("banners")
        .update({ priority: newPriority })
        .eq("id", id);

      if (error) throw error;
      
      toast({
        title: "Успех",
        description: "Приоритет баннера обновлен",
      });
      
      // Обновляем список баннеров локально
      const updatedBanners = banners.map(banner => 
        banner.id === id ? { ...banner, priority: newPriority } : banner
      );
      
      setBanners(updatedBanners);
      filterBannersByTab(updatedBanners, activeTab);
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось обновить приоритет баннера",
        variant: "destructive"
      });
    }
  }

  async function handleAddBanner() {
    try {
      if (!newBanner.title || !newBanner.image_url) {
        toast({
          title: "Ошибка",
          description: "Заполните обязательные поля: название и URL изображения",
          variant: "destructive"
        });
        return;
      }

      // Рассчитываем дату окончания, если она не указана
      const expiresAt = newBanner.expires_at 
        ? new Date(newBanner.expires_at) 
        : new Date(new Date().setDate(new Date().getDate() + 30)); // 30 дней по умолчанию

      // Создаем новый баннер
      const { data, error } = await supabase
        .from("banners")
        .insert({
          title: newBanner.title,
          description: newBanner.description,
          image_url: newBanner.image_url,
          link: newBanner.link || "/",
          status: "active",
          user_id: user?.id,
          expires_at: expiresAt.toISOString(),
          priority: newBanner.priority,
          is_active: newBanner.is_active,
          starts_at: new Date(newBanner.starts_at).toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Успех",
        description: "Баннер успешно добавлен",
      });
      
      // Сбрасываем форму
      setNewBanner({
        title: "",
        description: "",
        image_url: "",
        link: "",
        priority: 0,
        is_active: true,
        starts_at: new Date().toISOString().slice(0, 16),
        expires_at: ""
      });
      
      setIsAdding(false);
      
      // Добавляем новый баннер в локальное состояние
      if (data) {
        const newBannerData = {
          ...data,
          user_name: "Вы",
          user_email: user?.email || "",
          status: "active" as BannerStatus
        };
        
        const updatedBanners = [...banners, newBannerData];
        setBanners(updatedBanners);
        filterBannersByTab(updatedBanners, activeTab);
      } else {
        // Если данные не вернулись, делаем полную перезагрузку с сервера
        // Создаем заново асинхронную функцию для загрузки баннеров
        const loadBanners = async () => {
          try {
            setLoading(true);
            // Получаем баннеры
            const { data: bannersData, error: bannersError } = await supabase
              .from("banners")
              .select("*")
              .order("priority", { ascending: false })
              .order("created_at", { ascending: false });

            if (bannersError) throw bannersError;

            if (!bannersData || bannersData.length === 0) {
              setBanners([]);
              setFilteredBanners([]);
              setLoading(false);
              return;
            }

            // Получаем информацию о пользователях
            const userIds = [...new Set(bannersData.map(banner => banner.user_id))];
            const { data: usersData, error: usersError } = await supabase
              .from("profiles")
              .select("id, name, email")
              .in("id", userIds);

            if (usersError) throw usersError;

            // Добавляем имена пользователей к баннерам
            const bannersWithUsers = bannersData.map(banner => {
              const user = usersData?.find(u => u.id === banner.user_id);
              return {
                ...banner,
                user_name: user?.name || "Неизвестный",
                user_email: user?.email || "Нет email",
                status: banner.status as BannerStatus
              };
            }) as Banner[];

            setBanners(bannersWithUsers);
            // Фильтруем баннеры по активной вкладке
            filterBannersByTab(bannersWithUsers, activeTab);
          } catch (error) {
            console.error("Ошибка при загрузке баннеров:", error);
            setError("Не удалось загрузить список баннеров");
          } finally {
            setLoading(false);
          }
        };

        loadBanners();
      }
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось добавить баннер",
        variant: "destructive"
      });
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    const newValue = type === "checkbox" 
      ? (e.target as HTMLInputElement).checked 
      : value;
    
    setNewBanner(prev => ({
      ...prev,
      [name]: newValue
    }));
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Управление баннерами</h1>
        <Button 
          variant="outline"
          onClick={() => router.back()}
          className="w-full sm:w-auto"
        >
          Назад
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="mb-6 overflow-x-auto">
        <TabsList className="grid grid-cols-4 mb-4 min-w-[500px] w-full">
          <TabsTrigger value="pending" onClick={() => handleTabChange("pending")}>
            На модерации
          </TabsTrigger>
          <TabsTrigger value="active" onClick={() => handleTabChange("active")}>
            Активные
          </TabsTrigger>
          <TabsTrigger value="rejected" onClick={() => handleTabChange("rejected")}>
            Отклоненные
          </TabsTrigger>
          <TabsTrigger value="all" onClick={() => handleTabChange("all")}>
            Все
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Список баннеров */}
        <div className="col-span-1 md:col-span-1">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">
              {activeTab === "pending" && "Ожидают модерации"}
              {activeTab === "active" && "Активные баннеры"}
              {activeTab === "rejected" && "Отклоненные баннеры"}
              {activeTab === "all" && "Все баннеры"}
              {" "}({filteredBanners.length})
            </h2>
            
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredBanners.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-gray-500">Нет баннеров в этой категории</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredBanners.map((banner) => (
                  <div 
                    key={banner.id}
                    className={`p-3 rounded border cursor-pointer transition hover:bg-gray-50 ${selectedBanner?.id === banner.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                    onClick={() => setSelectedBanner(banner)}
                  >
                    <div className="font-medium line-clamp-1">{banner.title}</div>
                    <div className="text-sm text-gray-500 line-clamp-1">
                      {banner.user_name || "Неизвестный"}
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <div className="text-xs text-gray-400">
                        {new Date(banner.created_at).toLocaleDateString()}
                      </div>
                      {getBadgeByStatus(banner.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Детальная информация о выбранном баннере */}
        <div className="col-span-1 md:col-span-2">
          {selectedBanner ? (
            <Card className="overflow-hidden">
              <div className="relative aspect-[3/1]">
                <Image
                  src={selectedBanner.image_url}
                  alt={selectedBanner.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold mb-2">{selectedBanner.title}</h2>
                    {selectedBanner.description && (
                      <p className="text-gray-600 mb-4">{selectedBanner.description}</p>
                    )}
                  </div>
                  {getBadgeByStatus(selectedBanner.status)}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium">Создан</div>
                      <div className="text-gray-600">
                        {new Date(selectedBanner.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium">Действует до</div>
                      <div className="text-gray-600">
                        {new Date(selectedBanner.expires_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-5 w-5 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium">Ссылка</div>
                      <a 
                        href={selectedBanner.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate block max-w-xs"
                      >
                        {selectedBanner.link}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="text-sm font-medium mb-2">Информация о пользователе</h3>
                  <p className="text-gray-600"><strong>Имя:</strong> {selectedBanner.user_name}</p>
                  <p className="text-gray-600"><strong>Email:</strong> {selectedBanner.user_email}</p>
                </div>

                {selectedBanner.status === "pending" && (
                  <div className="flex flex-col sm:flex-row gap-4 justify-end mt-4">
                    <Button
                      variant="outline"
                      onClick={() => handleBannerReject(selectedBanner.id)}
                      className="flex items-center gap-2 w-full sm:w-auto"
                    >
                      <XCircle className="h-4 w-4" />
                      Отклонить
                    </Button>
                    <Button
                      onClick={() => handleBannerApprove(selectedBanner.id)}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Одобрить
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[300px] md:min-h-[400px] bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <div className="text-center p-6">
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  Выберите баннер для просмотра
                </h3>
                <p className="text-gray-500">
                  Нажмите на баннер в списке слева, чтобы увидеть подробную информацию
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {!isAdding && (
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="mr-2 h-4 w-4" /> Добавить баннер
        </Button>
      )}

      {isAdding && (
        <Card className="p-6 mb-8">
          <div className="space-y-4">
            <div className="flex justify-between">
              <h2 className="text-xl font-semibold">Новый баннер</h2>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {showPreview ? "Скрыть превью" : "Показать превью"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Название *
                  </label>
                  <Input
                    name="title"
                    value={newBanner.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Описание
                  </label>
                  <Textarea
                    name="description"
                    value={newBanner.description}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    URL изображения *
                  </label>
                  <Input
                    name="image_url"
                    value={newBanner.image_url}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Ссылка
                  </label>
                  <Input
                    name="link"
                    value={newBanner.link}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Приоритет
                    </label>
                    <Input
                      name="priority"
                      type="number"
                      value={newBanner.priority}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Активен
                    </label>
                    <div className="pt-2">
                      <input
                        name="is_active"
                        type="checkbox"
                        checked={newBanner.is_active}
                        onChange={(e) => setNewBanner(prev => ({
                          ...prev,
                          is_active: e.target.checked
                        }))}
                        className="h-4 w-4"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Дата начала *
                    </label>
                    <Input
                      name="starts_at"
                      type="datetime-local"
                      value={newBanner.starts_at}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Дата окончания
                    </label>
                    <Input
                      name="expires_at"
                      type="datetime-local"
                      value={newBanner.expires_at}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
              
              {showPreview && (
                <div className="border rounded-lg p-4 h-fit">
                  <h3 className="text-sm font-medium mb-2">Предпросмотр</h3>
                  <div className="relative aspect-[16/9] overflow-hidden rounded-md">
                    {newBanner.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={newBanner.image_url} 
                        alt={newBanner.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                        Предпросмотр изображения
                      </div>
                    )}
                  </div>
                  <div className="mt-2">
                    <h3 className="font-semibold">{newBanner.title || "Название баннера"}</h3>
                    <p className="text-sm text-gray-600 mt-1">{newBanner.description || "Описание баннера (если есть)"}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsAdding(false)}>Отмена</Button>
              <Button onClick={handleAddBanner}>Сохранить</Button>
            </div>
          </div>
        </Card>
      )}

      {banners.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">Баннеры отсутствуют</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {banners.map((banner) => (
            <Card key={banner.id} className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/4">
                  <div className="relative aspect-[16/9] overflow-hidden rounded-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={banner.image_url} 
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h3 className="text-xl font-semibold">{banner.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        banner.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}>
                        {banner.is_active ? "Активен" : "Неактивен"}
                      </span>
                      <span className="text-xs text-gray-500">
                        Приоритет: {banner.priority}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1">{banner.description || "Нет описания"}</p>
                  
                  {banner.link && (
                    <div className="mt-2">
                      <span className="text-sm text-blue-500 break-all">{banner.link}</span>
                    </div>
                  )}
                  
                  <div className="mt-2 text-xs text-gray-500">
                    <p>Начало: {new Date(banner.starts_at).toLocaleString()}</p>
                    {banner.expires_at && (
                      <p>Окончание: {new Date(banner.expires_at).toLocaleString()}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex md:flex-col justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => toggleBannerStatus(banner.id, banner.is_active)}
                    title={banner.is_active ? "Деактивировать" : "Активировать"}
                  >
                    {banner.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => changePriority(banner.id, banner.priority, "up")}
                    title="Увеличить приоритет"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => changePriority(banner.id, banner.priority, "down")}
                    title="Уменьшить приоритет"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    variant="destructive" 
                    size="icon"
                    onClick={() => deleteBanner(banner.id)}
                    title="Удалить"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function getBadgeByStatus(status: string) {
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