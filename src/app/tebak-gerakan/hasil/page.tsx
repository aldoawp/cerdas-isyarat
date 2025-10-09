// src/app/tebak-gerakan/hasil/page.tsx
'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FaTrophy,
  FaCheckCircle,
  FaTimesCircle,
  FaRedo,
  FaHome,
} from 'react-icons/fa';

// Komponen terpisah yang menggunakan useSearchParams
function HasilContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const score = searchParams.get('score') ?? '0';
  const correct = searchParams.get('correct') ?? '0';
  const total = searchParams.get('total') ?? '0';
  const incorrect = Number.parseInt(total, 10) - Number.parseInt(correct, 10);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-mobile-bg bg-cover bg-center p-4 font-sans md:bg-desktop-bg">
      <div className="w-full max-w-md rounded-3xl border-4 border-white/50 bg-gradient-to-br from-purple-100 via-blue-100 to-green-100 p-6 text-center shadow-2xl backdrop-blur-sm">
        <h1 className="font-comic text-4xl font-bold text-purple-800 drop-shadow-lg">
          Permainan Selesai!
        </h1>
        <p className="mt-2 font-sans text-gray-600">
          Kerja bagus! Ini hasil permainanmu:
        </p>

        <div className="my-8 flex flex-col items-center justify-center space-y-4">
          {/* Skor Akhir */}
          <div className="flex w-full items-center justify-between rounded-xl bg-white/50 p-4 shadow-md">
            <div className="flex items-center gap-3">
              <FaTrophy className="text-4xl text-yellow-500" />
              <span className="font-comic text-xl font-bold text-gray-700">
                Skor Akhir
              </span>
            </div>
            <span className="font-comic text-3xl font-extrabold text-purple-700">
              {score}
            </span>
          </div>

          {/* Jawaban Benar */}
          <div className="flex w-full items-center justify-between rounded-xl bg-white/50 p-4 shadow-md">
            <div className="flex items-center gap-3">
              <FaCheckCircle className="text-4xl text-green-500" />
              <span className="font-comic text-xl font-bold text-gray-700">
                Jawaban Benar
              </span>
            </div>
            <span className="font-comic text-3xl font-extrabold text-green-600">
              {correct} / {total}
            </span>
          </div>

          {/* Jawaban Salah */}
          <div className="flex w-full items-center justify-between rounded-xl bg-white/50 p-4 shadow-md">
            <div className="flex items-center gap-3">
              <FaTimesCircle className="text-4xl text-red-500" />
              <span className="font-comic text-xl font-bold text-gray-700">
                Jawaban Salah
              </span>
            </div>
            <span className="font-comic text-3xl font-extrabold text-red-600">
              {incorrect}
            </span>
          </div>
        </div>

        <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0">
          <button
            onClick={() => router.push('/tebak-gerakan')}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-blue-500 px-6 py-3 font-comic text-lg font-bold text-white shadow-lg transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
          >
            <FaRedo />
            Coba Lagi
          </button>
          <button
            onClick={() => router.push('/onboarding')}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gray-600 px-6 py-3 font-comic text-lg font-bold text-white shadow-lg transition hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75"
          >
            <FaHome />
            Beranda
          </button>
        </div>
      </div>
    </div>
  );
}

// Komponen utama dengan Suspense boundary
export default function HasilPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-mobile-bg bg-cover bg-center md:bg-desktop-bg">
          <div className="text-center">
            <div className="inline-block size-12 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent"></div>
            <p className="mt-4 font-comic text-xl text-purple-800">
              Memuat hasil...
            </p>
          </div>
        </div>
      }
    >
      <HasilContent />
    </Suspense>
  );
}
