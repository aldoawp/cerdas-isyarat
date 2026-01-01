'use client';

import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
} from 'react';
import {
  getAllBackgroundMusic,
  type BackgroundMusicWithAsset,
} from '@/services/music-service';

// --- GLOBAL STATE MANAGEMENT ---
declare global {
  interface Window {
    audioInstance_cerdasisyarat?: HTMLAudioElement;
    musicState_cerdasisyarat?: {
      isPlaying: boolean;
      volume: number;
      isMuted: boolean;
      currentTime: number;
      hasUserInteracted: boolean;
      currentMusicId?: string;
      musicUrl?: string;
    };
  }
}

// Fungsi untuk mendapatkan atau membuat SATU instansi audio global
const getAudioInstance = (musicUrl?: string): HTMLAudioElement | undefined => {
  if (globalThis === undefined || globalThis.window === undefined)
    return undefined;

  // Jika ada URL musik baru dan berbeda dari yang sekarang, update source
  if (musicUrl && globalThis.window.audioInstance_cerdasisyarat) {
    const audio = globalThis.window.audioInstance_cerdasisyarat;
    if (audio.src !== musicUrl) {
      const wasPlaying = !audio.paused;
      const currentVolume = audio.volume;
      const currentMuted = audio.muted;

      audio.src = musicUrl;
      audio.volume = currentVolume;
      audio.muted = currentMuted;

      if (
        wasPlaying &&
        globalThis.window.musicState_cerdasisyarat?.hasUserInteracted
      ) {
        // eslint-disable-next-line no-console
        audio.play().catch(console.error);
      }

      updateGlobalState({ musicUrl });
    }
    return audio;
  }

  // PERUBAHAN: Hanya buat instance tanpa default URL
  // URL akan di-set setelah data dari DB berhasil dimuat
  if (!globalThis.window.audioInstance_cerdasisyarat && musicUrl) {
    const audio = new Audio(musicUrl);
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0.3;
    globalThis.window.audioInstance_cerdasisyarat = audio;

    if (!globalThis.window.musicState_cerdasisyarat) {
      globalThis.window.musicState_cerdasisyarat = {
        isPlaying: false,
        volume: 0.3,
        isMuted: false,
        currentTime: 0,
        hasUserInteracted: false,
        currentMusicId: undefined,
        musicUrl: musicUrl,
      };
    }
  }
  return globalThis.window.audioInstance_cerdasisyarat;
};

const getGlobalState = () => {
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
      currentMusicId: undefined,
      musicUrl: undefined,
    };
  }
  return globalThis.window.musicState_cerdasisyarat;
};

const updateGlobalState = (
  updates: Partial<
    NonNullable<typeof globalThis.window.musicState_cerdasisyarat>
  >
) => {
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

interface MusicContextType {
  audioRef: React.RefObject<HTMLAudioElement | undefined>;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  controlsVisible: boolean;
  hasUserInteracted: boolean;
  isClient: boolean;
  isLoading: boolean;
  error: string | undefined;
  musicList: BackgroundMusicWithAsset[];
  currentMusic: BackgroundMusicWithAsset | undefined;
  togglePlayPause: () => Promise<void>;
  changeVolume: (newVolume: number) => void;
  toggleMute: () => void;
  showControlsWithDelay: () => void;
  changeMusic: (musicId: string) => Promise<void>;
  nextMusic: () => Promise<void>;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [musicList, setMusicList] = useState<BackgroundMusicWithAsset[]>([]);
  const [currentMusic, setCurrentMusic] = useState<
    BackgroundMusicWithAsset | undefined
  >(undefined);

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

  // Load music list dari Supabase - HANYA DARI DB
  useEffect(() => {
    const loadMusicFromSupabase = async () => {
      try {
        const allMusic = await getAllBackgroundMusic();

        // PERUBAHAN: Validasi bahwa ada musik di database
        if (!allMusic || allMusic.length === 0) {
          setError('No music found in database. Please add music first.');
          setIsLoading(false);
          setIsClient(true);
          return;
        }

        // Filter musik yang memiliki audio_url valid
        const validMusic = allMusic.filter(m => m.audio_url);

        if (validMusic.length === 0) {
          setError('No valid music URLs found in database.');
          setIsLoading(false);
          setIsClient(true);
          return;
        }

        setMusicList(validMusic);

        // Cari musik yang active atau ambil yang pertama
        const activeMusic = validMusic.find(m => m.is_active) || validMusic[0];
        const musicUrl = activeMusic.audio_url;

        setCurrentMusic(activeMusic);
        setIsClient(true);

        const globalState = getGlobalState();
        const audioInstance = getAudioInstance(musicUrl);

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

          updateGlobalState({
            currentMusicId: activeMusic.music_id,
            musicUrl: musicUrl,
          });
        }

        setError(undefined); // Clear any previous errors
      } catch (error_) {
        // eslint-disable-next-line no-console
        console.error('Failed to load music from database:', error_);
        setError(
          'Failed to load music from database. Please check your connection.'
        );
        setIsClient(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadMusicFromSupabase();
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
      setError('Failed to play music. The audio file may be unavailable.');
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

  const changeMusic = async (musicId: string): Promise<void> => {
    const selectedMusic = musicList.find(m => m.music_id === musicId);
    if (!selectedMusic || !selectedMusic.audio_url) return;

    const audio = audioRef.current;
    if (!audio) return;

    const wasPlaying = !audio.paused;

    // Update music
    audio.src = selectedMusic.audio_url;
    setCurrentMusic(selectedMusic);
    updateGlobalState({
      currentMusicId: musicId,
      musicUrl: selectedMusic.audio_url,
      currentTime: 0,
    });

    // Play jika sebelumnya playing dan user sudah interact
    if (wasPlaying && hasUserInteracted) {
      try {
        await audio.play();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to play new music:', error);
      }
    }

    showControlsWithDelay();
  };

  const nextMusic = async (): Promise<void> => {
    if (musicList.length === 0) return;

    const currentIndex = musicList.findIndex(
      m => m.music_id === currentMusic?.music_id
    );
    const nextIndex = (currentIndex + 1) % musicList.length;
    const nextMusic = musicList[nextIndex];

    await changeMusic(nextMusic.music_id);
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
