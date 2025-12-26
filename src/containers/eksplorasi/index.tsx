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
import { useMascot } from '@/lib/hooks/use-mascot';

// --- MODALS COMPONENTS ---

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md animate-jump-in rounded-3xl bg-form-bg p-6 pt-10 text-center font-sans shadow-2xl drop-shadow-comic">
        <button
          onClick={onCancel}
          className="absolute right-3 top-3 rounded-full bg-input-border p-1 text-brand-brown-stroke transition-transform hover:scale-110"
        >
          <CloseIcon className="size-6" />
        </button>
        <h2 className="text-2xl font-bold text-brand-brown-stroke md:text-3xl">
          Lanjutkan Belajar?
        </h2>
        <p className="my-4 text-base text-placeholder-brown md:text-lg">
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
  currentLevel,
}: {
  isOpen: boolean;
  onStudy: () => void;
  onCancel: () => void;
  currentLevel?: number;
}) => {
  const { mascotUrl } = useMascot(
    'no_lives_modal',
    'center',
    '/images/ulangi-materi.png'
  );

  if (!isOpen) return undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md animate-jump-in rounded-3xl border-4 border-brand-brown-stroke bg-form-bg p-6 text-center shadow-2xl drop-shadow-comic md:p-8">
        {mascotUrl && (
          <Image
            src={mascotUrl}
            alt="Nyawa Habis"
            width={100}
            height={100}
            className="mx-auto size-24 md:size-auto"
          />
        )}
        <h2 className="mt-4 text-2xl font-bold text-brand-yellow text-stroke-base md:text-3xl">
          Yah, Nyawamu Habis!
        </h2>
        <p className="my-4 text-base font-bold text-placeholder-brown md:text-lg">
          Untuk mengisi ulang nyawamu, kamu harus belajar lagi materi{' '}
          <span className="text-brand-yellow">Level {currentLevel}</span> yang
          sedang kamu kerjakan.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onStudy}
            className="w-full rounded-xl bg-icon-orange-bg py-3 font-bold text-white shadow-lg drop-shadow-comic-sm transition-transform hover:scale-105"
          >
            Ulangi Materi Level {currentLevel}
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

// --- SUB COMPONENTS ---

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
  let progressPercentage = progress;

  if (
    isCurrentLevel &&
    currentStep !== undefined &&
    totalSteps &&
    totalSteps > 0
  ) {
    progressPercentage = Math.min(
      100,
      Math.round((currentStep / totalSteps) * 100)
    );
  } else if (progress > 100) {
    progressPercentage = 100;
  }

  return (
    <div className="flex w-full items-center gap-2 rounded-full bg-white/60 px-2 py-1 text-[10px] font-semibold text-placeholder-brown shadow-inner md:text-xs">
      <div className="h-1.5 flex-1 rounded-full bg-gray-300 md:h-2">
        <div
          className="h-1.5 rounded-full bg-icon-green-bg transition-all duration-300 md:h-2"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      <span className="whitespace-nowrap font-bold">
        {isCurrentLevel && currentStep !== undefined
          ? `${currentStep}/${totalSteps || 0}`
          : `${progressPercentage}%`}
      </span>
    </div>
  );
};

const ScoreBadge = ({ score, passed }: { score: number; passed: boolean }) => {
  return passed ? (
    <div className="animate-bounce-in absolute right-2 top-2 z-10 flex flex-col items-center justify-center rounded-lg border-2 border-yellow-500 bg-gradient-to-b from-yellow-100 to-yellow-200 px-2 py-0.5 shadow-md md:py-1">
      <span className="text-lg md:text-xl">🏆</span>
      <span className="text-[10px] font-bold text-yellow-700 md:text-xs">
        Skor: {score}
      </span>
    </div>
  ) : (
    <div className="animate-bounce-in absolute right-2 top-2 z-10 flex flex-col items-center justify-center rounded-lg border-2 border-rose-400 bg-gradient-to-b from-rose-50 to-rose-100 px-2 py-0.5 shadow-md md:py-1">
      <span className="text-lg md:text-xl">📝</span>
      <span className="text-[10px] font-bold text-rose-700 md:text-xs">
        Skor: {score}
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
    !level.isLearningComplete;

  const isTestReady = level.isLearningComplete || isCompleted;
  const hasLives = lives > 0;

  const studyButtonText = !hasLives && isTestReady ? 'Ulangi' : 'Belajar';

  return (
    <div
      className={clsx(
        'relative flex h-full flex-col justify-between rounded-2xl p-2 text-center shadow-lg transition-all md:rounded-3xl md:p-3',
        {
          'border-4 border-gray-400 bg-gray-200 opacity-80': isLocked,
          'border-4 border-green-400 bg-gradient-to-br from-yellow-100 to-orange-100':
            isCompleted,
          'border-4 border-orange-400 bg-gradient-to-br from-yellow-50 to-orange-50':
            !isLocked && !isCompleted,
        }
      )}
    >
      {/* 🏅 Display Score */}
      {level.testScore !== undefined && level.testPassed !== undefined && (
        <ScoreBadge score={level.testScore} passed={level.testPassed} />
      )}

      {/* Lock/Complete Badge */}
      {isLocked && (
        <div className="absolute -right-2 -top-2 z-20 grid size-7 place-items-center rounded-full border-2 border-white bg-gray-500 shadow-md md:-right-3 md:-top-3 md:size-9 md:border-4">
          <LockIconSvg className="size-3 text-white md:size-5" />
        </div>
      )}
      {isCompleted && (
        <div className="absolute -right-2 -top-2 z-20 grid size-7 place-items-center rounded-full border-2 border-white bg-green-500 shadow-md md:-right-3 md:-top-3 md:size-9 md:border-4">
          <CheckCircleIcon className="size-3 text-white md:size-5" />
        </div>
      )}

      <div
        className={`flex flex-col space-y-2 ${isLocked ? 'grayscale filter' : ''}`}
      >
        {/* Title Responsive: text-sm di mobile, text-lg di desktop */}
        <h3 className="mt-2 font-sans text-sm font-bold leading-tight text-brand-brown-stroke md:text-lg md:leading-normal">
          {level.title}
        </h3>

        <div className="grid min-h-[80px] flex-grow place-items-center rounded-xl bg-white/80 p-2 shadow-inner md:min-h-[100px] md:rounded-2xl">
          <Image
            src={level.imgUrl}
            alt={level.description}
            width={80}
            height={80}
            className="size-16 object-contain md:size-20"
          />
        </div>

        {/* Progress Indicator */}
        {isStudying ? (
          <ProgressIndicator
            progress={level.learningProgress}
            isCurrentLevel={level.status === 'unlocked'}
            currentStep={level.currentStep}
            totalSteps={level.totalSteps}
          />
        ) : (
          <div className="line-clamp-2 min-h-[2.5em] py-1 text-xs font-semibold text-placeholder-brown md:text-sm">
            {level.description}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {!isLocked && (
        <div className="mt-2 flex w-full gap-1.5 md:mt-3 md:gap-2">
          {/* Tombol Belajar */}
          <button
            onClick={onStudy}
            className={clsx(
              'rounded-lg bg-icon-orange-bg py-1.5 font-bold text-white shadow-md transition-transform hover:scale-105 md:rounded-xl md:py-2',
              // Mobile text size adjustments
              isTestReady
                ? 'flex-1 text-[10px] md:text-sm'
                : 'w-full text-xs md:text-base'
            )}
          >
            {studyButtonText}
          </button>

          {/* Tombol Tes */}
          {isTestReady && (
            <button
              onClick={onTest}
              disabled={!hasLives}
              className={clsx(
                'flex-1 animate-jump-in rounded-lg py-1.5 text-[10px] font-bold text-white shadow-md transition-transform md:rounded-xl md:py-2 md:text-sm',
                {
                  'bg-icon-teal-bg hover:scale-105': hasLives,
                  'cursor-not-allowed bg-gray-400': !hasLives,
                }
              )}
            >
              {hasLives ? 'Tes' : 'Habis'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

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
  const [currentUserLevel, setCurrentUserLevel] = useState(1);
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

      if (result.userProgress) {
        setCurrentUserLevel(result.userProgress.exploration_level);
      }

      const userData = getUserData();
      setUserLives(userData?.lives ?? 3);
    } catch (error_) {
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
        level.isLearningComplete || level.status === 'completed';

      if (userLives <= 0 && isTestReady) {
        if (level.levelNumber === currentUserLevel) {
          resetLevelProgress(level.levelNumber);
          router.push(`/eksplorasi/${level.id}/materi`);
        } else {
          setNoLivesModalState({ isOpen: true, level: undefined });
        }
        return;
      }

      if (level.learningProgress > 0 && !level.isLearningComplete) {
        setStudyModalState({ isOpen: true, level: level });
      } else {
        router.push(`/eksplorasi/${level.id}/materi`);
      }
    },
    [router, userLives, currentUserLevel]
  );

  const handleTestClick = useCallback(
    (level: ProcessedExplorationLevel) => {
      if (userLives > 0) {
        router.push(`/eksplorasi/${level.id}/tes`);
      } else {
        setNoLivesModalState({ isOpen: true, level: undefined });
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

  const handleGoToStudyFromNoLives = () => {
    const currentLevel = levels.find(l => l.levelNumber === currentUserLevel);
    if (currentLevel) {
      resetLevelProgress(currentLevel.levelNumber);
      router.push(`/eksplorasi/${currentLevel.id}/materi`);
    }
    setNoLivesModalState({ isOpen: false, level: undefined });
  };

  if (isPageLoading || authLoading) {
    return <LoadingScreen message="Halaman sedang dimuat..." />;
  }

  return (
    <>
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
        currentLevel={currentUserLevel}
      />
      <div className="page-container relative flex min-h-screen flex-col font-sans">
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
            <div className="grid flex-1 grid-cols-2 items-stretch gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:gap-5">
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
