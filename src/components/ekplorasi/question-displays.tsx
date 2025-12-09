'use client';

import Image from 'next/image';
import { useState } from 'react';

interface QuestionDisplayProps {
  questionAsset: string;
  questionText?: string;
  onImageLoad?: () => void;
  onImageError?: () => void;
}

export const QuestionDisplay = ({
  questionAsset,
  questionText,
  onImageLoad,
  onImageError,
}: QuestionDisplayProps) => {
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageLoad = () => {
    setImageLoading(false);
    onImageLoad?.();
  };

  const handleImageError = () => {
    setImageLoading(false);
    onImageError?.();
  };

  return (
    <div className="space-y-4">
      <div className="relative mx-auto flex h-48 w-full max-w-md items-center justify-center rounded-2xl border-2 border-input-border bg-input-bg p-4 shadow-inner">
        {/* Loading Indicator */}
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-input-bg/80">
            <div className="flex flex-col items-center space-y-3">
              <div className="size-10 animate-spin rounded-full border-4 border-orange-300 border-t-orange-600"></div>
              <p className="text-xs font-semibold text-placeholder-brown">
                Memuat...
              </p>
            </div>
          </div>
        )}

        {/* Image */}
        <Image
          src={questionAsset}
          alt="Pertanyaan"
          width={250}
          height={250}
          unoptimized
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`max-h-40 max-w-full rounded-xl object-contain transition-opacity duration-300 ${
            imageLoading ? 'opacity-0' : 'opacity-100'
          }`}
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
};
