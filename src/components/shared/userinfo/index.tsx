'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image'; // [DIPERBAIKI] Impor komponen Image dari Next.js
import clsx from 'clsx';
import { useAuth } from '@/lib/contexts/auth-context';

// --- Tipe Data ---
type LevelProgress = { progress: number; lastIndex: number };
type UserProgress = {
  completedLevelIds: number[];
  learningProgress: { [levelId: number]: LevelProgress };
};
type UserData = { fullName: string; lives?: number; avatar?: string };

// --- LOGIKA HELPER ---
const USER_KEY = 'loggedInUser';
const PROGRESS_KEY = 'userBisindoProgress';

const getProgress = (): UserProgress => {
  if (globalThis.window === undefined)
    return { completedLevelIds: [], learningProgress: {} };
  try {
    const saved = localStorage.getItem(PROGRESS_KEY);
    return saved
      ? JSON.parse(saved)
      : { completedLevelIds: [], learningProgress: {} };
  } catch {
    return { completedLevelIds: [], learningProgress: {} };
  }
};

// [DIPERBAIKI] Menggunakan 'undefined' sebagai ganti 'null'
export const getUserData = (): UserData | undefined => {
  if (globalThis.window === undefined) return undefined;
  try {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : undefined;
  } catch {
    return undefined;
  }
};

export const decreaseLife = () => {
  const userData = getUserData();
  if (!userData) return;
  const currentLives = userData.lives ?? 3;
  if (currentLives > 0) {
    userData.lives = currentLives - 1;
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    globalThis.dispatchEvent(new Event('userStateChange'));
  }
};

export const refillLives = () => {
  const userData = getUserData();
  if (!userData) return;
  if ((userData.lives ?? 3) < 3) {
    userData.lives = 3;
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    globalThis.dispatchEvent(new Event('userStateChange'));
    // [DIPERBAIKI] Menghapus console.log
  }
};

export const completeLevel = (levelId: number) => {
  if (globalThis.window === undefined) return;
  const progress = getProgress();
  if (!progress.completedLevelIds.includes(levelId)) {
    progress.completedLevelIds.push(levelId);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    globalThis.dispatchEvent(new Event('userStateChange'));
  }
};

// --- DATA DUMMY & KONFIGURASI ---
const avatars = [
  'https://i.pinimg.com/originals/ed/f7/96/edf7963313c62ae35796eed89df14852.jpg',
  'https://st5.depositphotos.com/72771704/75678/v/450/depositphotos_756786120-stock-illustration-hamster-vector-illustration-cartoon-clipart.jpg',
  'https://cdn.pixabay.com/photo/2022/04/05/01/51/bear-7112623_1280.png',
  'https://www.clipartmax.com/png/middle/4-41019_panda-clip-art-clipart-gambar-animasi-hewan-lucu.png',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBG5EunaflZSZEb88XZFumJtFUryDiT56wrw&s',
];

// --- DEFINISI TIPE PROPS ---
type UserInfoProps = {
  fullName: string;
  level: number;
  xp: number;
  lives: number;
  avatar: string;
  onAvatarClick: () => void;
  onLogoutClick: () => void;
};
type DisplayMode = 'card' | 'sidebar' | 'dropdown';
type UserDetailProps = { mode?: DisplayMode; className?: string };

// --- KOMPONEN IKON ---
const HeartIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);
const LogoutIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
    />
  </svg>
);
const MenuIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
    />
  </svg>
);
const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);
const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m19.5 8.25-7.5 7.5-7.5-7.5"
    />
  </svg>
);

// --- KOMPONEN MODAL ---
const AvatarModal = ({
  isOpen,
  onClose,
  onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (avatar: string) => void;
}) => {
  if (!isOpen) return undefined;
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border-4 border-yellow-300 bg-form-bg p-6"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="mb-6 text-center text-4xl font-bold text-brand-yellow drop-shadow-lg text-stroke-base">
          Pilih Avatarmu!
        </h3>
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-5">
          {avatars.map((avatar, index) => (
            <button
              key={index}
              onClick={() => onSelect(avatar)}
              className="relative aspect-square rounded-full bg-input-bg p-2 transition hover:scale-110 hover:bg-yellow-400"
            >
              <Image
                src={avatar}
                alt={`Avatar ${index + 1}`}
                fill
                className="rounded-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
const LogoutModal = ({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  if (!isOpen) return undefined;
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border-4 border-yellow-300 bg-form-bg p-6"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="mb-4 text-center text-3xl font-bold text-brand-yellow drop-shadow-lg text-stroke">
          Yakin mau logout?
        </h3>
        <p className="mb-6 text-center text-lg font-bold text-subtitle-cream drop-shadow-lg text-stroke-sm">
          Progress belajarmu akan tersimpan kok!
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-gray-500 py-3 font-comic font-bold text-white transition hover:bg-gray-600"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-500 py-3 font-comic font-bold text-white transition hover:bg-red-600"
          >
            Ya, Logout
          </button>
        </div>
      </div>
    </div>
  );
};

// --- KONTEN UI (DIPISAH SESUAI MODE) ---
const UserInfoSidebarContent = ({
  fullName,
  level,
  xp,
  lives,
  avatar,
  onAvatarClick,
  onLogoutClick,
}: UserInfoProps) => {
  const isXpMax = xp === 100;
  return (
    <div className="flex size-full flex-col p-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <button
          onClick={onAvatarClick}
          className="group relative size-24 flex-shrink-0"
        >
          <Image
            src={avatar}
            alt="User Avatar"
            width={96}
            height={96}
            className="rounded-full border-4 border-white bg-yellow-200 object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 transition group-hover:opacity-100">
            <span className="text-sm font-bold text-white">Ganti</span>
          </div>
        </button>
        <h3 className="w-full truncate text-2xl font-bold text-brand-yellow drop-shadow-lg text-stroke-sm">
          {fullName}
        </h3>
      </div>
      <div className="mt-5 flex-grow space-y-4">
        <div>
          <div className="flex justify-between text-sm font-bold text-subtitle-cream drop-shadow-lg">
            <span className="text-stroke-sm">Level {level}</span>
            <span
              className={clsx('text-stroke-sm', {
                'animate-pulse text-cyan-300': isXpMax,
              })}
            >
              {isXpMax ? 'Tes Siap!' : `${xp}/100 XP`}
            </span>
          </div>
          <div
            className={clsx(
              'mt-1 h-4 w-full rounded-full border-2 border-yellow-400/50 bg-black/30 transition-shadow',
              { 'shadow-lg shadow-cyan-500/50': isXpMax }
            )}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-400 to-cyan-400"
              style={{ width: `${xp}%` }}
            ></div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <HeartIcon
                key={i}
                className={`size-7 ${i < lives ? 'text-red-500 drop-shadow-md' : 'text-slate-700'}`}
              />
            ))}
          </div>
          {lives === 0 && (
            <div className="mt-1 rounded-full border border-yellow-400 bg-yellow-100 px-3 py-1 text-xs font-bold text-brand-brown-stroke">
              Ulangi materi untuk isi nyawa!
            </div>
          )}
        </div>
      </div>
      <div className="mt-auto pt-4">
        <button
          onClick={onLogoutClick}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-300 bg-red-500/90 p-3 font-comic font-bold text-white transition hover:scale-105 hover:bg-red-600"
        >
          <LogoutIcon className="size-6" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

const UserInfoDesktopContent = ({
  fullName,
  level,
  xp,
  lives,
  avatar,
  onAvatarClick,
  onLogoutClick,
}: UserInfoProps) => {
  const isXpMax = xp === 100;
  return (
    <div className="flex w-full items-center gap-4 p-3">
      <button
        onClick={onAvatarClick}
        className="group relative size-20 flex-shrink-0"
      >
        <Image
          src={avatar}
          alt="User Avatar"
          width={80}
          height={80}
          className="rounded-full border-4 border-white bg-yellow-200 object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 transition group-hover:opacity-100">
          <span className="text-xs font-bold text-white">Ganti</span>
        </div>
      </button>
      <div className="flex-grow">
        <h3 className="truncate text-2xl font-bold text-brand-yellow drop-shadow-lg text-stroke-sm">
          {fullName}
        </h3>
        <div className="mt-1">
          <div className="flex justify-between text-sm font-bold text-subtitle-cream drop-shadow-lg">
            <span className="text-stroke-sm">Level {level}</span>
            <span
              className={clsx('text-stroke-sm', {
                'animate-pulse text-cyan-300': isXpMax,
              })}
            >
              {isXpMax ? 'Tes Siap!' : `${xp}/100 XP`}
            </span>
          </div>
          <div
            className={clsx(
              'mt-1 h-4 w-full rounded-full border-2 border-yellow-400/50 bg-black/30 transition-shadow',
              { 'shadow-lg shadow-cyan-500/50': isXpMax }
            )}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-400 to-cyan-400"
              style={{ width: `${xp}%` }}
            ></div>
          </div>
        </div>
      </div>
      <div className="flex flex-shrink-0 flex-col items-center justify-center gap-2 self-stretch">
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <HeartIcon
              key={i}
              className={`size-6 ${i < lives ? 'text-red-500 drop-shadow-md' : 'text-slate-700'}`}
            />
          ))}
        </div>
        {lives === 0 && (
          <div className="rounded-full border border-yellow-400 bg-yellow-100 px-2 py-0.5 text-xs font-bold text-brand-brown-stroke">
            Ulangi Materi!
          </div>
        )}
        <button
          onClick={onLogoutClick}
          className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-500/80 px-3 py-1.5 font-comic text-sm font-bold text-white transition hover:bg-red-600"
        >
          <LogoutIcon className="size-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

const UserInfoDropdownContent = ({
  fullName,
  level,
  xp,
  lives,
  avatar,
  onAvatarClick,
  onLogoutClick,
}: UserInfoProps) => {
  const isXpMax = xp === 100;
  return (
    <div className="w-80 max-w-[90vw] rounded-xl border-4 border-yellow-400/80 bg-form-bg/95 p-4 shadow-2xl backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <button
          onClick={onAvatarClick}
          className="group relative size-16 flex-shrink-0"
        >
          <Image
            src={avatar}
            alt="User Avatar"
            width={64}
            height={64}
            className="border-3 rounded-full border-white bg-yellow-200 object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 transition group-hover:opacity-100">
            <span className="text-xs font-bold text-white">Ganti</span>
          </div>
        </button>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-xl font-bold text-brand-yellow drop-shadow-lg text-stroke-sm">
            {fullName}
          </h3>
          <div className="mt-2">
            <div className="flex justify-between text-sm font-bold text-subtitle-cream drop-shadow-lg">
              <span className="text-stroke-sm">Level {level}</span>
              <span
                className={clsx('text-stroke-sm', {
                  'animate-pulse text-cyan-300': isXpMax,
                })}
              >
                {isXpMax ? 'Tes Siap!' : `${xp}/100 XP`}
              </span>
            </div>
            <div
              className={clsx(
                'mt-1 h-3 w-full rounded-full border-2 border-yellow-400/50 bg-black/30 transition-shadow',
                { 'shadow-lg shadow-cyan-500/50': isXpMax }
              )}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-400 to-cyan-400"
                style={{ width: `${xp}%` }}
              ></div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <HeartIcon
                  key={i}
                  className={`size-5 ${i < lives ? 'text-red-500 drop-shadow-md' : 'text-slate-700'}`}
                />
              ))}
            </div>
            {lives === 0 && (
              <div className="rounded-full border border-yellow-400 bg-yellow-100 px-2 py-0.5 text-xs font-bold text-brand-brown-stroke">
                Ulangi Materi!
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-4 border-t-2 border-yellow-400/30 pt-3">
        <button
          onClick={onLogoutClick}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-300 bg-red-500/90 px-4 py-2.5 font-comic font-bold text-white transition hover:scale-105 hover:bg-red-600"
        >
          <LogoutIcon className="size-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

// --- KOMPONEN UTAMA ---
export default function UserDetail({
  mode = 'card',
  className = '',
}: UserDetailProps) {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [fullName, setFullName] = useState('Pengguna');
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [lives, setLives] = useState(3);
  const [avatar, setAvatar] = useState(avatars[0]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const loadData = useCallback(() => {
    const userData = getUserData();
    const userProgress = getProgress();
    if (userData) {
      setFullName(userData.fullName);
      setLives(userData.lives ?? 3);
      setAvatar(userData.avatar || avatars[0]);
    }
    const highestCompleted =
      userProgress.completedLevelIds.length > 0
        ? Math.max(...userProgress.completedLevelIds)
        : 0;
    const currentLevel = highestCompleted + 1;
    setLevel(currentLevel);
    const currentLevelProgress = userProgress.learningProgress[currentLevel];
    setXp(currentLevelProgress ? currentLevelProgress.progress : 0);
  }, []);
  useEffect(() => {
    setIsClient(true);
    loadData();
    globalThis.addEventListener('userStateChange', loadData);
    window.addEventListener('focus', loadData);
    return () => {
      globalThis.removeEventListener('userStateChange', loadData);
      window.removeEventListener('focus', loadData);
    };
  }, [loadData]);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen)
      document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);
  const { signOut } = useAuth();

  const confirmLogout = async () => {
    try {
      // Call Supabase logout through auth context
      await signOut();

      // Clear localStorage data
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(PROGRESS_KEY);

      // Note: The auth context will handle the redirect automatically
    } catch {
      // Even if logout fails, clear localStorage and redirect to login page for security
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(PROGRESS_KEY);
      router.push('/login');
    }
  };
  const handleAvatarSelect = (newAvatar: string) => {
    setAvatar(newAvatar);
    const userData = getUserData();
    if (userData) {
      userData.avatar = newAvatar;
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
    }
    setIsAvatarModalOpen(false);
  };
  const userInfoProps: UserInfoProps = {
    fullName,
    level,
    xp,
    lives,
    avatar,
    onAvatarClick: () => setIsAvatarModalOpen(true),
    onLogoutClick: () => setIsLogoutModalOpen(true),
  };

  if (!isClient) return <div className="size-14 bg-transparent"></div>;

  return (
    <div className={className}>
      {' '}
      <AvatarModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        onSelect={handleAvatarSelect}
      />{' '}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={confirmLogout}
      />{' '}
      {mode === 'card' && (
        <div className="w-full max-w-md rounded-2xl border-4 border-yellow-400/80 bg-form-bg/90 shadow-lg backdrop-blur-sm">
          {' '}
          <UserInfoDesktopContent {...userInfoProps} />{' '}
        </div>
      )}{' '}
      {mode === 'sidebar' && (
        <div>
          {' '}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="relative flex size-14 items-center justify-center rounded-full border-4 border-input-border bg-amber-500 shadow-xl transition-transform hover:scale-110 active:scale-95"
          >
            <Image
              src={avatar}
              alt="Buka Menu"
              fill
              className="rounded-full object-cover p-0.5"
            />
            <div className="absolute bottom-0 right-0 grid size-5 place-items-center rounded-full border-2 border-yellow-400 bg-form-bg">
              <MenuIcon className="size-3 text-brand-yellow" />
            </div>
          </button>{' '}
          <div
            className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity ${isSidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
            onClick={() => setIsSidebarOpen(false)}
          ></div>{' '}
          <div
            className={`fixed left-0 top-0 z-50 h-full w-72 max-w-[80vw] transform border-r-4 border-yellow-400/80 bg-form-bg transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
          >
            {' '}
            <div className="relative flex h-full flex-col">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="absolute right-3 top-3 text-brand-yellow/80 hover:text-brand-yellow"
              >
                <CloseIcon className="size-7" />
              </button>
              <UserInfoSidebarContent {...userInfoProps} />
            </div>{' '}
          </div>{' '}
        </div>
      )}{' '}
      {mode === 'dropdown' && (
        <div className="relative" ref={dropdownRef}>
          {' '}
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="relative flex size-14 items-center justify-center rounded-full border-4 border-input-border bg-amber-500 shadow-xl transition-transform hover:scale-110 active:scale-95"
          >
            <Image
              src={avatar}
              alt="Buka Menu"
              fill
              className="rounded-full object-cover p-0.5"
            />
            <div className="absolute bottom-0 right-0 grid size-5 place-items-center rounded-full border-2 border-yellow-400 bg-form-bg">
              <ChevronDownIcon
                className={`size-3 text-brand-yellow transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
              />
            </div>
          </button>{' '}
          <div
            className={`absolute right-0 top-full z-50 mt-2 origin-top-right transform transition-all duration-200 ${isDropdownOpen ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'}`}
          >
            <UserInfoDropdownContent {...userInfoProps} />
          </div>{' '}
        </div>
      )}{' '}
    </div>
  );
}
