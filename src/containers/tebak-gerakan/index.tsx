'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import BackButton from '@/components/shared/backbutton/backbutton';
import { mockMovements } from '@/dummy/tebak-gerakan-data';
import { shuffleArray } from '@/lib/utils/arrays-util';
import ActionButton from '@/components/tebak-gerakan/action-button';
import ConfirmationModal from '@/components/tebak-gerakan/confirmation-modal';
import FunModal from '@/components/tebak-gerakan/fun-modal';
import QuestionCounter from '@/components/tebak-gerakan/question-counter';
import ScoreDisplay from '@/components/tebak-gerakan/score-display';
import TimerDisplay from '@/components/tebak-gerakan/timer-display';
import CameraView from '@/components/tebak-gerakan/camera-view';
import { Movement } from '@/types';
import { useRequireAuth, usePageLoading } from '@/lib/contexts/auth-context';
import LoadingScreen from '@/components/shared/loading-screen';

const TOTAL_TIME_SECONDS = 20 * 60;

CameraView.displayName = 'CameraView';

export default function TebakGerakanPage() {
  const router = useRouter();
  const { loading: authLoading } = useRequireAuth();
  const { isPageLoading } = usePageLoading();
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
    router.push('/onboarding');
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

  // Show loading screen while page is loading or checking authentication
  if (isPageLoading || authLoading) {
    return <LoadingScreen message="Halaman sedang dimuat..." />;
  }

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
        onAction={() => router.push('/onboarding')}
        icon="📸"
        title="Oops, Kamera Belum Siap!"
        message="Kita butuh kameramu untuk bermain! Yuk, kita kembali sebentar untuk mengaktifkan kameranya."
        buttonText="Ayo, Aktifkan!"
      />
      <FunModal
        isOpen={showDisconnectedModal}
        onAction={() => router.push('/onboarding')}
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
