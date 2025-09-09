import { createClient } from '@/lib/supabase/client';

export interface ExplorationLevel {
  exploration_id: string;
  levels: number;
  title: string;
  thumbnail: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface ExplorationLevelWithAsset
  extends Omit<ExplorationLevel, 'thumbnail'> {
  thumbnail_url: string | undefined;
  thumbnail_alt_text: string | undefined;
}

/**
 * Fetches all exploration levels from the database
 * @returns Promise<ExplorationLevelWithAsset[]> - Array of exploration levels with asset information
 */
export const getExplorationLevels = async (): Promise<
  ExplorationLevelWithAsset[]
> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('exploration')
    .select(
      `
      exploration_id,
      levels,
      title,
      thumbnail,
      created_at,
      updated_at,
      assets!exploration_thumbnail_fkey (
        url,
        alt_text
      )
    `
    )
    .order('levels', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch exploration levels: ${error.message}`);
  }

  // Transform the data to flatten the asset information
  return data.map(level => ({
    exploration_id: level.exploration_id,
    levels: level.levels,
    title: level.title,
    created_at: level.created_at,
    updated_at: level.updated_at,
    thumbnail_url: (level.assets as any)?.url || undefined,
    thumbnail_alt_text: (level.assets as any)?.alt_text || undefined,
  }));
};

/**
 * Fetches a single exploration level by ID
 * @param explorationId - The exploration ID to fetch
 * @returns Promise<ExplorationLevelWithAsset | undefined> - The exploration level or undefined if not found
 */
export const getExplorationLevelById = async (
  explorationId: string
): Promise<ExplorationLevelWithAsset | undefined> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('exploration')
    .select(
      `
      exploration_id,
      levels,
      title,
      thumbnail,
      created_at,
      updated_at,
      assets!exploration_thumbnail_fkey (
        url,
        alt_text
      )
    `
    )
    .eq('exploration_id', explorationId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows found
      return undefined;
    }
    throw new Error(`Failed to fetch exploration level: ${error.message}`);
  }

  return {
    exploration_id: data.exploration_id,
    levels: data.levels,
    title: data.title,
    created_at: data.created_at,
    updated_at: data.updated_at,
    thumbnail_url: (data.assets as any)?.url || undefined,
    thumbnail_alt_text: (data.assets as any)?.alt_text || undefined,
  };
};
