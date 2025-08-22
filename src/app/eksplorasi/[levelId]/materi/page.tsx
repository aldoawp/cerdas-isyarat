'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { refillLives } from '@/components/userinfo/userinfo';
import BackButton from '../../../../components/backbutton/backbutton'; // [DITAMBAHKAN] Impor komponen BackButton

// --- Tipe Data & Logika Progress ---
interface MateriItem {
  id: string;
  name: string;
  imageUrl: string;
  exampleSentence: string;
}
interface LevelProgress {
  progress: number;
  lastIndex: number;
}
interface UserProgress {
  completedLevelIds: number[];
  learningProgress: { [levelId: number]: LevelProgress };
}
const materiData: { [levelId: number]: MateriItem[] } = {
  1: [
    {
      id: '1a',
      name: 'Huruf A',
      imageUrl: '/images/materi/placeholder.png',
      exampleSentence: 'Saya suka **A**pel.',
    },
    {
      id: '1b',
      name: 'Huruf B',
      imageUrl: '/images/materi/placeholder.png',
      exampleSentence: 'Ini **B**ola baru.',
    },
    {
      id: '1c',
      name: 'Huruf C',
      imageUrl: '/images/materi/placeholder.png',
      exampleSentence: '**C**icak di dinding.',
    },
    {
      id: '1d',
      name: 'Huruf D',
      imageUrl: '/images/materi/placeholder.png',
      exampleSentence: 'Itu **D**omba putih.',
    },
    {
      id: '1e',
      name: 'Huruf E',
      imageUrl: '/images/materi/placeholder.png',
      exampleSentence: '**E**lang terbang tinggi.',
    },
  ],
  2: [
    {
      id: '2f',
      name: 'Huruf F',
      imageUrl: '/images/materi/placeholder.png',
      exampleSentence: '**F**oto keluarga kami.',
    },
    {
      id: '2g',
      name: 'Huruf G',
      imageUrl: '/images/materi/placeholder.png',
      exampleSentence: 'Dia punya **G**ajah mainan.',
    },
    {
      id: '2h',
      name: 'Huruf H',
      imageUrl: '/images/materi/placeholder.png',
      exampleSentence: 'Hari ini **H**ujan.',
    },
    {
      id: '2i',
      name: 'Huruf I',
      imageUrl: '/images/materi/placeholder.png',
      exampleSentence: 'Adik makan **I**kan.',
    },
    {
      id: '2j',
      name: 'Huruf J',
      imageUrl: '/images/materi/placeholder.png',
      exampleSentence: 'Aku suka **J**eruk.',
    },
  ],
  3: [
    {
      id: '3a',
      name: 'Apa?',
      imageUrl: '/images/materi/placeholder.png',
      exampleSentence: '**Apa** warna bajumu?',
    },
    {
      id: '3b',
      name: 'Siapa?',
      imageUrl: '/images/materi/placeholder.png',
      exampleSentence: '**Siapa** nama ibumu?',
    },
    {
      id: '3c',
      name: 'Di mana?',
      imageUrl: '/images/materi/placeholder.png',
      exampleSentence: '**Di mana** kamu tinggal?',
    },
    {
      id: '3d',
      name: 'Kapan?',
      imageUrl: '/images/materi/placeholder.png',
      exampleSentence: '**Kapan** kamu lahir?',
    },
    {
      id: '3e',
      name: 'Mengapa?',
      imageUrl: '/images/materi/placeholder.png',
      exampleSentence: '**Mengapa** kamu sedih?',
    },
    {
      id: '3f',
      name: 'Bagaimana?',
      imageUrl: '/images/materi/placeholder.png',
      exampleSentence: '**Bagaimana** cara membuatnya?',
    },
  ],
  4: [
    {
      id: '4a',
      name: 'Halo',
      imageUrl: '/images/materi/placeholder.png',
      exampleSentence: '**Halo**, apa kabar?',
    },
    {
      id: '4b',
      name: 'Selamat Pagi',
      imageUrl: '/images/materi/placeholder.png',
      exampleSentence: '**Selamat Pagi**, Ayah.',
    },
    {
      id: '4c',
      name: 'Terima Kasih',
      imageUrl: '/images/materi/placeholder.png',
      exampleSentence: '**Terima kasih** atas hadiahnya.',
    },
    {
      id: '4d',
      name: 'Maaf',
      imageUrl: '/images/materi/placeholder.png',
      exampleSentence: '**Maaf**, aku tidak sengaja.',
    },
    {
      id: '4e',
      name: 'Sampai Jumpa',
      imageUrl: '/images/materi/placeholder.png',
      exampleSentence: '**Sampai jumpa** besok!',
    },
  ],
};
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
  const levelId = Number(params.levelId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const materials = useMemo(() => materiData[levelId] || [], [levelId]);

  useEffect(() => {
    if (levelId && materiData[levelId]) {
      const savedProgress = getProgress();
      const lastIndex = savedProgress.learningProgress[levelId]?.lastIndex ?? 0;
      setCurrentIndex(lastIndex);
    }
    setIsLoading(false);
  }, [levelId]);

  useEffect(() => {
    if (!isLoading && materials.length > 0) {
      updateLearningProgress(levelId, currentIndex, materials.length);
    }
  }, [currentIndex, levelId, materials.length, isLoading]);

  const handleBackClick = () => setIsModalOpen(true);
  const handleConfirmBack = () => router.push('/eksplorasi');
  const handleCancelBack = () => setIsModalOpen(false);
  const currentMateri = materials[currentIndex];
  const progressPercentage =
    materials.length > 0
      ? Math.round(((currentIndex + 1) / materials.length) * 100)
      : 0;
  const isLastMateri = currentIndex === materials.length - 1;

  const handleNext = useCallback(() => {
    if (isLastMateri) {
      refillLives();
      router.push('/eksplorasi');
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  }, [isLastMateri, router]);

  const handlePrev = useCallback(() => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  }, []);

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 font-sans text-xl font-bold">
        Memuat materi...
      </div>
    );
  if (!currentMateri)
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
          {/* [DIUBAH] Menggunakan komponen BackButton */}
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
          <div className="w-full max-w-2xl rounded-3xl bg-form-bg p-6 text-center shadow-2xl drop-shadow-comic">
            <h1 className="text-5xl font-bold text-brand-yellow drop-shadow-lg text-stroke-base md:text-6xl">
              {currentMateri.name}
            </h1>
            <div className="my-4 flex h-52 w-full items-center justify-center rounded-2xl bg-input-bg shadow-inner md:h-64">
              <Image
                src={currentMateri.imageUrl}
                alt={`Isyarat untuk ${currentMateri.name}`}
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
                  __html: currentMateri.exampleSentence.replaceAll(
                    /\*\*(.*?)\*\*/g,
                    '<strong class="text-brand-brown-stroke">$1</strong>'
                  ),
                }}
              />
            </div>
          </div>
        </main>
        <footer className="flex items-center justify-center gap-6 p-4">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="max-w-xs flex-1 rounded-2xl border-4 border-brand-brown-stroke bg-white py-3 text-2xl font-bold text-brand-brown-stroke shadow-lg drop-shadow-comic-sm transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Kembali
          </button>
          <button
            onClick={handleNext}
            className="max-w-xs flex-1 rounded-2xl bg-brand-yellow py-4 text-2xl font-bold text-brand-brown-stroke shadow-lg drop-shadow-comic-sm transition-transform hover:scale-105"
          >
            {isLastMateri ? 'Selesai!' : 'Lanjut'}
          </button>
        </footer>
      </div>
    </>
  );
}
