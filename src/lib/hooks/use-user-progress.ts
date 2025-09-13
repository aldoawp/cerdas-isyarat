'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import {
  getUserProgressData,
  refillUserLives,
  completeLevel,
  updateUserStep,
  decreaseUserLivesWithProgressReset,
  type UserProgressData,
} from '@/services/users-progress-service';

export interface UserProfileData {
  fullName: string;
  avatar?: string;
  lives?: number;
}

// Local storage keys
const USER_KEY = 'loggedInUser';

// Avatar options
export const avatars = [
  'https://i.pinimg.com/originals/ed/f7/96/edf7963313c62ae35796eed89df14852.jpg',
  'https://st5.depositphotos.com/72771704/75678/v/450/depositphotos_756786120-stock-illustration-hamster-vector-illustration-cartoon-clipart.jpg',
  'https://cdn.pixabay.com/photo/2022/04/05/01/51/bear-7112623_1280.png',
  'https://www.clipartmax.com/png/middle/4-41019_panda-clip-art-clipart-gambar-animasi-hewan-lucu.png',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBG5EunaflZSZEb88XZFumJtFUryDiT56wrw&s',
];

// Local storage helpers
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
  } catch {
    // Silent error handling
  }
};

/**
 * Custom hook for managing user progress and profile data
 * Integrates Supabase backend for progress tracking and localStorage for profile data
 *
 * @returns Object containing user progress data, profile data, loading state, and action functions
 */
export const useUserProgress = () => {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<UserProgressData>({
    explorationLevel: 1,
    explorationProgress: 0,
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

      // Load user profile from localStorage
      const localUserData = getUserData();
      if (localUserData) {
        setUserProfile(localUserData);
      }

      // Load progress from database
      const progress = await getUserProgressData(user.id);
      setProgressData(progress);

      // Update user profile with lives from progress
      if (localUserData) {
        const updatedProfile = { ...localUserData, lives: progress.lives };
        setUserProfile(updatedProfile);
        // Update localStorage without triggering userStateChange event
        localStorage.setItem(USER_KEY, JSON.stringify(updatedProfile));
      }
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

  // Store the function in ref to avoid dependency issues
  loadUserDataRef.current = loadUserData;

  const decreaseLife = useCallback(
    async (_reason: 'quit' | 'low_score' | 'time_up' = 'quit') => {
      if (!user?.id) return;

      try {
        const { updatedProgress, shouldResetProgress } =
          await decreaseUserLivesWithProgressReset(user.id);

        // Update local state
        const newProgressData = {
          ...progressData,
          lives: updatedProgress.user_lives,
          explorationProgress: shouldResetProgress
            ? 0
            : progressData.explorationProgress,
        };
        setProgressData(newProgressData);

        // Update user profile with new lives
        const updatedProfile = {
          ...userProfile,
          lives: updatedProgress.user_lives,
        };
        setUserProfile(updatedProfile);
        localStorage.setItem(USER_KEY, JSON.stringify(updatedProfile));
      } catch (error_) {
        console.error('Error decreasing life:', error_);
      }
    },
    [user?.id, progressData, userProfile]
  );

  const refillLives = useCallback(async () => {
    if (!user?.id) return;

    try {
      await refillUserLives(user.id);
      updateUserData({ lives: 3 });
      setUserProfile(prev => ({ ...prev, lives: 3 }));
      await loadUserData(); // Refresh progress data
    } catch (error_) {
      console.error('Error refilling lives:', error_);
    }
  }, [user?.id, loadUserData]);

  const completeLevelAction = useCallback(
    async (levelId: number) => {
      if (!user?.id) return;

      try {
        await completeLevel(user.id, levelId);
        await loadUserData(); // Refresh progress data
      } catch (error_) {
        console.error('Error completing level:', error_);
      }
    },
    [user?.id, loadUserData]
  );

  const updateStep = useCallback(
    async (level: number, step: number) => {
      if (!user?.id) return;

      try {
        await updateUserStep(user.id, level, step);
        await loadUserData(); // Refresh progress data
      } catch (error_) {
        console.error('Error updating step:', error_);
      }
    },
    [user?.id, loadUserData]
  );

  const updateAvatar = useCallback((newAvatar: string) => {
    updateUserData({ avatar: newAvatar });
    setUserProfile(prev => ({ ...prev, avatar: newAvatar }));
  }, []);

  const updateFullName = useCallback((newFullName: string) => {
    updateUserData({ fullName: newFullName });
    setUserProfile(prev => ({ ...prev, fullName: newFullName }));
  }, []);

  // Load data on mount and when user changes
  useEffect(() => {
    if (user?.id && loadUserDataRef.current) {
      loadUserDataRef.current();
    }
  }, [user?.id]);

  // Listen for window focus to refresh data
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
    progressData,
    userProfile,
    loading,
    error,
    decreaseLife,
    refillLives,
    completeLevelAction,
    updateStep,
    updateAvatar,
    updateFullName,
    _refreshData: loadUserData,
  };
};
