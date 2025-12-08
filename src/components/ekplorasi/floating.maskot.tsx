'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

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
      const randomIndex = Math.floor(Math.random() * encouragements.length);
      setCurrentEncouragement(encouragements[randomIndex]);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-4 left-4 z-30 animate-bounce md:bottom-8 md:left-8">
      <div className="relative">
        {/* Speech Bubble */}
        <div className="mb-2 rounded-2xl bg-white px-3 py-2 shadow-lg md:px-4 md:py-2">
          <div className="flex items-center gap-2">
            <span className="text-base md:text-lg">
              {currentEncouragement.emoji}
            </span>
            <span className="text-sm font-bold text-brand-brown-stroke md:text-base">
              {currentEncouragement.text}
            </span>
          </div>
          <div className="absolute -bottom-1 left-4 size-3 rotate-45 bg-white md:left-6"></div>
        </div>

        {/* Mascot Image - Tanpa lingkaran kuning */}
        <div className="ml-2">
          <Image
            src="/images/semangat.png"
            alt="Maskot"
            width={100}
            height={100}
            className="size-20 rounded-full drop-shadow-lg md:size-24 lg:size-28"
          />
        </div>
      </div>
    </div>
  );
};
