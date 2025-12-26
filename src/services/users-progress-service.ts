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
import { resetLevelProgress } from '@/repositories/user-level-progress-repository';

export interface UserProgressData {
  explorationLevel: number;
  explorationProgress: number; // ⚠️ DEPRECATED: Gunakan user_exploration_level_progress table
  guessingChallengeScore: number;
  xp: number;
  lives: number;
}

export interface UserProfileData {
  fullName: string;
  avatar?: string;
  lives?: number;
}

/**
 * ✅ SIMPLIFIED: Get user progress data from database
 * XP sekarang disimpan langsung di database, tidak perlu calculate
 */
export const getUserProgressData = async (
  userId: string
): Promise<UserProgressData> => {
  const dbProgress = await getUserProgress(userId);

  if (!dbProgress) {
    // Create default progress if not exists
    const newProgress = await createUserProgress({
      userId,
      explorationLevel: 1,
      explorationProgress: 0,
      guessingChallengeScore: 0,
      xp: 0,
    });

    return {
      explorationLevel: newProgress.exploration_level,
      explorationProgress: newProgress.exploration_progress,
      guessingChallengeScore: newProgress.guessing_challenge_score,
      xp: newProgress.xp,
      lives: newProgress.user_lives,
    };
  }

  return {
    explorationLevel: dbProgress.exploration_level,
    explorationProgress: dbProgress.exploration_progress,
    guessingChallengeScore: dbProgress.guessing_challenge_score,
    xp: dbProgress.xp || 0, // ✅ XP dari database
    lives: dbProgress.user_lives,
  };
};

/**
 * Initialize user progress (for new users)
 */
export const initializeUserProgress = async (
  userId: string
): Promise<UserProgress> => {
  return createUserProgress({
    userId,
    explorationLevel: 1,
    explorationProgress: 0,
    guessingChallengeScore: 0,
    xp: 0,
  });
};

/**
 * ⚠️ DEPRECATED: Use updateUserProgress() with specific fields
 */
export const updateUserExplorationProgress = async (
  userId: string,
  newLevel: number,
  newStep: number
): Promise<UserProgress> => {
  return updateUserProgress({
    userId,
    explorationLevel: newLevel,
    explorationProgress: newStep,
  });
};

/**
 * Update guessing challenge score
 */
export const updateUserGuessingChallengeScore = async (
  userId: string,
  score: number
): Promise<UserProgress> => {
  return upsertUserProgress({
    userId,
    guessingChallengeScore: score,
  });
};

/**
 * Refill user lives to 3
 */
export const refillUserLives = async (
  userId: string
): Promise<UserProgress> => {
  console.log('💖 Refilling lives to 3...');
  return regenerateUserLives(userId);
};

/**
 * ✅ Complete level: Unlock next level + refill lives + reset XP
 */
export const completeLevel = async (
  userId: string,
  currentLevelId: number
): Promise<UserProgress> => {
  const nextLevel = currentLevelId + 1;

  console.log(
    `✅ Completing Level ${currentLevelId}, unlocking Level ${nextLevel}`
  );

  return updateUserProgress({
    userId,
    explorationLevel: nextLevel,
    explorationProgress: 0,
    userLives: 3,
    xp: 0, // ✅ Reset XP untuk level baru
  });
};

/**
 * ⚠️ DEPRECATED: Use updateLevelProgress() from user-level-progress-repository
 */
export const updateUserStep = async (
  userId: string,
  level: number,
  step: number
): Promise<UserProgress> => {
  console.warn(
    `⚠️ updateUserStep(${level}, ${step}) is deprecated. Use updateLevelProgress() from user-level-progress-repository instead.`
  );
  return updateUserExplorationProgress(userId, level, step);
};

/**
 * ✅ FIXED: Decrease user lives with progress reset if lives = 0
 * - Reset XP to 0
 * - Reset current level progress to 0
 * - Keep exploration_level (don't demote)
 * - Trigger UI reload via custom event
 */
export const decreaseUserLivesWithProgressReset = async (
  userId: string
): Promise<{ updatedProgress: UserProgress; shouldResetProgress: boolean }> => {
  console.log('💔 Decreasing user lives...');

  const updatedProgress = await decreaseUserLives(userId);

  if (updatedProgress.user_lives === 0) {
    console.log('⚠️ Lives = 0, resetting XP and current level progress...');

    // 1. Reset XP ke 0
    const resetProgress = await resetUserExplorationProgress(userId);

    // 2. Reset progress level yang sedang aktif ke 0
    const currentLevel = resetProgress.exploration_level;
    await resetLevelProgress(userId, currentLevel);

    console.log(
      `🔄 Reset complete: XP = 0, Level ${currentLevel} progress = 0`
    );

    // 3. ✅ Trigger UI reload
    if (globalThis.window !== undefined) {
      globalThis.dispatchEvent(new CustomEvent('userStateChange'));
    }

    return { updatedProgress: resetProgress, shouldResetProgress: true };
  }

  return { updatedProgress, shouldResetProgress: false };
};
