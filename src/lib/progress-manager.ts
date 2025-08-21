'use client';

// Tipe data ini bisa Anda pindah ke file types.ts jika mau
interface LevelProgress {
  progress: number;
  lastIndex: number;
}
export interface UserProgress {
  completedLevelIds: number[];
  learningProgress: { [levelId: number]: LevelProgress };
}

const PROGRESS_KEY = 'userBisindoProgress';

/**
 * Mengambil data progress dari localStorage.
 */
export const getProgress = (): UserProgress => {
  if (globalThis.window === undefined) {
    return { completedLevelIds: [], learningProgress: {} };
  }
  try {
    const saved = localStorage.getItem(PROGRESS_KEY);
    return saved
      ? JSON.parse(saved)
      : { completedLevelIds: [], learningProgress: {} };
  } catch {
    return { completedLevelIds: [], learningProgress: {} };
  }
};

/**
 * Menyimpan data progress ke localStorage.
 */
const saveProgress = (progress: UserProgress) => {
  if (globalThis.window !== undefined) {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  }
};

/**
 * Mengupdate progres belajar (materi) saat pengguna lanjut/kembali.
 */
export const updateLearningProgress = (
  levelId: number,
  currentIndex: number,
  totalItems: number
) => {
  const currentProgress = getProgress();
  const newPercentage = Math.round(((currentIndex + 1) / totalItems) * 100);
  currentProgress.learningProgress[levelId] = {
    progress: newPercentage,
    lastIndex: currentIndex,
  };
  saveProgress(currentProgress);
};

/**
 * [FIX] Mereset progres belajar (materi) untuk level tertentu.
 * Ini akan membuat pengguna mulai belajar dari materi pertama lagi.
 */
export const resetLevelProgress = (levelId: number) => {
  if (globalThis.window === undefined) return;

  const currentProgress = getProgress();

  if (currentProgress.learningProgress[levelId]) {
    delete currentProgress.learningProgress[levelId];
    saveProgress(currentProgress);
    console.log(`Progres materi untuk Level ${levelId} telah direset.`);
  }
};
