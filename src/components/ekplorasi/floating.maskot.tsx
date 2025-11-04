'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

// Pindahkan array ke luar komponen agar tidak dibuat ulang setiap render
const encouragements = [
  { text: 'Semangat!', emoji: '💪' },
  { text: 'Kamu bisa!', emoji: '✨' },
  { text: 'Fokus ya!', emoji: '🎯' },
  { text: 'Pelan-pelan aja!', emoji: '🤗' },
  { text: 'Keren banget!', emoji: '⭐' },
];

export const FloatingMascot = () => {
  const [currentEncouragement, setCurrentEncouragement] = useState(
    encouragements[0]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      // Ambil item acak dari array
      const randomIndex = Math.floor(Math.random() * encouragements.length);
      setCurrentEncouragement(encouragements[randomIndex]);
    }, 4000);

    // Bersihkan interval saat komponen dilepas
    return () => clearInterval(interval);
  }, []); // Dependency array sekarang bisa kosong karena 'encouragements' stabil

  return (
    // [DIUBAH] Posisi dipindahkan ke kiri bawah
    <div className="fixed bottom-6 left-6 z-30 animate-bounce">
      <div className="relative">
        <div className="mb-2 rounded-2xl bg-white px-4 py-2 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-lg">{currentEncouragement.emoji}</span>
            <span className="font-bold text-brand-brown-stroke">
              {currentEncouragement.text}
            </span>
          </div>
          <div className="absolute -bottom-1 left-6 size-3 rotate-45 bg-white"></div>
        </div>
        <div className="rounded-full bg-gradient-to-br from-brand-yellow to-orange-400 p-2 shadow-lg">
          <Image
            src="/images/maskot-netral.png"
            alt="Maskot"
            width={60}
            height={60}
            className="rounded-full"
          />
        </div>
      </div>
    </div>
  );
};
