'use client';

import React, { useState, useEffect, useRef } from 'react';
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

const LoadingIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="animate-spin"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
    />
  </svg>
);

const ForwardIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d="M3 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062A1.125 1.125 0 013 16.81V8.688zM12.75 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062a1.125 1.125 0 01-1.683-.977V8.688z"
    />
  </svg>
);

const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
    />
  </svg>
);

const ExclamationIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
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
    isLoading,
    error,
    musicList,
    currentMusic,
    togglePlayPause,
    changeVolume,
    toggleMute,
    showControlsWithDelay,
    changeMusic,
    nextMusic,
  } = useMusic();

  const [showDropdown, setShowDropdown] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const tooltipTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  // Tooltip muncul setiap 5 detik jika user belum interact
  useEffect(() => {
    if (!hasUserInteracted && isClient && !isLoading && !error) {
      setShowTooltip(true);

      const hideTooltip = () => {
        setShowTooltip(false);
        tooltipTimerRef.current = setTimeout(() => {
          if (!hasUserInteracted) {
            setShowTooltip(true);
            hideTooltip();
          }
        }, 5000);
      };

      const hideTimer = setTimeout(hideTooltip, 2000);

      return () => {
        clearTimeout(hideTimer);
        if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
      };
    } else {
      setShowTooltip(false);
      if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
    }
  }, [hasUserInteracted, isClient, isLoading, error]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  if (!isClient) {
    return <div className="fixed right-4 top-4 size-14" />;
  }

  // PERUBAHAN: Tampilkan error state jika ada masalah dengan database
  if (error && !isLoading) {
    return (
      <div className="fixed right-2 top-2 z-[9999] sm:right-4 sm:top-4">
        <div className="flex items-center gap-2 rounded-full border-4 border-red-200 bg-red-500 px-4 py-2 shadow-xl">
          <ExclamationIcon className="size-6 flex-shrink-0 text-white" />
          <span className="text-xs text-white sm:text-sm">{error}</span>
        </div>
      </div>
    );
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    changeVolume(Number.parseFloat(e.target.value));
  };

  const handleMusicSelect = (musicId: string) => {
    changeMusic(musicId);
    setShowDropdown(false);
  };

  const handleToggleDropdown = () => {
    setShowDropdown(!showDropdown);
    showControlsWithDelay();
  };

  const handleNextMusic = () => {
    nextMusic();
    showControlsWithDelay();
  };

  const hasMultipleMusic = musicList.length > 1;

  return (
    <div className="fixed right-2 top-2 z-[9999] sm:right-4 sm:top-4">
      <div className="flex flex-row-reverse items-start gap-2 sm:gap-3">
        {/* Main Play Button */}
        <div className="relative">
          <button
            onClick={togglePlayPause}
            disabled={isLoading || !!error}
            className={`group relative flex size-12 items-center justify-center overflow-hidden rounded-full border-4 border-input-border bg-amber-500 shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50 sm:size-14 ${!hasUserInteracted && !isLoading && !error ? 'animate-pulse ring-2 ring-white/50' : ''}`}
            aria-label={isPlaying ? 'Pause music' : 'Play music'}
          >
            {isPlaying && (
              <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20" />
            )}
            <div className="relative z-10">
              {isLoading ? (
                <LoadingIcon className="size-6 text-white sm:size-7" />
              ) : isPlaying ? (
                <SpeakerWaveIcon className="size-6 text-white sm:size-7" />
              ) : hasUserInteracted ? (
                <SpeakerXMarkIcon className="size-6 text-white/70 transition-colors duration-300 group-hover:text-white sm:size-7" />
              ) : (
                <PlayIcon className="size-6 text-white/70 transition-colors duration-300 group-hover:text-white sm:size-7" />
              )}
            </div>
          </button>

          {/* Tooltip */}
          {showTooltip && !hasUserInteracted && !isLoading && !error && (
            <div className="absolute -bottom-20 right-0 w-44 animate-bounce rounded-lg bg-amber-600 px-3 py-2 text-xs text-white shadow-lg sm:w-48">
              <div className="absolute -top-2 right-4 size-0 border-x-8 border-b-8 border-x-transparent border-b-amber-600" />
              Klik tombol ini untuk memulai musik! 🎵
            </div>
          )}
        </div>

        {/* Controls Panel - Hanya tampil jika tidak ada error */}
        {!error && (
          <div
            className={`relative overflow-visible transition-all duration-500 ease-out ${controlsVisible ? 'max-w-2xl opacity-100' : 'max-w-0 opacity-0'}`}
          >
            <div className="flex flex-col gap-0 rounded-3xl border-2 border-input-border bg-amber-500/90 shadow-xl backdrop-blur-sm">
              {/* Volume Controls - Top Part */}
              <div className="flex items-center gap-2 px-2 py-1.5 sm:gap-3 sm:px-3 sm:py-2">
                <button
                  onClick={toggleMute}
                  className="group rounded-full p-1 transition-colors duration-200 hover:bg-black/20 focus:outline-none"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? (
                    <SpeakerXMarkIcon className="size-4 text-white/70 transition-colors group-hover:text-white sm:size-5" />
                  ) : (
                    <SpeakerWaveIcon className="size-4 text-white transition-colors group-hover:text-amber-300 sm:size-5" />
                  )}
                </button>

                <div className="relative w-16 sm:w-20">
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

                <span className="min-w-7 text-right text-xs font-medium text-white sm:min-w-8">
                  {Math.round((isMuted ? 0 : volume) * 100)}%
                </span>
              </div>

              {/* Music Selector - Bottom Part (always shown when there's music) */}
              {hasMultipleMusic && (
                <>
                  {/* Divider */}
                  <div className="mx-3 h-px bg-white/30" />

                  {/* Music controls */}
                  <div className="relative flex items-center gap-1.5 px-2 py-1.5 sm:gap-2 sm:px-3 sm:py-2">
                    <div className="relative flex-1" ref={dropdownRef}>
                      <button
                        onClick={handleToggleDropdown}
                        className="flex w-full items-center justify-between gap-1 rounded-full px-2 py-0.5 text-xs text-white transition-colors hover:bg-black/20 sm:gap-1.5 sm:py-1"
                        aria-label="Select music"
                      >
                        <span className="truncate text-xs font-medium sm:text-sm">
                          {currentMusic?.title || 'Select Music'}
                        </span>
                        <ChevronDownIcon
                          className={`size-3 flex-shrink-0 transition-transform sm:size-4 ${showDropdown ? 'rotate-180' : ''}`}
                        />
                      </button>

                      {/* Dropdown Menu */}
                      {showDropdown && (
                        <div
                          className="absolute inset-x-0 top-full z-[100] mt-2 rounded-lg border-2 border-amber-400 bg-white shadow-2xl"
                          style={{ position: 'absolute' }}
                        >
                          <div className="max-h-56 overflow-y-auto rounded-lg sm:max-h-64">
                            {musicList.map(music => (
                              <button
                                key={music.music_id}
                                onClick={() =>
                                  handleMusicSelect(music.music_id)
                                }
                                className={`w-full px-3 py-2 text-left text-xs transition-colors first:rounded-t-lg last:rounded-b-lg hover:bg-amber-50 sm:px-4 sm:py-2.5 sm:text-sm ${
                                  currentMusic?.music_id === music.music_id
                                    ? 'bg-amber-100 font-semibold text-amber-700'
                                    : 'text-gray-700'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="truncate">
                                    {music.title}
                                  </span>
                                  {currentMusic?.music_id ===
                                    music.music_id && (
                                    <span className="ml-1 text-amber-600 sm:ml-2">
                                      ♪
                                    </span>
                                  )}
                                </div>
                                {music.description && (
                                  <p className="mt-0.5 truncate text-xs text-gray-500">
                                    {music.description}
                                  </p>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleNextMusic}
                      className="rounded-full p-1 text-white transition-colors hover:bg-black/20 sm:p-1.5"
                      aria-label="Next music"
                      title="Next music"
                    >
                      <ForwardIcon className="size-3.5 sm:size-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicPlayer;
