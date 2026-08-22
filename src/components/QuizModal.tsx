"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { QuizQuestion } from "@/types/quiz";
import {
  getQuizSession,
  saveQuizSession,
  clearQuizSession,
} from "@/lib/quizSessionStore";
import { getQuizCompletionFeedback } from "@/lib/quizFeedback";
import LecturamaLogo from "@/components/LecturamaLogo";

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAbandon?: () => void;
  chapterId: string;
  chapterTitle: string;
  bookTitle?: string;
  userId?: string;
  questions: QuizQuestion[];
  onCompleteSuccess: () => void;
  onAdvanceToNextChapter?: () => void;
}

export default function QuizModal({
  isOpen,
  onClose,
  onAbandon,
  chapterId,
  chapterTitle,
  bookTitle = "default_book",
  userId = "default_user",
  questions,
  onCompleteSuccess,
  onAdvanceToNextChapter,
}: QuizModalProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [lives, setLives] = useState<number>(4);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);

  const lastChapterIdRef = useRef<string>(chapterId);

  const resetQuiz = useCallback(() => {
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setIsAnswerSubmitted(false);
    setLives(4);
    setIsVictory(false);
    setIsGameOver(false);
    setCorrectAnswersCount(0);
    clearQuizSession(userId, bookTitle, chapterId);
  }, [userId, bookTitle, chapterId]);

  // Load saved session on open or initialize
  useEffect(() => {
    if (!isOpen) return;

    lastChapterIdRef.current = chapterId;
    const savedSession = getQuizSession(userId, bookTitle, chapterId);

    // Verify if saved session matches current questions
    const isMatchingSession =
      savedSession &&
      Array.isArray(savedSession.questions) &&
      savedSession.questions.length > 0 &&
      questions.length > 0 &&
      savedSession.questions[0].question === questions[0].question;

    if (isMatchingSession && savedSession) {
      setCurrentQuestionIndex(savedSession.currentQuestionIndex || 0);
      setSelectedOptionIndex(savedSession.selectedOptionIndex ?? null);
      setIsAnswerSubmitted(Boolean(savedSession.isAnswerSubmitted));
      setLives(typeof savedSession.lives === "number" ? savedSession.lives : 4);
      setCorrectAnswersCount(savedSession.correctAnswersCount || 0);
      setIsVictory(false);
      setIsGameOver(false);
    } else {
      // If no valid session or questions changed/reset, start fresh at question 1
      resetQuiz();
    }
  }, [isOpen, chapterId, questions, userId, bookTitle, resetQuiz]);

  // Auto-save quiz session state to localStorage on changes
  useEffect(() => {
    if (!isOpen || isVictory || isGameOver || questions.length === 0) return;

    saveQuizSession(userId, bookTitle, {
      chapterId,
      chapterTitle,
      questions,
      currentQuestionIndex,
      lives,
      correctAnswersCount,
      selectedOptionIndex,
      isAnswerSubmitted,
      timestamp: Date.now(),
    });
  }, [
    isOpen,
    isVictory,
    isGameOver,
    userId,
    bookTitle,
    chapterId,
    chapterTitle,
    questions,
    currentQuestionIndex,
    lives,
    correctAnswersCount,
    selectedOptionIndex,
    isAnswerSubmitted,
  ]);

  if (!isOpen || questions.length === 0) return null;

  const currentQuestion = questions[currentQuestionIndex] || questions[0];
  const totalQuestions = questions.length;
  const progressPercent = Math.round(
    ((currentQuestionIndex + (isAnswerSubmitted ? 1 : 0)) / totalQuestions) * 100
  );

  const handleSelectOption = (index: number) => {
    if (isAnswerSubmitted || isGameOver || isVictory) return;

    setSelectedOptionIndex(index);
    setIsAnswerSubmitted(true);

    const isCorrect = index === currentQuestion.correctOptionIndex;

    if (isCorrect) {
      setCorrectAnswersCount((prev) => prev + 1);
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) {
        setIsGameOver(true);
        clearQuizSession(userId, bookTitle, chapterId);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < totalQuestions) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOptionIndex(null);
      setIsAnswerSubmitted(false);
    } else {
      // Completed all questions with at least 1 life
      setIsVictory(true);
      clearQuizSession(userId, bookTitle, chapterId);
      onCompleteSuccess();
    }
  };

  const handleRetryQuiz = () => {
    resetQuiz();
  };

  const handleVictoryContinue = () => {
    clearQuizSession(userId, bookTitle, chapterId);
    onClose();
    if (onAdvanceToNextChapter) {
      onAdvanceToNextChapter();
    }
  };

  const handleAbandonQuiz = () => {
    if (
      window.confirm(
        "🏳️ ¿Estás seguro de que deseas abandonar el quiz?\n\nSe perderá el progreso de las preguntas respondidas en este capítulo."
      )
    ) {
      clearQuizSession(userId, bookTitle, chapterId);
      resetQuiz();
      if (onAbandon) {
        onAbandon();
      } else {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#FAF8F5] dark:bg-zinc-900 rounded-3xl shadow-2xl border border-amber-200/80 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm">
          <div className="flex items-center gap-3 min-w-0">
            <LecturamaLogo size={26} withGlow={false} />
            <div className="min-w-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                ✨ Desafío del Nivel
              </span>
              <h2 className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-zinc-100 truncate max-w-[160px] sm:max-w-xs font-[family-name:var(--font-outfit)]">
                {chapterTitle}
              </h2>
            </div>
          </div>

          {/* Lives Indicator */}
          <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/40 px-3.5 py-1.5 rounded-full border border-rose-200 dark:border-rose-900/50 shadow-2xs">
            <span className="text-xs font-bold text-rose-700 dark:text-rose-300 mr-0.5">
              Vidas:
            </span>
            {[1, 2, 3, 4].map((heart) => (
              <span
                key={heart}
                className={`text-sm transition-transform duration-200 ${
                  heart <= lives
                    ? "scale-100 opacity-100"
                    : "scale-75 opacity-25 grayscale"
                }`}
              >
                ❤️
              </span>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        {!isGameOver && !isVictory && (
          <div className="w-full bg-amber-100 dark:bg-zinc-800 h-1.5">
            <div
              className="bg-gradient-to-r from-amber-400 to-amber-500 h-full transition-all duration-300 ease-out shadow-xs"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* Main Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Victory Screen */}
          {isVictory ? (() => {
            const feedback = getQuizCompletionFeedback(lives);
            const medal = lives === 4 ? "🏆" : lives === 3 ? "🥈" : lives === 2 ? "🥉" : "🎯";

            return (
              <div className="text-center py-2 space-y-4 animate-in zoom-in-95 duration-200">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 shadow-xs">
                  {feedback.badge}
                </div>

                <div className="space-y-1">
                  <div className="text-5xl my-1 animate-bounce">{medal}</div>
                  <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                    {feedback.title}
                  </h3>
                  <div className="text-sm font-semibold text-rose-500 tracking-widest pt-0.5">
                    {feedback.heartsDisplay}
                  </div>
                  <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 pt-0.5">
                    🔓 ¡Capítulo superado y desbloqueado permanentemente!
                  </p>
                </div>

                {/* Diagnostic & Comprehension message */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 text-left space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Diagnóstico de Comprensión:
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {feedback.diagnostic}
                  </p>
                </div>

                {/* Focus / Attention Tip Box */}
                <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 text-left space-y-1.5 shadow-xs">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                    <span>💡 Tip de Enfoque y Atención Lectora</span>
                  </div>
                  <p className="text-xs sm:text-sm text-indigo-950 dark:text-indigo-200/90 leading-relaxed">
                    {feedback.focusTip}
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleVictoryContinue}
                    className="w-full sm:w-auto px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Continuar al Siguiente Capítulo ➔</span>
                  </button>
                </div>
              </div>
            );
          })() : isGameOver ? (() => {
            const feedback = getQuizCompletionFeedback(0);

            return (
              <div className="text-center py-2 space-y-4 animate-in zoom-in-95 duration-200">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-900 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80 shadow-xs">
                  {feedback.badge}
                </div>

                <div className="space-y-1">
                  <div className="text-5xl my-1">💔</div>
                  <h3 className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight">
                    {feedback.title}
                  </h3>
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {feedback.subtitle}
                  </p>
                </div>

                {/* Diagnostic */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 text-left space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Diagnóstico de Comprensión:
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {feedback.diagnostic}
                  </p>
                </div>

                {/* Focus / Attention Tip Box */}
                <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-left space-y-1.5 shadow-xs">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                    <span>💡 Tip de Enfoque y Atención Lectora</span>
                  </div>
                  <p className="text-xs sm:text-sm text-amber-950 dark:text-amber-200/90 leading-relaxed">
                    {feedback.focusTip}
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleRetryQuiz}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>🔄</span>
                    <span>Reintentar Quiz (4 Vidas)</span>
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold transition-all cursor-pointer"
                  >
                    Volver al Lector
                  </button>
                </div>
              </div>
            );
          })() : (
            /* Active Question Screen */
            <div className="space-y-5">
              {/* Question Counter */}
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200/80 dark:border-zinc-700">
                  Pregunta {currentQuestionIndex + 1} de {totalQuestions}
                </span>
                <span className="text-zinc-500 dark:text-zinc-400">
                  {correctAnswersCount} {correctAnswersCount === 1 ? "acierto" : "aciertos"}
                </span>
              </div>

              {/* Question Text */}
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-snug font-[family-name:var(--font-outfit)]">
                {currentQuestion.question}
              </h3>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedOptionIndex === idx;
                  const isCorrect = idx === currentQuestion.correctOptionIndex;

                  let optionStyles =
                    "border-zinc-200/90 dark:border-zinc-800 hover:border-amber-400 dark:hover:border-amber-500/60 bg-white dark:bg-zinc-800/90 text-zinc-800 dark:text-zinc-200 shadow-2xs hover:shadow-xs hover:scale-[1.008]";

                  if (isAnswerSubmitted) {
                    if (isCorrect) {
                      optionStyles =
                        "border-emerald-500 bg-emerald-50/90 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-200 font-semibold shadow-xs";
                    } else if (isSelected && !isCorrect) {
                      optionStyles =
                        "border-rose-400 bg-rose-50/90 dark:bg-rose-950/50 text-rose-950 dark:text-rose-200 line-through";
                    } else {
                      optionStyles =
                        "opacity-45 border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/50 text-zinc-400";
                    }
                  }

                  const optionLetters = ["A", "B", "C", "D"];

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswerSubmitted}
                      className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between gap-3 text-xs sm:text-sm cursor-pointer ${optionStyles}`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 shadow-2xs ${
                            isAnswerSubmitted && isCorrect
                              ? "bg-emerald-500 text-white"
                              : isAnswerSubmitted && isSelected && !isCorrect
                              ? "bg-rose-500 text-white"
                              : "bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                          }`}
                        >
                          {optionLetters[idx] || `${idx + 1}`}
                        </span>
                        <span className="leading-snug">{option}</span>
                      </div>

                      {isAnswerSubmitted && (
                        <span className="text-base shrink-0 font-bold">
                          {isCorrect ? "✓" : isSelected ? "✗" : ""}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Pedagogical Explanation Box */}
              {isAnswerSubmitted && currentQuestion.explanation && (
                <div
                  className={`p-4 rounded-2xl text-xs space-y-1 animate-in fade-in duration-200 border ${
                    selectedOptionIndex === currentQuestion.correctOptionIndex
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-900/50"
                      : "bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-900/50"
                  }`}
                >
                  <span className="font-bold uppercase tracking-wider block">
                    {selectedOptionIndex === currentQuestion.correctOptionIndex
                      ? "✨ ¡Correcto!"
                      : "💡 Explicación Formativa:"}
                  </span>
                  <p className="leading-relaxed">{currentQuestion.explanation}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isVictory && !isGameOver && (
          <div className="px-6 py-4 border-t border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer transition-colors flex items-center gap-1"
                title="Pausa el quiz para releer el capítulo"
              >
                <span>🔖</span>
                <span>Pausar y salir</span>
              </button>
              <button
                type="button"
                onClick={handleAbandonQuiz}
                className="text-xs font-semibold text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 flex items-center gap-1 cursor-pointer transition-colors"
                title="Descarta este quiz para reiniciar o cambiar de dificultad"
              >
                <span>🏳️</span>
                <span>Abandonar</span>
              </button>
            </div>

            {isAnswerSubmitted && (
              <button
                type="button"
                onClick={handleNextQuestion}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-xs sm:text-sm shadow-md hover:shadow-amber-500/25 transition-all animate-in fade-in duration-150 cursor-pointer"
              >
                {currentQuestionIndex + 1 === totalQuestions
                  ? "Ver Resultados ➔"
                  : "Siguiente Pregunta ➔"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
