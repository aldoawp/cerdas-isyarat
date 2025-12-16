'use client';

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
} from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import BackButton from '@/components/shared/backbutton/backbutton';
import { shuffleArray } from '@/lib/utils/arrays-util';
import ConfirmationModal from '@/components/tebak-gerakan/confirmation-modal';
import FunModal from '@/components/tebak-gerakan/fun-modal';
import QuestionCounter from '@/components/tebak-gerakan/question-counter';
import ScoreDisplay from '@/components/tebak-gerakan/score-display';
import TimerDisplay from '@/components/tebak-gerakan/timer-display';
import { Movement } from '@/types';
import {
  useRequireAuth,
  usePageLoading,
  useAuth,
} from '@/lib/contexts/auth-context'; // Import useAuth
import LoadingScreen from '@/components/shared/loading-screen';
import { aslAlphabetMovements } from '@/dummy/tebak-gerakan-data';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { drawConnectors, drawLandmarks } from '@/lib/utils/drawing-utils';
import { saveGameScore } from '@/services/tebak-gerakan-service'; // Pastikan path ini benar

const HAND_CONNECTIONS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [5, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [9, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [13, 17],
  [0, 17],
  [17, 18],
  [18, 19],
  [19, 20],
];

const useIsDesktop = (breakpoint = 1024) => {
  const [isDesktop, setIsDesktop] = useState(false);

  useLayoutEffect(() => {
    const updateMedia = () => {
      setIsDesktop(window.innerWidth >= breakpoint);
    };

    updateMedia();
    window.addEventListener('resize', updateMedia);
    return () => window.removeEventListener('resize', updateMedia);
  }, [breakpoint]);

  return isDesktop;
};

const TOTAL_TIME_SECONDS = 180;
const MOVEMENT_THRESHOLD = 0.08;
const STILLNESS_FRAMES_TRIGGER = 30;
const HISTORY_BUFFER_SIZE = 10;
const JEDA_ANTAR_SOAL_DETIK = 3;

export default function TebakGerakanPage() {
  const router = useRouter();
  const { user } = useAuth(); // Ambil user dari context
  const { loading: authLoading } = useRequireAuth();
  const { isPageLoading } = usePageLoading();

  const isDesktop = useIsDesktop();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | undefined>(undefined);
  const animationFrameIdRef = useRef<number | undefined>(undefined);
  const latestLandmarksRef = useRef<number[]>([]);
  const landmarksHistoryRef = useRef<number[][]>([]);
  const stillnessCounterRef = useRef(0);
  const lastVideoTimeRef = useRef(-1);
  const lastPredictionTimeRef = useRef(0);

  const [handLandmarker, setHandLandmarker] = useState<
    HandLandmarker | undefined
  >();
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [shuffledMovements, setShuffledMovements] = useState<Movement[]>([]);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME_SECONDS);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [predictionResult, setPredictionResult] = useState('');
  const [realtimePrediction, setRealtimePrediction] = useState('');
  const [feedbackPoints, setFeedbackPoints] = useState<
    { points: number; key: number } | undefined
  >(undefined);
  const [nextQuestionCountdown, setNextQuestionCountdown] = useState<
    number | undefined
  >(undefined);
  const [stabilityProgress, setStabilityProgress] = useState(0);

  const [isTimeUpModalOpen, setIsTimeUpModalOpen] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  const currentMovement = shuffledMovements[currentQuestionIndex];

  // --- LOGIC END GAME DIPERBARUI ---
  const handleGameEnd = useCallback(async () => {
    if (!user?.id) {
      router.push('/login');
      return;
    }

    try {
      // Simpan skor ke database
      await saveGameScore({
        userId: user.id,
        score,
        correctAnswers,
        totalQuestions: shuffledMovements.length,
        gameDuration: TOTAL_TIME_SECONDS - timeLeft,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to save score:', error);
      // Lanjut redirect meski gagal simpan (opsional: tampilkan toast error)
    }

    router.push(
      `/tebak-gerakan/hasil?score=${score}&correct=${correctAnswers}&total=${shuffledMovements.length}`
    );
  }, [
    router,
    score,
    correctAnswers,
    shuffledMovements.length,
    timeLeft,
    user?.id,
  ]);

  const handleCameraDisconnect = useCallback(() => setIsCameraReady(false), []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = undefined;
    }
    if (videoRef.current) {
      // eslint-disable-next-line unicorn/no-null
      videoRef.current.srcObject = null;
    }
    setIsCameraReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    stopCamera();

    await new Promise(resolve => setTimeout(resolve, 200));

    if (!navigator.mediaDevices) {
      setShowPermissionModal(true);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        const handleLoadedMetadata = () => {
          if (videoRef.current) {
            videoRef.current
              .play()
              .then(() => {
                setIsCameraReady(true);
                setShowPermissionModal(false);
              })
              .catch(error => {
                // eslint-disable-next-line no-console
                console.error('Error playing video:', error);
                setShowPermissionModal(true);
              });
          }
        };

        videoRef.current.addEventListener(
          'loadedmetadata',
          handleLoadedMetadata,
          {
            once: true,
          }
        );
      } else {
        setTimeout(() => startCamera(), 300);
        return;
      }

      stream
        .getVideoTracks()[0]
        .addEventListener('ended', handleCameraDisconnect);
    } catch {
      setIsCameraReady(false);
      setShowPermissionModal(true);
    }
  }, [handleCameraDisconnect, stopCamera]);

  useEffect(() => {
    const createHandLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-tasks/hand_landmarker/hand_landmarker.task`,
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 2,
          minHandDetectionConfidence: 0.7,
          minHandPresenceConfidence: 0.7,
          minTrackingConfidence: 0.7,
        });
        setHandLandmarker(landmarker);
      } catch {
        // Model loading failed silently
      }
    };
    createHandLandmarker();
  }, []);

  const sendPredictionRequest = useCallback(
    async (landmarks: number[], isRealtime: boolean = true) => {
      if (landmarks.length === 0) return undefined;
      try {
        const response = await fetch(
          'https://aiskripsibisindo-production-e734.up.railway.app/predict_landmarks',

          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ landmarks }),
          }
        );
        if (!response.ok) throw new Error('Backend prediction failed');
        const result = await response.json();

        const prediction =
          result.prediction || (isRealtime ? '' : 'Tidak Terdeteksi');

        if (isRealtime) {
          setRealtimePrediction(prediction);
        } else {
          setPredictionResult(prediction);
        }
        return prediction;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Prediction error:', error);
        if (isRealtime) setRealtimePrediction('Error');
        else setPredictionResult('Error');
        return undefined;
      }
    },
    []
  );

  const calculateStability = useCallback((history: number[][]) => {
    if (history.length < 3) return false;

    let totalMovement = 0;
    let comparisonCount = 0;

    for (const [index, current] of history.entries()) {
      if (index === 0) continue;
      const previous = history[index - 1];
      if (current.length !== previous.length) continue;

      let frameDistance = 0;
      for (const [j, value] of current.entries()) {
        frameDistance += (value - previous[j]) ** 2;
      }
      totalMovement += Math.sqrt(frameDistance);
      comparisonCount++;
    }

    const averageMovement =
      comparisonCount > 0 ? totalMovement / comparisonCount : Infinity;
    return averageMovement < MOVEMENT_THRESHOLD;
  }, []);

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < shuffledMovements.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleGameEnd();
    }
    setPredictionResult('');
    setRealtimePrediction('');
    setIsProcessing(false);
    setFeedbackPoints(undefined);
    landmarksHistoryRef.current = [];
    stillnessCounterRef.current = 0;
    setStabilityProgress(0);
  }, [currentQuestionIndex, shuffledMovements.length, handleGameEnd]);

  const handleAutoCapture = useCallback(async () => {
    if (isProcessing || latestLandmarksRef.current.length === 0) return;

    setIsProcessing(true);

    const predictedLabel = await sendPredictionRequest(
      latestLandmarksRef.current,
      false
    );

    if (
      predictedLabel &&
      predictedLabel.toUpperCase() === currentMovement.name.toUpperCase()
    ) {
      setScore(prev => prev + 10);
      setCorrectAnswers(prev => prev + 1);
      setFeedbackPoints({ points: 10, key: Date.now() });
    } else {
      setFeedbackPoints({ points: 0, key: Date.now() });
    }

    setNextQuestionCountdown(JEDA_ANTAR_SOAL_DETIK);
  }, [isProcessing, currentMovement, sendPredictionRequest]);

  useEffect(() => {
    setShuffledMovements(shuffleArray(aslAlphabetMovements));
    startCamera();

    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (
      !handLandmarker ||
      !video ||
      !isCameraReady ||
      !canvas ||
      nextQuestionCountdown !== undefined ||
      isTimeUpModalOpen
    )
      return;

    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;

    const predictWebcam = () => {
      if (video.readyState < 2) {
        animationFrameIdRef.current = requestAnimationFrame(predictWebcam);
        return;
      }

      if (
        canvas.width !== video.videoWidth ||
        canvas.height !== video.videoHeight
      ) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      if (lastVideoTimeRef.current !== video.currentTime) {
        lastVideoTimeRef.current = video.currentTime;
        const results = handLandmarker.detectForVideo(video, performance.now());

        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

        if (results.landmarks && results.landmarks.length > 0) {
          const combinedLandmarks: number[] = [];
          for (const handLandmarks of results.landmarks) {
            const mirroredLandmarks = handLandmarks.map(lm => ({
              ...lm,
              x: 1 - lm.x,
            }));
            drawConnectors(canvasCtx, mirroredLandmarks, HAND_CONNECTIONS, {
              color: '#00FF00',
              lineWidth: 5,
            });
            drawLandmarks(canvasCtx, mirroredLandmarks, {
              color: '#FF0000',
              lineWidth: 2,
            });
            combinedLandmarks.push(
              ...handLandmarks.flatMap(lm => [lm.x, lm.y, lm.z])
            );
          }

          if (results.landmarks.length === 1) {
            combinedLandmarks.push(...Array.from({ length: 63 }, () => 0));
          }

          latestLandmarksRef.current = combinedLandmarks;

          landmarksHistoryRef.current.push(combinedLandmarks);
          if (landmarksHistoryRef.current.length > HISTORY_BUFFER_SIZE) {
            landmarksHistoryRef.current.shift();
          }

          const isStable = calculateStability(landmarksHistoryRef.current);

          if (isStable) {
            stillnessCounterRef.current++;
            const progress = Math.min(
              (stillnessCounterRef.current / STILLNESS_FRAMES_TRIGGER) * 100,
              100
            );
            setStabilityProgress(progress);
          } else {
            stillnessCounterRef.current = 0;
            setStabilityProgress(0);
          }

          const now = performance.now();
          if (now - lastPredictionTimeRef.current > 300) {
            lastPredictionTimeRef.current = now;
            sendPredictionRequest(latestLandmarksRef.current, true);
          }

          if (
            stillnessCounterRef.current >= STILLNESS_FRAMES_TRIGGER &&
            !isProcessing
          ) {
            handleAutoCapture();
            setStabilityProgress(0);
            stillnessCounterRef.current = 0;
          }
        } else {
          stillnessCounterRef.current = 0;
          landmarksHistoryRef.current = [];
          setStabilityProgress(0);
          setRealtimePrediction('');
        }
        canvasCtx.restore();
      }
      animationFrameIdRef.current = requestAnimationFrame(predictWebcam);
    };

    animationFrameIdRef.current = requestAnimationFrame(predictWebcam);
    return () => {
      if (animationFrameIdRef.current)
        cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [
    handLandmarker,
    isCameraReady,
    nextQuestionCountdown,
    isProcessing,
    sendPredictionRequest,
    calculateStability,
    handleAutoCapture,
    isTimeUpModalOpen,
  ]);

  useEffect(() => {
    if (nextQuestionCountdown === undefined) return;

    if (nextQuestionCountdown > 0) {
      const timerId = setTimeout(() => {
        setNextQuestionCountdown(prev => (prev ? prev - 1 : undefined));
      }, 1000);
      return () => clearTimeout(timerId);
    } else if (nextQuestionCountdown === 0) {
      handleNextQuestion();
      setNextQuestionCountdown(undefined);
    }
  }, [nextQuestionCountdown, handleNextQuestion]);

  useEffect(() => {
    if (!isCameraReady || isExitModalOpen || isTimeUpModalOpen) return;

    if (timeLeft <= 0) {
      setIsTimeUpModalOpen(true);
      return;
    }

    const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, isCameraReady, isExitModalOpen, isTimeUpModalOpen]);

  const handleLeave = () => {
    localStorage.removeItem('tebakGerakanProgress');
    router.push('/onboarding');
  };

  if (isPageLoading || authLoading || shuffledMovements.length === 0) {
    return <LoadingScreen message="Sedang menyiapkan permainan..." />;
  }

  return (
    <div className="page-container min-h-screen font-sans">
      <FunModal
        isOpen={showPermissionModal}
        onAction={() => router.push('/intro-tebak-gerakan')}
        icon="📸"
        title="Oops, Kamera Belum Siap!"
        message="Kita butuh kameramu untuk bermain! Yuk, kita kembali sebentar untuk mengaktifkan kameranya."
        buttonText="Ayo, Aktifkan!"
      />
      <ConfirmationModal
        isOpen={isExitModalOpen}
        onConfirm={handleLeave}
        onCancel={() => setIsExitModalOpen(false)}
      />
      <FunModal
        isOpen={isTimeUpModalOpen}
        onAction={handleGameEnd}
        icon="⏰"
        title="Waktu Habis!"
        message="Waktu permainan tebak gerakan isyarat sudah berakhir. Yuk, lihat skormu!"
        buttonText="Lihat Hasil"
      />

      <header className="z-30 w-full p-3 sm:p-3">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2">
          <div className="flex flex-1 justify-start">
            <BackButton onClick={() => setIsExitModalOpen(true)} />
          </div>
          <div className="flex flex-1 justify-center lg:hidden">
            {/* Empty space on mobile - info moved below */}
          </div>
          <div className="hidden flex-1 justify-center lg:flex">
            <ScoreDisplay score={score} feedbackPoints={feedbackPoints} />
          </div>
          <div className="hidden flex-1 items-center justify-end gap-4 lg:flex">
            <TimerDisplay timeLeft={timeLeft} totalTime={TOTAL_TIME_SECONDS} />
            <QuestionCounter
              current={currentQuestionIndex + 1}
              total={shuffledMovements.length}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-grow items-center justify-center px-2 sm:px-4 lg:-mt-4">
        {isDesktop ? (
          /* Desktop Layout */
          <div className="grid w-full grid-cols-2 items-center gap-8">
            <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center">
              <div className="relative mb-2">
                <h2 className="text-center font-comic text-2xl font-bold text-purple-800 drop-shadow-md">
                  ✨ CONTOH GERAKAN ✨
                </h2>
                <div className="absolute -right-2 -top-2 size-5 animate-bounce rounded-full bg-yellow-400"></div>
              </div>
              <div className="relative w-full">
                <div className="relative z-10 rounded-3xl border-4 border-white/50 bg-gradient-to-br from-blue-100 to-purple-100 p-3 shadow-2xl">
                  <div className="relative aspect-square w-full rounded-2xl border-2 border-white/50 bg-white/70 shadow-inner">
                    {currentMovement && (
                      <Image
                        key={currentMovement.id}
                        src={currentMovement.imageUrl}
                        width={300}
                        height={300}
                        alt={currentMovement.name}
                        className="size-full rounded-xl object-contain"
                        priority
                      />
                    )}

                    {nextQuestionCountdown !== undefined &&
                      nextQuestionCountdown > 0 && (
                        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center rounded-xl bg-black/60 backdrop-blur-sm">
                          <p className="font-comic text-xl font-bold text-white drop-shadow-lg">
                            Soal Berikutnya dalam
                          </p>
                          <p className="animate-pulse font-comic text-8xl font-bold text-white drop-shadow-lg">
                            {nextQuestionCountdown}
                          </p>
                        </div>
                      )}
                  </div>
                  <div className="mt-2 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 p-2 text-center shadow-lg">
                    <p className="font-comic text-xl font-bold text-white drop-shadow-md">
                      {currentMovement?.name}
                    </p>
                  </div>
                </div>
                <div className="absolute inset-0 -z-10 translate-y-2 rounded-3xl bg-gradient-to-br from-blue-300 to-purple-300"></div>
              </div>
            </div>

            <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center">
              <div className="relative mb-2">
                <h2 className="text-center font-comic text-2xl font-bold text-purple-800 drop-shadow-md">
                  🎯 GERAKANMU 🎯
                </h2>
                <div className="animation-delay-500 absolute -left-2 -top-2 size-5 animate-bounce rounded-full bg-green-400"></div>
              </div>
              <div className="relative w-full">
                <div className="relative z-10 rounded-3xl border-4 border-white/50 bg-gradient-to-br from-green-100 to-blue-100 p-3 shadow-2xl">
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl border-2 border-white/50 bg-gray-900 shadow-inner">
                    {/* INI ADALAH videoRef UNTUK DESKTOP */}
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="absolute inset-0 z-0 size-full -scale-x-100 object-cover"
                      style={{
                        display: isCameraReady ? 'block' : 'none',
                        backgroundColor: '#000',
                      }}
                    />
                    {!isCameraReady && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-800">
                        <p className="font-comic text-white">
                          Mengaktifkan kamera...
                        </p>
                      </div>
                    )}
                    {/* INI ADALAH canvasRef UNTUK DESKTOP */}
                    <canvas
                      ref={canvasRef}
                      className="absolute left-0 top-0 z-10 size-full"
                      style={{ pointerEvents: 'none' }}
                    />

                    {stabilityProgress > 0 && (
                      <div className="absolute inset-x-4 bottom-4 z-20">
                        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-700/80 backdrop-blur-sm">
                          <div
                            className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-300"
                            style={{ width: `${stabilityProgress}%` }}
                          ></div>
                        </div>
                        <p className="mt-1 text-center font-comic text-xs text-white drop-shadow-lg">
                          Tahan posisi... {Math.round(stabilityProgress)}%
                        </p>
                      </div>
                    )}

                    {isProcessing && !nextQuestionCountdown && (
                      <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40">
                        <p className="font-comic text-4xl font-bold text-white drop-shadow-lg">
                          Memeriksa...
                        </p>
                      </div>
                    )}

                    {nextQuestionCountdown !== undefined &&
                      nextQuestionCountdown > 0 && (
                        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                          <p className="font-comic text-xl font-bold text-white drop-shadow-lg">
                            Soal Berikutnya dalam
                          </p>
                          <p className="animate-pulse font-comic text-8xl font-bold text-white drop-shadow-lg">
                            {nextQuestionCountdown}
                          </p>
                        </div>
                      )}
                  </div>
                </div>
                <div className="absolute inset-0 -z-10 translate-y-2 rounded-3xl bg-gradient-to-br from-green-300 to-blue-300"></div>
              </div>

              {!isProcessing &&
                !predictionResult &&
                realtimePrediction &&
                !nextQuestionCountdown && (
                  <div className="mt-4 text-center">
                    <p className="font-comic text-sm text-gray-500">
                      Tanganmu Terdeteksi:
                    </p>
                    <p className="inline-block rounded-lg bg-gray-200/80 px-4 py-2 font-comic text-3xl font-bold text-gray-800 shadow-lg backdrop-blur-sm">
                      {realtimePrediction}
                    </p>
                  </div>
                )}

              {predictionResult && !nextQuestionCountdown && (
                <div className="mt-4 animate-pulse text-center">
                  <p className="font-comic text-sm text-gray-700">
                    Hasil Prediksi Akhir:
                  </p>
                  <p className="inline-block rounded-lg bg-purple-600/80 px-4 py-2 font-comic text-2xl font-bold text-white shadow-lg backdrop-blur-sm">
                    {predictionResult}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Mobile Layout */
          <div className="flex w-full flex-col items-center justify-center">
            {/* Mobile Info Bar - Above Camera */}
            <div className="mb-3 flex w-full max-w-md items-center justify-between gap-2 px-2">
              <ScoreDisplay score={score} feedbackPoints={feedbackPoints} />
              <div className="flex items-center gap-2">
                <TimerDisplay
                  timeLeft={timeLeft}
                  totalTime={TOTAL_TIME_SECONDS}
                />
                <QuestionCounter
                  current={currentQuestionIndex + 1}
                  total={shuffledMovements.length}
                />
              </div>
            </div>

            <div className="relative w-full max-w-md">
              {/* Target Letter Badge - Above Camera */}
              {currentMovement && (
                <div className="absolute -top-3 left-1/2 z-30 -translate-x-1/2">
                  <div className="relative">
                    <div className="border-3 flex items-center gap-2 rounded-2xl border-white bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 px-6 py-2 shadow-2xl">
                      <span className="font-comic text-sm font-bold text-white/90">
                        TIRU:
                      </span>
                      <span className="font-comic text-4xl font-bold text-white drop-shadow-lg">
                        {currentMovement.name}
                      </span>
                    </div>
                    <div className="absolute -right-2 -top-2 size-4 animate-bounce rounded-full bg-yellow-400 shadow-lg"></div>
                    <div className="absolute -bottom-1 left-1/2 size-3 -translate-x-1/2 rotate-45 bg-gradient-to-br from-pink-500 to-orange-500"></div>
                  </div>
                </div>
              )}

              {/* Camera Container */}
              <div className="relative mt-6 w-full">
                <div className="relative z-10 rounded-3xl border-4 border-white/50 bg-gradient-to-br from-green-100 to-blue-100 p-3 shadow-2xl">
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl border-2 border-white/50 bg-gray-900 shadow-inner">
                    {/* INI ADALAH videoRef UNTUK MOBILE */}
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="absolute inset-0 size-full -scale-x-100 object-cover"
                      style={{
                        display: isCameraReady ? 'block' : 'none',
                        backgroundColor: '#000',
                      }}
                    />
                    {!isCameraReady && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                        <p className="font-comic text-sm text-white">
                          Mengaktifkan kamera...
                        </p>
                      </div>
                    )}
                    {/* INI ADALAH canvasRef UNTUK MOBILE */}
                    <canvas
                      ref={canvasRef}
                      className="absolute left-0 top-0 size-full"
                      style={{ pointerEvents: 'none' }}
                    />

                    {/* Real-time Prediction Display */}
                    {!isProcessing &&
                      !predictionResult &&
                      realtimePrediction &&
                      !nextQuestionCountdown && (
                        <div className="absolute left-3 top-3 z-20">
                          <div className="rounded-xl bg-black/70 px-3 py-2 backdrop-blur-sm">
                            <p className="font-comic text-[10px] text-white/70">
                              Terdeteksi:
                            </p>
                            <p className="font-comic text-2xl font-bold text-white">
                              {realtimePrediction}
                            </p>
                          </div>
                        </div>
                      )}

                    {/* Stability Progress Bar */}
                    {stabilityProgress > 0 && (
                      <div className="absolute inset-x-3 bottom-3 z-20">
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-700/80 backdrop-blur-sm">
                          <div
                            className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-300"
                            style={{ width: `${stabilityProgress}%` }}
                          ></div>
                        </div>
                        <p className="mt-1 text-center font-comic text-[10px] text-white drop-shadow-lg">
                          Tahan... {Math.round(stabilityProgress)}%
                        </p>
                      </div>
                    )}

                    {/* Processing Overlay */}
                    {isProcessing && !nextQuestionCountdown && (
                      <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40">
                        <p className="font-comic text-3xl font-bold text-white drop-shadow-lg">
                          Memeriksa...
                        </p>
                      </div>
                    )}

                    {/* Next Question Countdown */}
                    {nextQuestionCountdown !== undefined &&
                      nextQuestionCountdown > 0 && (
                        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                          <p className="font-comic text-lg font-bold text-white drop-shadow-lg">
                            Soal Berikutnya dalam
                          </p>
                          <p className="animate-pulse font-comic text-7xl font-bold text-white drop-shadow-lg">
                            {nextQuestionCountdown}
                          </p>
                        </div>
                      )}
                  </div>
                </div>
                <div className="absolute inset-0 -z-10 translate-y-2 rounded-3xl bg-gradient-to-br from-green-300 to-blue-300"></div>
              </div>

              {/* Final Prediction Result */}
              {predictionResult && !nextQuestionCountdown && (
                <div className="mt-3 text-center">
                  <p className="font-comic text-xs text-gray-600">
                    Hasil Prediksi:
                  </p>
                  <p className="inline-block rounded-xl bg-purple-600/90 px-4 py-2 font-comic text-xl font-bold text-white shadow-lg backdrop-blur-sm">
                    {predictionResult}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="z-30 flex h-20 w-full justify-center py-1 sm:py-2"></footer>
    </div>
  );
}
