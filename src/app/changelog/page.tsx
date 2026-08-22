import Link from "next/link";
import { getParsedChangelog, ChangelogCategory } from "@/lib/changelogParser";

export const metadata = {
  title: "Historial de Versiones y Cambios | Lecturama",
  description:
    "Registro cronológico oficial en español de todas las versiones, funciones añadidas y mejoras de Lecturama.",
};

export const dynamic = "force-dynamic";

function getCategoryBadge(type: ChangelogCategory["type"]) {
  switch (type) {
    case "added":
      return {
        label: "✨ Añadido",
        badgeClass:
          "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
        bulletClass: "bg-emerald-500",
      };
    case "fixed":
      return {
        label: "🛡️ Corregido",
        badgeClass:
          "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800",
        bulletClass: "bg-rose-500",
      };
    case "changed":
      return {
        label: "🎨 Mejorado",
        badgeClass:
          "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
        bulletClass: "bg-blue-500",
      };
    default:
      return {
        label: "🔧 Cambio",
        badgeClass:
          "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700",
        bulletClass: "bg-zinc-500",
      };
  }
}

function renderFormattedLine(cleanLine: string) {
  // Split by markdown bold (**text**) and code (`code`)
  const parts = cleanLine.split(/(\*\*.*?\*\*|`.*?`)/g);

  return (
    <>
      {parts.map((part, pIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong
              key={pIdx}
              className="font-bold text-zinc-900 dark:text-zinc-100"
            >
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={pIdx}
              className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-amber-600 dark:text-amber-300 font-mono text-xs border border-zinc-200/50 dark:border-zinc-700/50"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return part;
      })}
    </>
  );
}

function renderItemBlock(rawText: string, bulletClass: string) {
  const lines = rawText.split("\n");

  return (
    <div className="space-y-1.5">
      {lines.map((line, idx) => {
        const isSubItem = line.trim().startsWith("-");
        const cleanLine = line.replace(/^\s*-\s*/, "").trim();

        if (isSubItem) {
          return (
            <div
              key={idx}
              className="flex items-start gap-2 pl-4 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed"
            >
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400/80 shrink-0" />
              <span>{renderFormattedLine(cleanLine)}</span>
            </div>
          );
        }

        return (
          <div
            key={idx}
            className="flex items-start gap-2.5 text-sm sm:text-base text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium"
          >
            <span
              className={`mt-2 w-2 h-2 rounded-full ${bulletClass} shrink-0`}
            />
            <span>{renderFormattedLine(cleanLine)}</span>
          </div>
        );
      })}
    </div>
  );
}

export default async function ChangelogPage() {
  const releases = await getParsedChangelog();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-amber-500 selection:text-white">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-30 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors group cursor-pointer"
          >
            <span className="transition-transform duration-200 group-hover:-translate-x-1">
              ←
            </span>
            <span>Volver a Lecturama</span>
          </Link>

          <a
            href="https://github.com/FelipeRomeroDUOC/CoderCup-Lecturama"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 transition-all cursor-pointer"
          >
            <span>Ver Repositorio</span>
            <span>↗</span>
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-12 space-y-10">
        {/* Title Section */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80">
            <span>📜 Historial Oficial de Versiones</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-[family-name:var(--font-outfit)]">
            Registro de Cambios y Versiones
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
            Historial de lanzamientos, nuevas funciones y correcciones implementadas en{" "}
            <strong className="font-semibold text-zinc-800 dark:text-zinc-200">
              LECTURAMA
            </strong>
            , redactado en español claro y estructurado por cada versión oficial.
          </p>
        </div>

        {/* Timeline of Releases */}
        <div className="relative border-l-2 border-zinc-200 dark:border-zinc-800 ml-4 space-y-10 py-2">
          {releases.map((release, idx) => {
            const isLatest = idx === 0;

            return (
              <div key={release.version || idx} className="relative pl-7 group">
                {/* Timeline Node Dot */}
                <div
                  className={`absolute -left-[9px] top-2 w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                    isLatest
                      ? "bg-amber-500 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.6)] scale-110"
                      : "bg-white dark:bg-zinc-900 border-zinc-400 dark:border-zinc-600 group-hover:border-amber-400"
                  }`}
                />

                {/* Release Card */}
                <div
                  className={`p-6 sm:p-7 rounded-2xl bg-white dark:bg-zinc-900/90 border transition-all duration-200 space-y-6 ${
                    isLatest
                      ? "border-amber-500/40 shadow-lg shadow-amber-500/5 dark:shadow-amber-500/10"
                      : "border-zinc-200/80 dark:border-zinc-800/80 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  {/* Release Header: Version Tag + Date + Latest Tag */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800/60">
                    <div className="flex items-center gap-3">
                      <span className="text-xl sm:text-2xl font-extrabold font-[family-name:var(--font-outfit)] text-zinc-900 dark:text-zinc-50">
                        v{release.version}
                      </span>
                      {isLatest && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400/20 text-amber-600 dark:text-amber-300 border border-amber-400/40">
                          Última Versión
                        </span>
                      )}
                    </div>

                    {release.date && (
                      <time className="text-xs font-medium text-zinc-500 dark:text-zinc-400 font-mono">
                        📅 {release.date}
                      </time>
                    )}
                  </div>

                  {/* Release Summary */}
                  {release.summary && (
                    <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed italic bg-zinc-50 dark:bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800/60">
                      &ldquo;{release.summary}&rdquo;
                    </p>
                  )}

                  {/* Categories */}
                  <div className="space-y-6">
                    {release.categories.map((cat, cIdx) => {
                      const badge = getCategoryBadge(cat.type);

                      return (
                        <div key={cIdx} className="space-y-3">
                          {/* Category Badge Title */}
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${badge.badgeClass}`}
                            >
                              {cat.title}
                            </span>
                          </div>

                          {/* Category Items */}
                          <div className="space-y-4 pl-1">
                            {cat.items.map((item, iIdx) => (
                              <div key={iIdx}>
                                {renderItemBlock(item, badge.bulletClass)}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="text-center pt-8 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
          <p>
            Lecturama &copy; {new Date().getFullYear()} &bull; CoderCup
          </p>
          <p>
            Historial mantenido y estructurado conforme al estándar Keep a Changelog.
          </p>
        </div>
      </main>
    </div>
  );
}
