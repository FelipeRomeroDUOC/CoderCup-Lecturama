"use client";

import { useRef, useEffect, useState, useCallback, useMemo } from "react";
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
  hasNextChapter?: boolean;
  hasPrevChapter?: boolean;
  isCurrentChapterCompleted?: boolean;
  isNextChapterUnlocked?: boolean;
  isNonPlayable?: boolean;
  hasActiveQuizSession?: boolean;
  quizSessionInfo?: { currentQuestion: number; totalQuestions: number; lives: number } | null;
  onNextChapter?: () => void;
  onPrevChapter?: () => void;
  onStartQuiz?: () => void;
  scrollToPage?: number;
}

export default function PdfViewer({
  pdf,
  startPage,
  endPage,
  onVisiblePageChange,
  scale = 1.0,
  activeChapterTitle,
  hasNextChapter = false,
  hasPrevChapter = false,
  isCurrentChapterCompleted = false,
  isNextChapterUnlocked = true,
  isNonPlayable = false,
  hasActiveQuizSession = false,
  quizSessionInfo,
  onNextChapter,
  onPrevChapter,
  onStartQuiz,
  scrollToPage,
}: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(750);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const isProgrammaticScroll = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isPreliminary = isPreliminarySection(activeChapterTitle) || isNonPlayable;

  // Register DOM elements per page
  const handleMountElement = useCallback(
    (pageNum: number, el: HTMLDivElement | null) => {
      if (el) {
        pageRefs.current.set(pageNum, el);
      } else {
        pageRefs.current.delete(pageNum);
      }
    },
    []
  );

  // Adjust page width responsively without rapid updates
  const updateWidth = useCallback(() => {
    if (containerRef.current) {
      const width = containerRef.current.clientWidth;
      const targetWidth = Math.min(Math.max(width - 32, 320), 850);
      setContainerWidth((prev) => (Math.abs(prev - targetWidth) > 10 ? targetWidth : prev));
    }
  }, []);

  useEffect(() => {
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [updateWidth]);

  // Handle explicit scroll commands
  useEffect(() => {
    if (scrollToPage && pageRefs.current.has(scrollToPage)) {
      const targetEl = pageRefs.current.get(scrollToPage);
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

        if (mostVisiblePage > 0) {
          onVisiblePageChange(mostVisiblePage);
        }
      },
      {
        root: containerRef.current,
        threshold: [0.1, 0.3, 0.5, 0.7, 0.9],
      }
    );

    const currentMap = pageRefs.current;
    currentMap.forEach((el) => observer.observe(el));

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

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center gap-6 py-8 px-4 w-full h-full overflow-y-auto"
    >
      {/* Pages List */}
      {pageNumbers.map((pageNum) => (
        <div
          key={pageNum}
          ref={(el) => handleMountElement(pageNum, el)}
          data-page-number={pageNum}
          className="relative shadow-xl rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white transition-shadow duration-300 hover:shadow-2xl"
          style={{ width: `${containerWidth * scale}px` }}
        >
          {/* Subtle Page Number Indicator on Top */}
          <div className="absolute top-2 right-3 z-10 text-[10px] font-medium text-zinc-400 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm px-2 py-0.5 rounded shadow-sm">
            Pág. {pageNum}
          </div>

          <Page
            pageNumber={pageNum}
            width={containerWidth * scale}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            loading={
              <div
                className="flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 text-zinc-400 text-xs animate-pulse"
                style={{
                  width: `${containerWidth * scale}px`,
                  height: `${(containerWidth * scale) * 1.414}px`,
                }}
              >
                Cargando página {pageNum}...
              </div>
            }
          />
        </div>
      ))}

      {/* End of Chapter Action Card */}
      <div
        className="w-full max-w-xl my-8 p-6 rounded-2xl border bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-lg text-center animate-in fade-in duration-300"
      >
        <div className="space-y-3">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              {isPreliminary
                ? "📖 Sección Introductoria"
                : isCurrentChapterCompleted
                ? "✅ Capítulo Superado"
                : hasActiveQuizSession
                ? "⚔️ Desafío en Pausa"
                : "⚔️ Desafío de Nivel"}
            </span>

            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 pt-2">
              {activeChapterTitle || "Fin del capítulo"}
            </h3>

            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {isPreliminary
                ? "Has terminado de ver esta sección preliminar. Puedes avanzar libremente al primer capítulo del libro."
                : isCurrentChapterCompleted
                ? "Ya has superado este capítulo. Puedes releerlo libremente o continuar tu camino."
                : hasActiveQuizSession && quizSessionInfo
                ? `Tienes un quiz en pausa en la Pregunta ${quizSessionInfo.currentQuestion} de ${quizSessionInfo.totalQuestions} (${quizSessionInfo.lives} ${quizSessionInfo.lives === 1 ? "vida" : "vidas"}).`
                : "Has terminado las páginas de este capítulo. Responde el quiz para desbloquear el siguiente nivel."}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {hasPrevChapter && onPrevChapter && (
              <button
                type="button"
                onClick={onPrevChapter}
                className="px-4 py-2.5 text-sm font-medium rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all cursor-pointer"
              >
                ← Anterior
              </button>
            )}

            {/* Preliminary section: Direct advance button */}
            {isPreliminary && hasNextChapter && onNextChapter && (
              <button
                type="button"
                onClick={onNextChapter}
                className="px-6 py-2.5 text-sm font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-500 shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Comenzar Lectura ➔</span>
              </button>
            )}

            {/* Playable chapter: Quiz button if not yet completed */}
            {!isPreliminary && !isCurrentChapterCompleted && onStartQuiz && (
              <button
                type="button"
                onClick={onStartQuiz}
                className={`px-5 py-2.5 text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer ${
                  hasActiveQuizSession
                    ? "bg-emerald-500 text-white hover:bg-emerald-400"
                    : "bg-amber-500 text-zinc-950 hover:bg-amber-400"
                }`}
              >
                <span>{hasActiveQuizSession ? "▶️" : "🎯"}</span>
                <span>
                  {hasActiveQuizSession
                    ? quizSessionInfo
                      ? `Continuar Quiz del Nivel (Pregunta ${quizSessionInfo.currentQuestion}/${quizSessionInfo.totalQuestions})`
                      : "Continuar Quiz del Nivel"
                    : "Comenzar Quiz del Nivel"}
                </span>
              </button>
            )}

            {/* Playable chapter: Next chapter button if already completed */}
            {!isPreliminary && hasNextChapter && onNextChapter && isCurrentChapterCompleted && isNextChapterUnlocked && (
              <button
                type="button"
                onClick={onNextChapter}
                className="px-5 py-2.5 text-sm font-medium rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-sm transition-all cursor-pointer"
              >
                Siguiente Capítulo →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
