'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

// --- KOMPONEN IKON PANAH KIRI (Sesuai desain Anda) ---
const ArrowLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
    />
  </svg>
);

// --- Tipe props yang lebih fleksibel ---
interface BackButtonProps {
  href?: string; // Untuk navigasi langsung (seperti di halaman Eksplorasi)
  onClick?: () => void; // Untuk aksi custom (seperti membuka modal di halaman Tes)
}

const BackButton = ({ href, onClick }: BackButtonProps) => {
  const router = useRouter();

  // Fungsi ini akan menentukan aksi tombol secara cerdas
  const handleClick = () => {
    // Prioritas 1: Jalankan fungsi onClick jika ada.
    // Ini yang akan kita gunakan di halaman tes untuk memunculkan modal peringatan.
    if (onClick) {
      onClick();
    }
    // Prioritas 2: Navigasi ke href jika ada.
    else if (href) {
      router.push(href);
    }
    // Prioritas 3: Kembali ke halaman sebelumnya jika tidak ada keduanya.
    else {
      router.back();
    }
  };

  return (
    // Menggunakan styling dari Anda, tapi tanpa `position: fixed` agar bisa ditempatkan
    // di dalam header dengan benar di semua halaman.
    <button
      onClick={handleClick}
      className="flex size-14 items-center justify-center rounded-full border-4 border-input-border bg-amber-500 shadow-xl transition-transform hover:scale-110 active:scale-95"
      aria-label="Go back"
    >
      <ArrowLeftIcon className="size-8 text-white" />
    </button>
  );
};

export default BackButton;
