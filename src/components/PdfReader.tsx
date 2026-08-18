"use client";

import { useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { useChapters } from "@/hooks/useChapters";
import { Chapter } from "@/types/pdf";
import ChapterSidebar from "@/components/ChapterSidebar";
import PdfNavigation from "@/components/PdfNavigation";

const PdfViewer = dynamic(() => import("@/components/PdfViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center p-24 space-y-4">
      <div className="w-8 h-8 border-4 border-zinc-400 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin" />
      <p className="text-sm text-zinc-500">Iniciando visor de PDF...</p>
    </div>
  ),
});

interface PdfReaderProps {
  file: File;
  onClose: () => void;
}

export default function PdfReader({ file, onClose }: PdfReaderProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [scrollToPage, setScrollToPage] = useState<number | undefined>(undefined);

  const {
    chapters,
    hasOutline,
    isLoadingChapters,
    extractChapters,
  } = useChapters();

  const handleDocumentLoadSuccess = (pdf: PDFDocumentProxy) => {
    setNumPages(pdf.numPages);
    extractChapters(pdf, pdf.numPages);
  };

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

  const handleSelectChapter = useCallback((chapter: Chapter) => {
    setActiveChapterId(chapter.id);
    setCurrentPage(chapter.startPage);
    setScrollToPage(chapter.startPage);
  }, []);

  const handleNextChapter = useCallback(() => {
    if (
      currentChapterIndex >= 0 &&
      currentChapterIndex < flattenedChapters.length - 1
    ) {
      const nextChapter = flattenedChapters[currentChapterIndex + 1];
      handleSelectChapter(nextChapter);
    }
  }, [currentChapterIndex, flattenedChapters, handleSelectChapter]);

  const handlePrevChapter = useCallback(() => {
    if (currentChapterIndex > 0) {
      const prevChapter = flattenedChapters[currentChapterIndex - 1];
      handleSelectChapter(prevChapter);
    }
  }, [currentChapterIndex, flattenedChapters, handleSelectChapter]);

  // Jump to specific page: if it belongs to another chapter, switch chapter
  const handlePageChange = useCallback(
    (targetPage: number) => {
      if (targetPage < 1 || targetPage > numPages) return;

      const targetChapter = flattenedChapters.find(
        (c) => targetPage >= c.startPage && targetPage <= c.endPage
      );

      if (targetChapter && targetChapter.id !== activeChapterId) {
        setActiveChapterId(targetChapter.id);
      }

      setCurrentPage(targetPage);
      setScrollToPage(targetPage);
    },
    [numPages, flattenedChapters, activeChapterId]
  );

  const handleVisiblePageChange = useCallback((pageNum: number) => {
    setCurrentPage(pageNum);
    setScrollToPage(undefined); // Clear requested scroll target once scrolling naturally
  }, []);

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.15, 2.0));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.15, 0.6));
  const zoomReset = () => setScale(1.0);

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

      {/* Body: Sidebar + Scrollable Reader */}
      <div className="flex flex-1 overflow-hidden relative">
        <ChapterSidebar
          chapters={chapters}
          hasOutline={hasOutline}
          isLoading={isLoadingChapters}
          activeChapterId={activeChapter?.id || null}
          onSelectChapter={handleSelectChapter}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen((prev) => !prev)}
        />

        <div className="flex flex-col flex-1 h-full overflow-y-auto relative">
          <main className="flex-1 pb-24">
            <PdfViewer
              file={file}
              startPage={startPage}
              endPage={endPage}
              onDocumentLoadSuccess={handleDocumentLoadSuccess}
              onVisiblePageChange={handleVisiblePageChange}
              scale={scale}
              activeChapterTitle={activeChapter?.title}
              hasNextChapter={
                currentChapterIndex >= 0 &&
                currentChapterIndex < flattenedChapters.length - 1
              }
              hasPrevChapter={currentChapterIndex > 0}
              onNextChapter={handleNextChapter}
              onPrevChapter={handlePrevChapter}
              scrollToPage={scrollToPage}
            />
          </main>

          {/* Sticky Bottom Navigation Bar */}
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
        </div>
      </div>
    </div>
  );
}
