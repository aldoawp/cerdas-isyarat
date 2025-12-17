'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
// ✅ FIX: Hapus 'updateUserData' dari import karena tidak dipakai
import { useUserProgress } from './use-user-progress';
import { useAuth } from '@/lib/contexts/auth-context';
import { getAssessmentQuestionsForExploration } from '@/services/ekplorasi-service';
import { getExplorationLevelById } from '@/repositories/ekplorasi-repository';
import { saveTestScore } from '@/repositories/test-scores-repository';
import { updateUserProgress } from '@/repositories/users-progress-repository';
import { TestSession, Question } from '@/types';

export const TEST_DURATION_MS = 30 * 60 * 1000;

export const useTest = (explorationId: string) => {
  const router = useRouter();
  const { user } = useAuth();
  const { userProfile, decreaseLife } = useUserProgress();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [testState, setTestState] = useState<TestSession | undefined>(
    undefined
  );
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION_MS);
  const [showResults, setShowResults] = useState(false);
  const [finalScore, setFinalScore] = useState({ score: 0, correct: 0 });
  const [isLeaving, setIsLeaving] = useState(false);
  const [currentLevelNumber, setCurrentLevelNumber] = useState<number>(1);
  const hasFetched = useRef(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setQuestionsLoading(true);

        if (!explorationId || typeof explorationId !== 'string') {
          throw new Error(`Invalid explorationId: ${explorationId}`);
        }

        const explorationLevel = await getExplorationLevelById(explorationId);
        if (!explorationLevel) {
          throw new Error(`Exploration level ${explorationId} not found`);
        }

        setCurrentLevelNumber(explorationLevel.levels);

        const assessmentQuestions = await getAssessmentQuestionsForExploration(
          explorationId,
          explorationLevel.levels
        );

        setQuestions(assessmentQuestions);
      } catch (error) {
        console.error('Error fetching assessment questions:', error);
        setQuestions([]);
      } finally {
        setQuestionsLoading(false);
      }
    };

    if (explorationId && !hasFetched.current) {
      hasFetched.current = true;
      fetchQuestions();
    }
  }, [explorationId]);

  useEffect(() => {
    const savedStateRaw = localStorage.getItem(
      `testState_exploration_${explorationId}`
    );
    setTestState(
      savedStateRaw
        ? JSON.parse(savedStateRaw)
        : {
            levelId: 0,
            currentQuestionIndex: 0,
            answers: {},
            startTime: Date.now(),
          }
    );
  }, [explorationId]);

  const calculateAndFinalize = useCallback(async () => {
    if (!testState || !user?.id) return;

    let correctCount = 0;
    for (const q of questions) {
      const userAnswer = testState.answers[q.id];
      if (
        (q.mode === 'fill-in-the-blank' && userAnswer === q.correctAnswer) ||
        (q.mode === 'multiple-choice-image' && userAnswer === q.correctAnswerId)
      ) {
        correctCount++;
      }
    }

    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= 75;

    try {
      // 💾 Simpan skor tes
      await saveTestScore({
        userId: user.id,
        explorationId,
        levelNumber: currentLevelNumber,
        score,
        correctAnswers: correctCount,
        totalQuestions: questions.length,
        passed,
      });

      // 🔓 FIXED: Gunakan Ternary Operator untuk logic lulus/gagal (ESLint Fix)
      await (passed
        ? updateUserProgress({
            userId: user.id,
            explorationLevel: currentLevelNumber + 1, // Unlock level berikutnya
            explorationProgress: 0, // Reset progress untuk level baru
            xp: 0, // ✅ FIX: Reset XP ke 0
          })
        : decreaseLife('low_score'));
    } catch (error) {
      console.error('Error saving test score:', error);
    }

    setFinalScore({ score, correct: correctCount });
    setShowResults(true);
    localStorage.removeItem(`testState_exploration_${explorationId}`);
  }, [
    testState,
    questions,
    explorationId,
    currentLevelNumber,
    user,
    decreaseLife,
  ]);

  const handleTimeUp = useCallback(async () => {
    console.log('⏰ Time is up!');
    await decreaseLife('time_up');
    calculateAndFinalize();
  }, [calculateAndFinalize, decreaseLife]);

  useEffect(() => {
    if (!testState) return;
    const interval = setInterval(() => {
      const remaining = TEST_DURATION_MS - (Date.now() - testState.startTime);
      if (remaining <= 0) {
        clearInterval(interval);
        handleTimeUp();
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [testState, handleTimeUp]);

  useEffect(() => {
    if (testState && !showResults) {
      localStorage.setItem(
        `testState_exploration_${explorationId}`,
        JSON.stringify(testState)
      );
    }
  }, [testState, explorationId, showResults]);

  const handleSubmitTest = useCallback(() => {
    calculateAndFinalize();
  }, [calculateAndFinalize]);

  const handleAnswerChange = (answer: string) => {
    if (!testState) return;
    const currentQuestion = questions[testState.currentQuestionIndex];
    setTestState(prev =>
      prev
        ? {
            ...prev,
            answers: { ...prev.answers, [currentQuestion.id]: answer },
          }
        : undefined
    );
  };

  const navigateQuestion = (direction: 'next' | 'prev') => {
    setTestState(prev => {
      if (!prev) return undefined;
      const newIndex =
        direction === 'next'
          ? prev.currentQuestionIndex + 1
          : prev.currentQuestionIndex - 1;
      if (newIndex >= 0 && newIndex < questions.length) {
        return { ...prev, currentQuestionIndex: newIndex };
      }
      return prev;
    });
  };

  const handleRetry = () => {
    localStorage.removeItem(`testState_exploration_${explorationId}`);
    globalThis.location.reload();
  };

  const handleNextLevel = async () => {
    router.push('/eksplorasi');
  };

  const handleBackToExplore = () => {
    router.push('/eksplorasi');
  };

  const confirmLeave = async () => {
    await decreaseLife('quit');
    localStorage.removeItem(`testState_exploration_${explorationId}`);
    router.push('/eksplorasi');
  };

  return {
    testState,
    questions,
    questionsLoading,
    timeLeft,
    showResults,
    finalScore,
    isLeaving,
    userLives: userProfile.lives ?? 3,
    setIsLeaving,
    handleAnswerChange,
    navigateQuestion,
    handleSubmitTest,
    handleRetry,
    handleNextLevel,
    handleBackToExplore,
    confirmLeave,
  };
};
