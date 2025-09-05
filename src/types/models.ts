export interface LevelProgress {
  progress: number; // Persentase (0-100)
  lastIndex: number; // Index materi terakhir yang dilihat
}

export interface UserProgress {
  completedLevelIds: number[];
  learningProgress: { [levelId: number]: LevelProgress }; // Diperbarui
}

export interface Movement {
  id: number;
  name: string;
  imageUrl: string;
}

export interface User {
  fullName: string;
  age: string;
  username: string;
  password: string;
}

export interface MateriItem {
  id: string;
  name: string;
  imageUrl: string;
  exampleSentence: string;
}

// Types for Ekplorasi Page

export type QuestionMode = 'fill-in-the-blank' | 'multiple-choice-image';

export interface BaseQuestion {
  id: number;
  mode: QuestionMode;
  questionAsset: string;
}

export interface FillInTheBlankQuestion extends BaseQuestion {
  mode: 'fill-in-the-blank';
  correctAnswer: string;
}

export interface MultipleChoiceImageQuestion extends BaseQuestion {
  mode: 'multiple-choice-image';
  options: { id: string; asset: string }[];
  correctAnswerId: string;
}

export type Question = FillInTheBlankQuestion | MultipleChoiceImageQuestion;

export interface TestState {
  levelId: number;
  currentQuestionIndex: number;
  answers: { [questionId: number]: string };
  startTime: number;
}
