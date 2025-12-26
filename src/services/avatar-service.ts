import { createClient } from '@/lib/supabase/client';
import { insertEventLog } from '@/repositories/event-log-repository';
import { logServiceError } from '@/lib/utils/error-logger';

// Sesuaikan interface dengan kebutuhan UI (tetap butuh image_url untuk <Image/>)
// Tapi kita akan ambil datanya lewat relasi UUID
export interface UserAvatar {
  avatar_id: string;
  name: string;
  image_url: string; // Ini nanti hasil mapping dari assets.url
  is_default: boolean;
  display_order: number;
}

/**
 * Mengambil semua avatar dengan men-join table 'avatars' dan 'assets'
 */
export const getAllAvatars = async (): Promise<UserAvatar[]> => {
  const supabase = createClient();

  // Query ke table 'avatars', dan join ke 'assets' via image_asset_id
  const { data, error } = await supabase
    .from('avatars') // Pastikan nama table sesuai SQL: 'avatars'
    .select(
      `
      avatar_id,
      name,
      is_default,
      display_order,
      image_asset_id,
      assets (
        url
      )
    `
    )
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Failed to fetch avatars:', error);
    await logServiceError(error, 'avatar-service');
    return [];
  }

  // Mapping hasil query Supabase agar sesuai format yang UI butuhkan
  // Mengambil URL dari dalam object 'assets'
  return data.map((item: any) => ({
    avatar_id: item.avatar_id,
    name: item.name,
    is_default: item.is_default,
    display_order: item.display_order,
    // Jika asset ditemukan ambil url-nya, jika tidak pakai string kosong/placeholder
    image_url: item.assets?.url || '',
  }));
};

/**
 * Update avatar user (Hanya kirim UUID avatar_id)
 */
export const updateUserAvatar = async (
  userId: string,
  avatarId: string
): Promise<void> => {
  const supabase = createClient();

  const { error } = await supabase
    .from('users')
    .update({ avatar_id: avatarId }) // Kirim UUID
    .eq('user_id', userId);

  if (error) {
    await logServiceError(error, 'avatar-service', userId);
    throw new Error(`Failed to update user avatar: ${error.message}`);
  }

  // Log avatar change event
  try {
    await insertEventLog({
      event_type: 'user_profile',
      event_name: 'avatar_changed',
      description: `User changed avatar to ${avatarId}`,
      actor_type: 'user',
      actor_id: userId,
    });
  } catch (logError) {
    // Don't block avatar update if event logging fails
    console.error('Failed to log avatar change event:', logError);
  }
};

/**
 * Ambil avatar user saat ini
 */
export const getUserAvatar = async (
  userId: string
): Promise<UserAvatar | undefined> => {
  const supabase = createClient();

  // 1. Ambil avatar_id dari user
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('avatar_id')
    .eq('user_id', userId)
    .single();

  if (userError || !userData?.avatar_id) {
    return undefined;
  }

  // 2. Ambil detail avatar dari table 'avatars' join 'assets'
  const { data: avatarData, error: avatarError } = await supabase
    .from('avatars')
    .select(
      `
      avatar_id,
      name,
      is_default,
      display_order,
      assets (
        url
      )
    `
    )
    .eq('avatar_id', userData.avatar_id)
    .single();

  if (avatarError || !avatarData) {
    return undefined;
  }

  // Mapping hasil ke format UserAvatar
  return {
    avatar_id: avatarData.avatar_id,
    name: avatarData.name,
    is_default: avatarData.is_default,
    display_order: avatarData.display_order,
    image_url: (avatarData.assets as any)?.url || '',
  };
};
