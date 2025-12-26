// @/repositories/user-level-progress-repository.ts

import { createClient } from '@/lib/supabase/client';
import { logDatabaseError } from '@/lib/utils/error-logger';

export interface UserLevelProgress {
  id: string;
  user_id: string;
  level_number: number;
  progress_step: number;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Get progress untuk level tertentu
 */
export const getLevelProgress = async (
  userId: string,
  levelNumber: number
): Promise<UserLevelProgress | null> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('user_exploration_level_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('level_number', levelNumber)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching level progress:', error);
    await logDatabaseError(error, {
      module: 'user-level-progress-repository',
      userId,
    });
    throw error;
  }

  return data;
};

/**
 * Get progress untuk semua level user
 */
export const getAllLevelProgress = async (
  userId: string
): Promise<UserLevelProgress[]> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('user_exploration_level_progress')
    .select('*')
    .eq('user_id', userId)
    .order('level_number', { ascending: true });

  if (error) {
    console.error('Error fetching all level progress:', error);
    await logDatabaseError(error, {
      module: 'user-level-progress-repository',
      userId,
    });
    throw error;
  }

  return data || [];
};

/**
 * Update progress untuk level tertentu
 * PENTING: Progress HANYA NAIK, tidak pernah turun
 * CRITICAL: progressStep is 0-based index from MateriPage
 */
export const updateLevelProgress = async (
  userId: string,
  levelNumber: number,
  progressStep: number // ✅ 0-based: 0=step1, 25=step26
): Promise<UserLevelProgress> => {
  const supabase = createClient();

  // 1. Cek progress saat ini
  const currentProgress = await getLevelProgress(userId, levelNumber);

  // 2. Jika belum ada record, buat baru
  if (!currentProgress) {
    const { data, error } = await supabase
      .from('user_exploration_level_progress')
      .insert({
        user_id: userId,
        level_number: levelNumber,
        progress_step: progressStep, // ✅ Save as-is (0-based)
        is_completed: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating level progress:', error);
      await logDatabaseError(error, {
        module: 'user-level-progress-repository',
        userId,
        errorCode: 'PROGRESS_CREATE_FAILED',
      });
      throw error;
    }

    console.log(
      `✨ Created new progress for Level ${levelNumber}: step ${progressStep} (display: ${progressStep + 1})`
    );
    return data;
  }

  // 3. Hanya update jika progress NAIK
  if (progressStep > currentProgress.progress_step) {
    const { data, error } = await supabase
      .from('user_exploration_level_progress')
      .update({
        progress_step: progressStep, // ✅ Save 0-based
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentProgress.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating level progress:', error);
      await logDatabaseError(error, {
        module: 'user-level-progress-repository',
        userId,
        errorCode: 'PROGRESS_UPDATE_FAILED',
      });
      throw error;
    }

    console.log(
      `📈 Level ${levelNumber} progress: ${currentProgress.progress_step} → ${progressStep} (display: ${progressStep + 1})`
    );
    return data;
  }

  // 4. Jika progress tidak naik, return current
  console.log(
    `🔒 Level ${levelNumber} progress maintained at ${currentProgress.progress_step} (display: ${currentProgress.progress_step + 1})`
  );
  return currentProgress;
};

/**
 * Mark level as completed
 */
export const markLevelAsCompleted = async (
  userId: string,
  levelNumber: number
): Promise<UserLevelProgress> => {
  const supabase = createClient();

  const currentProgress = await getLevelProgress(userId, levelNumber);

  if (!currentProgress) {
    // Buat record baru dengan completed = true
    const { data, error } = await supabase
      .from('user_exploration_level_progress')
      .insert({
        user_id: userId,
        level_number: levelNumber,
        progress_step: 100, // Completed
        is_completed: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error marking level as completed:', error);
      throw error;
    }

    return data;
  }

  // Update existing record
  const { data, error } = await supabase
    .from('user_exploration_level_progress')
    .update({
      is_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', currentProgress.id)
    .select()
    .single();

  if (error) {
    console.error('Error marking level as completed:', error);
    throw error;
  }

  console.log(`✅ Level ${levelNumber} marked as completed`);
  return data;
};

/**
 * Reset progress untuk level tertentu (untuk retry)
 */
export const resetLevelProgress = async (
  userId: string,
  levelNumber: number
): Promise<UserLevelProgress> => {
  const supabase = createClient();

  const currentProgress = await getLevelProgress(userId, levelNumber);

  if (!currentProgress) {
    // Buat record baru dengan progress 0
    const { data, error } = await supabase
      .from('user_exploration_level_progress')
      .insert({
        user_id: userId,
        level_number: levelNumber,
        progress_step: 0,
        is_completed: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating level progress:', error);
      throw error;
    }

    return data;
  }

  // Reset ke 0
  const { data, error } = await supabase
    .from('user_exploration_level_progress')
    .update({
      progress_step: 0,
      is_completed: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', currentProgress.id)
    .select()
    .single();

  if (error) {
    console.error('Error resetting level progress:', error);
    throw error;
  }

  console.log(`🔄 Level ${levelNumber} progress reset to 0`);
  return data;
};

/**
 * Get current step untuk level tertentu
 */
export const getCurrentStepForLevel = async (
  userId: string,
  levelNumber: number,
  totalSteps: number
): Promise<number> => {
  try {
    const progress = await getLevelProgress(userId, levelNumber);

    if (!progress) return 0;

    return Math.max(0, Math.min(progress.progress_step, totalSteps - 1));
  } catch (error) {
    console.error('Error getting current step:', error);
    return 0;
  }
};
