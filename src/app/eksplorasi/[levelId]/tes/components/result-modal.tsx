'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export const ResultsModal = ({
  score,
  correctAnswers,
  totalQuestions,
  onRetry,
  onNextLevel,
  onBackToExplore,
  lives,
}: {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  onRetry: () => void;
  onNextLevel: () => void;
  onBackToExplore: () => void;
  lives: number;
}) => {
  const isPassed = score >= 75;
  const canRetry = lives > 0;
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (score === 0) return;
    const animationDuration = 1500;
    const frameRate = 60;
    const totalFrames = (animationDuration / 1000) * frameRate;
    const increment = score / totalFrames;
    let currentFrame = 0;
    const timer = setInterval(() => {
      currentFrame++;
      const newScore = Math.min(score, Math.round(increment * currentFrame));
      setDisplayScore(newScore);
      if (newScore === score) {
        clearInterval(timer);
      }
    }, 1000 / frameRate);
    return () => clearInterval(timer);
  }, [score]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="m-4 w-full max-w-lg animate-jump-in rounded-3xl bg-form-bg p-8 text-center shadow-2xl drop-shadow-comic">
        <div className="mb-6">
          <Image
            src={
              isPassed
                ? '/images/maskot-juara.png'
                : '/images/maskot-coba-lagi.png'
            }
            alt="Hasil"
            width={120}
            height={120}
            className="mx-auto"
          />
        </div>

        {/* [DIPERBAIKI] text-brand-brown-stroke dihapus */}
        <h2 className="mb-4 text-4xl font-bold text-brand-yellow text-stroke-base">
          {isPassed ? '🎉 Luar Biasa!' : '💪 Jangan Menyerah!'}
        </h2>

        <p className="mb-6 text-lg font-medium text-placeholder-brown">
          {isPassed
            ? 'Kamu berhasil! Siap lanjut ke tantangan berikutnya?'
            : 'Hampir berhasil! Ayo coba sekali lagi!'}
        </p>

        <div className="mb-8 rounded-2xl bg-subtitle-cream p-6 shadow-inner">
          <div className="text-2xl font-bold text-brand-brown-stroke">
            Hasil Kamu
          </div>
          {/* [DIPERBAIKI] text-brand-brown-stroke dihapus */}
          <div className="my-2 text-6xl font-bold text-brand-yellow text-stroke">
            {displayScore}
          </div>
          <div className="text-lg text-placeholder-brown">
            Benar: {correctAnswers} dari {totalQuestions} soal
          </div>
        </div>

        {isPassed ? (
          <button
            onClick={onNextLevel}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-icon-green-bg py-4 text-2xl font-bold text-white shadow-lg drop-shadow-comic-sm transition-all hover:scale-105"
          >
            {' '}
            <span className="text-3xl">🚀</span> <span>Level Berikutnya</span>
          </button>
        ) : (
          <div className="flex flex-col items-center gap-3">
            {canRetry ? (
              <div className="flex w-full gap-3">
                <button
                  onClick={onBackToExplore}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-4 text-xl font-bold text-brand-brown-stroke shadow-lg drop-shadow-comic-sm transition-all hover:scale-105"
                >
                  {' '}
                  <span className="text-2xl">📚</span>{' '}
                  <span>Kembali Belajar</span>
                </button>
                <button
                  onClick={onRetry}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-yellow py-4 text-xl font-bold text-brand-brown-stroke shadow-lg drop-shadow-comic-sm transition-all hover:scale-105"
                >
                  {' '}
                  <span className="text-2xl">🔄</span> <span>Coba Lagi</span>
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={onBackToExplore}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-icon-orange-bg py-4 text-2xl font-bold text-white shadow-lg drop-shadow-comic-sm transition-all hover:scale-105"
                >
                  {' '}
                  <span className="text-3xl">📚</span>{' '}
                  <span>Kembali Belajar</span>
                </button>
                <p className="mt-2 text-sm font-bold text-red-500">
                  Nyawamu habis! Ulangi materi untuk isi ulang.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
