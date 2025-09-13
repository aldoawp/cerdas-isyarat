'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUserProgress } from './use-user-progress';
import { getAssessmentQuestionsForExploration } from '@/services/ekplorasi-service';
import { getExplorationLevelById } from '@/repositories/ekplorasi-repository';
import { TestSession, Question } from '@/types';

export const TEST_DURATION_MS = 30 * 60 * 1000; // 30 menit

export const useTest = (explorationId: string) => {
  const router = useRouter();
  const { userProfile, decreaseLife, completeLevelAction } = useUserProgress();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [testState, setTestState] = useState<TestSession | undefined>(
    undefined
  );
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION_MS);
  const [showResults, setShowResults] = useState(false);
  const [finalScore, setFinalScore] = useState({ score: 0, correct: 0 });
  const [isLeaving, setIsLeaving] = useState(false);
  const hasFetched = useRef(false);

  // Fetch questions from database
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setQuestionsLoading(true);

        // Validate explorationId before making the request
        if (!explorationId || typeof explorationId !== 'string') {
          throw new Error(`Invalid explorationId: ${explorationId}`);
        }

        // First, get the exploration level to get the level number
        const explorationLevel = await getExplorationLevelById(explorationId);
        if (!explorationLevel) {
          throw new Error(`Exploration level ${explorationId} not found`);
        }

        // Then fetch the assessment questions
        const assessmentQuestions = await getAssessmentQuestionsForExploration(
          explorationId,
          explorationLevel.levels
        );

        setQuestions(assessmentQuestions);
      } catch (error) {
        console.error('Error fetching assessment questions:', error);
        // Fallback to empty array if there's an error
        setQuestions([]);
      } finally {
        setQuestionsLoading(false);
      }
    };

    // Only fetch if we have a valid explorationId and haven't fetched yet
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
            levelId: 0, // We'll get the actual level number from the exploration data
            currentQuestionIndex: 0,
            answers: {},
            startTime: Date.now(),
          }
    );
  }, [explorationId]);

  const calculateAndFinalize = useCallback(async () => {
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

    // Check if score is below 80% (minimum required score)
    if (score < 80) {
      await decreaseLife('low_score');
    }

    setFinalScore({ score, correct: correctCount });
    setShowResults(true);
    localStorage.removeItem(`testState_exploration_${explorationId}`);
  }, [testState, questions, explorationId, decreaseLife]);

  const handleTimeUp = useCallback(async () => {
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
    try {
      // Get the actual level number from the exploration data
      const explorationLevel = await getExplorationLevelById(explorationId);
      if (explorationLevel) {
        completeLevelAction(explorationLevel.levels);
      } else {
        console.error(
          'Could not find exploration level for ID:',
          explorationId
        );
        // Fallback to level 1 if we can't find the level
        completeLevelAction(1);
      }
    } catch (error) {
      console.error('Error getting exploration level:', error);
      // Fallback to level 1 if there's an error
      completeLevelAction(1);
    }
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
