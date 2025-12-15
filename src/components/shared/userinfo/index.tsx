'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import clsx from 'clsx';
import { useAuth } from '@/lib/contexts/auth-context';
import { useUserProgress } from '@/lib/hooks/use-user-progress';
import {
  getAllAvatars,
  updateUserAvatar,
  getUserAvatar,
  type UserAvatar,
} from '@/services/avatar-service';
import { getUserRank } from '@/services/tebak-gerakan-service';
import { getDisplayName } from '@/lib/utils/name-utils';
import LeaderboardModal from '@/components/tebak-gerakan/leaderboard';

// --- TYPE DEFINITIONS ---
interface UserInfoProps {
  fullName: string;
  level: number;
  xp: number;
  lives: number;
  avatar?: string; // Changed from string | null | undefined to optional string
  isLoading: boolean;
  rank?: number; // Changed from number | null to optional number
  onAvatarClick: () => void;
  onLogoutClick: () => void;
}

type DisplayMode = 'card' | 'sidebar' | 'dropdown';

interface UserDetailProps {
  mode?: DisplayMode;
  className?: string;
}

// --- ICON COMPONENTS ---
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

// --- LOADING COMPONENTS ---
const LoadingSpinner = ({ className = '' }: { className?: string }) => (
  <div
    className={`animate-spin rounded-full border-4 border-orange-300 border-t-orange-600 ${className}`}
  />
);

const LoadingSkeleton = ({ mode }: { mode: DisplayMode }) => {
  if (mode === 'sidebar' || mode === 'dropdown') {
    return (
      <div className="fixed right-16 top-2 z-50 flex size-12 items-center justify-center rounded-full border-4 border-input-border bg-amber-500/50 shadow-xl sm:right-20 sm:top-4 sm:size-14">
        <LoadingSpinner className="size-6" />
      </div>
    );
  }

  // Card mode skeleton
  return (
    <div className="w-full max-w-md animate-pulse rounded-2xl border-4 border-yellow-400/80 bg-form-bg/90 p-4 shadow-lg backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <div className="size-20 flex-shrink-0 rounded-full bg-gray-300"></div>
        <div className="flex-grow space-y-3">
          <div className="h-6 w-32 rounded bg-gray-300"></div>
          <div className="h-4 w-full rounded bg-gray-300"></div>
          <div className="h-3 w-24 rounded bg-gray-300"></div>
        </div>
      </div>
    </div>
  );
};

// --- HELPER COMPONENT: Rank Medal ---
const RankMedal = ({ rank }: { rank?: number }) => {
  if (rank === 1) return <span className="text-xl drop-shadow-md">🥇</span>;
  if (rank === 2) return <span className="text-xl drop-shadow-md">🥈</span>;
  if (rank === 3) return <span className="text-xl drop-shadow-md">🥉</span>;
  return undefined;
};

// --- MODAL COMPONENTS ---
const AvatarModal = ({
  isOpen,
  onClose,
  onSelect,
  avatarList,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (avatar: UserAvatar) => void;
  avatarList: UserAvatar[];
}) => {
  const [imageLoading, setImageLoading] = useState<{ [key: string]: boolean }>(
    {}
  );

  useEffect(() => {
    if (isOpen) {
      const loadingStates: { [key: string]: boolean } = {};
      for (const avatar of avatarList) {
        loadingStates[avatar.avatar_id] = true;
      }
      setImageLoading(loadingStates);
    }
  }, [isOpen, avatarList]);

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
          {avatarList.map(avatar => (
            <button
              key={avatar.avatar_id}
              onClick={() => onSelect(avatar)}
              className="relative aspect-square rounded-full bg-yellow-200 p-1 transition hover:scale-110 hover:ring-4 hover:ring-yellow-400"
              aria-label={`Select ${avatar.name}`}
            >
              {imageLoading[avatar.avatar_id] && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-yellow-200">
                  <LoadingSpinner className="size-6" />
                </div>
              )}
              {avatar.image_url && (
                <Image
                  src={avatar.image_url}
                  alt={avatar.name}
                  fill
                  sizes="(max-width: 768px) 33vw, 20vw"
                  onLoad={() =>
                    setImageLoading(prev => ({
                      ...prev,
                      [avatar.avatar_id]: false,
                    }))
                  }
                  className={`rounded-full object-cover transition-opacity ${imageLoading[avatar.avatar_id] ? 'opacity-0' : 'opacity-100'}`}
                />
              )}
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

// --- UI CONTENT COMPONENTS ---

// Helper to convert possible nulls to undefined or valid string
const getValidAvatar = (avatar?: string | null): string | undefined => {
  return avatar && avatar.trim() !== '' ? avatar : undefined;
};

const UserInfoSidebarContent = ({
  fullName,
  level,
  xp,
  lives,
  avatar,
  isLoading,
  onAvatarClick,
  onLogoutClick,
}: UserInfoProps) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const isXpMax = xp === 100;
  const validAvatar = getValidAvatar(avatar);

  return (
    <div className="flex size-full flex-col p-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <button
          onClick={onAvatarClick}
          className="group relative size-24 flex-shrink-0"
          aria-label="Change Avatar"
        >
          {(isLoading || !validAvatar || !imgLoaded) && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-full bg-yellow-200">
              <LoadingSpinner className="size-8" />
            </div>
          )}
          <div className="relative size-full overflow-hidden rounded-full border-4 border-white bg-yellow-200">
            {!isLoading && validAvatar && (
              <Image
                src={validAvatar}
                alt={`${fullName}'s Avatar`}
                fill
                sizes="96px"
                onLoad={() => setImgLoaded(true)}
                className={`object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              />
            )}
          </div>
          <div className="absolute inset-0 z-20 flex items-center justify-center rounded-full bg-black/60 opacity-0 transition group-hover:opacity-100">
            <span className="text-sm font-bold text-white">Ganti</span>
          </div>
        </button>
        <h3 className="w-full truncate text-2xl font-bold text-brand-yellow drop-shadow-lg text-stroke-sm">
          {getDisplayName(fullName)}
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
              className="h-full rounded-full bg-gradient-to-r from-green-400 to-cyan-400 transition-all duration-300"
              style={{ width: `${xp}%` }}
            ></div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <HeartIcon
                key={i}
                className={`size-7 transition-all ${i < lives ? 'text-red-500 drop-shadow-md' : 'text-slate-700'}`}
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
  isLoading,
  rank,
  onAvatarClick,
  onLogoutClick,
}: UserInfoProps) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const isXpMax = xp === 100;
  const validAvatar = getValidAvatar(avatar);

  return (
    <div className="flex w-full items-center gap-4 p-3">
      <button
        onClick={onAvatarClick}
        className="group relative size-20 flex-shrink-0"
        aria-label="Change Avatar"
      >
        {(isLoading || !validAvatar || !imgLoaded) && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-full bg-yellow-200">
            <LoadingSpinner className="size-6" />
          </div>
        )}
        <div className="relative size-full overflow-hidden rounded-full border-4 border-white bg-yellow-200">
          {!isLoading && validAvatar && (
            <Image
              src={validAvatar}
              alt={`${fullName}'s Avatar`}
              fill
              sizes="80px"
              onLoad={() => setImgLoaded(true)}
              className={`object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
          )}
        </div>
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-full bg-black/60 opacity-0 transition group-hover:opacity-100">
          <span className="text-xs font-bold text-white">Ganti</span>
        </div>
      </button>
      <div className="flex-grow">
        <div className="flex items-center gap-2">
          <RankMedal rank={rank} />
          <h3 className="truncate text-2xl font-bold text-brand-yellow drop-shadow-lg text-stroke-sm">
            {getDisplayName(fullName)}
          </h3>
        </div>
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
              className="h-full rounded-full bg-gradient-to-r from-green-400 to-cyan-400 transition-all duration-300"
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
              className={`size-6 transition-all ${i < lives ? 'text-red-500 drop-shadow-md' : 'text-slate-700'}`}
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
  isLoading,
  rank,
  onAvatarClick,
  onLogoutClick,
}: UserInfoProps) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const isXpMax = xp === 100;
  const validAvatar = getValidAvatar(avatar);

  return (
    <div className="w-80 max-w-[90vw] rounded-xl border-4 border-yellow-400/80 bg-form-bg/95 p-4 shadow-2xl backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <button
          onClick={onAvatarClick}
          className="group relative size-16 flex-shrink-0"
          aria-label="Change Avatar"
        >
          {(isLoading || !validAvatar || !imgLoaded) && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-full bg-yellow-200">
              <LoadingSpinner className="size-5" />
            </div>
          )}
          <div className="relative size-full overflow-hidden rounded-full border-[3px] border-white bg-yellow-200">
            {!isLoading && validAvatar && (
              <Image
                src={validAvatar}
                alt={`${fullName}'s Avatar`}
                fill
                sizes="64px"
                onLoad={() => setImgLoaded(true)}
                className={`object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              />
            )}
          </div>
          <div className="absolute inset-0 z-20 flex items-center justify-center rounded-full bg-black/60 opacity-0 transition group-hover:opacity-100">
            <span className="text-xs font-bold text-white">Ganti</span>
          </div>
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <RankMedal rank={rank} />
            <h3 className="truncate text-xl font-bold text-brand-yellow drop-shadow-lg text-stroke-sm">
              {getDisplayName(fullName)}
            </h3>
          </div>
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
                className="h-full rounded-full bg-gradient-to-r from-green-400 to-cyan-400 transition-all duration-300"
                style={{ width: `${xp}%` }}
              ></div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <HeartIcon
                  key={i}
                  className={`size-5 transition-all ${i < lives ? 'text-red-500 drop-shadow-md' : 'text-slate-700'}`}
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

// --- MAIN COMPONENT ---
export default function UserDetail({
  mode = 'card',
  className = '',
}: UserDetailProps) {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  // Data State - Initialize with undefined instead of null
  const [avatarList, setAvatarList] = useState<UserAvatar[]>([]);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | undefined>(
    undefined
  );
  const [isCheckingAvatar, setIsCheckingAvatar] = useState(true);
  const [rank, setRank] = useState<number | undefined>(undefined);

  const { user, signOut } = useAuth();
  const { progressData, userProfile, loading, updateAvatar } =
    useUserProgress();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch Avatar & Rank
  useEffect(() => {
    if (!user?.id) return;

    setIsCheckingAvatar(true);

    const fetchData = async () => {
      try {
        const avatarsData = await getAllAvatars();
        setAvatarList(avatarsData);

        const userAvatar = await getUserAvatar(user.id);

        if (userAvatar && userAvatar.image_url) {
          setCurrentAvatarUrl(userAvatar.image_url);
        } else if (avatarsData.length > 0) {
          const defaultAvatar =
            avatarsData.find(a => a.is_default) || avatarsData[0];
          // Use optional chaining and logical OR with undefined
          setCurrentAvatarUrl(defaultAvatar?.image_url || undefined);
        }

        // Fetch rank and handle null from service
        const userRank = await getUserRank(user.id);
        setRank(userRank ?? undefined);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to load user data:', error);
      } finally {
        setIsCheckingAvatar(false);
      }
    };

    fetchData();
  }, [user?.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const confirmLogout = async () => {
    try {
      await signOut();
    } catch {
      router.push('/login');
    }
  };

  const handleAvatarSelect = async (selectedAvatar: UserAvatar) => {
    if (!user?.id) return;
    try {
      // Handle potential null/undefined from selectedAvatar
      setCurrentAvatarUrl(selectedAvatar.image_url || undefined);
      setIsAvatarModalOpen(false);
      await updateUserAvatar(user.id, selectedAvatar.avatar_id);
      updateAvatar(selectedAvatar.image_url);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Gagal update avatar:', error);
    }
  };

  const isGlobalLoading = !isClient || loading || isCheckingAvatar;

  // --- LOGIC POSISI FLOATING ---
  const fixedPositionClasses = 'fixed right-16 top-2 z-50 sm:right-20 sm:top-4';

  // LOGIKA DINAMIS POSISI LEADERBOARD:
  // 1. Music Player ada di: right-2 (Mobile) / right-4 (Desktop).
  // 2. Jika Mode Sidebar/Dropdown: User Menu muncul di right-16. Maka Leaderboard harus geser ke kiri (right-32).
  // 3. Jika Mode Card: User Menu hilang (ada di card). Maka Leaderboard bisa menempati posisi User Menu (right-16).
  const leaderboardButtonClasses =
    mode === 'sidebar' || mode === 'dropdown'
      ? 'right-32 top-2 sm:right-36 sm:top-4' // Posisi Jauh (Spot 2)
      : 'right-16 top-2 sm:right-20 sm:top-4'; // Posisi Dekat (Spot 1 - Sebelah Music Player)

  if (isGlobalLoading && mode === 'card') {
    return (
      <div className={className}>
        <LoadingSkeleton mode={mode} />
      </div>
    );
  }

  const finalAvatar = currentAvatarUrl;

  const userInfoProps: UserInfoProps = {
    fullName: userProfile.fullName,
    level: progressData.explorationLevel,
    xp: progressData.xp,
    lives: userProfile.lives ?? 3,
    avatar: finalAvatar,
    isLoading: isCheckingAvatar,
    rank,
    onAvatarClick: () => setIsAvatarModalOpen(true),
    onLogoutClick: () => setIsLogoutModalOpen(true),
  };

  if (isGlobalLoading && (mode === 'sidebar' || mode === 'dropdown')) {
    return (
      <div className={className}>
        <LoadingSkeleton mode={mode} />
      </div>
    );
  }

  return (
    <div className={className}>
      <AvatarModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        onSelect={handleAvatarSelect}
        avatarList={avatarList}
      />
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={confirmLogout}
      />
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        currentUserId={user?.id}
      />

      {/* --- TOMBOL LEADERBOARD (SELALU MUNCUL, POSISI DINAMIS) --- */}
      <button
        onClick={() => setIsLeaderboardOpen(true)}
        className={`fixed z-50 flex size-12 items-center justify-center rounded-full border-4 border-input-border bg-gradient-to-r from-yellow-400 to-orange-500 shadow-xl transition-transform hover:scale-110 sm:size-14 ${leaderboardButtonClasses}`}
        aria-label="Lihat Peringkat"
        title="Lihat Peringkat"
      >
        <span className="text-2xl sm:text-3xl">🏆</span>
      </button>

      {mode === 'card' && (
        <div className="w-full max-w-md rounded-2xl border-4 border-yellow-400/80 bg-form-bg/90 shadow-lg backdrop-blur-sm">
          <UserInfoDesktopContent {...userInfoProps} />
        </div>
      )}

      {(mode === 'sidebar' || mode === 'dropdown') && (
        <>
          {/* Tombol User (Avatar) */}
          <div
            className={fixedPositionClasses}
            ref={mode === 'dropdown' ? dropdownRef : undefined}
          >
            <button
              onClick={() =>
                mode === 'sidebar'
                  ? setIsSidebarOpen(true)
                  : setIsDropdownOpen(!isDropdownOpen)
              }
              aria-label={
                mode === 'sidebar' ? 'Open User Menu' : 'Toggle User Dropdown'
              }
              className="group relative flex size-12 items-center justify-center overflow-hidden rounded-full border-4 border-input-border bg-amber-500 shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-110 sm:size-14"
            >
              <div className="relative size-full bg-yellow-200">
                {!isCheckingAvatar && finalAvatar && (
                  <Image
                    src={finalAvatar}
                    alt="Menu"
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="absolute bottom-0 right-0 grid size-4 place-items-center rounded-full border-2 border-yellow-400 bg-form-bg sm:size-5">
                {mode === 'sidebar' ? (
                  <MenuIcon className="size-2.5 text-brand-yellow sm:size-3" />
                ) : (
                  <ChevronDownIcon
                    className={`size-2.5 text-brand-yellow transition-transform sm:size-3 ${isDropdownOpen ? 'rotate-180' : ''}`}
                  />
                )}
              </div>
            </button>

            {/* Sidebar Content */}
            {mode === 'sidebar' && (
              <>
                <div
                  className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity ${
                    isSidebarOpen
                      ? 'opacity-100'
                      : 'pointer-events-none opacity-0'
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                />
                <div
                  className={`fixed left-0 top-0 z-50 h-full w-72 max-w-[80vw] transform border-r-4 border-yellow-400/80 bg-form-bg transition-transform duration-300 ease-in-out ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                  }`}
                >
                  <div className="relative flex h-full flex-col">
                    <button
                      onClick={() => setIsSidebarOpen(false)}
                      className="absolute right-3 top-3 text-brand-yellow/80 hover:text-brand-yellow"
                      aria-label="Close Menu"
                    >
                      <CloseIcon className="size-7" />
                    </button>
                    <UserInfoSidebarContent {...userInfoProps} />
                  </div>
                </div>
              </>
            )}

            {/* Dropdown Content */}
            {mode === 'dropdown' && (
              <div
                className={`absolute right-0 top-full z-50 mt-2 origin-top-right transform transition-all duration-200 ${
                  isDropdownOpen
                    ? 'scale-100 opacity-100'
                    : 'pointer-events-none scale-95 opacity-0'
                }`}
              >
                <UserInfoDropdownContent {...userInfoProps} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export { getUserData, updateUserData } from '@/lib/hooks/use-user-progress';
