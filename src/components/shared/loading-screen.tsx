import React from 'react';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({
  message = 'Loading...',
}: LoadingScreenProps) {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-mobile-bg bg-cover bg-center p-4 font-sans md:bg-desktop-bg">
      <div className="z-10 text-center">
        {/* Loading spinner */}
        <div className="mb-6 flex justify-center">
          <div className="size-16 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
        </div>

        {/* Loading text */}
        <div className="text-2xl font-bold text-white drop-shadow-lg">
          {message}
        </div>

        {/* Subtitle */}
        <div className="mt-2 text-lg text-amber-300 drop-shadow-lg">
          Mohon tunggu sebentar...
        </div>
      </div>

      {/* Background mascot (optional) */}
      <div className="pointer-events-none absolute bottom-0 right-0 z-20 w-36 opacity-30 md:w-52 lg:w-64 xl:w-72">
        <div className="h-auto w-full animate-pulse">
          <div className="h-64 w-full rounded-full bg-amber-500/20"></div>
        </div>
      </div>
    </div>
  );
}
