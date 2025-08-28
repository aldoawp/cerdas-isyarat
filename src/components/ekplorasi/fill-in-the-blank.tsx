'use client';

import clsx from 'clsx';
import { QuestionDisplay } from './question-displays';
import { FillInTheBlankQuestion } from '@/types/models';

export const FillInTheBlankMode = ({
  question,
  savedAnswer,
  onAnswerChange,
}: {
  question: FillInTheBlankQuestion;
  savedAnswer: string;
  onAnswerChange: (answer: string) => void;
}) => {
  const answerLength = question.correctAnswer.length;
  const keyboardRows = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

  const handleKeyPress = (key: string) => {
    if (savedAnswer.length < answerLength) {
      onAnswerChange(savedAnswer + key);
    }
  };
  const handleDelete = () => onAnswerChange(savedAnswer.slice(0, -1));

  return (
    <div className="space-y-4">
      <QuestionDisplay questionAsset={question.questionAsset} />
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: answerLength }).map((_, i) => (
          <div
            key={i}
            className={clsx(
              'flex size-12 items-center justify-center rounded-xl border-4 text-2xl font-bold transition-all duration-300',
              savedAnswer[i]
                ? 'border-icon-green-bg bg-subtitle-cream text-brand-brown-stroke shadow-lg'
                : 'border-input-border bg-white text-gray-400'
            )}
          >
            {savedAnswer[i] || ''}
          </div>
        ))}
      </div>
      <div className="space-y-4">
        {keyboardRows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-3">
            {[...row].map(char => (
              <button
                key={char}
                onClick={() => handleKeyPress(char)}
                className="h-14 w-12 rounded-xl border-2 border-brand-brown-stroke bg-brand-yellow text-lg font-bold text-brand-brown-stroke shadow-lg transition-all hover:scale-105 hover:bg-brand-yellow/90 hover:shadow-xl active:scale-95"
              >
                {char}
              </button>
            ))}
          </div>
        ))}
        <div className="flex justify-center pt-3">
          <button
            onClick={handleDelete}
            className="rounded-2xl border-2 border-red-600 bg-icon-red-bg px-10 py-4 text-lg font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-red-500 hover:shadow-xl active:scale-95"
          >
            <span className="text-xl">✖️</span> HAPUS
          </button>
        </div>
      </div>
    </div>
  );
};
