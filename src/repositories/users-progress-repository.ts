// @/repositories/users-progress-repository.ts

import { createClient } from '@/lib/supabase/client';

export interface UserProgress {
  progress_id: string;
  user_id: string;
  exploration_level: number;
  exploration_progress: number;
  guessing_challenge_score: number;
  user_lives: number;
  xp: number;
  created_at: string;
  updated_at: string;
}

export interface CreateUserProgressParams {
  userId: string;
  explorationLevel?: number;
  explorationProgress?: number;
  guessingChallengeScore?: number;
  xp?: number;
}

export interface UpdateUserProgressParams {
  userId: string;
  explorationLevel?: number;
  explorationProgress?: number;
  guessingChallengeScore?: number;
  userLives?: number;
  xp?: number;
}

/**
 * Get user progress from database
 */
export const getUserProgress = async (
  userId: string
): Promise<UserProgress | null> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('users_progress')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user progress:', error);
    throw error;
  }

  return data;
};

/**
 * Create new user progress
 */
export const createUserProgress = async (
  params: CreateUserProgressParams
): Promise<UserProgress> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('users_progress')
    .insert({
      user_id: params.userId,
      exploration_level: params.explorationLevel ?? 1,
      exploration_progress: params.explorationProgress ?? 0,
      guessing_challenge_score: params.guessingChallengeScore ?? 0,
      user_lives: 3,
      xp: params.xp ?? 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating user progress:', error);
    throw error;
  }

  return data;
};

/**
 * Update user progress
 * ✅ CRITICAL: Ensure XP is updated properly
 */
export const updateUserProgress = async (
  params: UpdateUserProgressParams
): Promise<UserProgress> => {
  const supabase = createClient();

  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (params.explorationLevel !== undefined) {
    updateData.exploration_level = params.explorationLevel;
    console.log('🔄 Updating exploration_level to:', params.explorationLevel);
  }
  if (params.explorationProgress !== undefined) {
    updateData.exploration_progress = params.explorationProgress;
  }
  if (params.guessingChallengeScore !== undefined) {
    updateData.guessing_challenge_score = params.guessingChallengeScore;
  }
  if (params.userLives !== undefined) {
    updateData.user_lives = params.userLives;
    console.log('🔄 Updating user_lives to:', params.userLives);
  }
  if (params.xp !== undefined) {
    updateData.xp = params.xp;
    console.log('🔄 Updating XP to:', params.xp);
  }

  console.log('📤 Sending update to database:', updateData);

  const { data, error } = await supabase
    .from('users_progress')
    .update(updateData)
    .eq('user_id', params.userId)
    .select()
    .single();

  if (error) {
    console.error('❌ Error updating user progress:', error);
    throw error;
  }

  console.log('✅ Database response:', {
    level: data.exploration_level,
    xp: data.xp,
    lives: data.user_lives,
  });

  return data;
};

/**
 * Upsert user progress (create if not exists, update if exists)
 */
export const upsertUserProgress = async (
  params: UpdateUserProgressParams
): Promise<UserProgress> => {
  const existing = await getUserProgress(params.userId);

  if (!existing) {
    return createUserProgress({
      userId: params.userId,
      explorationLevel: params.explorationLevel,
      explorationProgress: params.explorationProgress,
      guessingChallengeScore: params.guessingChallengeScore,
      xp: params.xp,
    });
  }

  return updateUserProgress(params);
};

/**
 * Decrease user lives by 1
 */
export const decreaseUserLives = async (
  userId: string
): Promise<UserProgress> => {
  const supabase = createClient();

  const current = await getUserProgress(userId);
  if (!current) {
    throw new Error('User progress not found');
  }

  const newLives = Math.max(0, current.user_lives - 1);

  const { data, error } = await supabase
    .from('users_progress')
    .update({
      user_lives: newLives,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error decreasing user lives:', error);
    throw error;
  }

  console.log(`💔 Lives decreased: ${current.user_lives} → ${newLives}`);
  return data;
};

/**
 * Regenerate user lives to maximum (3)
 * ✅ FIXED: Jangan override field lain
 */
export const regenerateUserLives = async (
  userId: string
): Promise<UserProgress> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('users_progress')
    .update({
      user_lives: 3,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error regenerating user lives:', error);
    throw error;
  }

  console.log('💖 Lives refilled to 3 (XP & level unchanged)');
  return data;
};

/**
 * ✅ FIXED: Reset XP only, keep exploration_level
 * Used when lives = 0
 */
export const resetUserExplorationProgress = async (
  userId: string
): Promise<UserProgress> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('users_progress')
    .update({
      exploration_progress: 0,
      xp: 0, // ✅ Reset XP ke 0
      updated_at: new Date().toISOString(),
      // ❌ TIDAK reset exploration_level (user tetap di level yang sama)
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error resetting user exploration progress:', error);
    throw error;
  }

  console.log('🔄 XP reset to 0 (level unchanged)');
  return data;
};

/**
 * Get all user progress records (for admin/debugging)
 */
export const getAllUserProgress = async (): Promise<UserProgress[]> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('users_progress')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all user progress:', error);
    throw error;
  }

  return data || [];
};
