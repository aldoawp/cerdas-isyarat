// Game/Eksplorasi domain types

export interface Movement {
  id: number;
  name: string;
  imageUrl: string;
  description?: string;
}

export interface MateriItem {
  id: string;
  name: string;
  imageUrl: string;
  exampleSentence: string;
  levelId: number;
  order: number;
}

export type QuestionMode = 'fill-in-the-blank' | 'multiple-choice-image';

export interface BaseQuestion {
  id: number;
  mode: QuestionMode;
  questionAsset: string;
  levelId: number;
  order: number;
}

export interface FillInTheBlankQuestion extends BaseQuestion {
  mode: 'fill-in-the-blank';
  correctAnswer: string;
  hint?: string;
}

export interface MultipleChoiceImageQuestion extends BaseQuestion {
  mode: 'multiple-choice-image';
  options: QuestionOption[];
  correctAnswerId: string;
}

export interface QuestionOption {
  id: string;
  asset: string;
  label?: string;
}

export type Question = FillInTheBlankQuestion | MultipleChoiceImageQuestion;

export interface TestSession {
  id: string;
  levelId: number;
  userId: string;
  currentQuestionIndex: number;
  answers: Record<number, string>;
  startTime: number;
  endTime?: number;
  score?: number;
  isCompleted: boolean;
}

export interface TestResult {
  sessionId: string;
  levelId: number;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  completedAt: string;
}

export interface Level {
  id: number;
  name: string;
  description: string;
  thumbnail: string;
  order: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  progress: number;
}
