'use client';

import React from 'react';
import { useParams } from 'next/navigation';

// Komponen UI yang sudah dipisah
import { GameHeader } from '@/components/ekplorasi/game-headers';
import { FloatingMascot } from '@/components/ekplorasi/floating.maskot';
import { FillInTheBlankMode } from '@/components/ekplorasi/fill-in-the-blank';
import { MultipleChoiceImageMode } from '@/components/ekplorasi/multiple-choice-image-question';
import { NavigationButtons } from '@/components/ekplorasi/navigation-button';
import { ResultsModal } from '@/components/ekplorasi/result-modal';
import { LeaveConfirmationModal } from '@/components/ekplorasi/leave-confirmation-modals';

// Logika inti dari custom hook
import { useTest } from '@/lib/hooks/use-tests';

export default function TestPage() {
  const params = useParams();
  const levelId = Number(params.levelId);

  // Memanggil semua state dan fungsi dari satu tempat!
  const {
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
    handleBackToExplore, // [DIUBAH]
    confirmLeave,
  } = useTest(levelId);

  // Tampilan Loading
  if (!testState || questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mobile-bg bg-cover bg-center font-sans md:bg-desktop-bg">
        <div className="text-center">
          <div className="mb-4 text-6xl">⏳</div>
          <div className="text-2xl font-bold text-brand-brown-stroke">
            Memuat Tes...
          </div>
        </div>
      </div>
    );
  }

  // Persiapan data untuk ditampilkan
  const currentQuestion = questions[testState.currentQuestionIndex];
  const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isFirstQuestion = testState.currentQuestionIndex === 0;
  const isLastQuestion =
    testState.currentQuestionIndex === questions.length - 1;
  const hasAnswer = !!testState.answers[currentQuestion.id];

  return (
    <>
      <div className="min-h-screen bg-mobile-bg bg-cover bg-center font-sans md:bg-desktop-bg">
        <div className="flex min-h-screen flex-col">
          <GameHeader
            currentIndex={testState.currentQuestionIndex}
            totalQuestions={questions.length}
            timeLeft={formattedTime}
            onBackClick={() => setIsLeaving(true)}
          />
          <main className="flex flex-1 animate-fade-in-up flex-col items-center justify-center space-y-6 p-4">
            <div className="w-full max-w-4xl">
              {currentQuestion.mode === 'fill-in-the-blank' && (
                <FillInTheBlankMode
                  question={currentQuestion}
                  savedAnswer={testState.answers[currentQuestion.id] || ''}
                  onAnswerChange={handleAnswerChange}
                />
              )}
              {currentQuestion.mode === 'multiple-choice-image' && (
                <MultipleChoiceImageMode
                  question={currentQuestion}
                  savedAnswer={testState.answers[currentQuestion.id] || ''}
                  onAnswerChange={handleAnswerChange}
                />
              )}
            </div>
            <NavigationButtons
              isFirstQuestion={isFirstQuestion}
              isLastQuestion={isLastQuestion}
              onPrevious={() => navigateQuestion('prev')}
              onNext={() => navigateQuestion('next')}
              onSubmit={handleSubmitTest}
              hasAnswer={hasAnswer}
            />
          </main>
        </div>
        <FloatingMascot />
      </div>

      {showResults && (
        <ResultsModal
          score={finalScore.score}
          correctAnswers={finalScore.correct}
          totalQuestions={questions.length}
          onRetry={handleRetry}
          onNextLevel={handleNextLevel}
          onBackToExplore={handleBackToExplore} // [DIUBAH]
          lives={userLives}
        />
      )}

      <LeaveConfirmationModal
        isOpen={isLeaving}
        onConfirm={confirmLeave}
        onCancel={() => setIsLeaving(false)}
      />
    </>
  );
}
