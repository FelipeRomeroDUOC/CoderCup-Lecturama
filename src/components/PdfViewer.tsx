"use client";

import React, { useRef, useEffect, useState, useCallback, useMemo, memo } from "react";
import { Page } from "react-pdf";
import { isPreliminarySection } from "@/lib/chapterClassifier";
import type { PDFDocumentProxy } from "pdfjs-dist";

interface PdfViewerProps {
  pdf: PDFDocumentProxy;
  startPage: number;
  endPage: number;
  onVisiblePageChange: (pageNum: number) => void;
  scale?: number;
  activeChapterTitle?: string;
  startSplitFractionY?: number;
  endSplitFractionY?: number;
  hasNextChapter?: boolean;
  hasPrevChapter?: boolean;
  isCurrentChapterCompleted?: boolean;
  isNextChapterUnlocked?: boolean;
  isNonPlayable?: boolean;
  hasActiveQuizSession?: boolean;
  quizSessionInfo?: { currentQuestion: number; totalQuestions: number; lives: number } | null;
  isAllBookCompleted?: boolean;
  onOpenBookCelebration?: () => void;
  onChooseNewBook?: () => void;
  onNextChapter?: () => void;
  onPrevChapter?: () => void;
  onStartQuiz?: () => void;
  scrollToPage?: number;
}

const PageLoadingPlaceholder = memo(function PageLoadingPlaceholder() {
  return (
    <div className="flex items-center justify-center min-h-[450px] w-full bg-zinc-50 dark:bg-zinc-900 text-zinc-400 text-xs animate-pulse">
      Cargando página...
    </div>
  );
});

function PdfViewerComponent({
  pdf,
  startPage,
  endPage,
  onVisiblePageChange,
  scale = 1.0,
  activeChapterTitle,
  startSplitFractionY,
  endSplitFractionY,
  hasNextChapter = false,
  hasPrevChapter = false,
  isCurrentChapterCompleted = false,
  isNextChapterUnlocked = true,
  isNonPlayable = false,
  hasActiveQuizSession = false,
  quizSessionInfo,
  isAllBookCompleted = false,
  onOpenBookCelebration,
  onChooseNewBook,
  onNextChapter,
  onPrevChapter,
  onStartQuiz,
  scrollToPage,
}: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(750);
  const [pageAspectRatios, setPageAspectRatios] = useState<Record<number, number>>({});
  const isProgrammaticScroll = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastReportedPageRef = useRef<number>(-1);

  const isPreliminary = isPreliminarySection(activeChapterTitle) || isNonPlayable;

  // Adjust page width responsively with hysteresis to avoid continuous layout shifts
  const updateWidth = useCallback(() => {
    if (containerRef.current) {
      const width = containerRef.current.clientWidth;
      const targetWidth = Math.min(Math.max(width - 32, 320), 850);
      setContainerWidth((prev) => (Math.abs(prev - targetWidth) > 15 ? targetWidth : prev));
    }
  }, []);

  useEffect(() => {
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [updateWidth]);

  // Handle explicit scroll commands
  useEffect(() => {
    if (scrollToPage && containerRef.current) {
      const targetEl = containerRef.current.querySelector(
        `[data-page-number="${scrollToPage}"]`
      );
      if (targetEl) {
        isProgrammaticScroll.current = true;
        targetEl.scrollIntoView({ behavior: "smooth", block: "start" });

        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => {
          isProgrammaticScroll.current = false;
        }, 800);
      }
    }
  }, [scrollToPage]);

  // Track the most visible page in the viewport using IntersectionObserver
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScroll.current) return;

        let mostVisiblePage = -1;
        let maxRatio = 0;

        entries.forEach((entry) => {
          const pageNum = Number(entry.target.getAttribute("data-page-number"));
          if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            mostVisiblePage = pageNum;
          }
        });

        if (mostVisiblePage > 0 && mostVisiblePage !== lastReportedPageRef.current) {
          lastReportedPageRef.current = mostVisiblePage;
          onVisiblePageChange(mostVisiblePage);
        }
      },
      {
        root: containerRef.current,
        threshold: [0.1, 0.3, 0.5, 0.7, 0.9],
      }
    );

    const elements = containerRef.current.querySelectorAll("[data-page-number]");
    elements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [startPage, endPage, onVisiblePageChange]);

  const pageNumbers = useMemo(() => {
    const list: number[] = [];
    for (let i = startPage; i <= endPage; i++) {
      list.push(i);
    }
    return list;
  }, [startPage, endPage]);

  const calculatedPageWidth = Math.round(containerWidth * scale);

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center gap-7 py-8 px-4 w-full h-full overflow-y-auto bg-[#F4EFE6] dark:bg-[#121110] transition-colors duration-200 relative"
    >
      {/* Warm Reading Desk Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/8 dark:bg-amber-500/6 rounded-full blur-3xl pointer-events-none" />

      {/* Pages List */}
      {pageNumbers.map((pageNum) => {
        const isStartPageSplit =
          pageNum === startPage && typeof startSplitFractionY === "number";
        const isEndPageSplit =
          pageNum === endPage && typeof endSplitFractionY === "number";

        const aspectRatio = pageAspectRatios[pageNum] || 1.414;
        const fullPageHeight = Math.round(calculatedPageWidth * aspectRatio);

        let containerHeight: number | undefined = undefined;
        let translateYOffset = 0;

        if (isStartPageSplit && isEndPageSplit) {
          translateYOffset = Math.round(fullPageHeight * startSplitFractionY!);
          containerHeight = Math.round(
            fullPageHeight * (endSplitFractionY! - startSplitFractionY!)
          );
        } else if (isStartPageSplit) {
          translateYOffset = Math.round(fullPageHeight * startSplitFractionY!);
          containerHeight = Math.round(fullPageHeight * (1 - startSplitFractionY!));
        } else if (isEndPageSplit) {
          translateYOffset = 0;
          containerHeight = Math.round(fullPageHeight * endSplitFractionY!);
        }

        const pageLabel = isStartPageSplit
          ? `Pág. ${pageNum} (2/2)`
          : isEndPageSplit
          ? `Pág. ${pageNum} (1/2)`
          : `Pág. ${pageNum}`;

        return (
          <div
            key={pageNum}
            data-page-number={pageNum}
            className="relative shadow-[0_12px_35px_rgba(0,0,0,0.12)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.7)] rounded-2xl overflow-hidden border border-amber-950/10 dark:border-amber-500/15 bg-white transition-all duration-300 hover:shadow-[0_18px_45px_rgba(0,0,0,0.18)] dark:hover:shadow-[0_30px_70px_rgba(0,0,0,0.85)] ring-1 ring-black/5 dark:ring-amber-500/10"
            style={{
              width: `${calculatedPageWidth}px`,
              height: containerHeight ? `${containerHeight}px` : undefined,
            }}
          >
            {/* Subtle Page Number Indicator on Top */}
            <div className="absolute top-2.5 right-3 z-10 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-2.5 py-0.5 rounded-full shadow-xs border border-zinc-200/60 dark:border-zinc-800/60">
              {pageLabel}
            </div>

            <div
              style={{
                transform: translateYOffset > 0 ? `translateY(-${translateYOffset}px)` : undefined,
              }}
            >
              <Page
                pageNumber={pageNum}
                width={calculatedPageWidth}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                loading={<PageLoadingPlaceholder />}
                onLoadSuccess={(page) => {
                  if (page.originalWidth && page.originalHeight) {
                    const ratio = page.originalHeight / page.originalWidth;
                    setPageAspectRatios((prev) =>
                      prev[pageNum] === ratio ? prev : { ...prev, [pageNum]: ratio }
                    );
                  }
                }}
              />
            </div>
          </div>
        );
      })}

      {/* End of Chapter Action Card */}
      <div
        className="w-full max-w-xl my-8 p-7 rounded-3xl border bg-white/95 dark:bg-[#1A1816]/95 border-amber-200/90 dark:border-amber-500/25 shadow-2xl text-center animate-in fade-in duration-300 backdrop-blur-md relative overflow-hidden"
      >
        {/* Subtle Warm Glow Behind Card */}
        <div
          className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-400/20 dark:bg-amber-400/10 rounded-full blur-2xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="space-y-4 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 shadow-xs">
              {isPreliminary
                ? "📖 Sección Informativa"
                : isAllBookCompleted || (!hasNextChapter && isCurrentChapterCompleted)
                ? "🏆 ¡Libro Conquistado con Éxito!"
                : isCurrentChapterCompleted
                ? "✅ Capítulo Superado con Honores"
                : hasActiveQuizSession
                ? "⚔️ Desafío en Pausa"
                : "✨ Desafío de Nivel"}
            </div>

            <h3 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 font-[family-name:var(--font-outfit)] pt-1">
              {activeChapterTitle || "Fin del capítulo"}
            </h3>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
              {isPreliminary
                ? "Has terminado de ver esta sección preliminar. Puedes avanzar libremente al primer capítulo del libro."
                : isAllBookCompleted || (!hasNextChapter && isCurrentChapterCompleted)
                ? "¡Felicitaciones! Has completado y superado todos los niveles de este libro con lectura activa y pensamiento crítico."
                : isCurrentChapterCompleted
                ? "Ya has superado este capítulo. Puedes releerlo libremente o continuar tu camino."
                : hasActiveQuizSession && quizSessionInfo
                ? `Tienes un quiz en pausa en la Pregunta ${quizSessionInfo.currentQuestion} de ${quizSessionInfo.totalQuestions} (${quizSessionInfo.lives} ${quizSessionInfo.lives === 1 ? "vida" : "vidas"}).`
                : "Has terminado las páginas de este capítulo. Responde el quiz interactivo de 8 preguntas para desbloquear el siguiente nivel."}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {hasPrevChapter && onPrevChapter && (
              <button
                type="button"
                onClick={onPrevChapter}
                className="px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-all cursor-pointer"
              >
                ← Anterior
              </button>
            )}

            {/* Preliminary section: Direct advance button */}
            {isPreliminary && hasNextChapter && onNextChapter && (
              <button
                type="button"
                onClick={onNextChapter}
                className="px-6 py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-zinc-900 hover:bg-amber-600 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-amber-400 shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Comenzar Lectura ➔</span>
              </button>
            )}

            {/* Playable chapter: Quiz button if not yet completed */}
            {!isPreliminary && !isCurrentChapterCompleted && onStartQuiz && (
              <button
                type="button"
                onClick={onStartQuiz}
                className={`px-6 py-3 text-xs sm:text-sm font-extrabold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer ${
                  hasActiveQuizSession
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
                    : "bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-500/25"
                }`}
              >
                <span>{hasActiveQuizSession ? "▶️" : "🎯"}</span>
                <span>
                  {hasActiveQuizSession
                    ? quizSessionInfo
                    ? `Continuar Quiz del Nivel (${quizSessionInfo.currentQuestion}/${quizSessionInfo.totalQuestions})`
                    : "Continuar Quiz del Nivel"
                    : "Comenzar Desafío del Nivel"}
                </span>
              </button>
            )}

            {/* Playable chapter: Next chapter button if already completed */}
            {!isPreliminary && hasNextChapter && onNextChapter && isCurrentChapterCompleted && isNextChapterUnlocked && (
              <button
                type="button"
                onClick={onNextChapter}
                className="px-6 py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Siguiente Capítulo ➔</span>
              </button>
            )}

            {/* All Book completed: Choose new book button */}
            {!isPreliminary && (!hasNextChapter || isAllBookCompleted) && isCurrentChapterCompleted && (onChooseNewBook || onOpenBookCelebration) && (
              <button
                type="button"
                onClick={onOpenBookCelebration || onChooseNewBook}
                className="px-6 py-3 text-xs sm:text-sm font-extrabold rounded-xl bg-zinc-900 hover:bg-amber-600 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-amber-400 shadow-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>🏆</span>
                <span>Ver Celebración & Elegir Libro</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(PdfViewerComponent);
