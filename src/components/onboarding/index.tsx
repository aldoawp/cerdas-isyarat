'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import UserDetail from '@/components/userinfo/userinfo';
import Image from 'next/image';

// --- KOMPONEN IKON BARU YANG LEBIH SERU ---

// Ikon untuk Eksplorasi: Kaca pembesar yang lebih tebal dan playful
const FunSearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle cx="30" cy="26" r="18" stroke="white" strokeWidth="8" />
    <line
      x1="44.3431"
      y1="40"
      x2="58"
      y2="53.6569"
      stroke="white"
      strokeWidth="8"
      strokeLinecap="round"
    />
  </svg>
);

// Ikon untuk Game: Gamepad dengan gaya kartun dan ada bintangnya
const FunGamepadIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M51 22C57.0751 22 62 26.9249 62 33V43C62 49.0751 57.0751 54 51 54H13C6.92487 54 2 49.0751 2 43V33C2 26.9249 6.92487 22 13 22H51Z"
      fill="#A78BFA"
      stroke="white"
      strokeWidth="6"
    />
    <path
      d="M16 32V44"
      stroke="white"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22 38H10"
      stroke="white"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M42 42C44.2091 42 46 40.2091 46 38C46 35.7909 44.2091 34 42 34C39.7909 34 38 35.7909 38 38C38 40.2091 39.7909 42 42 42Z"
      fill="white"
    />
    <path
      d="M52 36C54.2091 36 56 34.2091 56 32C56 29.7909 54.2091 28 52 28C49.7909 28 48 29.7909 48 32C48 34.2091 49.7909 36 52 36Z"
      fill="white"
    />
    <path
      d="M13 22L21 10"
      stroke="white"
      strokeWidth="6"
      strokeLinecap="round"
    />
    <path
      d="M51 22L43 10"
      stroke="white"
      strokeWidth="6"
      strokeLinecap="round"
    />
  </svg>
);

// Ikon untuk Kamus: Buku terbuka dengan gambar hati, lebih ramah
const FunBookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M54 10V52C54 55.3137 51.3137 58 48 58H11C7.68629 58 5 55.3137 5 52V10C5 6.68629 7.68629 4 11 4H48C51.3137 4 54 6.68629 54 10Z"
      fill="#67E8F9"
      stroke="white"
      strokeWidth="6"
    />
    <path
      d="M32 58V4"
      stroke="white"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22 23C22 20 24 18 26.5 18C29 18 31.5 21 32 23C32.5 21 35 18 37.5 18C40 18 42 20 42 23C42 28 32 36 32 36C32 36 22 28 22 23Z"
      fill="#F472B6"
    />
  </svg>
);

// --- KOMPONEN TOMBOL MENU YANG SUDAH DITINGKATKAN ---
interface MenuButtonProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  colors: {
    bg: string;
    shadow: string;
    text: string;
  };
  delay: string;
}

const MenuButton = ({ href, icon, title, colors, delay }: MenuButtonProps) => (
  <Link
    href={href}
    className="animate-fade-in-up group relative"
    style={{ animationDelay: delay }}
  >
    {/* Bagian atas tombol dengan border, gradasi, dan efek hover yang lebih kuat */}
    <div
      className={`relative z-10 flex w-full items-center gap-4 rounded-2xl border-4 border-white/50 p-5 text-left font-bold transition-transform duration-300 ease-out group-hover:-translate-y-3 ${colors.bg} ${colors.text}`}
    >
      <div className="flex-shrink-0">{icon}</div>
      {/* Teks dengan font dan shadow yang lebih playful */}
      <span
        className="text-xl drop-shadow-md md:text-2xl"
        style={{
          fontFamily: '"Comic Sans MS", cursive',
          textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
        }}
      >
        {title}
      </span>
    </div>
    {/* Bagian bayangan 3D */}
    <div
      className={`absolute inset-0 rounded-2xl ${colors.shadow} translate-y-1`}
    ></div>
  </Link>
);

// --- KOMPONEN UTAMA HALAMAN ONBOARDING ---
export default function OnboardingPage() {
  const [firstName, setFirstName] = useState('');
  const router = useRouter();
  const textStrokeStyle = {
    WebkitTextStroke: '6px #CE7310',
    paintOrder: 'stroke fill',
  };

  useEffect(() => {
    const loggedInUserRaw = localStorage.getItem('loggedInUser');
    if (loggedInUserRaw) {
      const user = JSON.parse(loggedInUserRaw);
      const userFirstName = user.fullName.split(' ')[0];
      setFirstName(userFirstName);
    } else {
      router.push('/login');
    }
  }, [router]);

  if (!firstName) {
    return (
      <div className="grid min-h-screen place-items-center bg-mobile-bg bg-cover bg-center md:bg-desktop-bg">
        <p className="text-2xl font-bold text-white">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
              @keyframes fade-in-up {
                  0% { opacity: 0; transform: translateY(20px); }
                  100% { opacity: 1; transform: translateY(0); }
              }
              .animate-fade-in-up { animation: fade-in-up 0.6s both; }
            `}</style>

      <div className="relative min-h-screen overflow-hidden bg-mobile-bg bg-cover bg-center font-sans md:bg-desktop-bg">
        {/* USER DETAIL - Responsive positioning */}
        <header className="flex w-full justify-start p-4">
          <UserDetail />
        </header>

        {/* MAIN CONTENT - Centered with proper spacing */}
        <main className="flex min-h-[calc(100vh-140px)] items-center justify-center px-4 pb-4">
          <div className="z-10 w-full max-w-lg text-center">
            <div
              className="animate-fade-in-up mb-6 md:mb-8"
              style={{ animationDelay: '0.1s' }}
            >
              <h1
                className="text-4xl font-bold text-brand-yellow drop-shadow-lg md:text-6xl lg:text-7xl"
                style={textStrokeStyle}
              >
                Halo, {firstName}!
              </h1>
              <h2
                className="mt-2 text-lg font-bold text-subtitle-cream drop-shadow-lg md:text-xl lg:text-2xl"
                style={textStrokeStyle}
              >
                Ingin belajar apa kamu hari ini?
              </h2>
            </div>

            <div className="grid gap-4 md:gap-6">
              <MenuButton
                href="/materi"
                icon={<FunSearchIcon className="size-12 md:size-14" />}
                title="Eksplorasi Materi"
                colors={{
                  bg: 'bg-gradient-to-br from-orange-400 to-orange-500',
                  shadow: 'bg-orange-600',
                  text: 'text-white',
                }}
                delay="0.3s"
              />
              <MenuButton
                href="/tebak-gerakan"
                icon={<FunGamepadIcon className="size-12 md:size-14" />}
                title="Tebak Gerakan"
                colors={{
                  bg: 'bg-gradient-to-br from-purple-400 to-purple-500',
                  shadow: 'bg-purple-600',
                  text: 'text-white',
                }}
                delay="0.5s"
              />
              <MenuButton
                href="/kamus"
                icon={<FunBookIcon className="size-12 md:size-14" />}
                title="Kamus BISINDO"
                colors={{
                  bg: 'bg-gradient-to-br from-cyan-400 to-cyan-500',
                  shadow: 'bg-cyan-600',
                  text: 'text-white',
                }}
                delay="0.7s"
              />
            </div>
          </div>
        </main>

        {/* MASCOT - Fixed position */}
        <div className="pointer-events-none absolute bottom-0 right-0 z-20 w-32 md:w-48 lg:w-56 xl:w-64">
          <Image
            src="/images/mascot2.png"
            alt="Mascot Cerdas Isyarat"
            width={256}
            height={325}
            className="h-auto w-full"
            priority
          />
        </div>
      </div>
    </>
  );
}
