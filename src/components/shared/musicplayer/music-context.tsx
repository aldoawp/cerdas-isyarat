'use client';

import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
} from 'react';

// --- GLOBAL STATE MANAGEMENT ---
// Deklarasi ini memberitahu TypeScript tentang properti yang kita tambahkan ke object global.
declare global {
  interface Window {
    audioInstance_cerdasisyarat?: HTMLAudioElement;
    musicState_cerdasisyarat?: {
      isPlaying: boolean;
      volume: number;
      isMuted: boolean;
      currentTime: number;
      hasUserInteracted: boolean;
    };
  }
}

// Fungsi untuk mendapatkan atau membuat SATU instansi audio global
const getAudioInstance = (): HTMLAudioElement | undefined => {
  // FIX: Menggunakan perbandingan langsung dengan undefined
  if (globalThis === undefined || globalThis.window === undefined)
    return undefined;

  if (!globalThis.window.audioInstance_cerdasisyarat) {
    const audio = new Audio('/music/music1.mp3');
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0.3; // Set volume awal
    globalThis.window.audioInstance_cerdasisyarat = audio;

    // Inisialisasi state global
    if (!globalThis.window.musicState_cerdasisyarat) {
      globalThis.window.musicState_cerdasisyarat = {
        isPlaying: false,
        volume: 0.3,
        isMuted: false,
        currentTime: 0,
        hasUserInteracted: false,
      };
    }
  }
  return globalThis.window.audioInstance_cerdasisyarat;
};

// Helper untuk mendapatkan state global
const getGlobalState = () => {
  // FIX: Menggunakan perbandingan langsung dengan undefined
  if (
    globalThis === undefined ||
    globalThis.window === undefined ||
    !globalThis.window.musicState_cerdasisyarat
  ) {
    return {
      isPlaying: false,
      volume: 0.3,
      isMuted: false,
      currentTime: 0,
      hasUserInteracted: false,
    };
  }
  return globalThis.window.musicState_cerdasisyarat;
};

// Helper untuk update state global
const updateGlobalState = (
  updates: Partial<
    NonNullable<typeof globalThis.window.musicState_cerdasisyarat>
  >
) => {
  // FIX: Menggunakan perbandingan langsung dengan undefined
  if (
    globalThis !== undefined &&
    globalThis.window !== undefined &&
    globalThis.window.musicState_cerdasisyarat
  ) {
    globalThis.window.musicState_cerdasisyarat = {
      ...globalThis.window.musicState_cerdasisyarat,
      ...updates,
    };
  }
};

// Types
interface MusicContextType {
  audioRef: React.RefObject<HTMLAudioElement | undefined>;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  controlsVisible: boolean;
  hasUserInteracted: boolean;
  isClient: boolean;
  togglePlayPause: () => Promise<void>;
  changeVolume: (newVolume: number) => void;
  toggleMute: () => void;
  showControlsWithDelay: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isClient, setIsClient] = useState(false);
  const audioRef = useRef<HTMLAudioElement | undefined>(undefined);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [isMuted, setIsMuted] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const globalState = getGlobalState();
    const audioInstance = getAudioInstance();
    if (audioInstance) {
      audioRef.current = audioInstance;
      setIsPlaying(globalState.isPlaying);
      setVolume(globalState.volume);
      setIsMuted(globalState.isMuted);
      setHasUserInteracted(globalState.hasUserInteracted);
      audioInstance.volume = globalState.volume;
      audioInstance.muted = globalState.isMuted;
      if (globalState.currentTime > 0) {
        audioInstance.currentTime = globalState.currentTime;
      }
    }
  }, []);

  useEffect(() => {
    if (!isClient) return;
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => {
      setIsPlaying(true);
      updateGlobalState({ isPlaying: true });
    };
    const handlePause = () => {
      setIsPlaying(false);
      updateGlobalState({ isPlaying: false });
    };
    const handleVolumeChange = () => {
      if (!audio) return;
      setVolume(audio.volume);
      setIsMuted(audio.muted);
      updateGlobalState({ volume: audio.volume, isMuted: audio.muted });
    };
    const handleTimeUpdate = () => {
      if (audio) updateGlobalState({ currentTime: audio.currentTime });
    };
    const handleError = () => {
      setIsPlaying(false);
      updateGlobalState({ isPlaying: false });
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('volumechange', handleVolumeChange);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('volumechange', handleVolumeChange);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('error', handleError);
    };
  }, [isClient]);

  useEffect(() => {
    if (!isClient) return;
    const audio = audioRef.current;
    const globalState = getGlobalState();
    if (audio && globalState.isPlaying && globalState.hasUserInteracted) {
      retryTimeoutRef.current = setTimeout(() => {
        audio.play().catch(() => {
          setIsPlaying(false);
          updateGlobalState({ isPlaying: false });
        });
      }, 100);
    }
    return () => {
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, [isClient, hasUserInteracted]);

  useEffect(() => {
    if (!isClient || hasUserInteracted) return;
    const handleFirstInteraction = () => {
      setHasUserInteracted(true);
      updateGlobalState({ hasUserInteracted: true });
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);
    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [isClient, hasUserInteracted]);

  const showControlsWithDelay = () => {
    setControlsVisible(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 5000);
  };

  const togglePlayPause = async (): Promise<void> => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
      updateGlobalState({ hasUserInteracted: true });
    }
    try {
      if (audio.paused) {
        const globalState = getGlobalState();
        if (
          globalState.currentTime > 0 &&
          globalState.currentTime < audio.duration
        ) {
          audio.currentTime = globalState.currentTime;
        }
        await audio.play();
        showControlsWithDelay();
      } else {
        audio.pause();
        setControlsVisible(false);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      }
    } catch {
      // FIX: Menghapus variabel 'error' yang tidak digunakan
      setIsPlaying(false);
      updateGlobalState({ isPlaying: false });
    }
  };

  const changeVolume = (newVolume: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    showControlsWithDelay();
    audio.volume = newVolume;
    if (newVolume > 0 && audio.muted) {
      audio.muted = false;
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    showControlsWithDelay();
    audio.muted = !audio.muted;
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, []);

  const value: MusicContextType = {
    audioRef,
    isPlaying,
    volume,
    isMuted,
    controlsVisible,
    hasUserInteracted,
    isClient,
    togglePlayPause,
    changeVolume,
    toggleMute,
    showControlsWithDelay,
  };

  return (
    <MusicContext.Provider value={value}>{children}</MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within MusicProvider');
  }
  return context;
};
