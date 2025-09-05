import { createClient as createServerClient } from '@/lib/supabase/server';

export interface UserProgress {
  progress_id: string;
  user_id: string;
  exploration_level: number;
  exploration_progress: number;
  guessing_challenge_score: number;
  created_at: string;
  updated_at: string;
}

export interface CreateUserProgressParams {
  userId: string;
  explorationLevel?: number;
  explorationProgress?: number;
  guessingChallengeScore?: number;
}

/**
 * Creates a new user progress record in the database (server-side)
 * Used during user registration to initialize default progress values
 *
 * @param params - User progress creation parameters
 * @returns Promise<UserProgress> - The created user progress record
 */
export const createUserProgressServer = async (
  params: CreateUserProgressParams
): Promise<UserProgress> => {
  const supabase = await createServerClient();

  // Check if user progress already exists
  const { data: existingProgress } = await supabase
    .from('users_progress')
    .select('*')
    .eq('user_id', params.userId)
    .single();

  if (existingProgress) {
    // Return existing progress if it already exists
    return existingProgress;
  }

  // Create new user progress
  const { data, error } = await supabase
    .from('users_progress')
    .insert({
      user_id: params.userId,
      exploration_level: params.explorationLevel ?? 1,
      exploration_progress: params.explorationProgress ?? 0,
      guessing_challenge_score: params.guessingChallengeScore ?? 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};
