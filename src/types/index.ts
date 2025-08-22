// src/types/index.ts

// ... tipe data sebelumnya ...

// Struktur progress untuk satu level
export interface LevelProgress {
  progress: number; // Persentase (0-100)
  lastIndex: number; // Index materi terakhir yang dilihat
}

export interface UserProgress {
  completedLevelIds: number[];
  learningProgress: { [levelId: number]: LevelProgress }; // Diperbarui
}
