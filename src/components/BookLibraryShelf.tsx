"use client";

import React, { useEffect, useState, useCallback } from "react";
import { StoredBook, getAllStoredBooks, deleteStoredBook } from "@/lib/bookStorage";
import { getClientUserId } from "@/lib/clientSession";
import LecturamaLogo from "@/components/LecturamaLogo";

interface BookLibraryShelfProps {
  onSelectBook: (file: File) => void;
  refreshTrigger?: number;
}

export default function BookLibraryShelf({
  onSelectBook,
  refreshTrigger = 0,
}: BookLibraryShelfProps) {
  const [books, setBooks] = useState<StoredBook[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string>("default_user");

  useEffect(() => {
    setUserId(getClientUserId());
  }, []);

  const loadBooks = useCallback(async () => {
    try {
      setIsLoading(true);
      const list = await getAllStoredBooks();
      setBooks(list);
    } catch (err) {
      console.warn("Could not load stored books:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBooks();
  }, [loadBooks, refreshTrigger]);

  const handleDelete = async (e: React.MouseEvent, book: StoredBook) => {
    e.stopPropagation();
    if (
      !window.confirm(
        `¿Deseas retirar "${book.displayTitle}" de tu biblioteca local?`
      )
    ) {
      return;
    }

    try {
      await deleteStoredBook(book.id);
      setBooks((prev) => prev.filter((b) => b.id !== book.id));
    } catch (err) {
      console.error("Error deleting book:", err);
    }
  };

  const handleBookClick = (book: StoredBook) => {
    // Reconstruct File from Blob
    const file = new File([book.fileBlob], book.fileName, {
      type: "application/pdf",
      lastModified: book.lastReadAt,
    });
    onSelectBook(file);
  };

  // Helper to read gamification completion from localStorage
  const getBookProgress = (book: StoredBook) => {
    try {
      const cleanTitle = book.fileName.replace(/\s+/g, "_");
      const raw = localStorage.getItem(`codercup_${userId}_${cleanTitle}_progress`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.completedChapterIds)) {
          const completedCount = parsed.completedChapterIds.length;
          const totalChapters =
            parsed.totalPlayableChapters ||
            book.totalChapters ||
            (typeof parsed.maxUnlockedIndex === "number" && parsed.maxUnlockedIndex > 0
              ? Math.max(parsed.maxUnlockedIndex, completedCount)
              : completedCount);

          const isCompleted =
            Boolean(parsed.isAllCompleted) ||
            (totalChapters > 0 && completedCount >= totalChapters);

          const percent = isCompleted
            ? 100
            : totalChapters > 0
            ? Math.min(100, Math.round((completedCount / totalChapters) * 100))
            : completedCount > 0
            ? 100
            : 0;

          return {
            completedCount,
            totalChapters,
            percent,
            isCompleted,
          };
        }
      }
    } catch {
      // Ignore
    }
    return {
      completedCount: 0,
      totalChapters: book.totalChapters || 0,
      percent: 0,
      isCompleted: false,
    };
  };

  if (isLoading) {
    return (
      <div className="w-full py-8 text-center text-zinc-400 text-sm animate-pulse">
        <span className="inline-block animate-spin mr-2">⏳</span>
        Explorando tu estantería...
      </div>
    );
  }

  if (books.length === 0) {
    return null; // Return null so landing page only shows uploader without empty shelf clutter
  }

  return (
    <section className="w-full max-w-5xl mx-auto space-y-6 pt-4 pb-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-300">
            <LecturamaLogo size={20} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black font-[family-name:var(--font-outfit)] text-zinc-900 dark:text-zinc-100 tracking-tight">
              Mi Estantería de Libros
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-[family-name:var(--font-patrick-hand)] text-base">
              {books.length} {books.length === 1 ? "obra guardada" : "obras guardadas"} en tu dispositivo
            </p>
          </div>
        </div>

        <span className="text-xs text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1.5 self-start sm:self-auto">
          <span>💡 Haz clic en una portada para reanudar la lectura</span>
        </span>
      </div>

      {/* Book Grid / Shelf */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
        {books.map((book) => {
          const progress = getBookProgress(book);
          const hasCover = Boolean(book.coverDataUrl);

          return (
            <div
              key={book.id}
              onClick={() => handleBookClick(book)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleBookClick(book);
                }
              }}
              className="group relative flex flex-col cursor-pointer select-none text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-2xl"
              title={`Reanudar: ${book.displayTitle}`}
            >
              {/* 3D Book Jacket & Spine Wrapper with Zero Gravity Hover */}
              <div className="relative w-full aspect-[1/1.42] rounded-xl overflow-hidden bg-zinc-900 border border-zinc-700/70 shadow-md group-hover:shadow-[0_20px_35px_rgba(217,119,6,0.25)] group-hover:-translate-y-2.5 group-hover:rotate-[-1.5deg] group-hover:border-amber-400/80 transition-all duration-300 ease-out flex flex-col justify-between">
                {/* Book Spine Simulating 3D Depth on Left Edge */}
                <div className="absolute top-0 left-0 bottom-0 w-3.5 bg-gradient-to-r from-black/60 via-black/20 to-transparent z-20 pointer-events-none border-r border-white/10" />

                {/* Subtle Paper Edge on Right */}
                <div className="absolute top-0 right-0 bottom-0 w-1 bg-gradient-to-l from-white/20 to-transparent z-20 pointer-events-none" />

                {/* Cover Image or Procedural Book Cover */}
                {hasCover ? (
                  <div className="relative w-full h-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={book.coverDataUrl}
                      alt={`Portada de ${book.displayTitle}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Dark gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                  </div>
                ) : (
                  <div className="relative w-full h-full p-4 flex flex-col justify-between bg-gradient-to-b from-[#2B231D] to-[#141210]">
                    <div className="flex justify-center pt-3 opacity-80">
                      <LecturamaLogo size={32} />
                    </div>
                    <p className="font-[family-name:var(--font-outfit)] font-bold text-xs sm:text-sm text-zinc-100 line-clamp-3 text-center leading-snug">
                      {book.displayTitle}
                    </p>
                    <div className="h-2" />
                  </div>
                )}

                {/* Status Badges on Top */}
                <div className="absolute top-2 right-2 z-20 flex items-center gap-1">
                  {progress.isCompleted ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-zinc-950 shadow-md border border-amber-300/80 flex items-center gap-1">
                      <span>🏆</span>
                      <span>¡Completado!</span>
                    </span>
                  ) : progress.completedCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white shadow-md">
                      ⚔️ {progress.completedCount}{progress.totalChapters > 0 ? `/${progress.totalChapters}` : ""} Niv.
                    </span>
                  ) : null}

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, book)}
                    className="p-1 rounded-full bg-black/60 hover:bg-red-600 text-zinc-300 hover:text-white backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                    title="Eliminar de la estantería"
                  >
                    <span className="text-[10px] block">🗑️</span>
                  </button>
                </div>

                {/* Bottom Title & Page Info Inside Card Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-3 z-20 text-white space-y-1.5">
                  <p className="font-[family-name:var(--font-outfit)] font-extrabold text-xs leading-tight line-clamp-2 drop-shadow-md text-amber-100 group-hover:text-amber-300 transition-colors">
                    {book.displayTitle}
                  </p>

                  {/* Progress Bar inside Card */}
                  {progress.completedCount > 0 && (
                    <div className="w-full bg-black/60 rounded-full h-1.5 overflow-hidden border border-white/15">
                      <div
                        className="bg-amber-400 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                        style={{ width: `${progress.percent}%` }}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-zinc-300 font-medium pt-0.5">
                    <span>{book.totalPages ? `${book.totalPages} págs.` : "PDF"}</span>
                    <span className="text-amber-400 group-hover:translate-x-0.5 transition-transform font-bold">
                      {progress.percent > 0 ? `${progress.percent}% ➔` : "Abrir ➔"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Outside Caption */}
              <div className="pt-2 px-1 text-center space-y-0.5">
                <p className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 truncate" title={book.displayTitle}>
                  {book.displayTitle}
                </p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  {progress.isCompleted ? (
                    <span className="font-bold text-amber-600 dark:text-amber-400 inline-flex items-center gap-1">
                      <span>🏆</span>
                      <span>¡Completado!</span>
                    </span>
                  ) : progress.completedCount > 0 ? (
                    `${progress.completedCount} de ${progress.totalChapters || progress.completedCount} niveles (${progress.percent}%)`
                  ) : book.lastReadPage && book.lastReadPage > 1 ? (
                    `Página ${book.lastReadPage}`
                  ) : (
                    "Comenzar"
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
