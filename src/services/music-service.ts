import { createClient } from '@/lib/supabase/client';

export interface BackgroundMusic {
  music_id: string;
  title: string;
  description: string | null;
  audio_asset_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface BackgroundMusicWithAsset extends BackgroundMusic {
  audio_url: string | undefined;
  audio_alt_text: string | undefined;
}

/**
 * Fetches the active background music from the database
 * @returns Promise<BackgroundMusicWithAsset | undefined> - The active background music or undefined if not found
 */
export const getActiveBackgroundMusic = async (): Promise<
  BackgroundMusicWithAsset | undefined
> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('background_music')
    .select(
      `
      music_id,
      title,
      description,
      audio_asset_id,
      is_active,
      created_at,
      updated_at,
      assets!background_music_audio_asset_id_fkey (
        url,
        alt_text
      )
    `
    )
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No active music found
      return undefined;
    }
    throw new Error(
      `Failed to fetch active background music: ${error.message}`
    );
  }

  return {
    music_id: data.music_id,
    title: data.title,
    description: data.description,
    audio_asset_id: data.audio_asset_id,
    is_active: data.is_active,
    created_at: data.created_at,
    updated_at: data.updated_at,
    audio_url: (data.assets as any)?.url || undefined,
    audio_alt_text: (data.assets as any)?.alt_text || undefined,
  };
};

/**
 * Fetches all background music from the database
 * @returns Promise<BackgroundMusicWithAsset[]> - Array of background music with asset information
 */
export const getAllBackgroundMusic = async (): Promise<
  BackgroundMusicWithAsset[]
> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('background_music')
    .select(
      `
      music_id,
      title,
      description,
      audio_asset_id,
      is_active,
      created_at,
      updated_at,
      assets!background_music_audio_asset_id_fkey (
        url,
        alt_text
      )
    `
    )
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch background music: ${error.message}`);
  }

  return data.map(music => ({
    music_id: music.music_id,
    title: music.title,
    description: music.description,
    audio_asset_id: music.audio_asset_id,
    is_active: music.is_active,
    created_at: music.created_at,
    updated_at: music.updated_at,
    audio_url: (music.assets as any)?.url || undefined,
    audio_alt_text: (music.assets as any)?.alt_text || undefined,
  }));
};

/**
 * Fetches a single background music by ID
 * @param musicId - The music ID to fetch
 * @returns Promise<BackgroundMusicWithAsset | undefined> - The background music or undefined if not found
 */
export const getBackgroundMusicById = async (
  musicId: string
): Promise<BackgroundMusicWithAsset | undefined> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('background_music')
    .select(
      `
      music_id,
      title,
      description,
      audio_asset_id,
      is_active,
      created_at,
      updated_at,
      assets!background_music_audio_asset_id_fkey (
        url,
        alt_text
      )
    `
    )
    .eq('music_id', musicId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return undefined;
    }
    throw new Error(`Failed to fetch background music: ${error.message}`);
  }

  return {
    music_id: data.music_id,
    title: data.title,
    description: data.description,
    audio_asset_id: data.audio_asset_id,
    is_active: data.is_active,
    created_at: data.created_at,
    updated_at: data.updated_at,
    audio_url: (data.assets as any)?.url || undefined,
    audio_alt_text: (data.assets as any)?.alt_text || undefined,
  };
};
