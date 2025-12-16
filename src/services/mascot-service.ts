import { createClient } from '@/lib/supabase/client';

export interface MascotData {
  mascot_id: string;
  name: string;
  page: string;
  position: string | undefined;
  image_url: string | undefined;
}

/**
 * Ambil mascot untuk page tertentu
 * @param page - Nama page (e.g., 'onboarding', 'login', 'register', 'floating', 'results')
 * @param position - Optional position ('bottom-right', 'success', 'fail', dll)
 */
export const getPageMascot = async (
  page: string,
  position?: string
): Promise<string | undefined> => {
  const supabase = createClient();

  let query = supabase
    .from('app_mascots')
    .select('mascot_id, name, position, assets(url)')
    .eq('page', page)
    .eq('is_active', true);

  // Filter by position if provided
  if (position) {
    query = query.eq('position', position);
  }

  const { data, error } = await query.single();

  if (error) {
    console.error(`Error fetching mascot for ${page}:`, error);
    return undefined;
  }

  if (!data) {
    return undefined;
  }

  let imageUrl = (data.assets as any)?.url;

  if (!imageUrl) {
    return undefined;
  }

  // Convert signed URL to public URL if needed
  if (imageUrl.includes('/object/sign/')) {
    const urlMatch = imageUrl.match(/\/storage\/v1\/object\/sign\/([^?]+)/);
    if (urlMatch) {
      const fullPath = decodeURIComponent(urlMatch[1]);
      const pathParts = fullPath.split('/');
      const bucket = pathParts[0];
      const filePath = pathParts.slice(1).join('/');

      const { data: publicData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      imageUrl = publicData.publicUrl;
    }
  }

  return imageUrl;
};

/**
 * Ambil semua mascots aktif (untuk debugging/admin)
 */
export const getAllMascots = async (): Promise<MascotData[]> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('app_mascots')
    .select(
      `
      mascot_id,
      name,
      page,
      position,
      assets(url)
    `
    )
    .eq('is_active', true)
    .order('page', { ascending: true });

  if (error) {
    console.error('Failed to fetch mascots:', error);
    return [];
  }

  return data.map((item: any) => {
    let imageUrl = item.assets?.url;

    // Convert signed URL if needed
    if (imageUrl?.includes('/object/sign/')) {
      const urlMatch = imageUrl.match(/\/storage\/v1\/object\/sign\/([^?]+)/);
      if (urlMatch) {
        const fullPath = decodeURIComponent(urlMatch[1]);
        const pathParts = fullPath.split('/');
        const bucket = pathParts[0];
        const filePath = pathParts.slice(1).join('/');

        const { data: publicData } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);

        imageUrl = publicData.publicUrl;
      }
    }

    return {
      mascot_id: item.mascot_id,
      name: item.name,
      page: item.page,
      position: item.position || undefined,
      image_url: imageUrl || undefined,
    };
  });
};
