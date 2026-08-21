"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Document, pdfjs } from "react-pdf";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { useChapters } from "@/hooks/useChapters";
import { useGamification } from "@/hooks/useGamification";
import { extractChapterText } from "@/lib/pdfTextExtractor";
import { classifySectionLocally, isPreliminarySection } from "@/lib/chapterClassifier";
import { getClientUserId } from "@/lib/clientSession";
import {
  getQuizSession,
  clearQuizSession,
  clearAllBookSessions,
  ActiveQuizSession,
} from "@/lib/quizSessionStore";
import { Chapter } from "@/types/pdf";
import { QuizQuestion, QuizDifficulty } from "@/types/quiz";
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
  const [userId, setUserId] = useState<string>("default_user");
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [scrollToPage, setScrollToPage] = useState<number | undefined>(undefined);

  // Difficulty level (defaults to 'medium')
  const [difficulty, setDifficulty] = useState<QuizDifficulty>("medium");

  // Dynamic set of chapter IDs detected as non-playable filler
  const [nonPlayableChapterIds, setNonPlayableChapterIds] = useState<string[]>([]);

  // Quiz state
  const [isQuizOpen, setIsQuizOpen] = useState<boolean>(false);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState<boolean>(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);

  // Initialize client user ID on mount
  useEffect(() => {
    setUserId(getClientUserId());
  }, []);

  // Load saved difficulty from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("codercup_difficulty");
      if (saved === "basic" || saved === "medium" || saved === "advanced") {
        setDifficulty(saved);
      }
    } catch {
      // Ignore
    }
  }, []);

  // Create a stable Blob URL for the file to prevent FileReader churn in react-pdf
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setFileUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const {
    chapters,
    hasOutline,
    isLoadingChapters,
    extractChapters,
  } = useChapters();

  const extractedPdfRef = useRef<PDFDocumentProxy | null>(null);

  const handleDocumentLoadSuccess = useCallback(
    (pdf: PDFDocumentProxy) => {
      console.log(`[PDF-DOCUMENT] Document loaded successfully: ${pdf.numPages} pages`);
      setPdfDocument((prev) => (prev === pdf ? prev : pdf));
      setNumPages((prev) => (prev === pdf.numPages ? prev : pdf.numPages));
      if (extractedPdfRef.current !== pdf) {
        console.log(`[PDF-DOCUMENT] Triggering chapter extraction for new PDF`);
        extractedPdfRef.current = pdf;
        extractChapters(pdf, pdf.numPages);
      }
    },
    [extractChapters]
  );

  // Flattened list of chapters for linear navigation (next / previous)
  const flattenedChapters = useMemo(() => {
    const list: Chapter[] = [];
    const flatten = (items: Chapter[]) => {
      for (const item of items) {
        if (item.items && item.items.length > 0) {
          flatten(item.items);
        } else {
          list.push(item);
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
    resetProgress,
  } = useGamification({
    chapters: flattenedChapters,
    bookTitle: file.name,
    nonPlayableChapterIds,
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

  // Dynamic version counter to force instant re-evaluation of localStorage quiz state
  const [quizSessionVersion, setQuizSessionVersion] = useState<number>(0);
  const refreshQuizSession = useCallback(() => {
    setQuizSessionVersion((prev) => prev + 1);
  }, []);

  // Check if active chapter has an in-progress quiz session
  const activeQuizSession = useMemo<ActiveQuizSession | null>(() => {
    if (!activeChapter) return null;
    return getQuizSession(userId, file.name, activeChapter.id);
  }, [userId, file.name, activeChapter, isQuizOpen, quizSessionVersion, difficulty]);

  const hasActiveQuizSession = Boolean(activeQuizSession);

  const quizSessionInfo = useMemo(() => {
    if (!activeQuizSession) return null;
    return {
      currentQuestion: (activeQuizSession.currentQuestionIndex || 0) + 1,
      totalQuestions: activeQuizSession.questions.length,
      lives: activeQuizSession.lives,
    };
  }, [activeQuizSession]);

  const handleDifficultyChange = useCallback(
    (newDifficulty: QuizDifficulty) => {
      if (newDifficulty === difficulty) return;

      if (activeChapter && hasActiveQuizSession) {
        const confirmChange = window.confirm(
          `Tienes un quiz en curso en este capítulo.\n\n¿Deseas cambiar la dificultad y descartar el intento actual para comenzar uno nuevo?`
        );

        if (!confirmChange) {
          return;
        }

        // Clear active session for this chapter so the new difficulty takes effect
        clearQuizSession(userId, file.name, activeChapter.id);
        fetch(`/api/chapters/${encodeURIComponent(activeChapter.id)}/questions`, {
          method: "DELETE",
        }).catch((e) => console.warn("Error invalidating server quiz cache:", e));
        setQuizQuestions([]);
        setIsQuizOpen(false);
      }

      setDifficulty(newDifficulty);
      try {
        localStorage.setItem("codercup_difficulty", newDifficulty);
      } catch {
        // Ignore
      }
      refreshQuizSession();
    },
    [difficulty, activeChapter, hasActiveQuizSession, userId, file.name, refreshQuizSession]
  );

  // References to prevent re-evaluation loops and stabilize effects
  const evaluatedChapterIdsRef = useRef<Set<string>>(new Set());
  const isChapterUnlockedRef = useRef(isChapterUnlocked);
  isChapterUnlockedRef.current = isChapterUnlocked;

  // Hybrid filler detection: automatically checks active chapter if not already classified
  useEffect(() => {
    if (!pdfDocument || !activeChapter || currentChapterIndex < 0) return;

    if (
      nonPlayableChapterIds.includes(activeChapter.id) ||
      evaluatedChapterIdsRef.current.has(activeChapter.id)
    ) {
      return;
    }

    evaluatedChapterIdsRef.current.add(activeChapter.id);

    let isMounted = true;

    async function evaluateChapter() {
      if (!pdfDocument || !activeChapter) return;
      try {
        const text = await extractChapterText(
          pdfDocument,
          activeChapter.startPage,
          Math.min(activeChapter.endPage, activeChapter.startPage + 1)
        );

        const localResult = classifySectionLocally(
          activeChapter.title,
          text,
          currentChapterIndex,
          flattenedChapters.length
        );

        if (localResult.isKnownFiller) {
          if (isMounted) {
            setNonPlayableChapterIds((prev) =>
              prev.includes(activeChapter.id) ? prev : [...prev, activeChapter.id]
            );
          }
          return;
        }

        if (localResult.isAmbiguous) {
          const res = await fetch(
            `/api/chapters/${encodeURIComponent(activeChapter.id)}/classify`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                sectionTitle: activeChapter.title,
                snippetText: text.slice(0, 1000),
                index: currentChapterIndex,
                totalSections: flattenedChapters.length,
              }),
            }
          );
          if (res.ok) {
            const data = await res.json();
            if (data.isPlayable === false && isMounted) {
              setNonPlayableChapterIds((prev) =>
                prev.includes(activeChapter.id) ? prev : [...prev, activeChapter.id]
              );
            }
          }
        }
      } catch (err) {
        console.error("Error evaluando jugabilidad del capítulo:", err);
      }
    }

    evaluateChapter();

    return () => {
      isMounted = false;
    };
  }, [pdfDocument, activeChapter, currentChapterIndex, nonPlayableChapterIds, flattenedChapters]);

  // Auto-unlock non-playable filler chapters
  useEffect(() => {
    if (
      activeChapter &&
      nonPlayableChapterIds.includes(activeChapter.id) &&
      !isChapterCompleted(activeChapter.id) &&
      currentChapterIndex >= 0
    ) {
      markChapterCompleted(activeChapter.id, currentChapterIndex);
    }
  }, [
    nonPlayableChapterIds,
    activeChapter,
    currentChapterIndex,
    isChapterCompleted,
    markChapterCompleted,
  ]);

  // Chapter Navigation Handlers
  const handleSelectChapter = useCallback(
    (chapter: Chapter) => {
      if (isChapterUnlocked(chapter.id)) {
        setActiveChapterId(chapter.id);
        setCurrentPage(chapter.startPage);
        setScrollToPage(chapter.startPage);
      }
    },
    [isChapterUnlocked]
  );

  const handleNextChapter = useCallback(() => {
    if (
      currentChapterIndex >= 0 &&
      currentChapterIndex < flattenedChapters.length - 1
    ) {
      const nextChapter = flattenedChapters[currentChapterIndex + 1];
      if (isChapterUnlocked(nextChapter.id, currentChapterIndex + 1)) {
        setActiveChapterId(nextChapter.id);
        setCurrentPage(nextChapter.startPage);
        setScrollToPage(nextChapter.startPage);
      }
    }
  }, [currentChapterIndex, flattenedChapters, isChapterUnlocked]);

  const handlePrevChapter = useCallback(() => {
    if (currentChapterIndex > 0) {
      const prevChapter = flattenedChapters[currentChapterIndex - 1];
      setActiveChapterId(prevChapter.id);
      setCurrentPage(prevChapter.startPage);
      setScrollToPage(prevChapter.startPage);
    }
  }, [currentChapterIndex, flattenedChapters]);

  const handlePageChange = useCallback(
    (targetPage: number) => {
      if (targetPage < 1 || targetPage > numPages) return;

      const targetChapter = flattenedChapters.find(
        (c) => targetPage >= c.startPage && targetPage <= c.endPage
      );

      if (targetChapter) {
        if (!isChapterUnlocked(targetChapter.id)) {
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

  // Launch quiz on demand or resume saved session
  const handleStartQuiz = useCallback(async () => {
    if (!pdfDocument || !activeChapter) return;

    // 1. If an active paused session exists for this chapter, restore it immediately
    const existingSession = getQuizSession(userId, file.name, activeChapter.id);
    if (
      existingSession &&
      Array.isArray(existingSession.questions) &&
      existingSession.questions.length > 0
    ) {
      setQuizQuestions(existingSession.questions);
      setIsQuizOpen(true);
      return;
    }

    setIsLoadingQuiz(true);
    setQuizError(null);

    try {
      // 2. Extract plain text from the chapter's pages
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

      // 3. Request questions from the backend with selected difficulty
      const response = await fetch(
        `/api/chapters/${encodeURIComponent(activeChapter.id)}/questions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chapterText,
            chapterTitle: activeChapter.title,
            difficulty,
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
  }, [pdfDocument, activeChapter, userId, file.name, difficulty]);

  const handleQuizSuccess = useCallback(() => {
    if (activeChapter) {
      markChapterCompleted(activeChapter.id, currentChapterIndex);
    }
  }, [activeChapter, currentChapterIndex, markChapterCompleted]);

  const handleAdvanceToNextChapter = useCallback(() => {
    if (
      currentChapterIndex >= 0 &&
      currentChapterIndex < flattenedChapters.length - 1
    ) {
      const nextChapter = flattenedChapters[currentChapterIndex + 1];
      setActiveChapterId(nextChapter.id);
      setCurrentPage(nextChapter.startPage);
      setScrollToPage(nextChapter.startPage);
    }
  }, [currentChapterIndex, flattenedChapters]);

  // Developer Reset Handler
  const handleDevReset = useCallback(async () => {
    if (
      !window.confirm(
        "🛠️ [MODO DESARROLLADOR]\n\n¿Estás seguro de que deseas reiniciar la detección de capítulos, bloquear los niveles y vaciar la memoria en caché?"
      )
    ) {
      return;
    }

    try {
      await fetch("/api/dev/reset", { method: "POST" });
      resetProgress();
      clearAllBookSessions(userId, file.name);
      evaluatedChapterIdsRef.current.clear();
      extractedPdfRef.current = null;
      setNonPlayableChapterIds([]);
      setQuizQuestions([]);
      setIsQuizOpen(false);
      setQuizError(null);
      refreshQuizSession();

      // Re-trigger chapter extraction and classification from scratch
      if (pdfDocument) {
        extractChapters(pdfDocument, numPages);
      }

      if (flattenedChapters.length > 0) {
        setActiveChapterId(flattenedChapters[0].id);
        setCurrentPage(flattenedChapters[0].startPage);
        setScrollToPage(flattenedChapters[0].startPage);
      }
      alert("✅ Detección de capítulos, niveles y preguntas reiniciados con éxito.");
    } catch (err) {
      console.error("Error al reiniciar progreso dev:", err);
    }
  }, [
    resetProgress,
    userId,
    file.name,
    pdfDocument,
    numPages,
    extractChapters,
    flattenedChapters,
    refreshQuizSession,
  ]);

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.15, 2.0));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.15, 0.6));
  const zoomReset = () => setScale(1.0);

  const isCurrentCompleted = activeChapter
    ? isChapterCompleted(activeChapter.id)
    : false;
  const isCurrentNonPlayable = activeChapter
    ? nonPlayableChapterIds.includes(activeChapter.id)
    : false;
  const isNextUnlocked =
    currentChapterIndex >= 0 &&
    currentChapterIndex < flattenedChapters.length - 1
      ? isChapterUnlocked(flattenedChapters[currentChapterIndex + 1].id)
      : false;

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* Top Header Bar */}
      <header className="h-14 border-b border-zinc-800 bg-zinc-900/90 backdrop-blur px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Alternar panel de capítulos"
          >
            <span>📑</span>
            <span>{isSidebarOpen ? "Ocultar Capítulos" : "Ver Capítulos"}</span>
          </button>
          <span className="text-sm font-semibold truncate text-zinc-200 max-w-xs md:max-w-md">
            {file.name}
          </span>
        </div>

        {/* Center Controls: Difficulty Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-400 font-medium hidden sm:inline">
            Nivel:
          </label>
          <select
            value={difficulty}
            onChange={(e) => handleDifficultyChange(e.target.value as QuizDifficulty)}
            className="text-xs bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-lg px-2.5 py-1.5 font-medium hover:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            title="Ajusta el nivel y vocabulario de las preguntas"
          >
            <option value="basic">🧒 Básica (8-12 años)</option>
            <option value="medium">🧑‍🎓 Media (13-17 años)</option>
            <option value="advanced">🎓 Avanzada (Adultos)</option>
          </select>
        </div>

        {/* Right Controls: Developer Reset Tool & Zoom */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDevReset}
            className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors flex items-center gap-1 cursor-pointer"
            title="[DEV] Reiniciar todos los niveles, bloquearlos nuevamente y vaciar caché del servidor"
          >
            <span>🛠️</span>
            <span>Reset [DEV]</span>
          </button>

          <div className="hidden sm:flex items-center gap-1 bg-zinc-800 rounded-lg p-1 border border-zinc-700 text-xs">
            <button
              type="button"
              onClick={zoomOut}
              className="px-2 py-0.5 hover:bg-zinc-700 rounded text-zinc-300 cursor-pointer"
              title="Reducir zoom"
            >
              -
            </button>
            <button
              type="button"
              onClick={zoomReset}
              className="px-2 py-0.5 hover:bg-zinc-700 rounded text-zinc-300 font-mono cursor-pointer"
              title="Restablecer zoom"
            >
              {Math.round(scale * 100)}%
            </button>
            <button
              type="button"
              onClick={zoomIn}
              className="px-2 py-0.5 hover:bg-zinc-700 rounded text-zinc-300 cursor-pointer"
              title="Aumentar zoom"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors cursor-pointer"
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
          nonPlayableChapterIds={nonPlayableChapterIds}
        />

        <div className="flex flex-col flex-1 h-full overflow-y-auto relative">
          {/* Error Banner if Quiz initiation failed */}
          {quizError && (
            <div className="mx-4 mt-4 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center justify-between text-rose-800 dark:text-rose-300 text-sm">
              <span>⚠️ {quizError}</span>
              <button
                type="button"
                onClick={() => setQuizError(null)}
                className="text-xs underline hover:text-rose-900 ml-4 cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          )}

          {fileUrl && (
            <Document
              file={fileUrl}
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
                    isCurrentChapterCompleted={
                      activeChapter ? isChapterCompleted(activeChapter.id) : false
                    }
                    isNextChapterUnlocked={
                      currentChapterIndex >= 0 &&
                      currentChapterIndex < flattenedChapters.length - 1
                        ? isChapterUnlocked(
                            flattenedChapters[currentChapterIndex + 1].id,
                            currentChapterIndex + 1
                          )
                        : false
                    }
                    isNonPlayable={
                      activeChapter
                        ? isPreliminarySection(activeChapter.title) ||
                          nonPlayableChapterIds.includes(activeChapter.id)
                        : false
                    }
                    hasActiveQuizSession={hasActiveQuizSession}
                    quizSessionInfo={quizSessionInfo}
                    onNextChapter={handleNextChapter}
                    onPrevChapter={handlePrevChapter}
                    onStartQuiz={handleStartQuiz}
                    scrollToPage={scrollToPage}
                  />
                </main>
              )}
            </Document>
          )}

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
          onClose={() => {
            setIsQuizOpen(false);
            refreshQuizSession();
          }}
          onAbandon={() => {
            if (activeChapter) {
              fetch(
                `/api/chapters/${encodeURIComponent(activeChapter.id)}/questions`,
                { method: "DELETE" }
              ).catch((e) =>
                console.warn("Error invalidating server quiz cache:", e)
              );
            }
            setQuizQuestions([]);
            setIsQuizOpen(false);
            refreshQuizSession();
          }}
          chapterId={activeChapter.id}
          chapterTitle={activeChapter.title}
          bookTitle={file.name}
          userId={userId}
          questions={quizQuestions}
          onCompleteSuccess={() => {
            handleQuizSuccess();
            refreshQuizSession();
          }}
          onAdvanceToNextChapter={handleAdvanceToNextChapter}
        />
      )}
    </div>
  );
}
