"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";

interface PdfNavigationProps {
  currentPage: number;
  numPages: number;
  onPageChange: (newPage: number) => void;
  activeChapterTitle?: string;
}

export default function PdfNavigation({
  currentPage,
  numPages,
  onPageChange,
  activeChapterTitle,
}: PdfNavigationProps) {
  const [inputPage, setInputPage] = useState<string>(String(currentPage));

  useEffect(() => {
    setInputPage(String(currentPage));
  }, [currentPage]);

  // Keyboard navigation: Left/Right arrows
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "ArrowLeft") {
        if (currentPage > 1) {
          onPageChange(currentPage - 1);
        }
      } else if (e.key === "ArrowRight") {
        if (currentPage < numPages) {
          onPageChange(currentPage + 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, numPages, onPageChange]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputPage(e.target.value);
  };

  const submitPage = () => {
    const pageNum = parseInt(inputPage, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= numPages) {
      onPageChange(pageNum);
    } else {
      setInputPage(String(currentPage));
    }
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    submitPage();
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < numPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-2.5 px-4 py-2 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800 rounded-full shadow-xl">
      {activeChapterTitle && (
        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 max-w-[220px] truncate hidden md:inline-block border-r border-zinc-200 dark:border-zinc-800 pr-3 mr-1">
          {activeChapterTitle}
        </span>
      )}

      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={currentPage <= 1}
          className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
          aria-label="Página anterior"
        >
          ← Anterior
        </button>

        <form onSubmit={handleFormSubmit} className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <span>Pág.</span>
          <input
            type="text"
            value={inputPage}
            onChange={handleInputChange}
            onBlur={submitPage}
            className="w-12 px-1 py-0.5 text-center font-bold rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            aria-label="Número de página"
          />
          <span className="text-zinc-500">/ {numPages || 1}</span>
        </form>

        <button
          type="button"
          onClick={handleNext}
          disabled={currentPage >= numPages}
          className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
          aria-label="Página siguiente"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}
