// File: lib/utils/intro-helper.ts
// Helper functions untuk manage intro page logic

const INTRO_KEY = 'hasSeenIntro';

/**
 * Cek apakah user sudah pernah melihat intro
 */
export const hasSeenIntro = (): boolean => {
  if (globalThis.window === undefined) return false;
  return localStorage.getItem(INTRO_KEY) === 'true';
};

/**
 * Set bahwa user sudah melihat intro
 */
export const setIntroSeen = (): void => {
  if (globalThis.window === undefined) return;
  localStorage.setItem(INTRO_KEY, 'true');
};

/**
 * Reset intro status (untuk testing atau reset)
 */
export const resetIntro = (): void => {
  if (globalThis.window === undefined) return;
  localStorage.removeItem(INTRO_KEY);
};

/**
 * Cek apakah ini first time visitor
 * (belum pernah login DAN belum pernah lihat intro)
 */
export const isFirstTimeVisitor = (): boolean => {
  if (globalThis.window === undefined) return false;

  const hasSeenIntroPage = localStorage.getItem(INTRO_KEY);
  const hasLoggedInUser = localStorage.getItem('loggedInUser');

  return !hasSeenIntroPage && !hasLoggedInUser;
};
