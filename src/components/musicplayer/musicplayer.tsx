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

const MusicIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
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
    isClient, // Untuk mengatasi hydration
    togglePlayPause,
    changeVolume,
    toggleMute,
  } = useMusic();

  // Jangan render apapun sebelum hydration selesai
  if (!isClient) {
    return <div className="fixed right-4 top-4 size-14" />; // Placeholder untuk menghindari layout shift
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    changeVolume(Number.parseFloat(e.target.value));
  };

  const handlePlayPause = async () => {
    await togglePlayPause();
  };

  return (
    <>
      {/* Music Player Controls */}
      <div className="fixed right-4 top-4 z-50 flex flex-row-reverse items-center space-x-2 space-x-reverse">
        {/* Main Play Button */}
        <div className="relative">
          <button
            onClick={handlePlayPause}
            className={`group relative flex size-14 items-center justify-center overflow-hidden rounded-full border border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-110 ${hasUserInteracted ? '' : 'animate-pulse ring-2 ring-orange-500/50'} ${isPlaying ? 'shadow-orange-500/20' : 'shadow-slate-900/50'}`}
            aria-label={isPlaying ? 'Pause music' : 'Play music'}
          >
            {/* Glow effect untuk playing state */}
            {isPlaying && (
              <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20" />
            )}

            {/* Icon */}
            <div className="relative z-10">
              {isPlaying ? (
                <SpeakerWaveIcon className="size-7 text-orange-500" />
              ) : hasUserInteracted ? (
                <SpeakerXMarkIcon className="size-7 text-slate-400 transition-colors duration-300 group-hover:text-orange-500" />
              ) : (
                <PlayIcon className="size-7 text-slate-400 transition-colors duration-300 group-hover:text-orange-500" />
              )}
            </div>

            {/* Ripple effect */}
            {!hasUserInteracted && (
              <div className="absolute inset-0 animate-ping rounded-full border-2 border-orange-500/30" />
            )}
          </button>

          {/* Tooltip untuk first time */}
          {!hasUserInteracted && (
            <div className="absolute -bottom-16 right-0 whitespace-nowrap rounded-lg border border-slate-700/50 bg-gradient-to-r from-slate-900 to-slate-800 px-3 py-2 text-xs text-white shadow-xl backdrop-blur-sm before:absolute before:right-4 before:top-0 before:-translate-y-full before:border-x-4 before:border-b-4 before:border-x-transparent before:border-b-slate-800 before:content-['']">
              <div className="flex items-center space-x-2">
                <MusicIcon className="size-3 text-orange-500" />
                <span>Klik untuk mulai musik</span>
              </div>
            </div>
          )}
        </div>

        {/* Volume Controls */}
        <div
          className={`overflow-hidden transition-all duration-500 ease-out ${
            controlsVisible ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0'
          }`}
        >
          <div className="flex items-center space-x-3 rounded-full border border-slate-700/50 bg-gradient-to-br from-slate-800/95 to-slate-900/95 p-3 shadow-xl backdrop-blur-sm">
            <button
              onClick={toggleMute}
              className="group rounded-full p-1 transition-colors duration-200 hover:bg-slate-700/50 focus:outline-none"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <SpeakerXMarkIcon className="size-5 text-slate-400 transition-colors group-hover:text-red-400" />
              ) : (
                <SpeakerWaveIcon className="size-5 text-orange-500 transition-colors group-hover:text-orange-400" />
              )}
            </button>

            {/* Custom Volume Slider */}
            <div className="relative w-20">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="slider-thumb:appearance-none slider-thumb:size-3 slider-thumb:rounded-full slider-thumb:bg-orange-500 slider-thumb:cursor-pointer slider-thumb:shadow-lg h-1 w-full cursor-pointer appearance-none rounded-full bg-slate-600"
                style={{
                  background: `linear-gradient(to right, #f97316 0%, #f97316 ${(isMuted ? 0 : volume) * 100}%, #475569 ${(isMuted ? 0 : volume) * 100}%, #475569 100%)`,
                }}
                aria-label="Volume slider"
              />
            </div>

            {/* Volume percentage */}
            <span className="min-w-8 text-right font-mono text-xs text-slate-400">
              {Math.round((isMuted ? 0 : volume) * 100)}%
            </span>
          </div>
        </div>

        {/* Playing indicator */}
        {isPlaying && (
          <div className="absolute -right-2 -top-2 size-3 animate-pulse rounded-full border-2 border-white bg-green-500 shadow-lg" />
        )}
      </div>
    </>
  );
};

export default MusicPlayer;
