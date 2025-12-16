'use client';

import React, { useState, useEffect } from 'react';
import UserDetail from '@/components/shared/userinfo';
import Image from 'next/image';
import FunBookIcon from '@/components/icons/fun-book-icon';
import FunGamepadIcon from '@/components/icons/fun-gamepad-icon';
import FunSearchIcon from '@/components/icons/fun-search-icon';
import useScreenSize from '@/lib/hooks/use-screen-size';
import MenuButton from '@/components/onboarding/menu-button';
import { useRequireAuth, usePageLoading } from '@/lib/contexts/auth-context';
import LoadingScreen from '@/components/shared/loading-screen';
import { getUserData } from '@/components/shared/userinfo';
import { useMascot } from '@/lib/hooks/use-mascot';

export default function OnboardingPage() {
  const [firstName, setFirstName] = useState('');
  const screenSize = useScreenSize();
  const { loading: authLoading } = useRequireAuth();
  const { isPageLoading } = usePageLoading();

  // Fetch mascot dari Supabase
  const { mascotUrl } = useMascot(
    'onboarding',
    'bottom-right',
    '/images/mascot2.png'
  );

  useEffect(() => {
    const userData = getUserData();
    if (userData?.fullName) {
      const firstWord = userData.fullName.split(' ')[0];
      setFirstName(firstWord);
    } else {
      setFirstName('Kamu');
    }
  }, []);

  if (isPageLoading || authLoading) {
    return <LoadingScreen message="Halaman sedang dimuat..." />;
  }

  if (!firstName) {
    return (
      <div className="page-container grid min-h-screen place-items-center">
        <p className="text-2xl font-bold text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div className="page-container relative min-h-screen overflow-hidden font-sans">
      <header className="flex w-full justify-start p-4">
        <UserDetail
          mode={screenSize === 'mobile' ? 'sidebar' : 'card'}
          className={screenSize === 'mobile' ? '' : 'w-full max-w-md'}
        />
      </header>

      <main className="flex min-h-[calc(100vh-140px)] items-center justify-center px-4 pb-4">
        <div className="z-10 w-full max-w-lg text-center">
          <div className="mb-6 animate-fade-in-up [animation-delay:0.1s] md:mb-8">
            <h1 className="text-4xl font-bold text-brand-yellow drop-shadow-lg text-stroke-md md:text-6xl lg:text-7xl">
              Halo, {firstName}!
            </h1>
            <h2 className="mt-2 text-lg font-bold text-subtitle-cream drop-shadow-lg text-stroke md:text-xl lg:text-2xl">
              Ingin belajar apa kamu hari ini?
            </h2>
          </div>

          <div className="grid gap-4 md:gap-6">
            <MenuButton
              href="/eksplorasi"
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
              href="/intro-tebak-gerakan"
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

      {/* Dynamic Mascot */}
      {mascotUrl && (
        <div className="pointer-events-none absolute bottom-0 right-0 z-20 w-48 md:w-64 lg:w-72 xl:w-80">
          <Image
            src={mascotUrl}
            alt="Mascot Cerdas Isyarat"
            width={256}
            height={325}
            className="h-auto w-full"
            priority
          />
        </div>
      )}
    </div>
  );
}
