import Link from "next/link";
import { getGitHubMainCommits, GitHubCommitItem } from "@/lib/github";

export const metadata = {
  title: "Historial de Cambios (Changelog) | Lecturama",
  description:
    "Registro cronológico y en tiempo real de los cambios y versiones liberadas en la rama main de Lecturama.",
};

export const dynamic = "force-dynamic";

function getTypeBadge(type: GitHubCommitItem["type"]) {
  switch (type) {
    case "feat":
      return {
        label: "✨ Nueva Función",
        classes:
          "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
      };
    case "fix":
      return {
        label: "🐛 Corrección",
        classes:
          "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800",
      };
    case "chore":
      return {
        label: "📦 Release / Mantenimiento",
        classes:
          "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
      };
    case "refactor":
      return {
        label: "♻️ Refactorización",
        classes:
          "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
      };
    case "perf":
      return {
        label: "⚡ Rendimiento",
        classes:
          "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800",
      };
    case "docs":
      return {
        label: "📝 Documentación",
        classes:
          "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
      };
    default:
      return {
        label: "🔧 Cambio",
        classes:
          "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700",
      };
  }
}

export default async function ChangelogPage() {
  const commits = await getGitHubMainCommits();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-amber-500 selection:text-white">
      {/* Top Header */}
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
            href="https://github.com/FelipeRomeroDUOC/CoderCup-Lecturama/commits/main"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 transition-all cursor-pointer"
          >
            <span>Ver en GitHub</span>
            <span>↗</span>
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-12 space-y-10">
        {/* Title Section */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80">
            <span>📜 Historial Oficial</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-[family-name:var(--font-outfit)]">
            Registro de Cambios y Versiones
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
            Historial de actualizaciones y mejoras desplegadas en la rama{" "}
            <span className="font-mono font-semibold px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
              main
            </span>
            , sincronizado en tiempo real con el repositorio de GitHub.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative border-l-2 border-zinc-200 dark:border-zinc-800 ml-4 space-y-8 py-2">
          {commits.map((commit, idx) => {
            const badge = getTypeBadge(commit.type);

            return (
              <div key={commit.sha || idx} className="relative pl-7 group">
                {/* Timeline Dot */}
                <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white dark:bg-zinc-900 border-2 border-amber-500 shadow-xs group-hover:scale-125 group-hover:bg-amber-500 transition-all duration-200" />

                {/* Commit Card */}
                <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 space-y-3">
                  {/* Card Header: Type Badge + Date + Hash */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.classes}`}
                    >
                      {badge.label}
                    </span>

                    <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                      <time dateTime={commit.date}>{commit.formattedDate}</time>
                      <a
                        href={commit.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
                        title="Ver commit en GitHub"
                      >
                        {commit.shortSha} ↗
                      </a>
                    </div>
                  </div>

                  {/* Message */}
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                    {commit.message}
                  </h3>

                  {commit.description && (
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 whitespace-pre-line leading-relaxed font-mono bg-zinc-50 dark:bg-zinc-950/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
                      {commit.description}
                    </p>
                  )}

                  {/* Author Footer */}
                  <div className="flex items-center gap-2 pt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {commit.authorAvatar && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={commit.authorAvatar}
                        alt={commit.authorName}
                        className="w-4 h-4 rounded-full"
                      />
                    )}
                    <span>Por <strong className="font-medium text-zinc-700 dark:text-zinc-300">{commit.authorName}</strong></span>
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
            Los cambios se actualizan automáticamente cada vez que se realiza un merge a la rama main.
          </p>
        </div>
      </main>
    </div>
  );
}
