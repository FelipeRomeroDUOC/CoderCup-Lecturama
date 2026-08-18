"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";

interface PdfNavigationProps {
  currentPage: number;
  numPages: number;
  onPageChange: (newPage: number) => void;
}

export default function PdfNavigation({
  currentPage,
  numPages,
  onPageChange,
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
    <div className="flex items-center justify-between gap-3 px-4 py-2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
      <button
        type="button"
        onClick={handlePrevious}
        disabled={currentPage <= 1}
        className="px-3 py-1.5 text-sm font-medium rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Página anterior"
      >
        ← Anterior
      </button>

      <form onSubmit={handleFormSubmit} className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
        <span>Página</span>
        <input
          type="text"
          value={inputPage}
          onChange={handleInputChange}
          onBlur={submitPage}
          className="w-12 px-1.5 py-1 text-center font-medium rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
          aria-label="Número de página"
        />
        <span>de {numPages || 1}</span>
      </form>

      <button
        type="button"
        onClick={handleNext}
        disabled={currentPage >= numPages}
        className="px-3 py-1.5 text-sm font-medium rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Página siguiente"
      >
        Siguiente →
      </button>
    </div>
  );
}
