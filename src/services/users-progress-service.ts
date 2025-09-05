import {
  getUserProgress,
  createUserProgress,
  updateUserProgress,
  upsertUserProgress,
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

  // Lives can be a simple system - for now, keep it at 3
  // This can be enhanced later with more complex logic
  const lives = 3;

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
  // For now, lives are always 3, so this function just returns current progress
  // This can be enhanced later with a separate lives tracking system
  const currentProgress = await getUserProgress(userId);

  if (!currentProgress) {
    return createUserProgress({
      userId,
      explorationLevel: 1,
      explorationProgress: 0,
      guessingChallengeScore: 0,
    });
  }

  // Return current progress unchanged since lives are always 3
  return currentProgress;
};

export const completeLevel = async (
  userId: string,
  levelId: number
): Promise<UserProgress> => {
  // Move user to the next level, step 0
  const nextLevel = levelId + 1;
  return updateUserExplorationProgress(userId, nextLevel, 0);
};

export const updateUserStep = async (
  userId: string,
  level: number,
  step: number
): Promise<UserProgress> => {
  // Update user's current step within a level
  return updateUserExplorationProgress(userId, level, step);
};
