'use client';

import { useState, useEffect, useCallback, useMemo } from 'react'; // [DIPERBAIKI] Tambahkan 'useMemo'
import { useRouter } from 'next/navigation';
import {
  decreaseLife,
  getUserData,
  completeLevel,
} from '@/components/userinfo/userinfo';
import { testBank, TEST_DURATION_MS } from '@/data/test-bank';
import type { TestState } from '@/types/test';

export const useTest = (levelId: number) => {
  const router = useRouter();
  // [DIPERBAIKI] Gunakan useMemo untuk menstabilkan referensi 'questions'
  const questions = useMemo(() => testBank[levelId] || [], [levelId]);

  const [testState, setTestState] = useState<TestState | undefined>(undefined);
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION_MS);
  const [showResults, setShowResults] = useState(false);
  const [finalScore, setFinalScore] = useState({ score: 0, correct: 0 });
  const [isLeaving, setIsLeaving] = useState(false);
  const [userLives, setUserLives] = useState(3);

  const loadLives = useCallback(() => {
    const userData = getUserData();
    setUserLives(userData?.lives ?? 3);
  }, []);

  useEffect(() => {
    const savedStateRaw = localStorage.getItem(`testState_level_${levelId}`);
    setTestState(
      savedStateRaw
        ? JSON.parse(savedStateRaw)
        : {
            levelId,
            currentQuestionIndex: 0,
            answers: {},
            startTime: Date.now(),
          }
    );
    loadLives();
    globalThis.addEventListener('userStateChange', loadLives);
    return () => globalThis.removeEventListener('userStateChange', loadLives);
  }, [levelId, loadLives]);

  const calculateAndFinalize = useCallback(() => {
    if (!testState) return;
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
    if (score < 75) {
      decreaseLife();
    }
    setFinalScore({ score, correct: correctCount });
    setShowResults(true);
    localStorage.removeItem(`testState_level_${levelId}`);
  }, [testState, questions, levelId]);

  const handleTimeUp = useCallback(() => {
    decreaseLife();
    calculateAndFinalize();
  }, [calculateAndFinalize]);

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
        `testState_level_${levelId}`,
        JSON.stringify(testState)
      );
    }
  }, [testState, levelId, showResults]);

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
    localStorage.removeItem(`testState_level_${levelId}`);
    globalThis.location.reload();
  };

  const handleNextLevel = () => {
    completeLevel(levelId);
    router.push('/eksplorasi');
  };

  const handleBackToExplore = () => {
    router.push('/eksplorasi');
  };

  const confirmLeave = () => {
    decreaseLife();
    localStorage.removeItem(`testState_level_${levelId}`);
    router.push('/eksplorasi');
  };

  return {
    testState,
    questions,
    timeLeft,
    showResults,
    finalScore,
    isLeaving,
    userLives,
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
