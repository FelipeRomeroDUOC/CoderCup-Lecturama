"use client";

import { Chapter } from "@/types/pdf";

interface ChapterSidebarProps {
  chapters: Chapter[];
  hasOutline: boolean | null;
  isLoading: boolean;
  currentPage: number;
  onSelectChapter: (pageNumber: number) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function ChapterSidebar({
  chapters,
  hasOutline,
  isLoading,
  currentPage,
  onSelectChapter,
  isOpen,
  onToggle,
}: ChapterSidebarProps) {
  // Helper to determine if a chapter is active (current page is at or past this chapter's start)
  const isChapterActive = (chapter: Chapter, index: number, allChapters: Chapter[]): boolean => {
    const nextChapter = allChapters[index + 1];
    if (nextChapter) {
      return currentPage >= chapter.pageNumber && currentPage < nextChapter.pageNumber;
    }
    return currentPage >= chapter.pageNumber;
  };

  const renderChapterList = (items: Chapter[], depth = 0) => {
    return (
      <ul className={`space-y-1 ${depth > 0 ? "pl-3 border-l border-zinc-200 dark:border-zinc-800 ml-1.5 mt-1" : ""}`}>
        {items.map((chapter, idx) => {
          const active = depth === 0 ? isChapterActive(chapter, idx, items) : currentPage === chapter.pageNumber;

          return (
            <li key={chapter.id}>
              <button
                type="button"
                onClick={() => onSelectChapter(chapter.pageNumber)}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between gap-2 ${
                  active
                    ? "bg-zinc-900 text-white font-semibold dark:bg-zinc-100 dark:text-zinc-900"
                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                }`}
              >
                <span className="truncate">{chapter.title}</span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded ${
                    active
                      ? "bg-zinc-800 text-zinc-300 dark:bg-zinc-200 dark:text-zinc-800"
                      : "text-zinc-500 bg-zinc-100 dark:bg-zinc-800"
                  }`}
                >
                  p. {chapter.pageNumber}
                </span>
              </button>

              {chapter.items && chapter.items.length > 0 && renderChapterList(chapter.items, depth + 1)}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-72 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:hidden"
        }`}
      >
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
            Capítulos
          </h2>
          <button
            type="button"
            onClick={onToggle}
            className="p-1 rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 lg:hidden"
            aria-label="Cerrar menú de capítulos"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {isLoading ? (
            <div className="py-8 text-center text-sm text-zinc-500">
              Cargando tabla de contenidos...
            </div>
          ) : hasOutline === false || chapters.length === 0 ? (
            <div className="p-4 text-center space-y-2 text-zinc-500 text-sm">
              <p>Este PDF no contiene una tabla de contenidos / capítulos embebida.</p>
              <p className="text-xs text-zinc-400">
                Puedes navegar entre las páginas usando los controles de lectura.
              </p>
            </div>
          ) : (
            renderChapterList(chapters)
          )}
        </div>
      </aside>
    </>
  );
}
