'use client';

import Image from 'next/image';

export const QuestionDisplay = ({
  questionAsset,
}: {
  questionAsset: string;
}) => (
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
);
