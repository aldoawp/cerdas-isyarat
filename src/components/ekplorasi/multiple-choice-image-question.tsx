'use client';

import clsx from 'clsx';
import Image from 'next/image';
import { QuestionDisplay } from './question-displays';
import { MultipleChoiceImageQuestion } from '@/types';

export const MultipleChoiceImageMode = ({
  question,
  savedAnswer,
  onAnswerChange,
}: {
  question: MultipleChoiceImageQuestion;
  savedAnswer: string;
  onAnswerChange: (answerId: string) => void;
}) => (
  <div className="space-y-4">
    <QuestionDisplay questionAsset={question.questionAsset} />
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {question.options.map((option, index) => (
        <button
          key={option.id}
          onClick={() => onAnswerChange(option.id)}
          className={clsx(
            'group relative transform rounded-xl p-3 transition-all duration-300',
            savedAnswer === option.id
              ? 'scale-105 border-4 border-icon-green-bg bg-subtitle-cream shadow-xl'
              : 'border-2 border-input-border bg-white shadow-lg hover:scale-105 hover:border-brand-yellow'
          )}
        >
          <div
            className={clsx(
              'absolute -left-2 -top-2 flex size-6 items-center justify-center rounded-full border-2 text-xs font-bold transition-all',
              savedAnswer === option.id
                ? 'border-green-600 bg-icon-green-bg text-white'
                : 'border-brand-brown-stroke bg-brand-yellow text-brand-brown-stroke'
            )}
          >
            {/* INI BAGIAN YANG DIPERBAIKI */}
            {String.fromCodePoint(65 + index)}
          </div>
          <div className="relative overflow-hidden rounded-lg">
            <Image
              src={option.asset}
              alt={`Pilihan ${option.id}`}
              width={120}
              height={120}
              className="h-20 w-full object-cover transition-transform group-hover:scale-110 md:h-24"
            />
          </div>
          {savedAnswer === option.id && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-icon-green-bg/20">
              <div className="rounded-full bg-icon-green-bg p-1">
                <svg
                  className="size-4 text-white"
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
      ))}
    </div>
  </div>
);
