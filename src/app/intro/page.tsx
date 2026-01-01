'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useMusic } from '@/components/shared/musicplayer/music-context';

// Komponen Dekorasi Bintang
const StarIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z" />
  </svg>
);

// Komponen Dekorasi Awan
const CloudIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.35,10.04C18.67,6.59,15.64,4,12,4c-1.48,0-2.85,0.43-4.01,1.17l1.46,1.46C10.21,6.23,11.08,6,12,6 c3.04,0,5.5,2.46,5.5,5.5v0.5H19c1.66,0,3,1.34,3,3s-1.34,3-3,3h-1.5v2H19c2.76,0,5-2.24,5-5C24,12.36,21.95,10.22,19.35,10.04z" />
    <path d="M11.5,8v2.59c0,0.89-0.39,1.67-1,2.2v2.3c1.19-0.69,2-1.97,2-3.5V8H11.5z" />
    <path d="M9.5,16.5C9.5,15.12,8.38,14,7,14s-2.5,1.12-2.5,2.5S5.62,19,7,19S9.5,17.88,9.5,16.5z M7,17c-0.28,0-0.5-0.22-0.5-0.5 S6.72,16,7,16s0.5,0.22,0.5,0.5S7.28,17,7,17z" />
  </svg>
);

// Komponen Partikel Confetti
const Confetti = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    {Array.from({ length: 20 }).map((_, i) => (
      <div
        key={i}
        className="absolute animate-confetti"
        style={{
          left: `${Math.random() * 100}%`,
          top: `-${Math.random() * 20}%`,
          animationDelay: `${Math.random() * 3}s`,
          animationDuration: `${3 + Math.random() * 2}s`,
        }}
      >
        <div
          className="size-3 rounded-full"
          style={{
            backgroundColor: [
              '#f59e0b',
              '#ef4444',
              '#10b981',
              '#3b82f6',
              '#8b5cf6',
            ][Math.floor(Math.random() * 5)],
          }}
        />
      </div>
    ))}
  </div>
);

export default function IntroPage() {
  const router = useRouter();
  const { togglePlayPause, isPlaying, volume, changeVolume } = useMusic();
  const [currentStep, setCurrentStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const dialogues = [
    {
      id: 1,
      text: 'Halo Teman! 👋\nBelajar BISINDO jadi seru! Tonton gerakan, main tebak-tebakan, dan kuasai isyarat baru setiap hari.',
      emoji: '🎉',
    },
    {
      id: 2,
      text: 'Yuk belajar sambil bermain!',
      emoji: '✨',
    },
    {
      id: 3,
      text: 'Ada banyak game tebak-tebakan\nyang menantang lho! yuk raih scor tertinggi 🎮',
      emoji: '🎯',
    },
    {
      id: 4,
      text: 'Siap jadi Jagoan Isyarat?\nYuk kita mulai petualangan pelajari materi dan naikan level mu! 🚀',
      emoji: '🌟',
    },
  ];

  // Logic untuk pindah step
  const goToStep = (index: number) => {
    if (index >= 0 && index < dialogues.length) {
      setCurrentStep(index);
    }
  };

  // Logic Next Button
  const handleNext = () => {
    if (currentStep < dialogues.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  // Logic Finish dengan musik
  const handleFinish = async () => {
    setIsTransitioning(true);
    setShowConfetti(true);

    // 1. Set local storage
    localStorage.setItem('hasSeenIntro', 'true');

    // 2. FORCE PLAY MUSIC
    if (!isPlaying) {
      // Set volume ke level yang terdengar jika 0
      if (volume === 0) changeVolume(0.3);

      try {
        await togglePlayPause();
      } catch (error) {
        console.error('Gagal memulai musik:', error);
      }
    }

    // 3. Pindah halaman dengan delay untuk efek
    setTimeout(() => {
      router.push('/login');
    }, 1500);
  };

  // Cek jika user sudah pernah lihat intro
  useEffect(() => {
    if (
      globalThis.window !== undefined &&
      localStorage.getItem('hasSeenIntro')
    ) {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="page-container relative min-h-screen w-full overflow-hidden">
      {/* Confetti Effect */}
      {showConfetti && <Confetti />}

      {/* --- DEKORASI MELAYANG (Fun Elements) --- */}
      <div
        className="absolute left-10 top-10 animate-float text-brand-yellow/40"
        style={{ animationDelay: '0s' }}
      >
        <CloudIcon className="size-20 md:size-24" />
      </div>
      <div
        className="absolute bottom-20 right-10 animate-float text-brand-yellow/40"
        style={{ animationDelay: '1.5s' }}
      >
        <CloudIcon className="size-24 md:size-32" />
      </div>
      <div className="absolute right-20 top-1/4 animate-spin-slow text-orange-300 opacity-60">
        <StarIcon className="size-10 md:size-12" />
      </div>
      <div
        className="absolute bottom-1/3 left-10 animate-spin-slow text-amber-400 opacity-60"
        style={{ animationDirection: 'reverse' }}
      >
        <StarIcon className="size-8 md:size-10" />
      </div>
      <div
        className="absolute left-1/4 top-1/3 animate-bounce text-pink-400 opacity-40"
        style={{ animationDelay: '0.5s' }}
      >
        <StarIcon className="size-6" />
      </div>
      <div
        className="absolute bottom-1/4 right-1/3 animate-bounce text-purple-400 opacity-40"
        style={{ animationDelay: '1s' }}
      >
        <StarIcon className="size-6" />
      </div>

      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4">
        {/* LOGO TITLE dengan animasi */}
        <div className="mb-6 animate-bounce-in text-center">
          <h1 className="text-5xl font-bold text-brand-yellow drop-shadow-2xl text-stroke-base md:text-6xl lg:text-7xl">
            CerdasIsyarat
          </h1>
          <div className="mt-2 flex items-center justify-center gap-2">
            {dialogues.map((dialogue, index) => (
              <span
                key={dialogue.id}
                className={`text-2xl transition-all duration-300 ${
                  index === currentStep
                    ? 'scale-125 animate-bounce'
                    : 'scale-100 opacity-50'
                }`}
              >
                {dialogue.emoji}
              </span>
            ))}
          </div>
        </div>

        {/* --- AREA UTAMA --- */}
        <div className="relative flex w-full max-w-md flex-col items-center">
          {/* BALON CHAT */}
          <div className="relative mb-2 flex h-32 w-full items-end justify-center md:h-36">
            {dialogues.map(
              (dialogue, index) =>
                index === currentStep && (
                  <div
                    key={dialogue.id}
                    className="absolute bottom-0 z-20 mx-auto w-auto max-w-[90%] animate-jump-in rounded-[24px] border-4 border-brand-brown-stroke bg-white p-4 shadow-[4px_4px_0px_0px_rgba(206,115,16,0.5)] transition-all duration-300 hover:shadow-[6px_6px_0px_0px_rgba(206,115,16,0.7)]"
                  >
                    <p className="whitespace-pre-line text-center font-comic text-lg font-bold leading-snug text-brand-brown-stroke md:text-xl">
                      {dialogue.text}
                    </p>
                    {/* Segitiga Buntut */}
                    <div className="absolute -bottom-3 left-1/2 size-6 -translate-x-1/2 rotate-45 transform border-b-4 border-r-4 border-brand-brown-stroke bg-white"></div>
                  </div>
                )
            )}
          </div>

          {/* MASKOT (Klik untuk Next) */}
          <div
            className="relative z-10 w-64 animate-float cursor-pointer transition-transform duration-200 active:scale-95 md:w-72"
            onClick={handleNext}
          >
            <Image
              src="/images/mascot-cropped-1-tp 1.png"
              alt="Mascot"
              width={350}
              height={350}
              className="h-auto w-full drop-shadow-2xl"
              priority
            />
            {/* Hover hint */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 hover:opacity-100">
              <div className="rounded-full bg-black/50 px-4 py-2 text-sm font-bold text-white">
                Klik Aku! 👆
              </div>
            </div>
          </div>

          {/* --- INDIKATOR TITIK (DOTS) - Sekarang Clickable --- */}
          <div className="mb-6 mt-2 flex items-center gap-3">
            {dialogues.map((_, index) => (
              <button
                key={index}
                onClick={() => goToStep(index)}
                disabled={isTransitioning}
                className={`h-3 rounded-full border-2 border-brand-brown-stroke transition-all duration-300 disabled:cursor-not-allowed ${
                  index === currentStep
                    ? 'w-8 scale-110 bg-amber-500 shadow-lg' // Aktif
                    : 'w-3 bg-white/50 hover:scale-125 hover:bg-white active:scale-95'
                } // Pasif`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          {/* --- TOMBOL AKSI --- */}
          <div className="w-full px-6">
            <button
              onClick={handleNext}
              disabled={isTransitioning}
              className={`w-full rounded-[20px] border-b-8 border-l-2 border-r-4 border-t-2 border-brand-brown-stroke py-3 text-xl font-bold text-white shadow-lg transition-all duration-200 active:translate-y-1 active:scale-95 active:border-b-2 active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 md:text-2xl ${
                currentStep === dialogues.length - 1
                  ? 'animate-pulse bg-icon-green-bg hover:bg-green-500' // Tombol Mulai (Hijau)
                  : 'bg-amber-500 hover:bg-amber-400'
              } // Tombol Lanjut (Kuning)`}
            >
              {isTransitioning
                ? '🎵 MEMUAT...'
                : currentStep === dialogues.length - 1
                  ? '🚀 MULAI PETUALANGAN!'
                  : 'LANJUT ➡️'}
            </button>
          </div>

          {/* Info Hint */}
          <div className="mt-4 text-center">
            <p className="text-xs font-semibold text-amber-700 opacity-75 md:text-sm">
              💡 Tip: Klik titik di atas untuk loncat ke dialog tertentu!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
