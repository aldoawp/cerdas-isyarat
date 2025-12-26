'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import {
  getUserProgressData,
  refillUserLives,
  decreaseUserLivesWithProgressReset,
  type UserProgressData,
} from '@/services/users-progress-service';

export interface UserProfileData {
  fullName: string;
  avatar?: string;
  lives?: number;
}

const USER_KEY = 'loggedInUser';

export const avatars = [
  'https://i.pinimg.com/originals/ed/f7/96/edf7963313c62ae35796eed89df14852.jpg',
  'https://st5.depositphotos.com/72771704/75678/v/450/depositphotos_756786120-stock-illustration-hamster-vector-illustration-cartoon-clipart.jpg',
  'https://cdn.pixabay.com/photo/2022/04/05/01/51/bear-7112623_1280.png',
  'https://www.clipartmax.com/png/middle/4-41019_panda-clip-art-clipart-gambar-animasi-hewan-lucu.png',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBG5EunaflZSZEb88XZFumJtFUryDiT56wrw&s',
];

export const getUserData = (): UserProfileData | undefined => {
  if (globalThis.window === undefined) return undefined;
  try {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : undefined;
  } catch {
    return undefined;
  }
};

export const updateUserData = (userData: Partial<UserProfileData>): void => {
  if (globalThis.window === undefined) return;
  try {
    const currentData = getUserData() || { fullName: 'Pengguna' };
    const updatedData = { ...currentData, ...userData };
    localStorage.setItem(USER_KEY, JSON.stringify(updatedData));
    globalThis.dispatchEvent(new Event('userStateChange'));
    console.log('💾 Local user data updated:', userData);
  } catch {
    // Silent error handling
  }
};

export const useUserProgress = () => {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<UserProgressData>({
    explorationLevel: 1,
    explorationProgress: 0, // ⚠️ DEPRECATED: Tidak dipakai lagi, diganti dengan user_exploration_level_progress table
    guessingChallengeScore: 0,
    xp: 0,
    lives: 3,
  });
  const [userProfile, setUserProfile] = useState<UserProfileData>({
    fullName: 'Pengguna',
    avatar: avatars[0],
    lives: 3,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const loadUserDataRef = useRef<(() => Promise<void>) | null>(null);
  const isLoadingRef = useRef(false);

  const loadUserData = useCallback(async () => {
    if (!user?.id || isLoadingRef.current) {
      setLoading(false);
      return;
    }

    isLoadingRef.current = true;
    try {
      setError(undefined);

      // 1. Load dari localStorage (untuk profile & avatar)
      const localUserData = getUserData();
      if (localUserData) {
        setUserProfile(localUserData);
      }

      // 2. Load dari database (source of truth untuk level, xp, lives)
      const progress = await getUserProgressData(user.id);
      setProgressData(progress);

      // 3. ✅ SYNC: Update localStorage dengan lives dari database
      if (localUserData) {
        const updatedProfile = {
          ...localUserData,
          lives: progress.lives, // Lives dari DB adalah source of truth
        };
        setUserProfile(updatedProfile);
        localStorage.setItem(USER_KEY, JSON.stringify(updatedProfile));
      }

      console.log('📊 User Progress Loaded:', {
        level: progress.explorationLevel,
        xp: progress.xp,
        lives: progress.lives,
      });
    } catch (error_) {
      setError(
        error_ instanceof Error ? error_.message : 'Failed to load user data'
      );
      console.error('Error loading user data:', error_);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [user?.id]);

  loadUserDataRef.current = loadUserData;

  // 💔 Decrease life (saat gagal tes / quit / timeout)
  const decreaseLife = useCallback(
    async (_reason: 'quit' | 'low_score' | 'time_up' = 'quit') => {
      if (!user?.id) return;

      try {
        console.log(`💔 Decreasing life (reason: ${_reason})`);

        const { updatedProgress, shouldResetProgress } =
          await decreaseUserLivesWithProgressReset(user.id);

        // Update state dengan lives baru dari database
        const newProgressData = {
          ...progressData,
          lives: updatedProgress.user_lives,
          // ⚠️ explorationProgress deprecated, tapi tetap update untuk backward compatibility
          explorationProgress: shouldResetProgress
            ? 0
            : progressData.explorationProgress,
        };
        setProgressData(newProgressData);

        // Sync localStorage
        const updatedProfile = {
          ...userProfile,
          lives: updatedProgress.user_lives,
        };
        setUserProfile(updatedProfile);
        localStorage.setItem(USER_KEY, JSON.stringify(updatedProfile));

        console.log(`❤️ Lives remaining: ${updatedProgress.user_lives}`);
      } catch (error_) {
        console.error('Error decreasing life:', error_);
      }
    },
    [user?.id, progressData, userProfile]
  );

  // 💖 Refill lives (saat selesai belajar materi)
  const refillLives = useCallback(async () => {
    if (!user?.id) return;

    try {
      console.log('💖 Refilling lives to 3...');

      await refillUserLives(user.id);

      // ✅ Update local state only
      updateUserData({ lives: 3 });
      setUserProfile(prev => ({ ...prev, lives: 3 }));
      setProgressData(prev => ({ ...prev, lives: 3 }));

      // ❌ REMOVED: Don't reload immediately - causes race condition
      // await loadUserData();

      console.log('✅ Lives refilled successfully!');
    } catch (error_) {
      console.error('Error refilling lives:', error_);
    }
  }, [user?.id]);

  // ⚠️ DEPRECATED: Level completion sekarang handled by test scores
  const completeLevelAction = useCallback(async (_levelId: number) => {
    console.warn(
      '⚠️ completeLevelAction is deprecated. Level completion is handled by test scores.'
    );
  }, []);

  // ⚠️ DEPRECATED: Step update sekarang handled by user_exploration_level_progress table
  const updateStep = useCallback(async (level: number, step: number) => {
    console.warn(
      `⚠️ updateStep(${level}, ${step}) is deprecated. Use updateLevelProgress() from user-level-progress-repository instead.`
    );
  }, []);

  const updateAvatar = useCallback((newAvatar: string) => {
    updateUserData({ avatar: newAvatar });
    setUserProfile(prev => ({ ...prev, avatar: newAvatar }));
  }, []);

  const updateFullName = useCallback((newFullName: string) => {
    updateUserData({ fullName: newFullName });
    setUserProfile(prev => ({ ...prev, fullName: newFullName }));
  }, []);

  // Load data saat component mount
  useEffect(() => {
    if (user?.id && loadUserDataRef.current) {
      loadUserDataRef.current();
    }
  }, [user?.id]);

  // Reload saat window focus (user kembali ke tab)
  useEffect(() => {
    const handleFocus = () => {
      if (user?.id && loadUserDataRef.current) {
        loadUserDataRef.current();
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [user?.id]);

  return {
    progressData, // Contains: explorationLevel, xp, lives
    userProfile, // Contains: fullName, avatar, lives
    loading,
    error,
    decreaseLife, // ✅ Active: Kurangi nyawa
    refillLives, // ✅ Active: Isi ulang nyawa
    completeLevelAction, // ⚠️ Deprecated
    updateStep, // ⚠️ Deprecated
    updateAvatar, // ✅ Active
    updateFullName, // ✅ Active
    _refreshData: loadUserData, // ✅ Active: Manual refresh
  };
};
