import { createClient } from '@/lib/supabase/client';
import {
  getUserProgress,
  createUserProgress,
  updateUserProgress,
  upsertUserProgress,
  decreaseUserLives,
  regenerateUserLives,
  resetUserExplorationProgress,
  type UserProgress,
} from '@/repositories/users-progress-repository';
import { getLearningModulesByExplorationId } from '@/repositories/ekplorasi-repository';

export interface UserProgressData {
  explorationLevel: number;
  explorationProgress: number;
  guessingChallengeScore: number;
  xp: number;
  lives: number;
}

export interface UserProfileData {
  fullName: string;
  avatar?: string;
  lives?: number;
}

// --- MAIN LOGIC FIX ---

// Helper function to calculate percentage
export const calculateUserProgress = (
  dbProgress: UserProgress | undefined,
  totalSteps: number
): UserProgressData => {
  if (!dbProgress) {
    return {
      explorationLevel: 1,
      explorationProgress: 0,
      guessingChallengeScore: 0,
      xp: 0,
      lives: 3,
    };
  }

  // DYNAMIC FORMULA: (User Step / Real DB Total Steps) * 100
  let calculatedXp = 0;
  if (totalSteps > 0) {
    calculatedXp = Math.round(
      (dbProgress.exploration_progress / totalSteps) * 100
    );
  }

  // Safety net to prevent overflow > 100%
  if (calculatedXp > 100) calculatedXp = 100;
  if (calculatedXp < 0) calculatedXp = 0;

  return {
    explorationLevel: dbProgress.exploration_level,
    explorationProgress: dbProgress.exploration_progress,
    guessingChallengeScore: dbProgress.guessing_challenge_score,
    xp: calculatedXp,
    lives: dbProgress.user_lives,
  };
};

// [CRITICAL FIX] Fetch total steps dynamically using existing repository function
export const getUserProgressData = async (
  userId: string
): Promise<UserProgressData> => {
  const dbProgress = await getUserProgress(userId);

  // Default to 0 to prevent division issues
  let currentLevelTotalSteps = 0;

  if (dbProgress) {
    try {
      const supabase = createClient();

      // Get the exploration_id for the user's current level
      const { data: explorationData } = await supabase
        .from('exploration')
        .select('exploration_id')
        .eq('levels', dbProgress.exploration_level)
        .single();

      if (explorationData?.exploration_id) {
        // Use the existing repository function to get learning modules
        const modules = await getLearningModulesByExplorationId(
          explorationData.exploration_id
        );
        currentLevelTotalSteps = modules.length;
      }
    } catch (error) {
      console.error('Failed to fetch dynamic total steps:', error);
      // If we can't fetch, default to the current progress to avoid breaking
      currentLevelTotalSteps = dbProgress.exploration_progress || 1;
    }
  }

  // Ensure we have a valid totalSteps to prevent division by zero
  if (currentLevelTotalSteps === 0) {
    currentLevelTotalSteps = dbProgress?.exploration_progress || 1;
  }

  // Pass the real totalSteps to the calculation
  return calculateUserProgress(dbProgress, currentLevelTotalSteps);
};

export const initializeUserProgress = async (
  userId: string
): Promise<UserProgress> => {
  return createUserProgress({
    userId,
    explorationLevel: 1,
    explorationProgress: 0,
    guessingChallengeScore: 0,
  });
};

export const updateUserExplorationProgress = async (
  userId: string,
  newLevel: number,
  newStep: number
): Promise<UserProgress> => {
  const currentProgress = await getUserProgress(userId);

  if (!currentProgress) {
    return createUserProgress({
      userId,
      explorationLevel: newLevel,
      explorationProgress: newStep,
      guessingChallengeScore: 0,
    });
  }

  return updateUserProgress({
    userId,
    explorationLevel: newLevel,
    explorationProgress: newStep,
  });
};

export const updateUserGuessingChallengeScore = async (
  userId: string,
  score: number
): Promise<UserProgress> => {
  return upsertUserProgress({
    userId,
    guessingChallengeScore: score,
  });
};

export const refillUserLives = async (
  userId: string
): Promise<UserProgress> => {
  return regenerateUserLives(userId);
};

export const completeLevel = async (
  userId: string,
  levelId: number
): Promise<UserProgress> => {
  const nextLevel = levelId + 1;
  return updateUserProgress({
    userId,
    explorationLevel: nextLevel,
    explorationProgress: 0,
    userLives: 3,
  });
};

export const updateUserStep = async (
  userId: string,
  level: number,
  step: number
): Promise<UserProgress> => {
  return updateUserExplorationProgress(userId, level, step);
};

export const decreaseUserLivesWithProgressReset = async (
  userId: string
): Promise<{ updatedProgress: UserProgress; shouldResetProgress: boolean }> => {
  const updatedProgress = await decreaseUserLives(userId);

  if (updatedProgress.user_lives === 0) {
    const resetProgress = await resetUserExplorationProgress(userId);
    return { updatedProgress: resetProgress, shouldResetProgress: true };
  }

  return { updatedProgress, shouldResetProgress: false };
};
