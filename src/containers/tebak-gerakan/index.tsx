'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { StarIcon, ClockIcon } from '@/components/icons';
import { useRouter } from 'next/navigation';
import BackButton from '@/components/backbutton/backbutton';

// --- Tipe Data & Data Awal ---
interface Movement {
  id: number;
  name: string;
  imageUrl: string;
}
const mockMovements: Movement[] = [
  {
    id: 1,
    name: 'Kucing',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Cat03.jpg',
  },
  {
    id: 2,
    name: 'Anjing',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/3/32/Golden_Retriever_Carlos_%2810509950996%29.jpg',
  },
  {
    id: 3,
    name: 'Makan',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/b/b5/Eating_sushi_in_a_Japanese_restaurant.jpg',
  },
  {
    id: 4,
    name: 'Tidur',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/4/4d/Sleeping_cat_on_her_back.jpg',
  },
  {
    id: 5,
    name: 'Minum',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/1/14/Drinking_water_glass.jpg',
  },
  {
    id: 6,
    name: 'Mobil',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/0f/Blue_tesla_model_3.jpg',
  },
  {
    id: 7,
    name: 'Sepeda',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/d/da/Cyclist_on_bike.jpg',
  },
  {
    id: 8,
    name: 'Sekolah',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/a/a2/Primary_school_classroom_in_Tanzania.jpg',
  },
  {
    id: 9,
    name: 'Buku',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Book.jpg',
  },
  {
    id: 10,
    name: 'Pohon',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/f/f6/Oak_tree.jpg',
  },
];
const TOTAL_TIME_SECONDS = 20 * 60;

// --- Fungsi Utilitas ---
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Ikon dipindah ke @icons

// --- Komponen UI Lokal ---
const ScoreDisplay = ({
  score,
  feedbackPoints,
}: {
  score: number;
  feedbackPoints?: { points: number; key: number };
}) => (
  <div className="relative flex min-w-0 flex-shrink items-center gap-1 rounded-full border-2 border-white/50 bg-gradient-to-br from-yellow-300 to-yellow-400 px-3 py-1.5 shadow-lg sm:gap-2 sm:px-4 sm:py-2">
    {' '}
    <StarIcon className="size-4 flex-shrink-0 animate-pulse text-yellow-600 sm:size-5" />{' '}
    <div className="min-w-0 text-center">
      {' '}
      <p className="text-xs font-bold text-yellow-800">SKOR</p>{' '}
      <p className="text-base font-bold text-yellow-900 sm:text-xl">
        {score}
      </p>{' '}
    </div>{' '}
    <StarIcon className="size-4 flex-shrink-0 animate-pulse text-yellow-600 sm:size-5" />{' '}
    {feedbackPoints && (
      <div
        key={feedbackPoints.key}
        className="absolute left-1/2 top-full z-10 mt-2 w-max -translate-x-1/2 transform animate-bounce"
      >
        {' '}
        <div className="absolute bottom-full left-1/2 size-0 -translate-x-1/2 border-x-8 border-b-8 border-x-transparent border-b-green-500"></div>{' '}
        <div className="rounded-full bg-green-500 px-2 py-1 text-sm font-bold text-white shadow-lg sm:px-3 sm:text-lg">
          {' '}
          +{feedbackPoints.points}{' '}
        </div>{' '}
      </div>
    )}{' '}
  </div>
);
const QuestionCounter = ({
  current,
  total,
}: {
  current: number;
  total: number;
}) => (
  <div className="min-w-0 flex-shrink-0 rounded-full border-2 border-white/50 bg-gradient-to-br from-purple-400 to-purple-500 px-3 py-1.5 shadow-lg sm:px-4 sm:py-2">
    {' '}
    <div className="flex items-center gap-1 sm:gap-2">
      {' '}
      <div className="flex size-5 flex-shrink-0 items-center justify-center rounded-full bg-white sm:size-6">
        {' '}
        <span className="text-xs font-bold text-purple-600 sm:text-sm">
          {current}
        </span>{' '}
      </div>{' '}
      <span className="text-sm font-bold text-white sm:text-base">/</span>{' '}
      <span className="text-sm font-bold text-white sm:text-base">
        {total}
      </span>{' '}
    </div>{' '}
  </div>
);
const TimerDisplay = ({
  timeLeft,
  totalTime,
}: {
  timeLeft: number;
  totalTime: number;
}) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const percentage = (timeLeft / totalTime) * 100;
  return (
    <div className="w-full max-w-[160px]">
      {' '}
      <div className="flex items-center justify-center gap-2">
        {' '}
        <ClockIcon className="size-4 text-purple-600 sm:size-5" />{' '}
        <span className="font-comic text-sm font-bold text-purple-800 drop-shadow-sm sm:text-base">
          {' '}
          {minutes.toString().padStart(2, '0')}:
          {seconds.toString().padStart(2, '0')}{' '}
        </span>{' '}
      </div>{' '}
      <div className="relative mt-1 h-2 w-full overflow-hidden rounded-full border-2 border-white/20 bg-white/30 shadow-inner sm:h-3">
        {' '}
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${percentage > 50 ? 'bg-gradient-to-r from-blue-400 to-blue-500' : percentage > 25 ? 'bg-gradient-to-r from-indigo-400 to-purple-400' : 'animate-pulse bg-gradient-to-r from-red-400 to-red-500'}`}
          style={{ width: `${percentage}%` }}
        />{' '}
      </div>{' '}
    </div>
  );
};
const CameraView = React.forwardRef<HTMLVideoElement, { isActive: boolean }>(
  ({ isActive }, ref) => (
    <div className="relative flex size-full items-center justify-center overflow-hidden rounded-2xl border-4 border-white/50 bg-gradient-to-br from-blue-100 to-blue-200 shadow-inner">
      {' '}
      {!isActive && (
        <div className="p-4 text-center">
          {' '}
          <div className="mx-auto mb-4 flex size-12 animate-bounce items-center justify-center rounded-full bg-blue-300 sm:size-16">
            {' '}
            <svg
              className="size-6 text-blue-600 sm:size-8"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              {' '}
              <path
                fillRule="evenodd"
                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                clipRule="evenodd"
              />{' '}
            </svg>{' '}
          </div>{' '}
          <p className="font-comic font-bold text-purple-800 drop-shadow-sm">
            Kamera tidak aktif
          </p>{' '}
        </div>
      )}{' '}
      <video
        ref={ref}
        autoPlay
        playsInline
        muted
        className={`size-full -scale-x-100 object-cover ${isActive ? 'block' : 'hidden'}`}
      />{' '}
      <div className="pointer-events-none absolute inset-2 rounded-xl border-2 border-white/30">
        {' '}
        <div className="absolute left-2 top-2 size-4 border-l-2 border-t-2 border-white/60"></div>{' '}
        <div className="absolute right-2 top-2 size-4 border-r-2 border-t-2 border-white/60"></div>{' '}
        <div className="absolute bottom-2 left-2 size-4 border-b-2 border-l-2 border-white/60"></div>{' '}
        <div className="absolute bottom-2 right-2 size-4 border-b-2 border-r-2 border-white/60"></div>{' '}
      </div>{' '}
    </div>
  )
);
CameraView.displayName = 'CameraView';
const FunModal = ({
  isOpen,
  onAction,
  title,
  message,
  buttonText,
  icon,
}: {
  isOpen: boolean;
  onAction: () => void;
  title: string;
  message: string;
  buttonText: string;
  icon: string;
}) => {
  if (!isOpen) return <></>;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      {' '}
      <div className="relative w-full max-w-md animate-jump-in">
        {' '}
        <div className="relative z-10 rounded-3xl border-4 border-yellow-300 bg-gradient-to-br from-yellow-100 to-orange-200 p-6 text-center shadow-lg">
          {' '}
          <div className="mb-4 animate-bounce text-6xl">{icon}</div>{' '}
          <h3 className="mb-3 font-comic text-3xl font-bold text-orange-600 drop-shadow-md">
            {title}
          </h3>{' '}
          <p className="mb-6 text-lg text-orange-800">{message}</p>{' '}
          <button
            onClick={onAction}
            className="w-full rounded-2xl bg-gradient-to-r from-orange-400 to-yellow-500 p-4 font-comic text-2xl font-bold text-white shadow-lg transition-all hover:scale-105 hover:from-orange-500 hover:to-yellow-600"
          >
            {' '}
            {buttonText}{' '}
          </button>{' '}
        </div>{' '}
        <div className="absolute inset-0 -z-10 translate-y-2 rounded-3xl bg-yellow-400"></div>{' '}
      </div>{' '}
    </div>
  );
};
const ConfirmationModal = ({
  isOpen,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  if (!isOpen) return <></>;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      {' '}
      <div className="relative w-full max-w-sm animate-jump-in">
        {' '}
        <div className="relative z-10 rounded-3xl border-4 border-red-300 bg-gradient-to-br from-red-100 to-red-200 p-6 text-center shadow-lg">
          {' '}
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-red-500">
            {' '}
            <svg
              className="size-8 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              {' '}
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />{' '}
            </svg>{' '}
          </div>{' '}
          <h3 className="mb-2 font-comic text-2xl font-bold text-red-700">
            Yakin mau keluar?
          </h3>{' '}
          <p className="mb-6 text-red-600">
            Semua progress tes kamu akan hilang.
          </p>{' '}
          <div className="flex gap-4">
            {' '}
            <button
              onClick={onCancel}
              className="flex-1 rounded-xl bg-gray-300 px-4 py-3 font-comic font-bold text-gray-700 shadow-md transition-all hover:scale-105 hover:bg-gray-400"
            >
              {' '}
              Batal{' '}
            </button>{' '}
            <button
              onClick={onConfirm}
              className="flex-1 rounded-xl bg-red-500 px-4 py-3 font-comic font-bold text-white shadow-md transition-all hover:scale-105 hover:bg-red-600"
            >
              {' '}
              Ya, Keluar{' '}
            </button>{' '}
          </div>{' '}
        </div>{' '}
        <div className="absolute inset-0 -z-10 translate-y-2 rounded-3xl bg-red-400"></div>{' '}
      </div>{' '}
    </div>
  );
};
const ActionButton = ({
  onClick,
  disabled,
  type,
}: {
  onClick: () => void;
  disabled?: boolean;
  type: 'check' | 'next';
}) => {
  const buttonConfig = {
    check: {
      text: 'Cek Gerakan!',
      bgClass:
        'bg-gradient-to-r from-orange-400 to-yellow-500 hover:from-orange-500 hover:to-yellow-600',
      shadowClass: 'bg-orange-600',
      icon: '🎯',
    },
    next: {
      text: 'Lanjut',
      bgClass:
        'bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600',
      shadowClass: 'bg-green-600',
      icon: '✨',
    },
  };
  const config = buttonConfig[type];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group relative rounded-full px-6 py-3 font-comic text-lg font-bold text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:grayscale sm:px-10 sm:py-4 sm:text-xl ${config.bgClass} ${type === 'next' ? 'animate-pulse' : ''}`}
    >
      {' '}
      <div
        className={`absolute inset-0 rounded-full ${config.shadowClass} -z-10 translate-y-1.5 sm:translate-y-2`}
      ></div>{' '}
      <span className="flex items-center gap-2">
        {' '}
        <span className="text-2xl sm:text-3xl">{config.icon}</span>{' '}
        <span className="whitespace-nowrap">{config.text}</span>{' '}
      </span>{' '}
    </button>
  );
};

// --- KOMPONEN UTAMA HALAMAN TES ---
export default function TebakGerakanPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | undefined>(undefined);
  const streamRef = useRef<MediaStream | undefined>(undefined);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showDisconnectedModal, setShowDisconnectedModal] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [shuffledMovements, setShuffledMovements] = useState<Movement[]>([]);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME_SECONDS);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [questionState, setQuestionState] = useState<'guessing' | 'feedback'>(
    'guessing'
  );
  const [feedbackPoints, setFeedbackPoints] = useState<
    { points: number; key: number } | undefined
  >(undefined);
  const currentMovement = shuffledMovements[currentQuestionIndex];

  const handleLeave = () => {
    localStorage.removeItem('tebakGerakanProgress');
    router.push('/tebak-gerakan');
  };

  const handleCameraDisconnect = useCallback(() => {
    setIsCameraReady(false);
    setShowDisconnectedModal(true);
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) track.stop();
      streamRef.current = undefined;
    }
  }, []);

  const startCamera = useCallback(async () => {
    if (streamRef.current || !navigator.mediaDevices) {
      if (!navigator.mediaDevices) setShowPermissionModal(true);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 480 },
          height: { ideal: 360 },
          facingMode: 'user',
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      stream
        .getVideoTracks()[0]
        .addEventListener('ended', handleCameraDisconnect);
      setIsCameraReady(true);
      setShowPermissionModal(false);
    } catch {
      setIsCameraReady(false);
      setShowPermissionModal(true);
    }
  }, [handleCameraDisconnect]);

  useEffect(() => {
    const savedStateJSON = localStorage.getItem('tebakGerakanProgress');
    let shouldStartFresh = true;
    if (savedStateJSON) {
      const savedState = JSON.parse(savedStateJSON);
      const timePassed = Math.floor((Date.now() - savedState.timestamp) / 1000);
      const newTimeLeft = savedState.timeLeft - timePassed;
      if (newTimeLeft > 0 && savedState.shuffledMovements?.length > 0) {
        setShuffledMovements(savedState.shuffledMovements);
        setCurrentQuestionIndex(savedState.currentQuestionIndex);
        setScore(savedState.score);
        setTimeLeft(newTimeLeft);
        shouldStartFresh = false;
      } else {
        localStorage.removeItem('tebakGerakanProgress');
      }
    }
    if (shouldStartFresh) {
      setShuffledMovements(shuffleArray(mockMovements));
    }
    startCamera();
    return () => {
      if (streamRef.current) {
        for (const track of streamRef.current.getTracks()) track.stop();
        streamRef.current = undefined;
      }
    };
  }, [startCamera]);

  useEffect(() => {
    if (
      !isCameraReady ||
      showDisconnectedModal ||
      showPermissionModal ||
      shuffledMovements.length === 0
    ) {
      return;
    }
    const stateToSave = {
      shuffledMovements,
      currentQuestionIndex,
      score,
      timeLeft,
      timestamp: Date.now(),
    };
    localStorage.setItem('tebakGerakanProgress', JSON.stringify(stateToSave));
    if (timeLeft <= 0) {
      localStorage.removeItem('tebakGerakanProgress');
      router.push('/hasil');
      return;
    }
    const timerId = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [
    timeLeft,
    isCameraReady,
    showDisconnectedModal,
    showPermissionModal,
    shuffledMovements,
    currentQuestionIndex,
    score,
    router,
  ]);

  const handleCheckMovement = () => {
    if (questionState !== 'guessing') return;
    const randomPoints = Math.floor(Math.random() * 6) + 5;
    setScore(prev => prev + randomPoints);
    setFeedbackPoints({ points: randomPoints, key: Date.now() });
    setQuestionState('feedback');
    setTimeout(() => setFeedbackPoints(undefined), 2000);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < shuffledMovements.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setQuestionState('guessing');
    } else {
      localStorage.removeItem('tebakGerakanProgress');
      router.push('/hasil');
    }
  };

  if (shuffledMovements.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-mobile-bg bg-cover bg-center md:bg-desktop-bg">
        <div className="text-center">
          <div className="mx-auto mb-4 size-16 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="font-comic text-xl font-bold text-purple-800 drop-shadow-sm">
            Memuat permainan...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-mobile-bg bg-cover bg-center font-sans md:bg-desktop-bg">
      <FunModal
        isOpen={showPermissionModal}
        onAction={() => router.push('/tebak-gerakan')}
        icon="📸"
        title="Oops, Kamera Belum Siap!"
        message="Kita butuh kameramu untuk bermain! Yuk, kita kembali sebentar untuk mengaktifkan kameranya."
        buttonText="Ayo, Aktifkan!"
      />
      <FunModal
        isOpen={showDisconnectedModal}
        onAction={() => router.push('/tebak-gerakan')}
        icon="🔌"
        title="Yah, Kamera Terputus!"
        message="Jangan khawatir, progresmu aman! Yuk kita kembali ke menu utama."
        buttonText="Kembali ke Menu"
      />
      <ConfirmationModal
        isOpen={isExitModalOpen}
        onConfirm={handleLeave}
        onCancel={() => setIsExitModalOpen(false)}
      />

      <header className="z-30 w-full p-2 sm:p-3">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2">
          <div className="flex flex-1 justify-start">
            <BackButton onClick={() => setIsExitModalOpen(true)} />
          </div>
          <div className="flex flex-1 justify-center">
            <ScoreDisplay score={score} feedbackPoints={feedbackPoints} />
          </div>
          <div className="flex flex-1 items-center justify-end gap-2 sm:gap-4">
            <TimerDisplay timeLeft={timeLeft} totalTime={TOTAL_TIME_SECONDS} />
            <QuestionCounter
              current={currentQuestionIndex + 1}
              total={shuffledMovements.length}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto -mt-4 flex w-full max-w-6xl flex-grow items-center justify-center px-2 sm:px-4">
        <div className="grid w-full grid-cols-1 items-center gap-4 lg:grid-cols-2 lg:gap-8">
          <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center">
            <div className="relative mb-1 sm:mb-2">
              <h2 className="text-center font-comic text-xl font-bold text-purple-800 drop-shadow-md sm:text-2xl">
                ✨ CONTOH GERAKAN ✨
              </h2>
              <div className="absolute -right-1 -top-1 size-4 animate-bounce rounded-full bg-yellow-400 sm:-right-2 sm:-top-2 sm:size-5"></div>
            </div>
            <div className="relative w-full">
              <div className="relative z-10 rounded-2xl border-4 border-white/50 bg-gradient-to-br from-blue-100 to-purple-100 p-3 shadow-2xl sm:rounded-3xl">
                <div className="aspect-square w-full rounded-xl border-2 border-white/50 bg-white/70 shadow-inner sm:rounded-2xl">
                  <Image
                    key={currentMovement.id}
                    src={currentMovement.imageUrl}
                    width={300}
                    height={300}
                    alt={currentMovement.name}
                    className="size-full rounded-lg object-contain sm:rounded-xl"
                    priority
                  />
                </div>
                <div className="mt-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 p-2 text-center shadow-lg sm:rounded-2xl">
                  <p className="font-comic text-lg font-bold text-white drop-shadow-md sm:text-xl">
                    {currentMovement.name}
                  </p>
                </div>
              </div>
              <div className="absolute inset-0 -z-10 translate-y-2 rounded-2xl bg-gradient-to-br from-blue-300 to-purple-300 sm:rounded-3xl"></div>
            </div>
          </div>
          <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center">
            <div className="relative mb-1 sm:mb-2">
              <h2 className="text-center font-comic text-xl font-bold text-purple-800 drop-shadow-md sm:text-2xl">
                🎯 GERAKANMU 🎯
              </h2>
              <div className="animation-delay-500 absolute -left-1 -top-1 size-4 animate-bounce rounded-full bg-green-400 sm:-left-2 sm:-top-2 sm:size-5"></div>
            </div>
            <div className="relative w-full">
              <div className="relative z-10 rounded-2xl border-4 border-white/50 bg-gradient-to-br from-green-100 to-blue-100 p-3 shadow-2xl sm:rounded-3xl">
                <div className="aspect-square w-full">
                  <CameraView
                    ref={videoRef as React.Ref<HTMLVideoElement>}
                    isActive={isCameraReady}
                  />
                </div>
              </div>
              <div className="absolute inset-0 -z-10 translate-y-2 rounded-2xl bg-gradient-to-br from-green-300 to-blue-300 sm:rounded-3xl"></div>
            </div>
          </div>
        </div>
      </main>

      <footer className="z-30 flex w-full justify-center py-1 sm:py-2">
        <ActionButton
          onClick={
            questionState === 'guessing'
              ? handleCheckMovement
              : handleNextQuestion
          }
          disabled={questionState === 'guessing' && !isCameraReady}
          type={questionState === 'guessing' ? 'check' : 'next'}
        />
      </footer>
    </div>
  );
}
