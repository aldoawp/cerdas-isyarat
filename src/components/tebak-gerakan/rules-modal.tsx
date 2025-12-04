'use client';

import React, { useState, useEffect } from 'react';

interface Rule {
  icon: string;
  title: string;
  description: string;
}

const rules: Rule[] = [
  {
    icon: '🎯',
    title: 'Tujuan Utama',
    description:
      'Tebak semua gerakan bahasa isyarat huruf A sampai Z secara acak sebanyak-banyaknya dalam waktu 5 menit.',
  },
  {
    icon: '📸',
    title: 'Posisi Tangan',
    description:
      'Pastikan seluruh jari tanganmu terlihat jelas di dalam kolom kamera untuk hasil deteksi terbaik.',
  },
  {
    icon: '🔄',
    title: 'Reset Deteksi',
    description:
      'Jika ingin mereset atau membatalkan pemeriksaan, cukup jauhkan tanganmu dari kolom kamera.',
  },
  {
    icon: '⏳',
    title: 'Cara Menjawab',
    description:
      'Posisikan tanganmu di dalam kamera. Tahan gerakan hingga progress bar "Tahan Posisi" muncul, lalu terus tahan sampai bar terisi penuh untuk menjawab.',
  },
];

interface RulesModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function RulesModal({
  isOpen,
  onConfirm,
  onCancel,
}: RulesModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reset to first step when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  if (!isOpen) return undefined;

  const handleNext = () => {
    if (currentStep < rules.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onConfirm();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onConfirm();
  };

  // Desktop: Show all rules at once
  if (!isMobile) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <div className="w-full max-w-2xl rounded-3xl border-4 border-white/50 bg-gradient-to-br from-orange-100 to-yellow-100 p-6 text-center font-comic shadow-2xl">
          <h2 className="text-3xl font-bold text-orange-800 drop-shadow-lg">
            📜 Cara Bermain 📜
          </h2>

          <div className="my-6 space-y-4 text-left text-base text-gray-700">
            {rules.map((rule, index) => (
              <div
                key={index}
                className="flex items-start gap-4 rounded-xl bg-white/40 p-3"
              >
                <span className="text-2xl">{rule.icon}</span>
                <div>
                  <h3 className="font-bold">{rule.title}</h3>
                  <p>{rule.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col-reverse space-y-3 space-y-reverse sm:flex-row sm:space-x-4 sm:space-y-0">
            <button
              onClick={onCancel}
              className="w-full rounded-full bg-gray-500 px-6 py-3 text-lg font-bold text-white shadow-lg transition hover:bg-gray-600"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              className="w-full rounded-full bg-orange-500 px-6 py-3 text-lg font-bold text-white shadow-lg transition hover:bg-orange-600"
            >
              Mengerti & Mulai!
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Mobile: Show one rule at a time with pagination
  const currentRule = rules[currentStep];
  const isLastStep = currentStep === rules.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-sm rounded-2xl border-4 border-white/50 bg-gradient-to-br from-orange-100 to-yellow-100 p-5 text-center shadow-2xl">
        {/* Header */}
        <h2 className="mb-1 text-xl font-bold text-orange-800 drop-shadow-lg">
          📜 Cara Bermain
        </h2>

        {/* Progress Indicator */}
        <div className="mb-4 flex justify-center gap-1.5">
          {rules.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 w-8 rounded-full transition-all ${
                index === currentStep
                  ? 'scale-110 bg-orange-500'
                  : index < currentStep
                    ? 'bg-orange-300'
                    : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Rule Card with Animation */}
        <div className="mb-5 min-h-[240px] rounded-xl bg-white/40 p-4 text-left">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-bounce text-5xl">{currentRule.icon}</div>
            <h3 className="text-lg font-bold text-gray-800">
              {currentRule.title}
            </h3>
            <p className="text-sm leading-relaxed text-gray-700">
              {currentRule.description}
            </p>
          </div>
        </div>

        {/* Skip Button - Top Right */}
        {!isLastStep && (
          <button
            onClick={handleSkip}
            className="absolute right-3 top-3 rounded-full bg-gray-400/80 px-3 py-1 text-xs font-bold text-white transition hover:bg-gray-500"
          >
            Lewati
          </button>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-2">
          {currentStep > 0 && (
            <button
              onClick={handlePrev}
              className="flex-1 rounded-full bg-gray-400 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-gray-500"
            >
              ← Kembali
            </button>
          )}

          <button
            onClick={handleNext}
            className="flex-1 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 py-2.5 text-sm font-bold text-white shadow-lg transition hover:from-orange-600 hover:to-yellow-600"
          >
            {isLastStep ? '🚀 Mulai Sekarang!' : 'Lanjut →'}
          </button>
        </div>

        {/* Cancel Button */}
        <button
          onClick={onCancel}
          className="mt-2 w-full rounded-full border-2 border-gray-400 bg-transparent py-2 text-sm font-bold text-gray-600 transition hover:bg-gray-100"
        >
          Batal
        </button>
      </div>
    </div>
  );
}
