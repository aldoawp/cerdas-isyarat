"use client";

import React from 'react';
// 1. Import hook 'useRouter' dari next/navigation
import { useRouter } from 'next/navigation';

// --- KOMPONEN IKON PANAH KIRI ---
const ArrowLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
);

// --- KOMPONEN TOMBOL KEMBALI ---
const BackButton = ({ href }: { href?: string }) => {
    // 2. Inisialisasi router di dalam komponen
    const router = useRouter();

    // Fungsi untuk menangani klik.
    const handleClick = () => {
        if (href) {
            // 3. Ganti dengan router.push() untuk navigasi tanpa refresh
            router.push(href);
        } else {
            // 4. Ganti dengan router.back() untuk kembali tanpa refresh
            router.back();
        }
    };

    return (
        // Tombol diposisikan secara tetap di pojok kiri atas.
        <div className="fixed left-4 top-4 z-50">
            <button
                onClick={handleClick}
                className="flex size-16 items-center justify-center rounded-full border-4 border-input-border bg-[#F59E0B] shadow-xl transition-transform hover:scale-110 active:scale-95"
                aria-label="Go back"
            >
                {/* Ikon dibuat lebih besar dan warnanya diubah menjadi putih */}
                <ArrowLeftIcon className="size-9 text-white" />
            </button>
        </div>
    );
};

export default BackButton;