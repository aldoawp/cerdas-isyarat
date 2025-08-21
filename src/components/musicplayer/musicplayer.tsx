'use client';

import React from 'react';
import { useMusic } from './music-context';

// --- KOMPONEN IKON ---
const SpeakerWaveIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
    />
  </svg>
);
const SpeakerXMarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
    />
  </svg>
);
const PlayIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
    />
  </svg>
);

// Komponen Music Player
const MusicPlayer = () => {
  const {
    isPlaying,
    volume,
    isMuted,
    controlsVisible,
    hasUserInteracted,
    isClient,
    togglePlayPause,
    changeVolume,
    toggleMute,
  } = useMusic();

  if (!isClient) {
    return <div className="fixed right-4 top-4 size-14" />;
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    changeVolume(Number.parseFloat(e.target.value));
  };

  return (
    <div className="fixed right-4 top-4 z-50">
      <div className="flex flex-row-reverse items-center space-x-2 space-x-reverse">
        <div className="relative">
          <button
            onClick={togglePlayPause}
            // FIX: Gaya disamakan dengan BackButton
            className={`group relative flex size-14 items-center justify-center overflow-hidden rounded-full border-4 border-input-border bg-amber-500 shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-110 ${hasUserInteracted ? '' : 'animate-pulse ring-2 ring-white/50'}`}
            aria-label={isPlaying ? 'Pause music' : 'Play music'}
          >
            {isPlaying && (
              <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20" />
            )}
            <div className="relative z-10">
              {isPlaying ? (
                <SpeakerWaveIcon className="size-7 text-white" />
              ) : hasUserInteracted ? (
                <SpeakerXMarkIcon className="size-7 text-white/70 transition-colors duration-300 group-hover:text-white" />
              ) : (
                <PlayIcon className="size-7 text-white/70 transition-colors duration-300 group-hover:text-white" />
              )}
            </div>
          </button>
        </div>
        <div
          className={`overflow-hidden transition-all duration-500 ease-out ${controlsVisible ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0'}`}
        >
          {/* FIX: Gaya kontrol volume disesuaikan */}
          <div className="flex items-center space-x-3 rounded-full border-2 border-input-border bg-amber-500/90 p-2 shadow-xl backdrop-blur-sm">
            <button
              onClick={toggleMute}
              className="group rounded-full p-1 transition-colors duration-200 hover:bg-black/20 focus:outline-none"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <SpeakerXMarkIcon className="size-5 text-white/70 transition-colors group-hover:text-white" />
              ) : (
                <SpeakerWaveIcon className="size-5 text-white transition-colors group-hover:text-amber-300" />
              )}
            </button>
            <div className="relative w-20">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full"
                style={{
                  background: `linear-gradient(to right, white 0%, white ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) 100%)`,
                }}
                aria-label="Volume slider"
              />
            </div>
            <span className="min-w-8 text-right font-comic text-xs text-white">
              {Math.round((isMuted ? 0 : volume) * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
