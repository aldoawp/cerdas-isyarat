'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import BackButton from '@/components/backbutton/backbutton';
import UserDetail from '@/components/userinfo/userinfo';
import MusicPlayer from '@/components/musicplayer/musicplayer';
import Image from 'next/image';

// --- KOMPONEN IKON ---
const CameraIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    {' '}
    <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />{' '}
    <path
      fillRule="evenodd"
      d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.342 1.374a3.026 3.026 0 01.64 2.288V17.5a3.026 3.026 0 01-.64 2.288c-.512.79-1.375 1.322-2.342 1.374a49.52 49.52 0 01-5.312 0c-.967-.052-1.83-.585-2.342-1.374a3.026 3.026 0 01-.64-2.288V6.733a3.026 3.026 0 01.64-2.288c.512-.79 1.375 1.322 2.342 1.374zM12 18a6 6 0 100-12 6 6 0 000 12z"
      clipRule="evenodd"
    />{' '}
  </svg>
);
const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    {' '}
    <path d="M18 6 6 18" /> <path d="m6 6 12 12" />{' '}
  </svg>
);
const RefreshIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    {' '}
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />{' '}
    <path d="M21 3v5h-5" />{' '}
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />{' '}
    <path d="M3 21v-5h5" />{' '}
  </svg>
);

// --- KOMPONEN KARTU INSTRUKSI ---
interface InstructionCardProps {
  step: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}
const InstructionCard = ({
  step,
  title,
  children,
  className = '',
}: InstructionCardProps) => (
  <div
    className={`relative rounded-3xl border-4 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50 p-3 shadow-lg ${className}`}
  >
    {' '}
    <div className="absolute -top-4 left-4">
      {' '}
      <span className="rounded-full border-2 border-white bg-gradient-to-r from-orange-500 to-yellow-600 px-3 py-1.5 font-comic text-sm font-bold text-white shadow-md">
        {' '}
        {step}{' '}
      </span>{' '}
    </div>{' '}
    <div className="mt-4 flex h-full flex-col items-center justify-center text-center">
      {' '}
      <h3 className="mb-2 font-comic text-lg font-bold text-brand-brown-stroke">
        {title}
      </h3>{' '}
      {children}{' '}
    </div>{' '}
  </div>
);

// --- KOMPONEN UTAMA HALAMAN TEBAK GERAKAN ---
export default function TebakGerakanPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | undefined>(undefined);
  const streamRef = useRef<MediaStream | undefined>(undefined);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isActivatingCamera, setIsActivatingCamera] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [score] = useState(0);
  const [isMascotVisible, setIsMascotVisible] = useState(true);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>(
    []
  );
  const [currentCameraId, setCurrentCameraId] = useState<string>('');

  const getAvailableCameras = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        device => device.kind === 'videoinput'
      );
      setAvailableCameras(videoDevices);

      if (videoDevices.length > 0 && !currentCameraId) {
        setCurrentCameraId(videoDevices[0].deviceId);
      }
    } catch {
      // Error handling
    }
  }, [currentCameraId]);

  useEffect(() => {
    getAvailableCameras();
  }, [getAvailableCameras]);

  const activateCamera = async (deviceId?: string) => {
    setError(undefined);
    setIsActivatingCamera(true);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Browser kamu tidak mendukung akses kamera.');
      setIsActivatingCamera(false);
      return;
    }

    if (!videoRef.current) {
      setTimeout(() => activateCamera(deviceId), 200);
      return;
    }

    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) track.stop();
      streamRef.current = undefined;
    }

    const constraints: MediaStreamConstraints = {
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        frameRate: { ideal: 30 },
      },
    };

    const selectedDeviceId = deviceId || currentCameraId;
    if (constraints.video && typeof constraints.video === 'object') {
      if (selectedDeviceId) {
        constraints.video.deviceId = { exact: selectedDeviceId };
      } else {
        constraints.video.facingMode = 'user';
      }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      const videoElement = videoRef.current;

      videoElement.srcObject = stream;
      videoElement.addEventListener('loadedmetadata', () => {
        videoElement
          .play()
          .then(() => {
            setIsCameraActive(true);
            setIsActivatingCamera(false);
            getAvailableCameras();
          })
          .catch(_playError => {
            setError('Gagal memutar video dari kamera.');
            setIsActivatingCamera(false);
          });
      });
    } catch (error_: unknown) {
      let errorMessage = 'Kamera tidak bisa diakses. ';
      if (error_ instanceof Error) {
        switch (error_.name) {
          case 'NotAllowedError': {
            errorMessage += 'Pastikan kamu sudah memberikan izin akses kamera.';

            break;
          }
          case 'NotFoundError': {
            errorMessage += 'Kamera tidak ditemukan di perangkat kamu.';

            break;
          }
          case 'NotReadableError': {
            errorMessage += 'Kamera mungkin sedang digunakan aplikasi lain.';

            break;
          }
          // No default
        }
      }
      setError(errorMessage);
      setIsCameraActive(false);
      setIsActivatingCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) track.stop();
      streamRef.current = undefined;
    }
    if (videoRef.current) {
      // [DIPERBAIKI] Diubah kembali ke null sesuai tipe DOM API
      // dan aturan ESLint dimatikan untuk baris ini.
      // eslint-disable-next-line unicorn/no-null
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setError(undefined);
  };

  const switchCamera = () => {
    if (availableCameras.length <= 1) return;
    const currentIndex = availableCameras.findIndex(
      cam => cam.deviceId === currentCameraId
    );
    const nextIndex = (currentIndex + 1) % availableCameras.length;
    const nextCamera = availableCameras[nextIndex];
    setCurrentCameraId(nextCamera.deviceId);
    activateCamera(nextCamera.deviceId);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleBack = () => {
    router.push('/onboarding');
  };

  return (
    <div className="min-h-screen bg-mobile-bg bg-cover bg-center font-sans md:bg-desktop-bg">
      <div className="flex min-h-screen flex-col">
        <header className="fixed inset-x-0 top-0 z-30 bg-gradient-to-b from-black/10 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BackButton onClick={handleBack} />
            </div>
            <div className="flex items-center pr-20">
              <div className="md:hidden">
                <UserDetail mode="sidebar" />
              </div>
              <div className="hidden md:block">
                <UserDetail mode="dropdown" />
              </div>
            </div>
          </div>
        </header>
        <MusicPlayer />

        <main className="flex flex-1 flex-col px-4 pb-4 pt-20">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-brand-yellow drop-shadow-lg text-stroke-md md:text-5xl">
              TEBAK GERAKAN
            </h1>
            <p className="mt-1 text-lg font-bold text-subtitle-cream text-stroke-sm md:text-xl">
              Skor tertinggi: {score}
            </p>
          </div>

          <div className="mb-6 flex flex-1 items-center justify-center overflow-y-auto">
            <div className="grid w-full max-w-6xl grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
              <InstructionCard step="1" title="AKTIFKAN KAMERA">
                <div className="relative flex h-48 w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-orange-200/50 bg-gradient-to-br from-orange-100/50 to-yellow-100/50 shadow-inner md:h-56">
                  {!isCameraActive && (
                    <div className="flex flex-col items-center text-center text-brand-brown-stroke/70">
                      <CameraIcon className="mb-3 size-16 md:size-20" />
                      <p className="text-sm font-semibold md:text-base">
                        Preview kamera akan muncul di sini
                      </p>
                      {availableCameras.length > 0 && (
                        <p className="mt-1 text-sm text-brand-brown-stroke/50">
                          {availableCameras.length} kamera tersedia
                        </p>
                      )}
                    </div>
                  )}
                  <video
                    ref={videoRef as React.RefObject<HTMLVideoElement>}
                    autoPlay
                    playsInline
                    muted
                    className={`absolute inset-0 size-full -scale-x-100 rounded-2xl object-cover ${isCameraActive ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
                  />
                  {isCameraActive && (
                    <>
                      <div className="absolute right-3 top-3 z-20 flex gap-2">
                        {availableCameras.length > 1 && (
                          <button
                            onClick={switchCamera}
                            className="rounded-full bg-blue-500 p-2 text-white shadow-lg transition hover:scale-110 hover:bg-blue-600"
                            title="Ganti Kamera"
                          >
                            <RefreshIcon className="size-4" />
                          </button>
                        )}
                        <button
                          onClick={stopCamera}
                          className="rounded-full bg-red-500 p-2 text-white shadow-lg transition hover:scale-110 hover:bg-red-600"
                          title="Matikan Kamera"
                        >
                          <XIcon className="size-4" />
                        </button>
                      </div>
                      <div className="absolute bottom-2 left-2 z-20 rounded-lg bg-black/70 px-3 py-1 font-comic text-xs text-white">
                        {availableCameras
                          .find(cam => cam.deviceId === currentCameraId)
                          ?.label?.slice(0, 15) + '...' || 'Kamera Aktif'}
                      </div>
                    </>
                  )}
                </div>
                {!isCameraActive && (
                  <div className="mt-3 w-full space-y-2">
                    <button
                      onClick={() => activateCamera()}
                      disabled={isActivatingCamera}
                      className="w-full rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-3 py-2 font-comic text-sm font-bold text-white shadow-lg transition hover:scale-105 disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                      {isActivatingCamera ? 'Mengaktifkan...' : 'Aktifkan'}
                    </button>
                    {availableCameras.length > 1 && (
                      <select
                        value={currentCameraId}
                        onChange={e => setCurrentCameraId(e.target.value)}
                        disabled={isActivatingCamera}
                        className="w-full appearance-none truncate rounded-xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50 px-3 py-2 pr-8 font-comic text-xs font-semibold text-brand-brown-stroke shadow-inner focus:outline-none focus:ring-2 focus:ring-orange-400"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23CE7310' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: 'right 0.5rem center',
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '1em 1em',
                        }}
                      >
                        {availableCameras.map((camera, index) => (
                          <option key={camera.deviceId} value={camera.deviceId}>
                            {camera.label?.slice(0, 20) + '...' ||
                              `Kamera ${index + 1}`}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
                {error && (
                  <div className="mt-2 rounded-lg border border-red-300 bg-red-100 p-2">
                    <p className="text-xs font-semibold text-red-600">
                      {error}
                    </p>
                  </div>
                )}
              </InstructionCard>

              <InstructionCard step="2" title="LIHAT GERAKAN">
                <div className="mx-auto flex aspect-square w-full max-w-[200px] items-center justify-center rounded-2xl border-2 border-orange-200/50 bg-gradient-to-br from-orange-100/50 to-yellow-100/50 shadow-inner">
                  <Image
                    src="/images/placeholder-materi.png"
                    width={80}
                    height={80}
                    alt="Contoh Gerakan"
                    className="size-20 object-contain"
                  />
                </div>
              </InstructionCard>

              <InstructionCard step="3" title="TIRU & DAPATKAN POIN">
                <div className="mx-auto flex aspect-square w-full max-w-[200px] items-center justify-center rounded-2xl border-2 border-orange-200/50 bg-gradient-to-br from-orange-100/50 to-yellow-100/50 shadow-inner">
                  <p className="text-5xl font-bold text-brand-brown-stroke">
                    ?
                  </p>
                </div>
              </InstructionCard>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => router.push('/tes-tebak-gerakan')}
              disabled={!isCameraActive}
              className="rounded-full bg-gradient-to-r from-orange-400 to-yellow-500 px-8 py-3 font-comic text-xl font-bold text-white shadow-xl transition-all hover:scale-105 disabled:cursor-not-allowed disabled:grayscale disabled:hover:scale-100"
            >
              Mulai Sekarang
            </button>
          </div>
        </main>

        {isMascotVisible && (
          <div className="pointer-events-none fixed bottom-0 right-0 z-20 w-32 md:w-48">
            <div className="relative">
              <Image
                src="/images/mascot2.png"
                width={192}
                height={243}
                alt="Mascot"
                className="h-auto w-full"
              />
              <div className="pointer-events-auto absolute -top-8 left-0 w-36 md:-left-4 md:w-44">
                <div className="relative rounded-xl border-2 border-orange-200 bg-gradient-to-br from-orange-100 to-yellow-100 p-2 text-center font-comic text-xs font-bold text-brand-brown-stroke shadow-xl">
                  <p>Yuk tiru gerakan tangan yang kamu lihat!</p>
                  <div className="border-x-6 border-t-6 absolute -bottom-2 left-1/2 size-0 -translate-x-1/2 border-x-transparent border-t-orange-100"></div>
                  <button
                    onClick={() => setIsMascotVisible(false)}
                    className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition-colors hover:bg-red-600"
                  >
                    <XIcon className="size-2.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
