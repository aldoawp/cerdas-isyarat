'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  UserIcon,
  LockIcon,
  EyeOpenIcon,
  EyeClosedIcon,
} from '@/components/icons';
import { useProtectedRoute, usePageLoading } from '@/lib/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';
import { insertEventLog } from '@/repositories/event-log-repository';
import LoadingScreen from '@/components/shared/loading-screen';
import { logAuthError } from '@/lib/utils/error-logger';

export default function LoginPage() {
  const router = useRouter();
  const { loading: authLoading } = useProtectedRoute();
  const { isPageLoading } = usePageLoading();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!username || !password) {
      setError('Username dan password tidak boleh kosong!');
      setIsShaking(true);
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      // First, try to find user by email or username in the users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email, username, full_name')
        .or(`email.eq.${username},username.eq.${username}`)
        .single();

      if (userError || !userData) {
        throw new Error('User not found');
      }

      // Use the email for Supabase Auth login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Log login event
        try {
          await insertEventLog({
            event_type: 'authentication',
            event_name: 'user_login',
            description: 'User logged in successfully',
            actor_type: 'user',
            actor_id: data.user.id,
          });
        } catch (logError) {
          // Don't block login if event logging fails
          console.error('Failed to log login event:', logError);
        }

        // Store user data in localStorage for backward compatibility
        localStorage.setItem(
          'loggedInUser',
          JSON.stringify({
            fullName: userData.full_name || userData.username, // Use full_name if available, fallback to username
            username: userData.username,
            email: userData.email,
            id: data.user.id,
          })
        );

        // Redirect to onboarding page
        router.push('/onboarding');
      }
    } catch (error) {
      // Log authentication error
      await logAuthError(error);
      setError('Username atau password salah, coba lagi ya!');
      setIsShaking(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isShaking) {
      const timer = setTimeout(() => setIsShaking(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isShaking]);

  // Show loading screen while page is loading or checking authentication
  if (isPageLoading || authLoading) {
    return <LoadingScreen message="Halaman sedang dimuat..." />;
  }

  return (
    <div className="page-container relative grid min-h-screen place-items-center overflow-hidden p-4 font-sans">
      <main className="z-10 w-full max-w-md">
        <div className="mb-12 text-center">
          {/* Menggunakan utility class text-stroke yang baru dibuat */}
          <h1 className="text-5xl font-bold text-brand-yellow drop-shadow-lg text-stroke-md md:text-7xl">
            CerdasIsyarat
          </h1>
          {/* Menggunakan utility class text-stroke yang lebih kecil */}
          <h2 className="mt-2 whitespace-nowrap text-xl font-bold text-subtitle-cream drop-shadow-lg text-stroke sm:text-2xl md:text-3xl lg:text-4xl">
            Belajar Bahasa Isyarat Asik
          </h2>
        </div>

        <div className="relative w-full rounded-3xl border-4 border-brand-brown-stroke bg-form-bg p-8 pt-4 shadow-lg">
          <div className="absolute left-1/2 top-0 w-full -translate-x-1/2 -translate-y-1/2 text-center">
            <span className="inline-block w-3/4 rounded-[24px] border-4 border-brand-brown-stroke bg-amber-500 py-4 text-2xl font-bold text-white shadow-lg md:text-3xl">
              LOGIN
            </span>
          </div>

          {/* Menambahkan font-comic ke form agar semua teks di dalamnya menggunakan font comic */}
          <form className="mt-12 font-comic" onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
              {/* Input Username */}
              <div className="relative flex items-center">
                <div className="absolute left-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg bg-icon-red-bg md:size-9">
                  <UserIcon />
                </div>
                <input
                  type="text"
                  placeholder="Username atau Email"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  disabled={isLoading}
                  // Menghilangkan style inline, properti diatur oleh class
                  className="h-12 w-full rounded-[20px] border-4 border-input-border bg-input-bg p-2 pl-12 text-sm font-bold text-brand-brown-stroke placeholder:text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 md:h-14 md:text-base"
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
                  disabled={isLoading}
                  // Menghilangkan style inline
                  className="h-12 w-full rounded-[20px] border-4 border-input-border bg-input-bg p-2 pl-12 text-sm font-bold text-brand-brown-stroke placeholder:text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 md:h-14 md:text-base"
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 focus:outline-none"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  disabled={isLoading}
                >
                  {passwordVisible ? (
                    <EyeOpenIcon className="size-6" />
                  ) : (
                    <EyeClosedIcon className="size-6" />
                  )}
                </button>
              </div>
            </div>

            {/* <Link
              href="/lupa-password"
              // Menghilangkan style inline
              className="mt-2 block text-right text-sm font-bold text-amber-700 hover:underline"
            >
              Lupa password?
            </Link> */}

            {error && (
              <p className="mt-3 text-center text-sm font-semibold text-red-600">
                {error}
              </p>
            )}

            <div className="mt-4 text-center">
              <button
                type="submit"
                disabled={isLoading}
                // Mengganti 'shake' dengan 'animate-shake' dari config
                className={`w-full rounded-[15px] border-4 border-brand-brown-stroke bg-amber-500 py-3 text-2xl font-bold text-white transition duration-300 hover:bg-yellow-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${isShaking ? 'animate-shake' : ''}`}
              >
                {isLoading ? 'MEMPROSES...' : 'MASUK'}
              </button>
            </div>

            <p className="mt-6 text-center text-sm font-bold text-amber-700">
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

      <div className="pointer-events-none absolute bottom-[-55px] right-0 z-20 w-60 md:w-72 lg:w-80 xl:w-96">
        <Image
          src="/images/mascot-cropped-1-tp 1.png"
          alt="Mascot Cerdas Isyarat"
          width={300}
          height={350}
          className="h-auto w-full"
          priority
        />
      </div>
    </div>
  );
}
