'use client';

import Image from 'next/image';

export const QuestionDisplay = ({
  questionAsset,
  questionText,
}: {
  questionAsset: string;
  questionText?: string;
}) => (
  <div className="space-y-4">
    <div className="mx-auto flex h-48 w-full max-w-md items-center justify-center rounded-2xl border-2 border-input-border bg-input-bg p-4 shadow-inner">
      <Image
        src={questionAsset}
        alt="Pertanyaan"
        width={250}
        height={250}
        unoptimized
        className="max-h-40 max-w-full rounded-xl object-contain"
      />
    </div>
    {questionText && (
      <div className="mx-auto max-w-md text-center">
        <p className="text-lg font-semibold text-brand-brown-stroke">
          {questionText}
        </p>
      </div>
    )}
  </div>
);
