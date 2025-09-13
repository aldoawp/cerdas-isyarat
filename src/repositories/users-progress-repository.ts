import { createClient } from '@/lib/supabase/client';

export interface UserProgress {
  progress_id: string;
  user_id: string;
  exploration_level: number;
  exploration_progress: number;
  guessing_challenge_score: number;
  user_lives: number;
  created_at: string;
  updated_at: string;
}

export interface CreateUserProgressParams {
  userId: string;
  explorationLevel?: number;
  explorationProgress?: number;
  guessingChallengeScore?: number;
  userLives?: number;
}

export interface UpdateUserProgressParams {
  userId: string;
  explorationLevel?: number;
  explorationProgress?: number;
  guessingChallengeScore?: number;
  userLives?: number;
}

export const getUserProgress = async (
  userId: string
): Promise<UserProgress | undefined> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('users_progress')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows found
      return undefined;
    }
    throw error;
  }

  return data;
};

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
      user_lives: params.userLives ?? 3,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateUserProgress = async (
  params: UpdateUserProgressParams
): Promise<UserProgress> => {
  const supabase = createClient();

  const updateData: Partial<
    Omit<UserProgress, 'progress_id' | 'user_id' | 'created_at'>
  > = {
    updated_at: new Date().toISOString(),
  };

  if (params.explorationLevel !== undefined) {
    updateData.exploration_level = params.explorationLevel;
  }
  if (params.explorationProgress !== undefined) {
    updateData.exploration_progress = params.explorationProgress;
  }
  if (params.guessingChallengeScore !== undefined) {
    updateData.guessing_challenge_score = params.guessingChallengeScore;
  }
  if (params.userLives !== undefined) {
    updateData.user_lives = params.userLives;
  }

  const { data, error } = await supabase
    .from('users_progress')
    .update(updateData)
    .eq('user_id', params.userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const upsertUserProgress = async (
  params: CreateUserProgressParams
): Promise<UserProgress> => {
  const existingProgress = await getUserProgress(params.userId);

  return existingProgress
    ? updateUserProgress(params)
    : createUserProgress(params);
};

/**
 * Decreases user lives by 1 and returns updated progress
 */
export const decreaseUserLives = async (
  userId: string
): Promise<UserProgress> => {
  const currentProgress = await getUserProgress(userId);

  if (!currentProgress) {
    // Create new progress with 2 lives (3 - 1)
    return createUserProgress({
      userId,
      explorationLevel: 1,
      explorationProgress: 0,
      guessingChallengeScore: 0,
      userLives: 2,
    });
  }

  const newLives = Math.max(0, currentProgress.user_lives - 1);

  return updateUserProgress({
    userId,
    userLives: newLives,
  });
};

/**
 * Resets user lives to 3 (full regeneration)
 */
export const regenerateUserLives = async (
  userId: string
): Promise<UserProgress> => {
  return updateUserProgress({
    userId,
    userLives: 3,
  });
};

/**
 * Resets user exploration progress to 0
 */
export const resetUserExplorationProgress = async (
  userId: string
): Promise<UserProgress> => {
  return updateUserProgress({
    userId,
    explorationProgress: 0,
  });
};
