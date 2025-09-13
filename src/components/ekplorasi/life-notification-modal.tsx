'use client';

import React from 'react';
import { CloseIcon } from '@/components/icons';

interface LifeNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  remainingLives: number;
  hasProgressReset: boolean;
  reason: 'quit' | 'low_score' | 'time_up';
}

export const LifeNotificationModal: React.FC<LifeNotificationModalProps> = ({
  isOpen,
  onClose,
  remainingLives,
  hasProgressReset: _hasProgressReset,
  reason,
}) => {
  if (!isOpen) return undefined;

  const getReasonText = () => {
    switch (reason) {
      case 'quit': {
        return 'Anda keluar dari tes sebelum menyelesaikannya';
      }
      case 'low_score': {
        return 'Skor Anda di bawah 80%';
      }
      case 'time_up': {
        return 'Waktu tes telah habis';
      }
      default: {
        return 'Tes tidak berhasil diselesaikan';
      }
    }
  };

  const getIcon = () => {
    if (remainingLives === 0) {
      return '😢';
    }
    return '💔';
  };

  const getTitle = () => {
    if (remainingLives === 0) {
      return 'Semua Nyawa Habis!';
    }
    return 'Nyawa Berkurang';
  };

  const getMessage = () => {
    if (remainingLives === 0) {
      return (
        <div className="text-center">
          <p className="mb-4 text-lg text-gray-700">
            {getReasonText()}. Semua nyawa Anda telah habis.
          </p>
          <p className="mb-4 text-base text-gray-600">
            Kemajuan level Anda telah direset ke 0. Jangan menyerah! Pelajari
            materi dengan lebih baik dan coba lagi.
          </p>
          <p className="text-sm text-gray-500">
            Anda akan mendapatkan 3 nyawa baru setelah berhasil menyelesaikan
            level.
          </p>
        </div>
      );
    }

    return (
      <div className="text-center">
        <p className="mb-4 text-lg text-gray-700">
          {getReasonText()}. Satu nyawa telah dikurangi.
        </p>
        <p className="mb-4 text-base text-gray-600">
          Nyawa tersisa:{' '}
          <span className="font-bold text-red-600">{remainingLives}</span>
        </p>
        <p className="text-sm text-gray-500">
          Belajarlah dengan lebih baik untuk menghindari kehilangan nyawa lagi.
        </p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-4xl">{getIcon()}</span>
            <h2 className="text-xl font-bold text-brand-brown-stroke">
              {getTitle()}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <CloseIcon className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">{getMessage()}</div>

        {/* Action Button */}
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="rounded-xl bg-brand-brown-stroke px-8 py-3 font-semibold text-white transition-colors hover:bg-brand-brown-stroke/90"
          >
            {remainingLives === 0 ? 'Kembali ke Eksplorasi' : 'Mengerti'}
          </button>
        </div>
      </div>
    </div>
  );
};
