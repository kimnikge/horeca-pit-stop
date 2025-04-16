import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export interface Banner {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  link: string | null;
  priority: number;
  isActive: boolean;
  startsAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function getActiveBanners(): Promise<Banner[]> {
  const supabase = createClientComponentClient();
  
  try {
    const { data, error } = await supabase
      .rpc('get_active_banners');
    
    if (error) {
      console.error('Ошибка при получении баннеров:', error);
      throw error;
    }
    
    // Преобразуем snake_case в camelCase для фронтенда
    return data.map((banner: any) => ({
      id: banner.id,
      title: banner.title,
      description: banner.description,
      imageUrl: banner.image_url,
      link: banner.link,
      priority: banner.priority,
      isActive: banner.is_active,
      startsAt: banner.starts_at,
      expiresAt: banner.expires_at,
      createdAt: banner.created_at,
      updatedAt: banner.updated_at
    }));
  } catch (error) {
    console.error('Ошибка при получении баннеров:', error);
    throw error;
  }
}

export async function createBanner(banner: Omit<Banner, 'id' | 'createdAt' | 'updatedAt'>): Promise<Banner> {
  const supabase = createClientComponentClient();
  
  try {
    // Преобразуем camelCase в snake_case для базы данных
    const { data, error } = await supabase
      .from('banners')
      .insert({
        title: banner.title,
        description: banner.description,
        image_url: banner.imageUrl,
        link: banner.link,
        is_active: banner.isActive,
        priority: banner.priority,
        starts_at: banner.startsAt,
        expires_at: banner.expiresAt
      })
      .select('*')
      .single();
    
    if (error) {
      console.error('Ошибка при создании баннера:', error);
      throw error;
    }
    
    // Преобразуем snake_case в camelCase для фронтенда
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      imageUrl: data.image_url,
      link: data.link,
      priority: data.priority,
      isActive: data.is_active,
      startsAt: data.starts_at,
      expiresAt: data.expires_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Ошибка при создании баннера:', error);
    throw error;
  }
}

export async function updateBanner(id: string, banner: Partial<Omit<Banner, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Banner> {
  const supabase = createClientComponentClient();
  
  try {
    // Преобразуем camelCase в snake_case для базы данных
    const updateData: any = {};
    
    if (banner.title !== undefined) updateData.title = banner.title;
    if (banner.description !== undefined) updateData.description = banner.description;
    if (banner.imageUrl !== undefined) updateData.image_url = banner.imageUrl;
    if (banner.link !== undefined) updateData.link = banner.link;
    if (banner.isActive !== undefined) updateData.is_active = banner.isActive;
    if (banner.priority !== undefined) updateData.priority = banner.priority;
    if (banner.startsAt !== undefined) updateData.starts_at = banner.startsAt;
    if (banner.expiresAt !== undefined) updateData.expires_at = banner.expiresAt;
    
    const { data, error } = await supabase
      .from('banners')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();
    
    if (error) {
      console.error('Ошибка при обновлении баннера:', error);
      throw error;
    }
    
    // Преобразуем snake_case в camelCase для фронтенда
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      imageUrl: data.image_url,
      link: data.link,
      priority: data.priority,
      isActive: data.is_active,
      startsAt: data.starts_at,
      expiresAt: data.expires_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Ошибка при обновлении баннера:', error);
    throw error;
  }
}

export async function deleteBanner(id: string): Promise<void> {
  const supabase = createClientComponentClient();
  
  try {
    const { error } = await supabase
      .from('banners')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Ошибка при удалении баннера:', error);
      throw error;
    }
  } catch (error) {
    console.error('Ошибка при удалении баннера:', error);
    throw error;
  }
} 