'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
// 1. Import useRouter untuk navigasi
import { useRouter } from 'next/navigation';

// --- TIPE DATA & INTERFACE ---
interface User {
  fullName: string;
  age: string;
  username: string;
  password: string;
}

// --- KOMPONEN IKON ---
const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="size-5 text-white md:size-6"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
      clipRule="evenodd"
    />
  </svg>
);
const LockIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="size-5 text-white md:size-6"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
      clipRule="evenodd"
    />
  </svg>
);
const EyeOpenIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);
const EyeClosedIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243l-4.243-4.243"
    />
  </svg>
);

// --- KOMPONEN UTAMA HALAMAN LOGIN ---
export default function LoginPage() {
  // 2. Inisialisasi router
  const router = useRouter();
  const textStrokeStyle = {
    WebkitTextStroke: '6px #CE7310',
    paintOrder: 'stroke fill',
  };

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Username dan password tidak boleh kosong!');
      setIsShaking(true);
      return;
    }

    const existingUsersRaw = localStorage.getItem('users');
    const existingUsers: User[] = existingUsersRaw
      ? JSON.parse(existingUsersRaw)
      : [];

    const foundUser = existingUsers.find(
      user => user.username.toLowerCase() === username.toLowerCase()
    );

    if (foundUser && foundUser.password === password) {
      // SIMPAN PENGGUNA YANG LOGIN KE LOCALSTORAGE
      localStorage.setItem('loggedInUser', JSON.stringify(foundUser));

      // 3. Arahkan ke halaman onboarding setelah login berhasil
      router.push('/onboarding');
    } else {
      setError('Username atau password salah, coba lagi ya!');
      setIsShaking(true);
    }
  };

  useEffect(() => {
    if (isShaking) {
      const timer = setTimeout(() => setIsShaking(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isShaking]);

  return (
    <>
      <style>{`
                @keyframes shake { 10%, 90% { transform: translateX(-1px); } 20%, 80% { transform: translateX(2px); } 30%, 50%, 70% { transform: translateX(-4px); } 40%, 60% { transform: translateX(4px); } }
                .shake { animation: shake 0.5s ease-in-out; }
            `}</style>

      <div className="relative grid min-h-screen place-items-center overflow-hidden bg-mobile-bg bg-cover bg-center p-4 font-sans md:bg-desktop-bg">
        <main className="z-10 w-full max-w-md">
          <div className="mb-12 text-center">
            <h1
              className="text-5xl font-bold text-brand-yellow drop-shadow-lg md:text-7xl"
              style={textStrokeStyle}
            >
              CerdasIsyarat
            </h1>
            <h2
              className="mt-2 whitespace-nowrap text-xl font-bold text-subtitle-cream drop-shadow-lg sm:text-2xl md:text-3xl lg:text-4xl"
              style={textStrokeStyle}
            >
              Belajar Bahasa Isyarat Asik
            </h2>
          </div>

          <div className="relative w-full rounded-3xl bg-form-bg p-8 pt-4 shadow-lg">
            <div className="absolute left-1/2 top-0 w-full -translate-x-1/2 -translate-y-1/2 text-center">
              <span className="inline-block w-3/4 rounded-[24px] bg-[#F59E0B] py-4 text-2xl font-bold text-white shadow-lg md:text-3xl">
                LOGIN
              </span>
            </div>

            <form className="mt-12" onSubmit={handleSubmit} noValidate>
              <div className="space-y-4">
                {/* Input Username */}
                <div className="relative flex items-center">
                  <div className="absolute left-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg bg-icon-red-bg md:size-9">
                    <UserIcon />
                  </div>
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="h-12 w-full rounded-[20px] border-4 border-input-border bg-input-bg p-2 pl-12 text-sm text-brand-brown-stroke placeholder-[#B68326] focus:outline-none md:h-14 md:text-base"
                    style={{ fontFamily: '"Comic Sans MS", cursive' }}
                  />
                </div>
                {/* Input Password */}
                <div className="relative flex items-center">
                  <div className="absolute left-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg bg-icon-teal-bg md:size-9">
                    <LockIcon />
                  </div>
                  <input
                    type={passwordVisible ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="h-12 w-full rounded-[20px] border-4 border-input-border bg-input-bg p-2 pl-12 text-sm text-brand-brown-stroke placeholder-[#B68326] focus:outline-none md:h-14 md:text-base"
                    style={{ fontFamily: '"Comic Sans MS", cursive' }}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 focus:outline-none"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                  >
                    {passwordVisible ? (
                      <EyeOpenIcon className="size-6" />
                    ) : (
                      <EyeClosedIcon className="size-6" />
                    )}
                  </button>
                </div>
              </div>

              {/* 4. Ganti <a> dengan <Link> */}
              <Link
                href="/lupa-password"
                className="mt-2 block text-right text-sm text-[#B68326] hover:underline"
                style={{ fontFamily: '"Comic Sans MS", cursive' }}
              >
                Lupa password?
              </Link>

              {error && (
                <p className="mt-3 text-center text-sm font-semibold text-red-600">
                  {error}
                </p>
              )}

              <div className="mt-4 text-center">
                <button
                  type="submit"
                  className={`w-full rounded-[15px] bg-[#F59E0B] py-3 text-2xl font-bold text-white transition duration-300 hover:bg-yellow-600 ${isShaking ? 'shake' : ''}`}
                >
                  MASUK
                </button>
              </div>

              <p
                className="mt-6 text-center text-sm text-[#B68326]"
                style={{ fontFamily: '"Comic Sans MS", cursive' }}
              >
                Belum punya akun?{' '}
                <Link
                  href="/register"
                  className="rounded-md bg-yellow-300 px-2 py-1 font-bold text-brand-brown-stroke hover:underline"
                >
                  Daftar Sekarang
                </Link>
              </p>
            </form>
          </div>
        </main>

        <div className="pointer-events-none absolute bottom-0 right-0 z-20 w-36 md:w-52 lg:w-64 xl:w-72">
          <img
            src="/images/mascot-cropped-1-tp 1.png"
            alt="Mascot Cerdas Isyarat"
            className="h-auto w-full"
          />
        </div>
      </div>
    </>
  );
}
