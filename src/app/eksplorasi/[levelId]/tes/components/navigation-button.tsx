'use client';

import clsx from 'clsx';

export const NavigationButtons = ({
  isFirstQuestion,
  isLastQuestion,
  onPrevious,
  onNext,
  onSubmit,
  hasAnswer,
}: {
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  hasAnswer: boolean;
}) => (
  <div className="flex w-full justify-center gap-4">
    <button
      onClick={onPrevious}
      disabled={isFirstQuestion}
      className={clsx(
        'flex max-w-xs flex-1 items-center justify-center gap-2 rounded-2xl border-4 border-brand-brown-stroke py-4 text-xl font-bold shadow-lg drop-shadow-comic-sm transition-all',
        isFirstQuestion
          ? 'cursor-not-allowed border-gray-400 bg-gray-300 text-gray-500'
          : 'bg-white text-brand-brown-stroke hover:scale-105'
      )}
    >
      <span className="text-2xl">👈</span>
      <span>Kembali</span>
    </button>
    {isLastQuestion ? (
      <button
        onClick={onSubmit}
        className="flex max-w-xs flex-1 animate-pulse items-center justify-center gap-2 rounded-2xl bg-icon-green-bg py-4 text-xl font-bold text-white shadow-lg drop-shadow-comic-sm transition-all hover:scale-105"
      >
        <span className="text-2xl">🎯</span>
        <span>Selesai!</span>
      </button>
    ) : (
      <button
        onClick={onNext}
        disabled={!hasAnswer}
        className={clsx(
          'flex max-w-xs flex-1 items-center justify-center gap-2 rounded-2xl py-4 text-xl font-bold shadow-lg drop-shadow-comic-sm transition-all',
          hasAnswer
            ? 'bg-brand-yellow text-brand-brown-stroke hover:scale-105'
            : 'cursor-not-allowed bg-gray-300 text-gray-500'
        )}
      >
        <span>Lanjut</span>
        <span className="text-2xl">👉</span>
      </button>
    )}
  </div>
);
