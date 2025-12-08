'use client';

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect, // 1. TAMBAHKAN INI
} from 'react';
import { useRouter } from 'next/navigation';
import BackButton from '@/components/shared/backbutton/backbutton';
import UserDetail from '@/components/shared/userinfo';
import MusicPlayer from '@/components/shared/musicplayer/musicplayer';
import Image from 'next/image';
import { CameraIcon, RefreshIcon, CloseIcon } from '@/components/icons';
import InstructionCard from '@/components/intro-tebak-gerakan/instruction-card';
import { useRequireAuth, usePageLoading } from '@/lib/contexts/auth-context';
import LoadingScreen from '@/components/shared/loading-screen';

import RulesModal from '@/components/tebak-gerakan/rules-modal';

// 2. TAMBAHKAN HOOK INI (Breakpoint 'md' Tailwind = 768px)
const useIsDesktop = (breakpoint = 768) => {
  const [isDesktop, setIsDesktop] = useState(false);

  useLayoutEffect(() => {
    const updateMedia = () => {
      setIsDesktop(window.innerWidth >= breakpoint);
    };

    updateMedia(); // Set nilai awal saat komponen dimuat di client

    window.addEventListener('resize', updateMedia);
    return () => window.removeEventListener('resize', updateMedia);
  }, [breakpoint]);

  return isDesktop;
};

export default function IntroTebakGerakanPage() {
  const router = useRouter();
  const { loading: authLoading } = useRequireAuth();
  const { isPageLoading } = usePageLoading();
  const isDesktop = useIsDesktop(); // 3. PANGGIL HOOKNYA

  const videoRef = useRef<HTMLVideoElement>(null);
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

  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

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

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = undefined;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null; // eslint-disable-line unicorn/no-null
    }
    setIsCameraActive(false);
    setError(undefined);
  }, []);

  const activateCamera = useCallback(
    async (deviceId?: string, retryCount = 0) => {
      setError(undefined);
      setIsActivatingCamera(true);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Browser kamu tidak mendukung akses kamera.');
        setIsActivatingCamera(false);
        return;
      }

      // Set camera active first to render video element
      if (!isCameraActive && retryCount === 0) {
        setIsCameraActive(true);
        // Wait for video element to be mounted
        setTimeout(() => activateCamera(deviceId, 1), 100);
        return;
      }

      if (!videoRef.current) {
        if (retryCount < 5) {
          setTimeout(() => activateCamera(deviceId, retryCount + 1), 100);
          return;
        }
        setError('Video element tidak ditemukan.');
        setIsActivatingCamera(false);
        setIsCameraActive(false);
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

        if (!videoElement) {
          setIsActivatingCamera(false);
          setIsCameraActive(false);
          return;
        }

        videoElement.srcObject = stream;

        const handleLoadedMetadata = () => {
          videoElement
            .play()
            .then(() => {
              setIsActivatingCamera(false);
              getAvailableCameras();
            })
            .catch(_playError => {
              setError('Gagal memutar video dari kamera.');
              setIsActivatingCamera(false);
              setIsCameraActive(false);
            });
        };

        videoElement.addEventListener('loadedmetadata', handleLoadedMetadata, {
          once: true,
        });
      } catch (error_: unknown) {
        let errorMessage = 'Kamera tidak bisa diakses. ';
        if (error_ instanceof Error) {
          switch (error_.name) {
            case 'NotAllowedError': {
              errorMessage +=
                'Pastikan kamu sudah memberikan izin akses kamera.';
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
          }
        }
        setError(errorMessage);
        setIsCameraActive(false);
        setIsActivatingCamera(false);
      }
    },
    [currentCameraId, getAvailableCameras, isCameraActive]
  );

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
  }, [stopCamera]);

  const handleBack = () => {
    router.push('/onboarding');
  };

  const handleStartGame = () => {
    setIsRulesModalOpen(true);
  };

  const confirmAndStartGame = () => {
    setIsRulesModalOpen(false);
    stopCamera();
    setTimeout(() => {
      router.push('/tebak-gerakan');
    }, 200);
  };

  if (isPageLoading || authLoading) {
    return <LoadingScreen message="Halaman sedang dimuat..." />;
  }

  return (
    <div className="min-h-screen bg-mobile-bg bg-cover bg-center font-sans md:bg-desktop-bg">
      <RulesModal
        isOpen={isRulesModalOpen}
        onConfirm={confirmAndStartGame}
        onCancel={() => setIsRulesModalOpen(false)}
      />

      <div className="flex min-h-screen flex-col">
        <header className="fixed inset-x-0 top-0 z-30 bg-gradient-to-b from-black/10 to-transparent p-3 md:p-4">
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

        <main className="flex flex-1 flex-col px-3 pb-3 pt-14 md:px-4 md:pb-4 md:pt-20">
          {/* Header Title - More Compact on Mobile */}
          <div className="mb-2 text-center md:mb-6">
            <h1 className="text-2xl font-bold text-brand-yellow drop-shadow-lg text-stroke-md md:text-5xl">
              TEBAK GERAKAN
            </h1>
            <p className="mt-0.5 text-xs font-bold text-subtitle-cream text-stroke-sm md:mt-1 md:text-xl">
              Skor tertinggi: {score}
            </p>
          </div>

          {/* Content Cards */}
          <div className="mb-2 flex flex-1 items-center justify-center md:mb-6">
            {/* 4. GUNAKAN CONDITIONAL RENDERING */}
            {isDesktop ? (
              /* Desktop Layout - HILANGKAN 'hidden' dan 'md:grid' */
              <div className="grid w-full max-w-6xl grid-cols-3 gap-6">
                <InstructionCard step="1" title="AKTIFKAN KAMERA">
                  <div className="relative flex h-56 w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-orange-200/50 bg-gradient-to-br from-orange-100/50 to-yellow-100/50 shadow-inner">
                    {!isCameraActive && (
                      <div className="flex flex-col items-center text-center text-brand-brown-stroke/70">
                        <CameraIcon className="mb-3 size-20" />
                        <p className="text-base font-semibold">
                          Preview kamera akan muncul di sini
                        </p>
                        {availableCameras.length > 0 && (
                          <p className="mt-1 text-sm text-brand-brown-stroke/50">
                            {availableCameras.length} kamera tersedia
                          </p>
                        )}
                      </div>
                    )}
                    {/* INI videoRef UNTUK DESKTOP */}
                    <video
                      ref={videoRef}
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
                            <CloseIcon className="size-4" />
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
                            <option
                              key={camera.deviceId}
                              value={camera.deviceId}
                            >
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
                      src="/images/bisindo.png"
                      width={80}
                      height={80}
                      alt="Contoh Gerakan"
                      className="size-full object-contain"
                    />
                  </div>
                </InstructionCard>
                <InstructionCard step="3" title="TIRU & DAPATKAN POIN">
                  <div className="mx-auto flex aspect-square w-full max-w-[200px] items-center justify-center rounded-2xl border-2 border-orange-200/50 bg-gradient-to-br from-orange-100/50 to-yellow-100/50 shadow-inner">
                    <Image
                      src="/images/tiru.jpg"
                      width={80}
                      height={80}
                      alt="Contoh Gerakan"
                      className="size-full object-contain"
                    />
                  </div>
                </InstructionCard>
              </div>
            ) : (
              /* Mobile Layout - HILANGKAN 'md:hidden' */
              <div className="flex w-full flex-col gap-2">
                {/* Card 1 - Camera - Larger */}
                <div className="rounded-xl border-2 border-orange-300/70 bg-gradient-to-br from-orange-50/90 to-yellow-50/90 p-2.5 shadow-lg backdrop-blur-sm">
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <div className="flex size-6 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-yellow-500 font-comic text-xs font-bold text-white shadow-md">
                      1
                    </div>
                    <h3 className="font-comic text-xs font-bold text-brand-brown-stroke">
                      AKTIFKAN KAMERA
                    </h3>
                  </div>
                  <div className="relative mx-auto flex aspect-square w-full max-w-[280px] items-center justify-center overflow-hidden rounded-lg border-2 border-orange-200/50 bg-gradient-to-br from-orange-100/50 to-yellow-100/50 shadow-inner">
                    {!isCameraActive && (
                      <div className="flex flex-col items-center text-center text-brand-brown-stroke/70">
                        <CameraIcon className="mb-1.5 size-10" />
                        <p className="text-[10px] font-semibold">
                          Preview kamera
                        </p>
                      </div>
                    )}
                    {/* INI videoRef UNTUK MOBILE */}
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`absolute inset-0 size-full -scale-x-100 rounded-lg object-cover ${isCameraActive ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
                    />
                    {isCameraActive && (
                      <div className="absolute right-1.5 top-1.5 z-20 flex gap-1">
                        {availableCameras.length > 1 && (
                          <button
                            onClick={switchCamera}
                            className="rounded-full bg-blue-500 p-1 text-white shadow-lg transition hover:scale-110 hover:bg-blue-600"
                            title="Ganti Kamera"
                          >
                            <RefreshIcon className="size-3" />
                          </button>
                        )}
                        <button
                          onClick={stopCamera}
                          className="rounded-full bg-red-500 p-1 text-white shadow-lg transition hover:scale-110 hover:bg-red-600"
                          title="Matikan Kamera"
                        >
                          <CloseIcon className="size-3" />
                        </button>
                      </div>
                    )}
                  </div>
                  {!isCameraActive && (
                    <button
                      onClick={() => activateCamera()}
                      disabled={isActivatingCamera}
                      className="mt-1.5 w-full rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-3 py-1.5 font-comic text-xs font-bold text-white shadow-lg transition hover:scale-105 disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                      {isActivatingCamera
                        ? 'Mengaktifkan...'
                        : 'Aktifkan Kamera'}
                    </button>
                  )}
                  {error && (
                    <div className="mt-1 rounded-lg border border-red-300 bg-red-100 p-1.5">
                      <p className="text-[9px] font-semibold leading-tight text-red-600">
                        {error}
                      </p>
                    </div>
                  )}
                </div>

                {/* Card 2 & 3 - Side by Side, Smaller */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Card 2 */}
                  <div className="rounded-xl border-2 border-orange-300/70 bg-gradient-to-br from-orange-50/90 to-yellow-50/90 p-2.5 shadow-lg backdrop-blur-sm">
                    <div className="mb-1.5 flex items-center gap-1.5">
                      <div className="flex size-6 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-yellow-500 font-comic text-xs font-bold text-white shadow-md">
                        2
                      </div>
                      <h3 className="font-comic text-[10px] font-bold leading-tight text-brand-brown-stroke">
                        LIHAT GERAKAN
                      </h3>
                    </div>
                    <div className="flex aspect-square items-center justify-center rounded-lg border-2 border-orange-200/50 bg-gradient-to-br from-orange-100/50 to-yellow-100/50 shadow-inner">
                      <Image
                        src="/images/placeholder-materi.png"
                        width={48}
                        height={48}
                        alt="Contoh Gerakan"
                        className="size-12 object-contain"
                      />
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="rounded-xl border-2 border-orange-300/70 bg-gradient-to-br from-orange-50/90 to-yellow-50/90 p-2.5 shadow-lg backdrop-blur-sm">
                    <div className="mb-1.5 flex items-center gap-1.5">
                      <div className="flex size-6 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-yellow-500 font-comic text-xs font-bold text-white shadow-md">
                        3
                      </div>
                      <h3 className="font-comic text-[10px] font-bold leading-tight text-brand-brown-stroke">
                        TIRU & POIN
                      </h3>
                    </div>
                    <div className="flex aspect-square items-center justify-center rounded-lg border-2 border-orange-200/50 bg-gradient-to-br from-orange-100/50 to-yellow-100/50 shadow-inner">
                      <p className="text-3xl font-bold text-brand-brown-stroke">
                        ?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Start Button */}
          <div className="text-center">
            <button
              onClick={handleStartGame}
              disabled={!isCameraActive}
              className="rounded-full bg-gradient-to-r from-orange-400 to-yellow-500 px-6 py-2 font-comic text-base font-bold text-white shadow-xl transition-all hover:scale-105 disabled:cursor-not-allowed disabled:grayscale disabled:hover:scale-100 md:px-8 md:py-3 md:text-xl"
            >
              Mulai Sekarang
            </button>
          </div>
        </main>

        {/* Mascot - Smaller on Mobile */}
        {isMascotVisible && (
          <div className="pointer-events-none fixed bottom-0 right-0 z-20 w-20 md:w-48">
            <div className="relative">
              <Image
                src="/images/rule.png"
                width={192}
                height={243}
                alt="Mascot"
                className="h-auto w-full"
              />
              <div className="pointer-events-auto absolute -left-2 -top-5 w-24 md:-left-4 md:-top-8 md:w-44">
                <div className="relative rounded-lg border-2 border-orange-200 bg-gradient-to-br from-orange-100 to-yellow-100 p-1.5 text-center font-comic text-[9px] font-bold leading-tight text-brand-brown-stroke shadow-xl md:rounded-xl md:p-2 md:text-xs">
                  <p>Yuk tiru gerakan tangan!</p>
                  <div className="border-x-6 border-t-6 absolute -bottom-2 left-1/2 size-0 -translate-x-1/2 border-x-transparent border-t-orange-100"></div>
                  <button
                    onClick={() => setIsMascotVisible(false)}
                    className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition-colors hover:bg-red-600 md:size-4"
                  >
                    <CloseIcon className="size-2.5 md:size-2.5" />
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
