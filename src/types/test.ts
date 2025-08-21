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
