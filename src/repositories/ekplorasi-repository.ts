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

export interface LearningModule {
  learning_module_id: string;
  exploration_id: string;
  title: string;
  description: string | undefined;
  image: string | undefined;
  created_at: string;
  updated_at: string | undefined;
}

export interface LearningModuleWithAsset extends Omit<LearningModule, 'image'> {
  image_url: string | undefined;
  image_alt_text: string | undefined;
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

/**
 * Fetches learning modules for a specific exploration level
 * @param explorationId - The exploration ID to fetch modules for
 * @returns Promise<LearningModuleWithAsset[]> - Array of learning modules with asset information
 */
export const getLearningModulesByExplorationId = async (
  explorationId: string
): Promise<LearningModuleWithAsset[]> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('exploration_learning_modules')
    .select(
      `
      learning_module_id,
      exploration_id,
      title,
      description,
      image,
      created_at,
      updated_at,
      assets!exploration_learning_modules_image_fkey (
        url,
        alt_text
      )
    `
    )
    .eq('exploration_id', explorationId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch learning modules: ${error.message}`);
  }

  // Transform the data to flatten the asset information
  return data.map(module => ({
    learning_module_id: module.learning_module_id,
    exploration_id: module.exploration_id,
    title: module.title,
    description: module.description,
    created_at: module.created_at,
    updated_at: module.updated_at,
    image_url: (module.assets as any)?.url || undefined,
    image_alt_text: (module.assets as any)?.alt_text || undefined,
  }));
};

/**
 * Fetches a single learning module by ID
 * @param moduleId - The learning module ID to fetch
 * @returns Promise<LearningModuleWithAsset | undefined> - The learning module or undefined if not found
 */
export const getLearningModuleById = async (
  moduleId: string
): Promise<LearningModuleWithAsset | undefined> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('exploration_learning_modules')
    .select(
      `
      learning_module_id,
      exploration_id,
      title,
      description,
      image,
      created_at,
      updated_at,
      assets!exploration_learning_modules_image_fkey (
        url,
        alt_text
      )
    `
    )
    .eq('learning_module_id', moduleId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows found
      return undefined;
    }
    throw new Error(`Failed to fetch learning module: ${error.message}`);
  }

  return {
    learning_module_id: data.learning_module_id,
    exploration_id: data.exploration_id,
    title: data.title,
    description: data.description,
    created_at: data.created_at,
    updated_at: data.updated_at,
    image_url: (data.assets as any)?.url || undefined,
    image_alt_text: (data.assets as any)?.alt_text || undefined,
  };
};
