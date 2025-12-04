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
  ProcessedLearningModule,
  updateUserExplorationProgress,
  getUserCurrentStep,
} from '@/services/ekplorasi-service';

// --- TYPES ---
interface LevelProgress {
  progress: number;
  lastIndex: number;
}
interface UserProgress {
  completedLevelIds: number[];
  learningProgress: { [levelId: number]: LevelProgress };
}

// --- LOCAL STORAGE FUNCTIONS ---
const PROGRESS_KEY = 'userBisindoProgress';

const getProgress = (): UserProgress => {
  if (globalThis.window === undefined)
    return { completedLevelIds: [], learningProgress: {} };
  try {
    const saved = localStorage.getItem(PROGRESS_KEY);
    return saved
      ? JSON.parse(saved)
      : { completedLevelIds: [], learningProgress: {} };
  } catch {
    return { completedLevelIds: [], learningProgress: {} };
  }
};

const saveProgress = (progress: UserProgress) => {
  if (globalThis.window !== undefined)
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
};

const updateLearningProgress = (
  levelId: number,
  currentIndex: number,
  totalItems: number
) => {
  const currentProgress = getProgress();
  const newPercentage = Math.round(((currentIndex + 1) / totalItems) * 100);
  currentProgress.learningProgress[levelId] = {
    progress: newPercentage,
    lastIndex: currentIndex,
  };
  saveProgress(currentProgress);
};

// --- MODAL COMPONENT ---
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

// --- MAIN PAGE COMPONENT ---
export default function MateriPage() {
  const router = useRouter();
  const params = useParams();
  const { loading: authLoading } = useRequireAuth();
  const { isPageLoading } = usePageLoading();
  const { user } = useAuth();
  const levelId = params.levelId as string;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [materials, setMaterials] = useState<ProcessedLearningModule[]>([]);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { refillLives } = useUserProgress();

  // Load materials with cache optimization
  const loadMaterials = useCallback(async () => {
    if (!levelId || !user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(undefined);

      // Fetch modules - akan menggunakan cache jika tersedia
      const modules = await getLearningModulesForExploration(levelId);
      setMaterials(modules);

      // Get current step
      const currentStep = await getUserCurrentStep(user.id, modules.length);
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

  // Preload next image
  useEffect(() => {
    if (materials.length > 0 && currentIndex < materials.length - 1) {
      const nextImage = new globalThis.Image();
      nextImage.src = materials[currentIndex + 1].imageUrl;
    }
  }, [currentIndex, materials]);

  // Update backend progress
  const updateBackendProgress = useCallback(async () => {
    if (!user?.id || materials.length === 0) return;

    try {
      await updateUserExplorationProgress(
        user.id,
        currentIndex,
        materials.length
      );
    } catch (error_) {
      // eslint-disable-next-line no-console
      console.error('Error updating backend progress:', error_);
    }
  }, [user?.id, currentIndex, materials.length]);

  // Update progress when index changes
  useEffect(() => {
    if (!isLoading && materials.length > 0) {
      updateLearningProgress(
        Number.parseInt(levelId),
        currentIndex,
        materials.length
      );
      updateBackendProgress();
    }
  }, [
    currentIndex,
    levelId,
    materials.length,
    isLoading,
    updateBackendProgress,
  ]);

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
    if (isTransitioning) return;

    if (isLastMateri) {
      setIsTransitioning(true);
      if (user?.id) {
        try {
          await updateUserExplorationProgress(
            user.id,
            materials.length - 1,
            materials.length
          );
        } catch (error_) {
          // eslint-disable-next-line no-console
          console.error('Error updating progress:', error_);
        }
      }
      refillLives();
      router.push('/eksplorasi');
    } else {
      setIsTransitioning(true);
      setCurrentIndex(prev => prev + 1);
      requestAnimationFrame(() => {
        setTimeout(() => setIsTransitioning(false), 200);
      });
    }
  }, [
    isLastMateri,
    router,
    refillLives,
    user?.id,
    materials.length,
    isTransitioning,
  ]);

  const handlePrev = useCallback(() => {
    if (isTransitioning || currentIndex === 0) return;

    setIsTransitioning(true);
    setCurrentIndex(prev => Math.max(0, prev - 1));
    requestAnimationFrame(() => {
      setTimeout(() => setIsTransitioning(false), 200);
    });
  }, [currentIndex, isTransitioning]);

  if (isPageLoading || authLoading) {
    return <LoadingScreen message="Halaman sedang dimuat..." />;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 font-sans text-xl font-bold">
        Memuat materi...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-100 p-4 text-center font-sans">
        <h2 className="text-2xl font-bold text-red-500">Error: {error}</h2>
        <button
          onClick={() => router.push('/eksplorasi')}
          className="mt-4 rounded-lg bg-blue-500 px-6 py-2 font-bold text-white"
        >
          Kembali
        </button>
      </div>
    );
  }

  if (!currentMateri || materials.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-100 p-4 text-center font-sans">
        <h2 className="text-2xl font-bold text-red-500">
          Materi tidak ditemukan!
        </h2>
        <button
          onClick={() => router.push('/eksplorasi')}
          className="mt-4 rounded-lg bg-blue-500 px-6 py-2 font-bold text-white"
        >
          Kembali
        </button>
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
      <div className="flex h-screen flex-col overflow-hidden bg-mobile-bg bg-cover bg-center font-sans md:bg-desktop-bg">
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
              <div className="my-4 flex h-52 w-full items-center justify-center rounded-2xl bg-input-bg shadow-inner md:h-64">
                <Image
                  src={currentMateri.imageUrl}
                  alt={`Isyarat untuk ${currentMateri.title}`}
                  width={250}
                  height={250}
                  className="object-contain"
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
            disabled={currentIndex === 0 || isTransitioning}
            className="max-w-xs flex-1 rounded-2xl border-4 border-brand-brown-stroke bg-white py-3 text-2xl font-bold text-brand-brown-stroke shadow-lg drop-shadow-comic-sm transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Kembali
          </button>
          <button
            onClick={handleNext}
            disabled={isTransitioning}
            className="max-w-xs flex-1 rounded-2xl bg-brand-yellow py-4 text-2xl font-bold text-brand-brown-stroke shadow-lg drop-shadow-comic-sm transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLastMateri ? 'Selesai!' : 'Lanjut'}
          </button>
        </footer>
      </div>
    </>
  );
}
