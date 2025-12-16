import { createClient } from '@/lib/supabase/client';

export interface BackgroundUrls {
  desktop: string | undefined;
  mobile: string | undefined;
}

/**
 * Ambil global background images dari Supabase
 */
export const getGlobalBackgrounds = async (): Promise<BackgroundUrls> => {
  const supabase = createClient();

  const { data: bgData, error: bgError } = await supabase
    .from('app_backgrounds')
    .select('background_id, type, asset_id')
    .eq('page', 'global')
    .eq('is_active', true);

  if (bgError) {
    console.error('Error fetching app_backgrounds:', bgError);
    return { desktop: undefined, mobile: undefined };
  }

  if (!bgData || bgData.length === 0) {
    return { desktop: undefined, mobile: undefined };
  }

  const backgrounds: BackgroundUrls = {
    desktop: undefined,
    mobile: undefined,
  };

  for (const bg of bgData) {
    if (!bg.asset_id) continue;

    const { data: assetData, error: assetError } = await supabase
      .from('assets')
      .select('asset_id, url')
      .eq('asset_id', bg.asset_id)
      .single();

    if (assetError) continue;

    if (!assetData?.url) continue;

    let imageUrl = assetData.url;

    // Jika signed URL, convert ke public
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

    if (bg.type === 'desktop') {
      backgrounds.desktop = imageUrl;
    } else if (bg.type === 'mobile') {
      backgrounds.mobile = imageUrl;
    }
  }

  return backgrounds;
};

/**
 * Ambil background untuk page spesifik
 */
export const getPageBackgrounds = async (
  page: string
): Promise<BackgroundUrls> => {
  const supabase = createClient();

  const { data: bgData, error: bgError } = await supabase
    .from('app_backgrounds')
    .select('background_id, type, asset_id')
    .eq('page', page)
    .eq('is_active', true);

  if (bgError || !bgData || bgData.length === 0) {
    return getGlobalBackgrounds();
  }

  const backgrounds: BackgroundUrls = {
    desktop: undefined,
    mobile: undefined,
  };

  for (const bg of bgData) {
    if (!bg.asset_id) continue;

    const { data: assetData, error: assetError } = await supabase
      .from('assets')
      .select('url')
      .eq('asset_id', bg.asset_id)
      .single();

    if (assetError || !assetData?.url) continue;

    let imageUrl = assetData.url;

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

    if (bg.type === 'desktop') {
      backgrounds.desktop = imageUrl;
    } else if (bg.type === 'mobile') {
      backgrounds.mobile = imageUrl;
    }
  }

  return backgrounds;
};
