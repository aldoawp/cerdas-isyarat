'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// --- DATA DUMMY & KONFIGURASI ---
const avatars = [
  'https://i.pinimg.com/originals/ed/f7/96/edf7963313c62ae35796eed89df14852.jpg',
  'https://st5.depositphotos.com/72771704/75678/v/450/depositphotos_756786120-stock-illustration-hamster-vector-illustration-cartoon-clipart.jpg',
  'https://cdn.pixabay.com/photo/2022/04/05/01/51/bear-7112623_1280.png',
  'https://www.clipartmax.com/png/middle/4-41019_panda-clip-art-clipart-gambar-animasi-hewan-lucu.png',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBG5EunaflZSZEb88XZFumJtFUryDiT56wrw&s',
];

// --- DEFINISI TIPE UNTUK PROPS ---
// Menghilangkan 'any' dengan mendefinisikan struktur data yang jelas
type UserInfoProps = {
  fullName: string;
  level: number;
  xp: number;
  lives: number;
  cooldownEnd: number | undefined;
  timeLeft: string;
  avatar: string;
  onAvatarClick: () => void;
  onLogoutClick: () => void;
};

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

// --- KOMPONEN MODAL AVATAR ---
const AvatarModal = ({
  isOpen,
  onClose,
  onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (avatar: string) => void;
}) => {
  if (!isOpen) return;
  const titleStrokeStyle = {
    WebkitTextStroke: '4px #CE7310',
    paintOrder: 'stroke fill',
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border-4 border-yellow-300 bg-form-bg p-6"
        onClick={e => e.stopPropagation()}
      >
        <h3
          className="mb-6 text-center text-4xl font-bold text-brand-yellow drop-shadow-lg"
          style={titleStrokeStyle}
        >
          Pilih Avatarmu!
        </h3>
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-5">
          {avatars.map((avatar, index) => (
            <button
              key={index}
              onClick={() => onSelect(avatar)}
              className="rounded-full bg-input-bg p-2 transition hover:scale-110 hover:bg-yellow-400"
            >
              <img
                src={avatar}
                alt={`Avatar ${index + 1}`}
                className="aspect-square w-full rounded-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- KOMPONEN KONFIRMASI LOGOUT ---
const LogoutModal = ({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  if (!isOpen) return;
  const titleStrokeStyle = {
    WebkitTextStroke: '3px #CE7310',
    paintOrder: 'stroke fill',
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border-4 border-yellow-300 bg-form-bg p-6"
        onClick={e => e.stopPropagation()}
      >
        <h3
          className="mb-4 text-center text-3xl font-bold text-brand-yellow drop-shadow-lg"
          style={titleStrokeStyle}
        >
          Yakin mau logout?
        </h3>
        <p
          className="mb-6 text-center text-lg font-bold text-subtitle-cream drop-shadow-lg"
          style={{ WebkitTextStroke: '2px #CE7310', paintOrder: 'stroke fill' }}
        >
          Progress belajarmu akan tersimpan kok!
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-gray-500 py-3 font-bold text-white transition hover:bg-gray-600"
            style={{ fontFamily: '"Comic Sans MS", cursive' }}
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-500 py-3 font-bold text-white transition hover:bg-red-600"
            style={{ fontFamily: '"Comic Sans MS", cursive' }}
          >
            Ya, Logout
          </button>
        </div>
      </div>
    </div>
  );
};

// --- KONTEN UNTUK SIDEBAR MOBILE ---
const UserInfoSidebarContent = ({
  fullName,
  level,
  xp,
  lives,
  cooldownEnd,
  timeLeft,
  avatar,
  onAvatarClick,
  onLogoutClick,
}: UserInfoProps) => {
  // Tipe 'any' diganti dengan 'UserInfoProps'
  const nameStrokeStyle = {
    WebkitTextStroke: '2px #CE7310',
    paintOrder: 'stroke fill',
  };
  const textStrokeStyle = {
    WebkitTextStroke: '2px #CE7310',
    paintOrder: 'stroke fill',
  };

  return (
    <div className="flex size-full flex-col gap-5 p-4">
      {/* Avatar dan Nama */}
      <div className="flex flex-col items-center gap-3 text-center">
        <button
          onClick={onAvatarClick}
          className="group relative flex-shrink-0"
        >
          <img
            src={avatar}
            alt="User Avatar"
            className="size-24 rounded-full border-4 border-white bg-yellow-200 object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 transition group-hover:opacity-100">
            <span className="text-sm font-bold text-white">Ganti</span>
          </div>
        </button>
        <h3
          className="w-full truncate text-2xl font-bold text-brand-yellow drop-shadow-lg"
          style={nameStrokeStyle}
        >
          {fullName}
        </h3>
      </div>

      {/* Level, XP, dan Nyawa */}
      <div className="space-y-3">
        {/* XP Bar */}
        <div>
          <div className="flex justify-between text-sm font-bold text-subtitle-cream drop-shadow-lg">
            <span style={textStrokeStyle}>Level {level}</span>
            <span style={textStrokeStyle}>{xp}/100 XP</span>
          </div>
          <div className="mt-1 h-4 w-full rounded-full border-2 border-yellow-400/50 bg-black/30">
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-400 to-cyan-400"
              style={{ width: `${xp}%` }}
            ></div>
          </div>
        </div>
        {/* Nyawa */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <HeartIcon
                key={i}
                className={`size-7 ${i < lives ? 'text-red-500 drop-shadow-md' : 'text-slate-700'}`}
              />
            ))}
          </div>
          {cooldownEnd && (
            <div className="mt-1 rounded-full border border-red-400 bg-red-800/70 px-3 py-1 text-xs font-bold text-white">
              {timeLeft}
            </div>
          )}
        </div>
      </div>

      {/* Tombol Logout */}
      <div className="mt-2">
        <button
          onClick={onLogoutClick}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-300 bg-red-500/90 p-3 font-bold text-white transition hover:scale-105 hover:bg-red-600"
          style={{ fontFamily: '"Comic Sans MS", cursive' }}
        >
          <LogoutIcon className="size-6" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

// --- KONTEN UNTUK TAMPILAN DESKTOP ---
const UserInfoDesktopContent = ({
  fullName,
  level,
  xp,
  lives,
  cooldownEnd,
  timeLeft,
  avatar,
  onAvatarClick,
  onLogoutClick,
}: UserInfoProps) => {
  // Tipe 'any' diganti dengan 'UserInfoProps'
  const nameStrokeStyle = {
    WebkitTextStroke: '2px #CE7310',
    paintOrder: 'stroke fill',
  };
  const textStrokeStyle = {
    WebkitTextStroke: '2px #CE7310',
    paintOrder: 'stroke fill',
  };

  return (
    <div className="flex w-full items-center gap-4 p-3">
      {/* Avatar */}
      <button onClick={onAvatarClick} className="group relative flex-shrink-0">
        <img
          src={avatar}
          alt="User Avatar"
          className="size-20 rounded-full border-4 border-white bg-yellow-200 object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 transition group-hover:opacity-100">
          <span className="text-xs font-bold text-white">Ganti</span>
        </div>
      </button>

      {/* Info Tengah: Nama & XP Bar */}
      <div className="flex-grow">
        <h3
          className="truncate text-2xl font-bold text-brand-yellow drop-shadow-lg"
          style={nameStrokeStyle}
        >
          {fullName}
        </h3>
        <div className="mt-1">
          <div className="flex justify-between text-sm font-bold text-subtitle-cream drop-shadow-lg">
            <span style={textStrokeStyle}>Level {level}</span>
            <span style={textStrokeStyle}>{xp}/100 XP</span>
          </div>
          <div className="mt-1 h-4 w-full rounded-full border-2 border-yellow-400/50 bg-black/30">
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-400 to-cyan-400"
              style={{ width: `${xp}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Info Kanan: Nyawa & Logout */}
      <div className="flex flex-shrink-0 flex-col items-center justify-center gap-2 self-stretch">
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <HeartIcon
              key={i}
              className={`size-6 ${i < lives ? 'text-red-500 drop-shadow-md' : 'text-slate-700'}`}
            />
          ))}
        </div>
        {cooldownEnd ? (
          <div className="rounded-full border border-red-400 bg-red-800/70 px-2 py-0.5 text-xs font-bold text-white">
            {timeLeft}
          </div>
        ) : (
          <button
            onClick={onLogoutClick}
            className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-500/80 px-3 py-1.5 text-sm font-bold text-white transition hover:bg-red-600"
            style={{ fontFamily: '"Comic Sans MS", cursive' }}
          >
            <LogoutIcon className="size-4" />
            <span>Logout</span>
          </button>
        )}
      </div>
    </div>
  );
};

// --- KOMPONEN UTAMA DETAIL PENGGUNA (RESPONSIVE) ---
export default function UserDetail() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [fullName, setFullName] = useState('Nama Pengguna');
  const [level, _setLevel] = useState(0);
  const [xp, _setXp] = useState(50);
  const [lives, setLives] = useState(3);
  const [cooldownEnd, setCooldownEnd] = useState<number | undefined>();
  const [timeLeft, setTimeLeft] = useState('');
  const [avatar, setAvatar] = useState(avatars[0]);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const userRaw = localStorage.getItem('loggedInUser');
    if (userRaw) {
      setFullName(JSON.parse(userRaw).fullName);
    }
  }, [router]);

  // Timer cooldown
  useEffect(() => {
    if (!cooldownEnd) return;
    const interval = setInterval(() => {
      const remaining = cooldownEnd - Date.now();
      if (remaining <= 0) {
        clearInterval(interval);
        setLives(3);
        setCooldownEnd(undefined);
        setTimeLeft('');
      } else {
        const h = Math.floor((remaining / 3_600_000) % 24);
        const m = Math.floor((remaining / 60_000) % 60);
        const s = Math.floor((remaining / 1000) % 60);
        setTimeLeft(
          `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
        );
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownEnd]);

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('loggedInUser');
    router.push('/login');
  };

  const handleAvatarSelect = (newAvatar: string) => {
    setAvatar(newAvatar);
    setIsAvatarModalOpen(false);
  };

  const userInfoProps: UserInfoProps = {
    fullName,
    level,
    xp,
    lives,
    cooldownEnd,
    timeLeft,
    avatar,
    onAvatarClick: () => setIsAvatarModalOpen(true),
    onLogoutClick: handleLogout,
  };

  if (!isClient) return <div className="size-16"></div>;

  return (
    <>
      <AvatarModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        onSelect={handleAvatarSelect}
      />
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={confirmLogout}
      />

      {/* --- TAMPILAN DESKTOP (HORIZONTAL) --- */}
      <div className="hidden w-full max-w-md rounded-2xl border-4 border-yellow-400/80 bg-form-bg/90 shadow-lg backdrop-blur-sm md:block">
        <UserInfoDesktopContent {...userInfoProps} />
      </div>

      {/* --- TAMPILAN MOBILE (SIDEBAR) --- */}
      <div className="md:hidden">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="relative size-14 rounded-full border-2 border-yellow-400/80 bg-yellow-200 shadow-lg transition hover:scale-105"
        >
          <img
            src={avatar}
            alt="Buka Menu Pengguna"
            className="size-full rounded-full object-cover"
          />
          <div className="absolute bottom-0 right-0 grid size-5 place-items-center rounded-full border-2 border-yellow-400 bg-form-bg">
            <MenuIcon className="size-3 text-brand-yellow" />
          </div>
        </button>

        {/* Overlay Latar Belakang */}
        <div
          className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity ${isSidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
          onClick={() => setIsSidebarOpen(false)}
        ></div>

        {/* Sidebar Konten */}
        <div
          className={`fixed left-0 top-0 z-50 h-full w-72 max-w-[80vw] transform border-r-4 border-yellow-400/80 bg-form-bg transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="relative flex h-full flex-col">
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="absolute right-3 top-3 text-brand-yellow/80 hover:text-brand-yellow"
            >
              <CloseIcon className="size-7" />
            </button>
            <UserInfoSidebarContent {...userInfoProps} />
          </div>
        </div>
      </div>
    </>
  );
}
