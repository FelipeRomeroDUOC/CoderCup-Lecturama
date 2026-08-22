"use client";

import LecturamaLogo from "@/components/LecturamaLogo";

interface BookCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChooseNewBook: () => void;
  bookTitle: string;
  totalChapters: number;
}

export default function BookCompletionModal({
  isOpen,
  onClose,
  onChooseNewBook,
  bookTitle,
  totalChapters,
}: BookCompletionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-[#FAF8F5] dark:bg-[#161412] rounded-3xl shadow-2xl border border-amber-300/80 dark:border-amber-500/30 overflow-hidden flex flex-col relative text-center p-6 sm:p-8 animate-in zoom-in-95 duration-200">
        {/* Ambient Warm Golden Halos */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-400/20 dark:bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/15 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Content Container */}
        <div className="relative z-10 space-y-6">
          {/* Top Badge & Logo */}
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-amber-300/60 dark:border-amber-500/20 shadow-md">
              <LecturamaLogo size={44} />
            </div>

            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800/80 shadow-xs">
              <span>🏆 Maestría Lectora Alcanzada</span>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h2 className="font-[family-name:var(--font-outfit)] font-black text-2xl sm:text-3xl text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
              ¡Libro Conquistado con Éxito!
            </h2>
            <p className="font-[family-name:var(--font-patrick-hand)] text-xl sm:text-2xl text-amber-700 dark:text-amber-400">
              Has llegado a la última página superando cada reto.
            </p>
          </div>

          {/* Pedagogical Recognition Card */}
          <div className="p-5 rounded-2xl bg-white/90 dark:bg-[#1F1C19]/90 border border-amber-200/80 dark:border-amber-500/20 text-left space-y-3 shadow-xs">
            <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
              No solo leíste este libro: lo conquistaste con <strong>atención activa</strong>, conectando ideas y reflexionando en cada capítulo. Tu perseverancia y curiosidad han demostrado que leer es una aventura que vale la pena vivir a fondo. <strong>Cada nuevo libro es un mundo por descubrir: anímate a subir otra obra y mantén encendida tu pasión lectora.</strong>
            </p>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              <span className="truncate max-w-[200px]" title={bookTitle}>
                📖 {bookTitle}
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                ✨ {totalChapters} {totalChapters === 1 ? "nivel dominado" : "niveles dominados"}
              </span>
            </div>
          </div>

          {/* Action Buttons: Choose New Book vs Keep Exploring */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={onChooseNewBook}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-zinc-900 hover:bg-amber-600 text-white dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-amber-400 font-extrabold text-sm sm:text-base shadow-xl hover:shadow-amber-500/20 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span>📚</span>
              <span>Elegir un Nuevo Libro</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
            >
              Repasar este Libro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
