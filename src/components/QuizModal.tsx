"use client";

import { useState, useCallback } from "react";
import { QuizQuestion } from "@/types/quiz";

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapterTitle: string;
  questions: QuizQuestion[];
  onCompleteSuccess: () => void;
}

export default function QuizModal({
  isOpen,
  onClose,
  chapterTitle,
  questions,
  onCompleteSuccess,
}: QuizModalProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [lives, setLives] = useState<number>(3);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);

  const resetQuiz = useCallback(() => {
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setIsAnswerSubmitted(false);
    setLives(3);
    setIsVictory(false);
    setIsGameOver(false);
    setCorrectAnswersCount(0);
  }, []);

  if (!isOpen || questions.length === 0) return null;

  const currentQuestion = questions[currentQuestionIndex];
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
      onCompleteSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Quiz del Nivel
            </span>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-xs sm:max-w-sm">
              {chapterTitle}
            </h2>
          </div>

          {/* Lives Indicator */}
          <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 rounded-full border border-rose-200 dark:border-rose-900/50">
            <span className="text-xs font-semibold text-rose-700 dark:text-rose-300 mr-1">
              Vidas:
            </span>
            {[1, 2, 3].map((heart) => (
              <span
                key={heart}
                className={`text-sm transition-transform duration-200 ${
                  heart <= lives
                    ? "scale-100 opacity-100"
                    : "scale-75 opacity-30 grayscale"
                }`}
              >
                ❤️
              </span>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        {!isGameOver && !isVictory && (
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5">
            <div
              className="bg-amber-500 h-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* Main Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Victory Screen */}
          {isVictory ? (
            <div className="text-center py-6 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="text-6xl animate-bounce">🏆</div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  ¡Nivel Superado con Éxito!
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
                  Has demostrado una excelente comprensión de este capítulo y has
                  conservado <span className="font-semibold text-rose-500">{lives} {lives === 1 ? "vida" : "vidas"}</span>.
                </p>
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  🔓 El siguiente capítulo ha sido desbloqueado permanentemente.
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-500 shadow-md transition-all"
                >
                  Continuar Lectura ➔
                </button>
              </div>
            </div>
          ) : isGameOver ? (
            /* Game Over Screen */
            <div className="text-center py-6 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="text-6xl">💀</div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                  ¡Te has quedado sin vidas!
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
                  No te preocupes, puedes volver a repasar el texto del capítulo o
                  reintentar el quiz ahora mismo con las 3 vidas restauradas.
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={resetQuiz}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>🔄</span>
                  <span>Reintentar Quiz (3 Vidas)</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium transition-all"
                >
                  Volver al Lector
                </button>
              </div>
            </div>
          ) : (
            /* Active Question Screen */
            <div className="space-y-5">
              {/* Question Counter */}
              <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
                <span>
                  Pregunta {currentQuestionIndex + 1} de {totalQuestions}
                </span>
                <span>
                  {correctAnswersCount} {correctAnswersCount === 1 ? "acierto" : "aciertos"}
                </span>
              </div>

              {/* Question Text */}
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                {currentQuestion.question}
              </h3>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedOptionIndex === idx;
                  const isCorrect = idx === currentQuestion.correctOptionIndex;

                  let optionStyles =
                    "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200";

                  if (isAnswerSubmitted) {
                    if (isCorrect) {
                      optionStyles =
                        "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-medium";
                    } else if (isSelected && !isCorrect) {
                      optionStyles =
                        "border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 line-through";
                    } else {
                      optionStyles =
                        "opacity-50 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-400";
                    }
                  }

                  const optionLetters = ["A", "B", "C", "D"];

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswerSubmitted}
                      className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 text-sm ${optionStyles}`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            isAnswerSubmitted && isCorrect
                              ? "bg-emerald-500 text-white"
                              : isAnswerSubmitted && isSelected && !isCorrect
                              ? "bg-rose-500 text-white"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                          }`}
                        >
                          {optionLetters[idx] || `${idx + 1}`}
                        </span>
                        <span>{option}</span>
                      </div>

                      {isAnswerSubmitted && (
                        <span className="text-base shrink-0">
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
                  className={`p-4 rounded-2xl text-xs space-y-1 animate-in fade-in duration-200 ${
                    selectedOptionIndex === currentQuestion.correctOptionIndex
                      ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50"
                      : "bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50"
                  }`}
                >
                  <span className="font-semibold uppercase tracking-wider block">
                    {selectedOptionIndex === currentQuestion.correctOptionIndex
                      ? "¡Correcto!"
                      : "Respuesta correcta:"}
                  </span>
                  <p>{currentQuestion.explanation}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isVictory && !isGameOver && (
          <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            >
              Pausar y salir
            </button>

            {isAnswerSubmitted && (
              <button
                type="button"
                onClick={handleNextQuestion}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm shadow-md transition-all animate-in fade-in duration-150"
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
