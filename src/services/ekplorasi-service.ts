import {
  getExplorationLevels,
  getExplorationLevelById,
  ExplorationLevelWithAsset,
} from '@/repositories/ekplorasi-repository';
import {
  getUserProgress,
  UserProgress,
} from '@/repositories/users-progress-repository';

export interface ProcessedExplorationLevel {
  id: string;
  levelNumber: number;
  title: string;
  description: string;
  imgUrl: string;
  status: 'locked' | 'unlocked' | 'completed';
  learningProgress: number;
}

export interface ExplorationLevelsResult {
  levels: ProcessedExplorationLevel[];
  userProgress: UserProgress | undefined;
}

/**
 * Processes exploration levels with user progress to determine status and learning progress
 * @param levels - Raw exploration levels from database
 * @param userProgress - User's current progress
 * @returns ProcessedExplorationLevel[] - Levels with status and progress information
 */
const processLevelsWithProgress = (
  levels: ExplorationLevelWithAsset[],
  userProgress: UserProgress | undefined
): ProcessedExplorationLevel[] => {
  const currentLevel = userProgress?.exploration_level || 1;
  const currentProgress = userProgress?.exploration_progress || 0;

  return levels.map(level => {
    let status: 'locked' | 'unlocked' | 'completed' = 'locked';
    let learningProgress = 0;

    if (level.levels < currentLevel) {
      // Previous levels are completed
      status = 'completed';
      learningProgress = 100;
    } else if (level.levels === currentLevel) {
      // Only the current level is unlocked with current progress
      status = 'unlocked';
      learningProgress = currentProgress;
    }
    // All other levels (including next levels) remain locked

    return {
      id: level.exploration_id,
      levelNumber: level.levels,
      title: `Level ${level.levels}`, // Level number as title
      description: level.title, // Original title as description
      imgUrl: level.thumbnail_url || '/images/placeholder-materi.png',
      status,
      learningProgress,
    };
  });
};

/**
 * Fetches all exploration levels with user progress information
 * @param userId - The user ID to get progress for
 * @returns Promise<ExplorationLevelsResult> - Levels with user progress
 */
export const getExplorationLevelsWithProgress = async (
  userId: string
): Promise<ExplorationLevelsResult> => {
  try {
    // Fetch exploration levels and user progress in parallel
    const [levels, userProgress] = await Promise.all([
      getExplorationLevels(),
      getUserProgress(userId),
    ]);

    const processedLevels = processLevelsWithProgress(levels, userProgress);

    return {
      levels: processedLevels,
      userProgress,
    };
  } catch (error) {
    console.error('Error fetching exploration levels with progress:', error);
    throw new Error('Failed to load exploration levels');
  }
};

/**
 * Fetches a single exploration level by ID
 * @param explorationId - The exploration ID to fetch
 * @returns Promise<ExplorationLevelWithAsset | undefined> - The exploration level or undefined if not found
 */
export const getExplorationLevel = async (
  explorationId: string
): Promise<ExplorationLevelWithAsset | undefined> => {
  try {
    return await getExplorationLevelById(explorationId);
  } catch (error) {
    console.error('Error fetching exploration level:', error);
    throw new Error('Failed to load exploration level');
  }
};
