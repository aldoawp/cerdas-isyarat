'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  CloseIcon,
  LockIcon as LockIconSvg,
  CheckCircleIcon,
} from '@/components/icons';
import clsx from 'clsx';
import BackButton from '@/components/shared/backbutton/backbutton';
import UserDetail, { getUserData } from '@/components/shared/userinfo';
import MusicPlayer from '@/components/shared/musicplayer/musicplayer';
import { resetLevelProgress } from '@/lib/utils/progress-manager';
import {
  useRequireAuth,
  usePageLoading,
  useAuth,
} from '@/lib/contexts/auth-context';
import LoadingScreen from '@/components/shared/loading-screen';
import {
  getExplorationLevelsWithProgress,
  ProcessedExplorationLevel,
} from '@/services/ekplorasi-service';

// --- TIPE DATA ---

const StudyOptionsModal = ({
  isOpen,
  onContinue,
  onCancel,
}: {
  isOpen: boolean;
  onContinue: () => void;
  onCancel: () => void;
}) => {
  if (!isOpen) return undefined;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative m-4 w-full max-w-md animate-jump-in rounded-3xl bg-form-bg p-6 pt-10 text-center font-sans shadow-2xl drop-shadow-comic">
        <button
          onClick={onCancel}
          className="absolute right-3 top-3 rounded-full bg-input-border p-1 text-brand-brown-stroke transition-transform hover:scale-110"
        >
          <CloseIcon className="size-6" />
        </button>
        <h2 className="text-3xl font-bold text-brand-brown-stroke">
          Lanjutkan Belajar?
        </h2>
        <p className="my-4 text-lg text-placeholder-brown">
          Kamu sudah punya progres di level ini. Lanjutkan dari materi terakhir?
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onContinue}
            className="w-full rounded-xl bg-brand-yellow px-6 py-3 font-bold text-brand-brown-stroke transition-transform hover:scale-105"
          >
            Ya, Lanjutkan
          </button>
          <button
            onClick={onCancel}
            className="w-full rounded-xl bg-white px-6 py-2 font-bold text-gray-700 ring-2 ring-gray-300 transition-transform hover:scale-105"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};

const NoLivesModal = ({
  isOpen,
  onStudy,
  onCancel,
}: {
  isOpen: boolean;
  onStudy: () => void;
  onCancel: () => void;
}) => {
  if (!isOpen) return undefined;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="m-4 w-full max-w-md animate-jump-in rounded-3xl border-4 border-brand-brown-stroke bg-form-bg p-8 text-center shadow-2xl drop-shadow-comic">
        <Image
          src="/images/maskot-sedih.png"
          alt="Nyawa Habis"
          width={100}
          height={100}
          className="mx-auto"
        />
        <h2 className="mt-4 text-3xl font-bold text-brand-yellow text-stroke-base">
          Yah, Nyawamu Habis!
        </h2>
        <p className="my-4 text-lg font-bold text-placeholder-brown">
          Untuk mengisi ulang nyawamu, kamu harus belajar lagi materi di level
          ini. Semangat!
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onStudy}
            className="w-full rounded-xl bg-icon-orange-bg py-3 font-bold text-white shadow-lg drop-shadow-comic-sm transition-transform hover:scale-105"
          >
            Ulangi Materi
          </button>
          <button
            onClick={onCancel}
            className="w-full rounded-xl bg-gray-300 py-2 font-bold text-gray-700 shadow-lg drop-shadow-comic-sm transition-transform hover:scale-105"
          >
            Nanti Saja
          </button>
        </div>
      </div>
    </div>
  );
};

const ProgressIndicator = ({
  progress,
  isCurrentLevel,
  currentStep,
  totalSteps,
}: {
  progress: number;
  isCurrentLevel?: boolean;
  currentStep?: number;
  totalSteps?: number;
}) => {
  // Calculate the proper percentage for the progress bar
  let progressPercentage = progress;

  if (isCurrentLevel && currentStep && totalSteps && totalSteps > 0) {
    // For current level, calculate percentage from step number
    progressPercentage = Math.round((currentStep / totalSteps) * 100);
  }

  return (
    <div className="flex w-full items-center gap-2 rounded-full bg-white/60 px-2 py-1 text-xs font-semibold text-placeholder-brown shadow-inner">
      <div className="h-2 flex-1 rounded-full bg-gray-300">
        <div
          className="h-2 rounded-full bg-icon-green-bg"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      <span className="font-bold">
        {isCurrentLevel && currentStep
          ? `Step ${currentStep}`
          : `${progressPercentage}%`}
      </span>
    </div>
  );
};

const LevelCard = ({
  level,
  onStudy,
  onTest,
  lives,
}: {
  level: ProcessedExplorationLevel;
  onStudy: () => void;
  onTest: () => void;
  lives: number;
}) => {
  const isLocked = level.status === 'locked';
  const isCompleted = level.status === 'completed';
  const isStudying =
    level.status === 'unlocked' &&
    level.learningProgress > 0 &&
    level.learningProgress < 100;
  // Test is ready only when user has completed all learning modules
  const isTestReady =
    isCompleted || (level.status === 'unlocked' && level.isLearningComplete);
  const hasLives = lives > 0;

  // [DIUBAH] Tombol "Belajar Materi" berubah teks jika nyawa habis dan tes sudah siap
  const studyButtonText =
    !hasLives && isTestReady ? 'Ulangi Materi' : 'Belajar Materi';

  return (
    <div
      className={clsx(
        'relative flex h-full flex-col justify-between rounded-3xl p-3 text-center shadow-lg transition-all',
        {
          'border-4 border-gray-400 bg-gray-200 opacity-80': isLocked,
          'border-4 border-green-400 bg-gradient-to-br from-yellow-100 to-orange-100':
            isCompleted,
          'border-4 border-orange-400 bg-gradient-to-br from-yellow-50 to-orange-50':
            !isLocked && !isCompleted,
        }
      )}
    >
      {isLocked && (
        <div className="absolute -right-3 -top-3 z-20 grid size-9 place-items-center rounded-full border-4 border-white bg-gray-500 shadow-md">
          <LockIconSvg className="size-5 text-white" />
        </div>
      )}
      {isCompleted && (
        <div className="absolute -right-3 -top-3 z-20 grid size-9 place-items-center rounded-full border-4 border-white bg-green-500 shadow-md">
          <CheckCircleIcon className="size-5 text-white" />
        </div>
      )}
      <div
        className={`flex flex-col space-y-2 ${isLocked ? 'grayscale filter' : ''}`}
      >
        <h3 className="font-sans text-lg font-bold text-brand-brown-stroke">
          {level.title}
        </h3>
        <div className="grid flex-grow place-items-center rounded-2xl bg-white/80 p-2 shadow-inner">
          <Image
            src={level.imgUrl}
            alt={level.description}
            width={80}
            height={80}
            className="size-20 object-contain"
          />
        </div>
        {isStudying ? (
          <ProgressIndicator
            progress={level.learningProgress}
            isCurrentLevel={level.status === 'unlocked'}
            currentStep={level.currentStep}
            totalSteps={level.totalSteps}
          />
        ) : (
          <div className="py-1 text-sm font-semibold text-placeholder-brown">
            {level.description}
          </div>
        )}
      </div>
      {!isLocked && (
        <div className="mt-3 flex flex-col gap-2">
          <button
            onClick={onStudy}
            className="w-full rounded-xl bg-icon-orange-bg py-2 font-bold text-white shadow-md transition-transform hover:scale-105"
          >
            {studyButtonText}
          </button>
          {isTestReady && (
            <button
              onClick={onTest}
              className={clsx(
                'w-full animate-jump-in rounded-xl py-2 font-bold text-white shadow-md transition-transform hover:scale-105',
                { 'bg-icon-teal-bg': hasLives, 'bg-gray-400': !hasLives }
              )}
            >
              Mulai Tes
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// --- FUNGSI PEMROSESAN ---

// --- KOMPONEN UTAMA HALAMAN EKSPLORASI ---
export default function EksplorasiPage() {
  const router = useRouter();
  const { loading: authLoading } = useRequireAuth();
  const { isPageLoading } = usePageLoading();
  const { user } = useAuth();
  const [levels, setLevels] = useState<ProcessedExplorationLevel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [studyModalState, setStudyModalState] = useState<{
    isOpen: boolean;
    level: ProcessedExplorationLevel | undefined;
  }>({ isOpen: false, level: undefined });
  const [userLives, setUserLives] = useState(3);
  const [noLivesModalState, setNoLivesModalState] = useState<{
    isOpen: boolean;
    level: ProcessedExplorationLevel | undefined;
  }>({ isOpen: false, level: undefined });

  const loadData = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(undefined);

      const result = await getExplorationLevelsWithProgress(user.id);
      setLevels(result.levels);

      // Get user lives from localStorage for now (you might want to move this to backend later)
      const userData = getUserData();
      setUserLives(userData?.lives ?? 3);
    } catch (error_) {
      // eslint-disable-next-line no-console
      console.error('Error loading exploration levels:', error_);
      setError(
        error_ instanceof Error ? error_.message : 'Failed to load levels'
      );
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);
  useEffect(() => {
    loadData();
    globalThis.addEventListener('userStateChange', loadData);
    window.addEventListener('focus', loadData);
    return () => {
      globalThis.removeEventListener('userStateChange', loadData);
      window.removeEventListener('focus', loadData);
    };
  }, [loadData]);

  const handleStudyClick = useCallback(
    (level: ProcessedExplorationLevel) => {
      const isTestReady =
        level.status === 'completed' ||
        (level.status === 'unlocked' && level.isLearningComplete);

      // [FIX] Jika nyawa habis DAN level sudah siap tes, maka "Belajar Materi" menjadi "Ulangi Materi"
      // yang fungsinya mereset progress.
      if (userLives <= 0 && isTestReady) {
        resetLevelProgress(level.levelNumber);
        router.push(`/eksplorasi/${level.id}/materi`);
        return;
      }

      // Jika ada progres dan nyawa masih ada, tawarkan untuk melanjutkan.
      if (level.learningProgress > 0) {
        setStudyModalState({ isOpen: true, level: level });
      } else {
        // Jika tidak ada progres, langsung mulai belajar.
        router.push(`/eksplorasi/${level.id}/materi`);
      }
    },
    [router, userLives]
  );

  const handleTestClick = useCallback(
    (level: ProcessedExplorationLevel) => {
      if (userLives > 0) {
        router.push(`/eksplorasi/${level.id}/tes`);
      } else {
        setNoLivesModalState({ isOpen: true, level: level });
      }
    },
    [router, userLives]
  );

  const handleContinueStudy = () => {
    if (studyModalState.level)
      router.push(`/eksplorasi/${studyModalState.level.id}/materi`);
    setStudyModalState({ isOpen: false, level: undefined });
  };
  const handleCancelStudy = () =>
    setStudyModalState({ isOpen: false, level: undefined });

  // [FIX] Fungsi ini HANYA dipanggil dari modal "Nyawa Habis"
  const handleGoToStudyFromNoLives = () => {
    if (noLivesModalState.level) {
      resetLevelProgress(noLivesModalState.level.levelNumber);
      router.push(`/eksplorasi/${noLivesModalState.level.id}/materi`);
    }
    setNoLivesModalState({ isOpen: false, level: undefined });
  };

  // Show loading screen while page is loading or checking authentication
  if (isPageLoading || authLoading) {
    return <LoadingScreen message="Halaman sedang dimuat..." />;
  }

  return (
    <>
      {/* [DIUBAH] onRestart dihapus dari sini */}
      <StudyOptionsModal
        isOpen={studyModalState.isOpen}
        onContinue={handleContinueStudy}
        onCancel={handleCancelStudy}
      />
      <NoLivesModal
        isOpen={noLivesModalState.isOpen}
        onStudy={handleGoToStudyFromNoLives}
        onCancel={() =>
          setNoLivesModalState({ isOpen: false, level: undefined })
        }
      />
      <div className="relative flex min-h-screen flex-col bg-mobile-bg bg-cover bg-center font-sans md:bg-desktop-bg">
        <header className="fixed inset-x-0 top-0 z-30 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BackButton href="/onboarding" />
            </div>
            <div className="flex items-center pr-20">
              <div className="md:hidden">
                <UserDetail mode="sidebar" />
              </div>
              <div className="hidden md:block">
                <UserDetail mode="dropdown" />
              </div>
            </div>
          </div>
        </header>
        <MusicPlayer />
        <main className="relative z-10 flex flex-1 flex-col px-4 pb-10 pt-24 md:px-8 md:pt-28">
          <div className="my-4 text-center md:my-2 lg:my-4">
            <h1 className="text-4xl font-bold text-brand-yellow drop-shadow-lg text-stroke-md md:text-5xl lg:text-6xl">
              Eksplorasi BISINDO
            </h1>
          </div>
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center text-xl font-bold text-white">
              Memuat level...
            </div>
          ) : error ? (
            <div className="flex flex-1 items-center justify-center text-xl font-bold text-red-400">
              {error}
            </div>
          ) : (
            <div className="grid flex-1 grid-cols-2 items-stretch gap-4 md:grid-cols-3 lg:grid-cols-4 xl:gap-5">
              {levels.map(level => (
                <LevelCard
                  key={level.id}
                  level={level}
                  onStudy={() => handleStudyClick(level)}
                  onTest={() => handleTestClick(level)}
                  lives={userLives}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
