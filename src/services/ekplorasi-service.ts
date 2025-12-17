import {
  getExplorationLevels,
  getExplorationLevelById,
  getLearningModulesByExplorationId,
  getLearningModuleById,
  getAssessmentModulesWithOptions,
  ExplorationLevelWithAsset,
  LearningModuleWithAsset,
  AssessmentModuleWithAsset,
  AssessmentOptionWithAsset,
} from '@/repositories/ekplorasi-repository';
import {
  Question,
  FillInTheBlankQuestion,
  MultipleChoiceImageQuestion,
  QuestionOption,
} from '@/types';
import {
  getUserProgress,
  // 🔧 FIXED: Hapus updateUserProgress karena tidak dipakai
  UserProgress,
} from '@/repositories/users-progress-repository';
import {
  getAllTestScores,
  ExplorationTestScore,
} from '@/repositories/test-scores-repository';
import {
  getAllLevelProgress,
  getLevelProgress,
  updateLevelProgress,
  // 🔧 FIXED: Hapus getCurrentStepForLevel karena tidak dipakai
  UserLevelProgress,
} from '@/repositories/user-level-progress-repository';

export interface ProcessedExplorationLevel {
  id: string;
  levelNumber: number;
  title: string;
  description: string;
  imgUrl: string;
  status: 'locked' | 'unlocked' | 'completed';
  learningProgress: number;
  currentStep?: number;
  totalSteps?: number;
  isLearningComplete?: boolean;
  testScore?: number;
  testPassed?: boolean;
  attemptNumber?: number;
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

// 🔧 FIXED: Gunakan progress PER LEVEL dari table baru
const processLevelsWithProgress = (
  levels: (ExplorationLevelWithAsset & { totalModules: number })[],
  userProgress: UserProgress | undefined,
  testScores: ExplorationTestScore[],
  levelProgressList: UserLevelProgress[] // ✨ Progress per level
): ProcessedExplorationLevel[] => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const currentLevel = userProgress?.exploration_level || 1;

  // Map scores by level number
  const scoresMap = new Map<number, ExplorationTestScore>();
  for (const score of testScores) {
    scoresMap.set(score.level_number, score);
  }

  // ✅ CRITICAL FIX: Map progress by level number dari table baru
  const progressMap = new Map<number, UserLevelProgress>();
  for (const progress of levelProgressList) {
    progressMap.set(progress.level_number, progress);
  }

  // Cari level tertinggi yang lulus
  const highestPassedLevel = Math.max(
    0,
    ...testScores.filter(s => s.passed).map(s => s.level_number)
  );

  return levels.map(level => {
    const levelScore = scoresMap.get(level.levels);
    const levelProgress = progressMap.get(level.levels); // ✅ Ambil progress LEVEL INI dari table baru

    let status: 'locked' | 'unlocked' | 'completed' = 'locked';
    let learningProgress = 0;
    let isLearningComplete = false;

    // Unlock logic
    if (level.levels === 1) {
      status = 'unlocked';
    } else if (level.levels <= highestPassedLevel + 1) {
      status = 'unlocked';
    }

    // Completed: Jika sudah lulus tes
    if (levelScore && levelScore.passed) {
      status = 'completed';
      learningProgress = 100;
      isLearningComplete = true;
    }
    // ✅ CRITICAL FIX: In Progress - Ambil dari levelProgress (table baru)
    else if (status === 'unlocked' && levelProgress && level.totalModules > 0) {
      // ✅ progress_step is 0-based, need to add 1 for display
      const currentStepDisplay = levelProgress.progress_step + 1;

      // Calculate percentage: (currentStep / totalSteps) * 100
      learningProgress = Math.min(
        100,
        Math.round((currentStepDisplay / level.totalModules) * 100)
      );

      // ✅ FIX: Learning complete when reached last step
      // progress_step = 25 (last index) → display = 26 → complete when 26 >= 26
      isLearningComplete = currentStepDisplay >= level.totalModules;
    }

    return {
      id: level.exploration_id,
      levelNumber: level.levels,
      title: `Level ${level.levels}`,
      description: level.title,
      imgUrl: level.thumbnail_url || '/images/placeholder-materi.png',
      status,
      learningProgress,
      currentStep: levelProgress ? levelProgress.progress_step + 1 : 0, // ✅ Display as 1-based
      totalSteps: level.totalModules,
      isLearningComplete,
      testScore: levelScore?.score,
      testPassed: levelScore?.passed,
      attemptNumber: levelScore?.attempt_number,
    };
  });
};

export const getExplorationLevelsWithProgress = async (
  userId: string
): Promise<ExplorationLevelsResult> => {
  try {
    const [levels, userProgressRaw, testScores, levelProgressList] =
      await Promise.all([
        getExplorationLevels(),
        getUserProgress(userId),
        getAllTestScores(userId),
        getAllLevelProgress(userId), // ✨ Ambil progress dari table baru
      ]);

    // ✅ FIX: Convert null to undefined for TypeScript
    const userProgress = userProgressRaw ?? undefined;

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
          return {
            ...level,
            totalModules: 0,
          };
        }
      })
    );

    const processedLevels = processLevelsWithProgress(
      levelsWithModuleCounts,
      userProgress,
      testScores,
      levelProgressList // ✨ Pass progress per level
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

const processLearningModules = (
  modules: LearningModuleWithAsset[]
): ProcessedLearningModule[] => {
  return modules.map(module => ({
    id: module.learning_module_id,
    title: module.title,
    description: module.description || '',
    imageUrl: module.image_url || '/images/materi/placeholder.png',
    exampleSentence: module.description,
  }));
};

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

// 📈 FIXED: Update progress LEVEL TERTENTU, tidak global
// CRITICAL: currentStep is 0-based index (0-25 for 26 items)
export const updateUserExplorationProgress = async (
  userId: string,
  levelNumber: number, // ✨ Level number
  currentStep: number // ✅ 0-based index from MateriPage
): Promise<UserLevelProgress> => {
  try {
    // ✅ Save progress as 0-based index
    // Repository will handle the display conversion
    const updatedProgress = await updateLevelProgress(
      userId,
      levelNumber,
      currentStep // ✅ Pass 0-based index directly
    );

    return updatedProgress;
  } catch (error) {
    console.error('Error updating user exploration progress:', error);
    throw new Error('Failed to update exploration progress');
  }
};

// 🔧 FIXED: Get current step untuk LEVEL TERTENTU
// Returns 0-based index for MateriPage
export const getUserCurrentStep = async (
  userId: string,
  levelNumber: number, // ✨ NEW: Tambah parameter level number
  totalSteps: number
): Promise<number> => {
  try {
    const progress = await getLevelProgress(userId, levelNumber);

    if (!progress) return 0; // Start from beginning

    // ✅ progress_step is already 0-based, return as-is
    // Ensure it doesn't exceed array bounds
    return Math.max(0, Math.min(progress.progress_step, totalSteps - 1));
  } catch (error) {
    console.error('Error getting current step:', error);
    return 0;
  }
};

const processAssessmentModules = (
  modules: (AssessmentModuleWithAsset & {
    options: AssessmentOptionWithAsset[];
  })[],
  levelId: number
): Question[] => {
  return modules.map((module, index) => {
    const baseQuestion = {
      id: module.assessment_id,
      questionAsset:
        module.question_image_url || '/images/placeholder-question.png',
      questionText: module.question,
      levelId,
      order: index + 1,
    };

    if (module.question_type === 'fill in the blank') {
      const correctOption = module.options.find(option => option.is_correct);
      const fillInTheBlankQuestion: FillInTheBlankQuestion = {
        ...baseQuestion,
        mode: 'fill-in-the-blank',
        correctAnswer: correctOption?.text || '',
      };
      return fillInTheBlankQuestion;
    } else {
      const processedOptions: QuestionOption[] = module.options.map(option => ({
        id: option.option_id,
        asset: option.image_url || '/images/placeholder-option.png',
        label: option.text || undefined,
      }));

      const correctOption = module.options.find(option => option.is_correct);
      const multipleChoiceQuestion: MultipleChoiceImageQuestion = {
        ...baseQuestion,
        mode: 'multiple-choice-image',
        options: processedOptions,
        correctAnswerId: correctOption?.option_id || '',
      };
      return multipleChoiceQuestion;
    }
  });
};

export const getAssessmentQuestionsForExploration = async (
  explorationId: string,
  levelId: number
): Promise<Question[]> => {
  try {
    const modulesWithOptions =
      await getAssessmentModulesWithOptions(explorationId);
    return processAssessmentModules(modulesWithOptions, levelId);
  } catch (error) {
    console.error('Error fetching assessment questions:', error);
    throw new Error('Failed to load assessment questions');
  }
};
