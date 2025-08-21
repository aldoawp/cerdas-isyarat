'use client';

import BackButton from '@/components/backbutton/backbutton';
import clsx from 'clsx';

// Tipe untuk properti yang diterima komponen ini
interface GameHeaderProps {
  currentIndex: number;
  totalQuestions: number;
  timeLeft: string;
  onBackClick: () => void; // Ini adalah fungsi untuk membuka modal peringatan
}

export const GameHeader = ({
  currentIndex,
  totalQuestions,
  timeLeft,
  onBackClick,
}: GameHeaderProps) => (
  <header className="flex items-center justify-between p-4">
    <div className="w-1/4">
      {/* [FIX] Di sinilah perbaikannya.
        Kita teruskan fungsi onBackClick ke prop onClick milik BackButton.
        Sekarang BackButton tahu apa yang harus dilakukan saat diklik di halaman tes.
      */}
      <BackButton onClick={onBackClick} />
    </div>

    <div className="flex w-1/2 items-center justify-center gap-2">
      {Array.from({ length: totalQuestions }).map((_, index) => (
        <div
          key={index}
          className={clsx(
            'flex size-8 items-center justify-center rounded-full border-2 transition-all duration-500',
            index < currentIndex
              ? 'border-icon-green-bg bg-icon-green-bg text-white shadow-lg'
              : index === currentIndex
                ? 'animate-pulse border-brand-yellow bg-brand-yellow/20 text-brand-brown-stroke shadow-md'
                : 'border-gray-300 bg-white/50 text-gray-400'
          )}
        >
          {index < currentIndex ? (
            <svg className="size-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <span className="text-xs font-bold">{index + 1}</span>
          )}
        </div>
      ))}
    </div>

    <div className="flex w-1/4 justify-center">
      <div className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-1 shadow-lg">
        <div className="rounded-full bg-white px-4 py-2 text-center">
          <div className="text-xs font-medium text-gray-600">Waktu</div>
          <div className="text-sm font-bold text-gray-800">{timeLeft}</div>
        </div>
      </div>
    </div>
  </header>
);
