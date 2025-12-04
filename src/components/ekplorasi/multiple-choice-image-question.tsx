'use client';

import { useState } from 'react';
import clsx from 'clsx';
import Image from 'next/image';
import { QuestionDisplay } from './question-displays';
import { MultipleChoiceImageQuestion } from '@/types';

const OptionCard = ({
  option,
  index,
  isSelected,
  onSelect,
}: {
  option: { id: string; asset: string; label?: string };
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const hasImage =
    option.asset && option.asset !== '/images/placeholder-option.png';

  return (
    <button
      onClick={onSelect}
      className={clsx(
        'group relative transform rounded-xl p-3 transition-all duration-300',
        isSelected
          ? 'scale-105 border-4 border-icon-green-bg bg-subtitle-cream shadow-xl'
          : 'border-2 border-input-border bg-white shadow-lg hover:scale-105 hover:border-brand-yellow'
      )}
    >
      {/* Label Badge */}
      <div
        className={clsx(
          'absolute -left-2 -top-2 z-10 flex size-8 items-center justify-center rounded-full border-2 text-sm font-bold transition-all',
          isSelected
            ? 'border-green-600 bg-icon-green-bg text-white'
            : 'border-brand-brown-stroke bg-brand-yellow text-brand-brown-stroke'
        )}
      >
        {String.fromCodePoint(65 + index)}
      </div>

      {hasImage ? (
        <div className="relative overflow-hidden rounded-lg bg-gray-100">
          {/* Loading Skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-24 w-full animate-pulse bg-gray-200 md:h-32" />
              <div className="absolute">
                <svg
                  className="size-8 animate-spin text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
            </div>
          )}

          {/* Actual Image */}
          <Image
            src={option.asset}
            alt={`Pilihan ${String.fromCodePoint(65 + index)}`}
            width={200}
            height={200}
            className={clsx(
              'h-24 w-full object-cover transition-all duration-300 md:h-32',
              imageLoaded ? 'opacity-100 group-hover:scale-110' : 'opacity-0'
            )}
            onLoad={() => setImageLoaded(true)}
            loading="eager"
            quality={85}
          />
        </div>
      ) : (
        <div className="flex h-24 items-center justify-center rounded-lg bg-gray-100 md:h-32">
          <span className="px-2 text-center text-base font-semibold text-brand-brown-stroke">
            {option.label || `Pilihan ${String.fromCodePoint(65 + index)}`}
          </span>
        </div>
      )}

      {/* Checkmark Overlay */}
      {isSelected && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-icon-green-bg/20">
          <div className="rounded-full bg-icon-green-bg p-2 shadow-lg">
            <svg
              className="size-6 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      )}
    </button>
  );
};

export const MultipleChoiceImageMode = ({
  question,
  savedAnswer,
  onAnswerChange,
}: {
  question: MultipleChoiceImageQuestion;
  savedAnswer: string;
  onAnswerChange: (answerId: string) => void;
}) => {
  const optionCount = question.options.length;

  // Dynamic grid layout based on option count
  const getGridClass = () => {
    if (optionCount === 2) return 'grid-cols-2 max-w-xl mx-auto';
    if (optionCount === 3) return 'grid-cols-3 max-w-2xl mx-auto';
    return 'grid-cols-2 md:grid-cols-4 max-w-4xl mx-auto';
  };

  return (
    <div className="space-y-4">
      <QuestionDisplay
        questionAsset={question.questionAsset}
        questionText={question.questionText}
      />

      <div className={clsx('grid gap-4', getGridClass())}>
        {question.options.map((option, index) => (
          <OptionCard
            key={option.id}
            option={option}
            index={index}
            isSelected={savedAnswer === option.id}
            onSelect={() => onAnswerChange(option.id)}
          />
        ))}
      </div>
    </div>
  );
};
