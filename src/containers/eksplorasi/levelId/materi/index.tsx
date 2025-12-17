'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { useUserProgress } from '@/lib/hooks/use-user-progress';
import BackButton from '../../../../components/shared/backbutton/backbutton';
import {
  useRequireAuth,
  usePageLoading,
  useAuth,
} from '@/lib/contexts/auth-context';
import LoadingScreen from '@/components/shared/loading-screen';
import {
  getLearningModulesForExploration,
  getExplorationLevel,
  ProcessedLearningModule,
  updateUserExplorationProgress,
  getUserCurrentStep,
} from '@/services/ekplorasi-service';
import { updateUserProgress } from '@/repositories/users-progress-repository';
import { getUserProgressData } from '@/services/users-progress-service';
import { markLevelAsCompleted } from '@/repositories/user-level-progress-repository';

const ConfirmationModal = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  children,
}: {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  children: React.ReactNode;
}) => {
  if (!isOpen) return undefined;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="m-4 w-full max-w-md animate-jump-in rounded-3xl bg-form-bg p-6 text-center font-sans shadow-2xl drop-shadow-comic">
        <h2 className="text-3xl font-bold text-brand-brown-stroke">{title}</h2>
        <div className="my-4 text-lg text-placeholder-brown">{children}</div>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="rounded-xl bg-gray-300 px-6 py-2 font-bold text-gray-700 transition-transform hover:scale-105"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="rounded-xl bg-brand-yellow px-6 py-2 font-bold text-brand-brown-stroke transition-transform hover:scale-105"
          >
            Ya, Benar
          </button>
        </div>
      </div>
    </div>
  );
};

export default function MateriPage() {
  const router = useRouter();
  const params = useParams();
  const { loading: authLoading } = useRequireAuth();
  const { isPageLoading } = usePageLoading();
  const { user } = useAuth();
  const levelId = params.levelId as string;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFinishing, setIsFinishing] = useState(false); // ✨ NEW: State untuk loader saat selesai
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [materials, setMaterials] = useState<ProcessedLearningModule[]>([]);
  const [levelNumber, setLevelNumber] = useState<number>(1);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const { refillLives } = useUserProgress();

  // ✅ Track user's current level
  const [userCurrentLevel, setUserCurrentLevel] = useState<number>(1);

  const loadMaterials = useCallback(async () => {
    if (!levelId || !user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(undefined);

      // Load user's current level
      const userProgress = await getUserProgressData(user.id);
      setUserCurrentLevel(userProgress.explorationLevel);

      const explorationLevel = await getExplorationLevel(levelId);
      if (!explorationLevel) {
        throw new Error('Level tidak ditemukan');
      }
      setLevelNumber(explorationLevel.levels);

      const modules = await getLearningModulesForExploration(levelId);
      setMaterials(modules);

      const currentStep = await getUserCurrentStep(
        user.id,
        explorationLevel.levels,
        modules.length
      );
      setCurrentIndex(currentStep);
    } catch (error_) {
      // eslint-disable-next-line no-console
      console.error('Error loading learning modules:', error_);
      setError(
        error_ instanceof Error ? error_.message : 'Failed to load materials'
      );
    } finally {
      setIsLoading(false);
    }
  }, [levelId, user?.id]);

  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  useEffect(() => {
    setImageLoading(true);
  }, [currentIndex]);

  useEffect(() => {
    if (materials.length > 0 && currentIndex < materials.length - 1) {
      const nextImage = new globalThis.Image();
      nextImage.src = materials[currentIndex + 1].imageUrl;
    }
  }, [currentIndex, materials]);

  const [highestXP, setHighestXP] = useState(0);

  useEffect(() => {
    const loadHighestXP = async () => {
      if (!user?.id) return;

      try {
        const progress = await getUserProgressData(user.id);
        setHighestXP(progress.xp || 0);
      } catch (error_) {
        // eslint-disable-next-line no-console
        console.error('Error loading XP:', error_);
      }
    };

    loadHighestXP();
  }, [user?.id]);

  // ✅ Only update XP if learning at current level
  const updateXP = useCallback(async () => {
    if (!user?.id || materials.length === 0) return;

    // ✅ CRITICAL VALIDATION: Only update XP if levelNumber === userCurrentLevel
    if (levelNumber !== userCurrentLevel) {
      return;
    }

    try {
      const xpValue = Math.min(
        100,
        Math.round(((currentIndex + 1) / materials.length) * 100)
      );

      if (xpValue <= highestXP) {
        return;
      }

      await updateUserProgress({
        userId: user.id,
        xp: xpValue,
      });

      setHighestXP(xpValue);
    } catch (error_) {
      // eslint-disable-next-line no-console
      console.error('Error updating XP:', error_);
    }
  }, [
    user?.id,
    currentIndex,
    materials.length,
    highestXP,
    levelNumber,
    userCurrentLevel,
  ]);

  const updateBackendProgress = useCallback(async () => {
    if (!user?.id || materials.length === 0) return;

    try {
      await updateUserExplorationProgress(user.id, levelNumber, currentIndex);

      await updateXP();
    } catch (error_) {
      // eslint-disable-next-line no-console
      console.error('Error updating backend progress:', error_);
    }
  }, [user?.id, levelNumber, currentIndex, materials.length, updateXP]);

  useEffect(() => {
    if (!isLoading && materials.length > 0) {
      updateBackendProgress();
    }
  }, [currentIndex, isLoading, updateBackendProgress, materials.length]);

  const handleBackClick = () => setIsModalOpen(true);
  const handleConfirmBack = () => router.push('/eksplorasi');
  const handleCancelBack = () => setIsModalOpen(false);

  const currentMateri = materials[currentIndex];
  const progressPercentage =
    materials.length > 0
      ? Math.round(((currentIndex + 1) / materials.length) * 100)
      : 0;
  const isLastMateri = currentIndex === materials.length - 1;

  const handleNext = useCallback(async () => {
    if (isTransitioning || isFinishing) return;

    if (isLastMateri) {
      // ✨ Start finishing loader
      setIsFinishing(true);

      if (user?.id) {
        try {
          await updateUserExplorationProgress(
            user.id,
            levelNumber,
            materials.length - 1
          );

          await markLevelAsCompleted(user.id, levelNumber);

          // ✅ Only set XP to 100 & refill lives if at current level
          if (levelNumber === userCurrentLevel) {
            await updateUserProgress({
              userId: user.id,
              xp: 100,
            });

            // Refill lives
            refillLives();
          }
        } catch (error_) {
          // eslint-disable-next-line no-console
          console.error('Error updating progress:', error_);
          // Jika error, kita matikan loading agar user bisa coba lagi atau kita biarkan redirect
          setIsFinishing(false);
          return; // Stop here if error (optional, depending on UX choice)
        }
      }
      // Redirect after success
      router.push('/eksplorasi');
    } else {
      setIsTransitioning(true);
      setCurrentIndex(prev => prev + 1);
      requestAnimationFrame(() => {
        setTimeout(() => setIsTransitioning(false), 200);
      });
    }
  }, [
    isTransitioning,
    isFinishing,
    isLastMateri,
    user?.id,
    levelNumber,
    materials.length,
    userCurrentLevel,
    refillLives,
    router,
  ]);

  const handlePrev = useCallback(() => {
    if (isTransitioning || isFinishing || currentIndex === 0) return;

    setIsTransitioning(true);
    setCurrentIndex(prev => Math.max(0, prev - 1));
    requestAnimationFrame(() => {
      setTimeout(() => setIsTransitioning(false), 200);
    });
  }, [currentIndex, isTransitioning, isFinishing]);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
  };

  if (isPageLoading || authLoading) {
    return <LoadingScreen message="Halaman sedang dimuat..." />;
  }

  // ✨ Tampilkan Loading Screen saat sedang menyimpan progress akhir
  if (isFinishing) {
    return <LoadingScreen message="Menyimpan progress..." />;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-50 font-sans">
        <div className="flex flex-col items-center space-y-4">
          <div className="size-16 animate-spin rounded-full border-4 border-orange-300 border-t-orange-600"></div>
          <p className="text-xl font-bold text-brand-brown-stroke">
            Memuat materi...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4 text-center font-sans">
        <div className="rounded-3xl bg-white p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-red-500">Error: {error}</h2>
          <button
            onClick={() => router.push('/eksplorasi')}
            className="mt-4 rounded-xl bg-brand-yellow px-6 py-3 font-bold text-brand-brown-stroke shadow-lg transition-transform hover:scale-105"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  if (!currentMateri || materials.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-50 p-4 text-center font-sans">
        <div className="rounded-3xl bg-white p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-red-500">
            Materi tidak ditemukan!
          </h2>
          <button
            onClick={() => router.push('/eksplorasi')}
            className="mt-4 rounded-xl bg-brand-yellow px-6 py-3 font-bold text-brand-brown-stroke shadow-lg transition-transform hover:scale-105"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ConfirmationModal
        isOpen={isModalOpen}
        onConfirm={handleConfirmBack}
        onCancel={handleCancelBack}
        title="Yakin Mau Keluar?"
      >
        <p>
          Kamu sudah hebat! Progress belajarmu akan disimpan kok, jadi bisa
          lanjut lagi nanti.
        </p>
      </ConfirmationModal>
      <div className="page-container flex h-screen flex-col overflow-hidden font-sans">
        <header className="flex items-center justify-between p-4">
          <div className="w-1/4">
            <BackButton onClick={handleBackClick} />
          </div>
          <div className="flex w-1/2 max-w-sm items-center justify-center gap-4">
            <div className="h-5 flex-1 rounded-full bg-form-bg shadow-inner">
              <div
                className="h-5 rounded-full bg-icon-green-bg transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="rounded-full bg-white/80 px-3 py-1 text-center font-bold text-brand-brown-stroke shadow-md">
              {currentIndex + 1} / {materials.length}
            </div>
          </div>
          <div className="w-1/4"></div>
        </header>
        <main className="flex flex-1 animate-fade-in-up flex-col items-center justify-center p-4 md:p-6">
          <div className="relative w-full max-w-2xl rounded-3xl bg-form-bg p-6 text-center shadow-2xl drop-shadow-comic">
            <div
              key={currentIndex}
              className={`transition-opacity duration-200 ${
                isTransitioning ? 'opacity-0' : 'opacity-100'
              }`}
            >
              <h1 className="text-5xl font-bold text-brand-yellow drop-shadow-lg text-stroke-base md:text-6xl">
                {currentMateri.title}
              </h1>
              <div className="relative my-4 flex h-52 w-full items-center justify-center rounded-2xl bg-input-bg shadow-inner md:h-64">
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-input-bg/80">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="size-12 animate-spin rounded-full border-4 border-orange-300 border-t-orange-600"></div>
                      <p className="text-sm font-semibold text-placeholder-brown">
                        Memuat gambar...
                      </p>
                    </div>
                  </div>
                )}
                <Image
                  src={currentMateri.imageUrl}
                  alt={`Isyarat untuk ${currentMateri.title}`}
                  width={250}
                  height={250}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  className={`object-contain transition-opacity duration-300 ${
                    imageLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                  priority
                />
              </div>
              <div className="rounded-xl bg-subtitle-cream p-4">
                <h3 className="text-lg font-bold text-placeholder-brown">
                  Contoh Kalimat:
                </h3>
                <p
                  className="font-comic text-xl text-gray-800"
                  dangerouslySetInnerHTML={{
                    __html: (
                      currentMateri.exampleSentence ||
                      currentMateri.description ||
                      ''
                    ).replaceAll(
                      /\*\*(.*?)\*\*/g,
                      '<strong class="text-brand-brown-stroke">$1</strong>'
                    ),
                  }}
                />
              </div>
            </div>
          </div>
        </main>
        <footer className="flex items-center justify-center gap-6 p-4">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0 || isTransitioning || isFinishing}
            className="max-w-xs flex-1 rounded-2xl border-4 border-brand-brown-stroke bg-white py-3 text-2xl font-bold text-brand-brown-stroke shadow-lg drop-shadow-comic-sm transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Kembali
          </button>
          <button
            onClick={handleNext}
            disabled={isTransitioning || isFinishing}
            className="max-w-xs flex-1 rounded-2xl bg-brand-yellow py-4 text-2xl font-bold text-brand-brown-stroke shadow-lg drop-shadow-comic-sm transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLastMateri ? 'Selesai!' : 'Lanjut'}
          </button>
        </footer>
      </div>
    </>
  );
}
