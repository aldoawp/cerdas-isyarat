'use client';

import React from 'react';

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
  if (!isOpen) return undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl border-4 border-white/50 bg-gradient-to-br from-orange-100 to-yellow-100 p-6 text-center font-comic shadow-2xl">
        <h2 className="text-3xl font-bold text-orange-800 drop-shadow-lg">
          📜 Cara Bermain 📜
        </h2>

        <div className="my-6 space-y-4 text-left font-sans text-base text-gray-700">
          <div className="flex items-start gap-4 rounded-xl bg-white/40 p-3">
            <span className="text-2xl">🎯</span>
            <div>
              <h3 className="font-bold">Tujuan Utama</h3>
              <p>
                Tebak semua gerakan bahasa isyarat huruf **A sampai Z** secara
                acak sebanyak-banyaknya dalam waktu **5 menit**.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-xl bg-white/40 p-3">
            <span className="text-2xl">📸</span>
            <div>
              <h3 className="font-bold">Posisi Tangan</h3>
              <p>
                Pastikan seluruh jari tanganmu terlihat jelas di dalam kolom
                kamera untuk hasil deteksi terbaik.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-xl bg-white/40 p-3">
            <span className="text-2xl">🔄</span>
            <div>
              <h3 className="font-bold">Reset Deteksi</h3>
              <p>
                Jika ingin mereset atau membatalkan pemeriksaan, cukup jauhkan
                tanganmu dari kolom kamera.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-xl bg-white/40 p-3">
            <span className="text-2xl">⏳</span>
            <div>
              <h3 className="font-bold">Cara Menjawab</h3>
              <p>
                Posisikan tanganmu Didalam Kamera. Tahan gerakan hingga progress
                bar &ldquo;Tahan Posisi&rdquo; muncul, lalu terus tahan sampai
                bar terisi penuh untuk menjawab.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse space-y-3 space-y-reverse sm:flex-row sm:space-x-4 sm:space-y-0">
          <button
            onClick={onCancel}
            className="w-full rounded-full bg-gray-500 px-6 py-3 font-comic text-lg font-bold text-white shadow-lg transition hover:bg-gray-600"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="w-full rounded-full bg-orange-500 px-6 py-3 font-comic text-lg font-bold text-white shadow-lg transition hover:bg-orange-600"
          >
            Mengerti & Mulai!
          </button>
        </div>
      </div>
    </div>
  );
}
