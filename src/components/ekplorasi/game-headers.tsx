'use client';

import BackButton from '@/components/shared/backbutton/backbutton';

// Tipe untuk properti yang diterima komponen ini
interface GameHeaderProps {
  currentIndex: number;
  totalQuestions: number;
  // [DIHAPUS] timeLeft tidak lagi diperlukan di header
  onBackClick: () => void; // Ini adalah fungsi untuk membuka modal peringatan
}

export const GameHeader = ({
  currentIndex,
  totalQuestions,
  onBackClick,
}: GameHeaderProps) => (
  <header className="flex items-center justify-between p-4">
    <div className="w-1/4">
      <BackButton onClick={onBackClick} />
    </div>

    {/* [DIUBAH] Paginasi titik diubah menjadi teks "Soal X / Y" */}
    <div className="flex w-1/2 items-center justify-center gap-2">
      <div className="flex items-center justify-center rounded-full bg-white/70 px-4 py-2 text-sm font-bold text-brand-brown-stroke shadow-md">
        Soal {currentIndex + 1} / {totalQuestions}
      </div>
    </div>

    {/* [DIHAPUS] Timer dipindahkan ke <main> di TestPage */}
    <div className="flex w-1/4 justify-center">
      {/* Dibiarkan kosong agar "Soal X / Y" tetap di tengah */}
    </div>
  </header>
);
