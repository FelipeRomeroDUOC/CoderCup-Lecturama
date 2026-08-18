"use client";

import { Chapter } from "@/types/pdf";
import { isPreliminarySection } from "@/lib/chapterClassifier";

interface ChapterSidebarProps {
  chapters: Chapter[];
  hasOutline: boolean | null;
  isLoading: boolean;
  activeChapterId: string | null;
  onSelectChapter: (chapter: Chapter) => void;
  isOpen: boolean;
  onToggle: () => void;
  isChapterUnlocked?: (chapterId: string, index: number) => boolean;
  isChapterCompleted?: (chapterId: string) => boolean;
}

export default function ChapterSidebar({
  chapters,
  hasOutline,
  isLoading,
  activeChapterId,
  onSelectChapter,
  isOpen,
  onToggle,
  isChapterUnlocked,
  isChapterCompleted,
}: ChapterSidebarProps) {
  const renderChapterList = (items: Chapter[], depth = 0) => {
    return (
      <ul
        className={`space-y-1 ${
          depth > 0
            ? "pl-3 border-l border-zinc-200 dark:border-zinc-800 ml-1.5 mt-1"
            : ""
        }`}
      >
        {items.map((chapter, index) => {
          const isActive = activeChapterId === chapter.id;
          const isPreliminary = isPreliminarySection(chapter.title);
          const isUnlocked = isChapterUnlocked
            ? isChapterUnlocked(chapter.id, index)
            : true;
          const isCompleted = isChapterCompleted
            ? isChapterCompleted(chapter.id)
            : false;

          let icon = "📖";
          if (isPreliminary) {
            icon = "📄";
          } else if (!isUnlocked) {
            icon = "🔒";
          } else if (isCompleted) {
            icon = "✅";
          }

          return (
            <li key={chapter.id}>
              <button
                type="button"
                onClick={() => {
                  if (isUnlocked) {
                    onSelectChapter(chapter);
                  }
                }}
                disabled={!isUnlocked}
                title={
                  isPreliminary
                    ? `${chapter.title} (Sección Introductoria)`
                    : !isUnlocked
                    ? "Capítulo bloqueado. Supera el quiz del nivel actual para desbloquearlo."
                    : isCompleted
                    ? "Capítulo completado (Lectura libre)"
                    : chapter.title
                }
                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all flex items-center justify-between gap-2 ${
                  !isUnlocked
                    ? "opacity-40 cursor-not-allowed bg-zinc-100/50 dark:bg-zinc-900/30 text-zinc-400"
                    : isActive
                    ? "bg-zinc-900 text-white font-semibold shadow-sm dark:bg-zinc-100 dark:text-zinc-900"
                    : isCompleted
                    ? "text-zinc-800 dark:text-zinc-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                    : isPreliminary
                    ? "text-zinc-700 dark:text-zinc-300 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 truncate">
                  <span className="shrink-0 text-xs">{icon}</span>
                  <span className="truncate">{chapter.title}</span>
                </div>

                <span
                  className={`text-xs px-1.5 py-0.5 rounded shrink-0 ${
                    !isUnlocked
                      ? "text-zinc-400 bg-zinc-200/50 dark:bg-zinc-800/50"
                      : isActive
                      ? "bg-zinc-800 text-zinc-300 dark:bg-zinc-200 dark:text-zinc-800"
                      : isCompleted
                      ? "text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300"
                      : isPreliminary
                      ? "text-blue-700 bg-blue-100 dark:bg-blue-950 dark:text-blue-300"
                      : "text-zinc-500 bg-zinc-100 dark:bg-zinc-800"
                  }`}
                >
                  {chapter.startPage === chapter.endPage
                    ? `p. ${chapter.startPage}`
                    : `pp. ${chapter.startPage}-${chapter.endPage}`}
                </span>
              </button>

              {chapter.items &&
                chapter.items.length > 0 &&
                renderChapterList(chapter.items, depth + 1)}
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
          <div>
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
              Niveles y Capítulos
            </h2>
            <p className="text-xs text-zinc-500">
              Supera cada quiz para desbloquear
            </p>
          </div>
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
                Puedes navegar libremente con el scroll continuo.
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
