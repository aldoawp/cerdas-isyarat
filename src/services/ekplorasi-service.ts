import {
  getExplorationLevels,
  getExplorationLevelById,
  getLearningModulesByExplorationId,
  getLearningModuleById,
  ExplorationLevelWithAsset,
  LearningModuleWithAsset,
} from '@/repositories/ekplorasi-repository';
import {
  getUserProgress,
  updateUserProgress,
  UserProgress,
} from '@/repositories/users-progress-repository';

export interface ProcessedExplorationLevel {
  id: string;
  levelNumber: number;
  title: string;
  description: string;
  imgUrl: string;
  status: 'locked' | 'unlocked' | 'completed';
  learningProgress: number; // This will be percentage for completed levels, step number for current level
  currentStep?: number; // Current step number for the current level
  totalSteps?: number; // Total number of learning modules in this level
  isLearningComplete?: boolean; // Whether all learning modules are completed
}

export interface ProcessedLearningModule {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  exampleSentence?: string;
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
  levels: (ExplorationLevelWithAsset & { totalModules: number })[],
  userProgress: UserProgress | undefined
): ProcessedExplorationLevel[] => {
  const currentLevel = userProgress?.exploration_level || 1;
  const currentStep = userProgress?.exploration_progress || 0;

  return levels.map(level => {
    let status: 'locked' | 'unlocked' | 'completed' = 'locked';
    let learningProgress = 0;
    let isLearningComplete = false;

    if (level.levels < currentLevel) {
      // Previous levels are completed
      status = 'completed';
      learningProgress = 100;
      isLearningComplete = true;
    } else if (level.levels === currentLevel) {
      // Only the current level is unlocked with current step from backend
      status = 'unlocked';
      learningProgress = currentStep; // This is now the step number (1, 2, 3, etc.)
      // Check if user has completed all learning modules
      isLearningComplete =
        currentStep >= level.totalModules && level.totalModules > 0;
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
      currentStep: level.levels === currentLevel ? currentStep : undefined,
      totalSteps: level.totalModules,
      isLearningComplete,
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

    // For each level, fetch the total number of learning modules
    const levelsWithModuleCounts = await Promise.all(
      levels.map(async level => {
        try {
          const modules = await getLearningModulesByExplorationId(
            level.exploration_id
          );
          return {
            ...level,
            totalModules: modules.length,
          };
        } catch {
          // If we can't fetch modules, assume 0 modules
          return {
            ...level,
            totalModules: 0,
          };
        }
      })
    );

    const processedLevels = processLevelsWithProgress(
      levelsWithModuleCounts,
      userProgress
    );

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

/**
 * Processes learning modules from database format to UI format
 * @param modules - Raw learning modules from database
 * @returns ProcessedLearningModule[] - Processed modules for UI display
 */
const processLearningModules = (
  modules: LearningModuleWithAsset[]
): ProcessedLearningModule[] => {
  return modules.map(module => ({
    id: module.learning_module_id,
    title: module.title,
    description: module.description || '',
    imageUrl: module.image_url || '/images/materi/placeholder.png',
    exampleSentence: module.description, // Using description as example sentence for now
  }));
};

/**
 * Fetches learning modules for a specific exploration level
 * @param explorationId - The exploration ID to fetch modules for
 * @returns Promise<ProcessedLearningModule[]> - Processed learning modules
 */
export const getLearningModulesForExploration = async (
  explorationId: string
): Promise<ProcessedLearningModule[]> => {
  try {
    const modules = await getLearningModulesByExplorationId(explorationId);
    return processLearningModules(modules);
  } catch (error) {
    console.error('Error fetching learning modules:', error);
    throw new Error('Failed to load learning modules');
  }
};

/**
 * Fetches a single learning module by ID
 * @param moduleId - The learning module ID to fetch
 * @returns Promise<ProcessedLearningModule | undefined> - The processed learning module or undefined if not found
 */
export const getLearningModule = async (
  moduleId: string
): Promise<ProcessedLearningModule | undefined> => {
  try {
    const learningModule = await getLearningModuleById(moduleId);
    if (!learningModule) return undefined;

    const processedModules = processLearningModules([learningModule]);
    return processedModules[0];
  } catch (error) {
    console.error('Error fetching learning module:', error);
    throw new Error('Failed to load learning module');
  }
};

/**
 * Updates user's exploration progress in the database
 * @param userId - The user ID
 * @param currentStep - The current step in the learning modules (0-based index)
 * @param totalSteps - Total number of steps in the current level
 * @returns Promise<UserProgress> - Updated user progress
 */
export const updateUserExplorationProgress = async (
  userId: string,
  currentStep: number,
  _totalSteps: number
): Promise<UserProgress> => {
  try {
    // Store the actual step number (1-based) instead of percentage
    const stepNumber = currentStep + 1; // Convert 0-based to 1-based

    // Update ONLY the exploration progress, NOT the exploration level
    const updatedProgress = await updateUserProgress({
      userId,
      explorationProgress: stepNumber,
    });

    return updatedProgress;
  } catch (error) {
    console.error('Error updating user exploration progress:', error);
    throw new Error('Failed to update exploration progress');
  }
};

/**
 * Gets user's current step in learning modules based on exploration progress
 * @param userId - The user ID
 * @param totalSteps - Total number of steps in the current level
 * @returns Promise<number> - Current step index (0-based)
 */
export const getUserCurrentStep = async (
  userId: string,
  totalSteps: number
): Promise<number> => {
  try {
    const userProgress = await getUserProgress(userId);
    if (!userProgress) return 0;

    // Get current step number directly from exploration_progress
    const stepNumber = userProgress.exploration_progress;
    const currentStep = stepNumber - 1; // Convert 1-based to 0-based

    // Ensure step is within bounds
    return Math.max(0, Math.min(currentStep, totalSteps - 1));
  } catch (error) {
    console.error('Error getting user current step:', error);
    return 0; // Default to first step on error
  }
};

/**
 * Completes the current exploration level and moves to the next level
 * @param userId - The user ID
 * @param currentLevel - The level that was just completed
 * @returns Promise<UserProgress> - Updated user progress
 */
export const completeExplorationLevel = async (
  userId: string,
  currentLevel: number
): Promise<UserProgress> => {
  try {
    // Move to next level and reset progress
    const nextLevel = currentLevel + 1;
    const updatedProgress = await updateUserProgress({
      userId,
      explorationLevel: nextLevel,
      explorationProgress: 0, // Reset progress for new level
    });

    return updatedProgress;
  } catch (error) {
    console.error('Error completing exploration level:', error);
    throw new Error('Failed to complete exploration level');
  }
};
