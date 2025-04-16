import { supabase } from "@/lib/supabase";
import { Banner } from "@/components/banner/banner-carousel";

export async function getActiveBanners(): Promise<Banner[]> {
  try {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .eq("status", "active")
      .gte("expires_at", now)
      .order("created_at", { ascending: false });

    if (error) {
      // Проверяем код ошибки для отсутствующей таблицы
      if (error.code === "42P01") { // relation does not exist
        console.log("Таблица баннеров не существует в БД. Показываем пустой массив.");
        return [];
      }
      console.error("Error fetching banners:", error);
      return [];
    }

    return data.map((banner) => ({
      id: banner.id,
      title: banner.title,
      description: banner.description,
      imageUrl: banner.image_url,
      link: banner.link,
      expiresAt: new Date(banner.expires_at),
    }));
  } catch (error) {
    console.error("Unexpected error fetching banners:", error);
    return [];
  }
}

export async function getUserBanners(userId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      // Проверяем код ошибки для отсутствующей таблицы
      if (error.code === "42P01") { 
        console.log("Таблица баннеров не существует в БД. Показываем пустой массив.");
        return [];
      }
      console.error("Error fetching user banners:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching user banners:", error);
    return [];
  }
}

export async function createBanner(bannerData: any): Promise<{ success: boolean; error?: string }> {
  // Установка даты истечения через 7 дней
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  
  const { error } = await supabase
    .from("banners")
    .insert([
      {
        ...bannerData,
        status: "pending", // По умолчанию все баннеры создаются с ожиданием модерации
        expires_at: expiresAt.toISOString(),
      },
    ]);

  if (error) {
    console.error("Error creating banner:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function updateBannerStatus(
  bannerId: string, 
  status: "pending" | "active" | "rejected" | "expired"
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from("banners")
    .update({ status })
    .eq("id", bannerId);

  if (error) {
    console.error("Error updating banner status:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function reactivateBanner(bannerId: string): Promise<{ success: boolean; error?: string }> {
  // Установка новой даты истечения через 7 дней от текущей даты
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  
  const { error } = await supabase
    .from("banners")
    .update({ 
      status: "pending", // Статус "ожидает модерации"
      expires_at: expiresAt.toISOString()
    })
    .eq("id", bannerId);

  if (error) {
    console.error("Error reactivating banner:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
} 