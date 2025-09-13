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

export interface UserProgressData {
  explorationLevel: number;
  explorationProgress: number;
  guessingChallengeScore: number;
  xp: number; // Calculated from exploration_progress
  lives: number; // Can be derived from exploration_progress or separate field
}

export interface UserProfileData {
  fullName: string;
  avatar?: string;
  lives?: number;
}

// Business logic for calculating user progress
export const calculateUserProgress = (
  dbProgress: UserProgress | undefined
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

  // XP is calculated based on exploration_progress
  // If user is at level 3 out of 5 total levels, XP = (3/5) * 100 = 60
  const totalLevels = 5; // Assuming 5 total levels in exploration
  const xp = Math.round((dbProgress.exploration_progress / totalLevels) * 100);

  // Use actual lives from database
  const lives = dbProgress.user_lives;

  return {
    explorationLevel: dbProgress.exploration_level,
    explorationProgress: dbProgress.exploration_progress,
    guessingChallengeScore: dbProgress.guessing_challenge_score,
    xp,
    lives,
  };
};

export const getUserProgressData = async (
  userId: string
): Promise<UserProgressData> => {
  const dbProgress = await getUserProgress(userId);
  return calculateUserProgress(dbProgress);
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
    // Initialize progress if it doesn't exist
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
  // Move user to the next level, step 0 and regenerate lives to full
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
  // Update user's current step within a level
  return updateUserExplorationProgress(userId, level, step);
};

/**
 * Decreases user lives and handles progress reset if lives reach zero
 * @param userId - The user ID
 * @returns Promise<{ updatedProgress: UserProgress; shouldResetProgress: boolean }>
 */
export const decreaseUserLivesWithProgressReset = async (
  userId: string
): Promise<{ updatedProgress: UserProgress; shouldResetProgress: boolean }> => {
  const updatedProgress = await decreaseUserLives(userId);

  // If lives reach zero, reset exploration progress
  if (updatedProgress.user_lives === 0) {
    const resetProgress = await resetUserExplorationProgress(userId);
    return { updatedProgress: resetProgress, shouldResetProgress: true };
  }

  return { updatedProgress, shouldResetProgress: false };
};
