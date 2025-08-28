'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';

// --- Tipe Data (Digabungkan untuk contoh ini) ---
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

// --- Data Materi (Digabungkan untuk contoh ini) ---
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

// --- Logika Progress (Digabungkan untuk contoh ini) ---
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

// --- KOMPONEN UTAMA HALAMAN MATERI ---
export default function MateriPage() {
  const router = useRouter();
  const params = useParams();
  const levelId = Number(params.levelId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Mengambil data materi untuk level ini
  const materials = useMemo(() => materiData[levelId] || [], [levelId]);

  // Efek untuk memuat progress & index terakhir saat halaman pertama kali dibuka
  useEffect(() => {
    if (levelId && materials.length > 0) {
      const savedProgress = getProgress();
      const lastIndex = savedProgress.learningProgress[levelId]?.lastIndex ?? 0;
      setCurrentIndex(lastIndex);
      setIsLoading(false);
    }
  }, [levelId, materials.length]);

  // Efek untuk menyimpan progress setiap kali index berubah
  useEffect(() => {
    // Jangan simpan progress jika data belum dimuat
    if (!isLoading && materials.length > 0) {
      updateLearningProgress(levelId, currentIndex, materials.length);
    }
  }, [currentIndex, levelId, materials.length, isLoading]);

  const currentMateri = materials[currentIndex];
  const progressPercentage =
    materials.length > 0
      ? Math.round(((currentIndex + 1) / materials.length) * 100)
      : 0;
  const isLastMateri = currentIndex === materials.length - 1;

  const handleNext = useCallback(() => {
    if (isLastMateri) {
      // Jika ini materi terakhir, kembali ke halaman eksplorasi
      router.push('/eksplorasi');
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  }, [isLastMateri, router]);

  const handlePrev = useCallback(() => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        Memuat materi...
      </div>
    );
  }

  if (!currentMateri) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-100 p-4 text-center">
        <h2 className="text-2xl font-bold text-red-500">
          Materi tidak ditemukan!
        </h2>
        <p className="text-gray-600">
          Materi untuk level {levelId} tidak tersedia.
        </p>
        <button
          onClick={() => router.push('/eksplorasi')}
          className="mt-4 rounded-lg bg-blue-500 px-6 py-2 font-bold text-white"
        >
          Kembali ke Level
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-orange-50 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between bg-white p-4 shadow-md">
        <button
          onClick={() => router.push('/eksplorasi')}
          className="text-lg font-bold text-orange-500"
        >
          &larr; Kembali
        </button>
        <div className="w-1/2">
          <div className="h-4 w-full rounded-full bg-orange-200">
            <div
              className="h-4 rounded-full bg-green-500 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
        <div className="w-24 text-right font-bold text-gray-600">
          {currentIndex + 1} / {materials.length}
        </div>
      </header>

      {/* Konten Utama */}
      <main className="flex flex-1 flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-2xl rounded-3xl bg-white p-6 text-center shadow-2xl">
          <h1 className="mb-4 text-4xl font-bold text-brand-brown-stroke">
            {currentMateri.name}
          </h1>
          <div className="my-6 flex h-64 w-full items-center justify-center rounded-2xl bg-gray-100 shadow-inner md:h-80">
            <Image
              src={currentMateri.imageUrl}
              alt={`Isyarat untuk ${currentMateri.name}`}
              width={300}
              height={300}
              className="object-contain"
              priority
            />
          </div>
          <div className="rounded-lg bg-yellow-100 p-4">
            <h3 className="text-lg font-bold text-gray-700">Contoh Kalimat:</h3>
            <p
              className="text-xl text-gray-800"
              dangerouslySetInnerHTML={{
                __html: currentMateri.exampleSentence.replaceAll(
                  /\*\*(.*?)\*\*/g,
                  '<strong>$1</strong>'
                ),
              }}
            />
          </div>
        </div>
      </main>

      {/* Navigasi Footer */}
      <footer className="sticky bottom-0 flex justify-between bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="rounded-full bg-gray-300 px-8 py-3 font-bold text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Sebelumnya
        </button>
        <button
          onClick={handleNext}
          className="rounded-full bg-orange-500 px-8 py-3 font-bold text-white shadow-lg transition-transform hover:scale-105"
        >
          {isLastMateri ? 'Selesai & Kembali' : 'Selanjutnya'}
        </button>
      </footer>
    </div>
  );
}
