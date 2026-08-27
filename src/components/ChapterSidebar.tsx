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
  isChapterUnlocked?: (chapterId: string, index?: number) => boolean;
  isChapterCompleted?: (chapterId: string) => boolean;
  nonPlayableChapterIds?: string[];
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
  nonPlayableChapterIds = [],
}: ChapterSidebarProps) {
  const isFiller = (chapter: Chapter) => {
    return (
      isPreliminarySection(chapter.title) ||
      nonPlayableChapterIds.includes(chapter.id)
    );
  };

  const renderChapterList = (items: Chapter[], depth = 0) => {
    return (
      <ul
        className={`space-y-1.5 ${
          depth > 0
            ? "pl-3 border-l-2 border-amber-200/60 dark:border-zinc-800 ml-2 mt-1"
            : ""
        }`}
      >
        {items.map((chapter) => {
          const isActive = activeChapterId === chapter.id;
          const isPreliminary = isFiller(chapter);
          const hasSubItems = Boolean(chapter.items && chapter.items.length > 0);

          // For container chapters, check if any sub-item is unlocked
          const isUnlocked = isChapterUnlocked
            ? isChapterUnlocked(chapter.id) ||
              (hasSubItems && chapter.items!.some((sub) => isChapterUnlocked(sub.id)))
            : true;

          // For container chapters, check if all sub-items are completed
          const isCompleted = isChapterCompleted
            ? isChapterCompleted(chapter.id) ||
              (hasSubItems && chapter.items!.every((sub) => isChapterCompleted(sub.id)))
            : false;

          let icon = "📖";
          if (isPreliminary) {
            icon = "📄";
          } else if (!isUnlocked) {
            icon = "🔒";
          } else if (isCompleted) {
            icon = "✅";
          } else if (hasSubItems) {
            icon = "📚";
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
                    ? `${chapter.title} (Sección Informativa / Lectura Libre)`
                    : !isUnlocked
                    ? "Capítulo bloqueado. Supera el quiz del nivel actual para desbloquearlo."
                    : isCompleted
                    ? "Capítulo completado con honores (Lectura libre)"
                    : chapter.title
                }
                className={`w-full text-left px-3 py-2.5 text-xs sm:text-sm rounded-xl transition-all duration-200 flex items-center justify-between gap-2 select-none ${
                  !isUnlocked
                    ? "opacity-40 cursor-not-allowed bg-zinc-100/40 dark:bg-zinc-900/20 text-zinc-400 dark:text-zinc-600 pointer-events-auto"
                    : isActive
                    ? "bg-amber-100/90 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 font-bold border-l-4 border-amber-500 shadow-xs"
                    : isCompleted
                    ? "text-zinc-800 dark:text-zinc-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-900 dark:hover:text-emerald-300 cursor-pointer"
                    : isPreliminary
                    ? "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 cursor-pointer"
                    : "text-zinc-700 dark:text-zinc-300 hover:bg-amber-50/70 dark:hover:bg-zinc-800/60 cursor-pointer"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 truncate">
                  <span className="shrink-0 text-sm">{icon}</span>
                  <span className="truncate">{chapter.title}</span>
                </div>

                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                    !isUnlocked
                      ? "text-zinc-400 bg-zinc-200/40 dark:bg-zinc-800/40"
                      : isActive
                      ? "bg-amber-200/80 text-amber-900 dark:bg-amber-900/80 dark:text-amber-200"
                      : isCompleted
                      ? "text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300"
                      : isPreliminary
                      ? "text-zinc-500 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400"
                      : "text-zinc-600 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  p. {chapter.startPage}
                  {chapter.partIndex ? ` (${chapter.partIndex}/${chapter.totalParts || 2})` : ""}
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
    <aside
      className={`fixed md:static inset-y-0 left-0 z-30 w-72 sm:w-80 bg-[#FAF8F5] dark:bg-[#141210] border-r border-zinc-200 dark:border-amber-500/15 flex flex-col transition-all duration-300 ease-in-out shadow-lg md:shadow-none ${
        isOpen
          ? "translate-x-0 opacity-100"
          : "-translate-x-full md:w-0 md:opacity-0 overflow-hidden pointer-events-none"
      }`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200/80 dark:border-amber-500/15 bg-white/70 dark:bg-[#1A1816]/90 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="text-base">📜</span>
          <h2 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 font-[family-name:var(--font-outfit)]">
            Índice de Capítulos
          </h2>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Cerrar barra lateral"
        >
          ✕
        </button>
      </div>

      {/* Chapters list */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-1">
        {isLoading ? (
          <div className="p-6 text-center text-sm text-zinc-500 space-y-3">
            <div className="w-6 h-6 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="font-medium text-xs">Descifrando índice del tomo...</p>
          </div>
        ) : hasOutline === false ? (
          <div className="p-6 text-xs text-zinc-500 text-center space-y-2">
            <p>Este PDF no contiene una tabla de contenidos embebida.</p>
          </div>
        ) : chapters.length === 0 ? (
          <div className="p-6 text-xs text-zinc-500 text-center space-y-2">
            <p>No se encontraron capítulos en el documento.</p>
          </div>
        ) : (
          renderChapterList(chapters)
        )}
      </div>
    </aside>
  );
}
