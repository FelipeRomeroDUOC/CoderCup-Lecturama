"use client";

import { useState, useMemo, useCallback } from "react";
import { Document, pdfjs } from "react-pdf";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { useChapters } from "@/hooks/useChapters";
import { useGamification } from "@/hooks/useGamification";
import { extractChapterText } from "@/lib/pdfTextExtractor";
import { Chapter } from "@/types/pdf";
import { QuizQuestion } from "@/types/quiz";
import ChapterSidebar from "@/components/ChapterSidebar";
import PdfNavigation from "@/components/PdfNavigation";
import PdfViewer from "@/components/PdfViewer";
import QuizModal from "@/components/QuizModal";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure PDF.js worker on client side
if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

// Static loading element
const DocumentLoadingFallback = (
  <div className="flex flex-col items-center justify-center p-24 space-y-4">
    <div className="w-8 h-8 border-4 border-zinc-400 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin" />
    <p className="text-sm text-zinc-500">Cargando documento PDF...</p>
  </div>
);

// Static error element
const DocumentErrorFallback = (
  <div className="p-12 text-center text-red-600 dark:text-red-400 space-y-2">
    <p className="font-semibold">Error al cargar el archivo PDF.</p>
    <p className="text-sm">Por favor verifica que el archivo no esté dañado.</p>
  </div>
);

interface PdfReaderProps {
  file: File;
  onClose: () => void;
}

export default function PdfReader({ file, onClose }: PdfReaderProps) {
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [scrollToPage, setScrollToPage] = useState<number | undefined>(undefined);

  // Quiz state
  const [isQuizOpen, setIsQuizOpen] = useState<boolean>(false);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState<boolean>(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);

  // Memoize stable file reference
  const stableFile = useMemo(() => file, [file]);

  const {
    chapters,
    hasOutline,
    isLoadingChapters,
    extractChapters,
  } = useChapters();

  const handleDocumentLoadSuccess = useCallback(
    (pdf: PDFDocumentProxy) => {
      setPdfDocument((prev) => (prev === pdf ? prev : pdf));
      setNumPages((prev) => (prev === pdf.numPages ? prev : pdf.numPages));
      extractChapters(pdf, pdf.numPages);
    },
    [extractChapters]
  );

  // Flattened list of chapters for linear navigation (next / previous)
  const flattenedChapters = useMemo(() => {
    const list: Chapter[] = [];
    const flatten = (items: Chapter[]) => {
      for (const item of items) {
        list.push(item);
        if (item.items && item.items.length > 0) {
          flatten(item.items);
        }
      }
    };
    flatten(chapters);
    return list;
  }, [chapters]);

  // Gamification: level unlocking & chapter completion state
  const {
    isChapterCompleted,
    isChapterUnlocked,
    markChapterCompleted,
  } = useGamification({
    chapters: flattenedChapters,
    bookTitle: file.name,
  });

  // Current active chapter object
  const activeChapter = useMemo(() => {
    if (activeChapterId && flattenedChapters.length > 0) {
      return (
        flattenedChapters.find((c) => c.id === activeChapterId) ||
        flattenedChapters[0]
      );
    }
    return flattenedChapters[0] || null;
  }, [activeChapterId, flattenedChapters]);

  // Current chapter index in flattened list
  const currentChapterIndex = useMemo(() => {
    if (!activeChapter) return -1;
    return flattenedChapters.findIndex((c) => c.id === activeChapter.id);
  }, [activeChapter, flattenedChapters]);

  // Determine active start and end page
  const startPage = activeChapter ? activeChapter.startPage : 1;
  const endPage = activeChapter ? activeChapter.endPage : numPages;

  const handleSelectChapter = useCallback(
    (chapter: Chapter) => {
      const idx = flattenedChapters.findIndex((c) => c.id === chapter.id);
      if (!isChapterUnlocked(chapter.id, idx)) {
        return;
      }
      setActiveChapterId(chapter.id);
      setCurrentPage(chapter.startPage);
      setScrollToPage(chapter.startPage);
    },
    [flattenedChapters, isChapterUnlocked]
  );

  const handleNextChapter = useCallback(() => {
    if (
      currentChapterIndex >= 0 &&
      currentChapterIndex < flattenedChapters.length - 1
    ) {
      const nextChapter = flattenedChapters[currentChapterIndex + 1];
      if (isChapterUnlocked(nextChapter.id, currentChapterIndex + 1)) {
        handleSelectChapter(nextChapter);
      }
    }
  }, [currentChapterIndex, flattenedChapters, handleSelectChapter, isChapterUnlocked]);

  const handlePrevChapter = useCallback(() => {
    if (currentChapterIndex > 0) {
      const prevChapter = flattenedChapters[currentChapterIndex - 1];
      handleSelectChapter(prevChapter);
    }
  }, [currentChapterIndex, flattenedChapters, handleSelectChapter]);

  // Jump to specific page with locked chapter guard
  const handlePageChange = useCallback(
    (targetPage: number) => {
      if (targetPage < 1 || targetPage > numPages) return;

      const targetChapterIdx = flattenedChapters.findIndex(
        (c) => targetPage >= c.startPage && targetPage <= c.endPage
      );

      if (targetChapterIdx >= 0) {
        const targetChapter = flattenedChapters[targetChapterIdx];
        if (!isChapterUnlocked(targetChapter.id, targetChapterIdx)) {
          return;
        }

        if (targetChapter.id !== activeChapterId) {
          setActiveChapterId(targetChapter.id);
        }
      }

      setCurrentPage(targetPage);
      setScrollToPage(targetPage);
    },
    [numPages, flattenedChapters, isChapterUnlocked, activeChapterId]
  );

  const handleVisiblePageChange = useCallback((pageNum: number) => {
    setCurrentPage((prev) => (prev !== pageNum ? pageNum : prev));
  }, []);

  // Launch quiz on demand by extracting chapter text and fetching questions
  const handleStartQuiz = useCallback(async () => {
    if (!pdfDocument || !activeChapter) return;

    setIsLoadingQuiz(true);
    setQuizError(null);

    try {
      // 1. Extract plain text from the chapter's pages
      const chapterText = await extractChapterText(
        pdfDocument,
        activeChapter.startPage,
        activeChapter.endPage
      );

      if (!chapterText || chapterText.length < 30) {
        throw new Error(
          "No se pudo extraer suficiente texto de este capítulo para formular el quiz."
        );
      }

      // 2. Request questions from the backend
      const response = await fetch(
        `/api/chapters/${encodeURIComponent(activeChapter.id)}/questions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chapterText,
            chapterTitle: activeChapter.title,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al obtener las preguntas del quiz.");
      }

      if (Array.isArray(data.questions) && data.questions.length > 0) {
        setQuizQuestions(data.questions);
        setIsQuizOpen(true);
      } else {
        throw new Error("No se recibieron preguntas válidas para este capítulo.");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error inesperado al iniciar el quiz.";
      setQuizError(message);
    } finally {
      setIsLoadingQuiz(false);
    }
  }, [pdfDocument, activeChapter]);

  const handleQuizSuccess = useCallback(() => {
    if (activeChapter) {
      markChapterCompleted(activeChapter.id, currentChapterIndex);
    }
  }, [activeChapter, currentChapterIndex, markChapterCompleted]);

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.15, 2.0));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.15, 0.6));
  const zoomReset = () => setScale(1.0);

  const isCurrentCompleted = activeChapter
    ? isChapterCompleted(activeChapter.id)
    : false;

  const isNextUnlocked =
    currentChapterIndex < flattenedChapters.length - 1
      ? isChapterUnlocked(
          flattenedChapters[currentChapterIndex + 1].id,
          currentChapterIndex + 1
        )
      : false;

  return (
    <div className="flex flex-col h-screen w-full bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      {/* Top Header */}
      <header className="flex items-center justify-between px-4 py-2.5 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 z-20">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className="px-3 py-1.5 text-sm font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            title="Alternar panel de capítulos"
          >
            ☰ {isSidebarOpen ? "Ocultar Capítulos" : "Ver Capítulos"}
          </button>

          <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 max-w-xs md:max-w-md truncate">
            {file.name}
          </span>
        </div>

        {/* Zoom Controls & Close */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5 border border-zinc-200 dark:border-zinc-700 text-xs">
            <button
              type="button"
              onClick={zoomOut}
              className="px-2 py-1 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-700 dark:text-zinc-300"
              title="Reducir zoom"
            >
              -
            </button>
            <button
              type="button"
              onClick={zoomReset}
              className="px-2 py-1 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-700 dark:text-zinc-300 font-medium"
              title="Restablecer zoom"
            >
              {Math.round(scale * 100)}%
            </button>
            <button
              type="button"
              onClick={zoomIn}
              className="px-2 py-1 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-700 dark:text-zinc-300"
              title="Aumentar zoom"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-sm font-medium rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Cambiar libro
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        <ChapterSidebar
          chapters={chapters}
          hasOutline={hasOutline}
          isLoading={isLoadingChapters}
          activeChapterId={activeChapter?.id || null}
          onSelectChapter={handleSelectChapter}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen((prev) => !prev)}
          isChapterUnlocked={isChapterUnlocked}
          isChapterCompleted={isChapterCompleted}
        />

        <div className="flex flex-col flex-1 h-full overflow-y-auto relative">
          {/* Error Banner if Quiz initiation failed */}
          {quizError && (
            <div className="mx-4 mt-4 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center justify-between text-rose-800 dark:text-rose-300 text-sm">
              <span>⚠️ {quizError}</span>
              <button
                type="button"
                onClick={() => setQuizError(null)}
                className="text-xs underline hover:text-rose-900 ml-4"
              >
                Cerrar
              </button>
            </div>
          )}

          <Document
            file={stableFile}
            onLoadSuccess={handleDocumentLoadSuccess}
            loading={DocumentLoadingFallback}
            error={DocumentErrorFallback}
          >
            {pdfDocument && (
              <main className="flex-1 pb-24">
                <PdfViewer
                  pdf={pdfDocument}
                  startPage={startPage}
                  endPage={endPage}
                  onVisiblePageChange={handleVisiblePageChange}
                  scale={scale}
                  activeChapterTitle={activeChapter?.title}
                  hasNextChapter={
                    currentChapterIndex >= 0 &&
                    currentChapterIndex < flattenedChapters.length - 1
                  }
                  hasPrevChapter={currentChapterIndex > 0}
                  isCurrentChapterCompleted={isCurrentCompleted}
                  isNextChapterUnlocked={isNextUnlocked}
                  onNextChapter={handleNextChapter}
                  onPrevChapter={handlePrevChapter}
                  onStartQuiz={handleStartQuiz}
                  scrollToPage={scrollToPage}
                />
              </main>
            )}
          </Document>

          {/* Sticky Bottom Navigation Bar */}
          {pdfDocument && (
            <div className="sticky bottom-4 left-0 right-0 flex justify-center px-4 pointer-events-none z-10">
              <div className="pointer-events-auto">
                <PdfNavigation
                  currentPage={currentPage}
                  numPages={numPages}
                  onPageChange={handlePageChange}
                  activeChapterTitle={activeChapter?.title}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading Overlay when generating/fetching quiz questions */}
      {isLoadingQuiz && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 text-white space-y-4">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold">Generando Desafío con IA...</h3>
            <p className="text-sm text-zinc-300 max-w-sm">
              Analizando el contenido del capítulo para formular tus 5 preguntas de comprensión.
            </p>
          </div>
        </div>
      )}

      {/* Interactive Quiz Modal */}
      {activeChapter && (
        <QuizModal
          isOpen={isQuizOpen}
          onClose={() => setIsQuizOpen(false)}
          chapterTitle={activeChapter.title}
          questions={quizQuestions}
          onCompleteSuccess={handleQuizSuccess}
        />
      )}
    </div>
  );
}
