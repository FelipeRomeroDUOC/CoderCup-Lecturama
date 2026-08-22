"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import LecturamaLogo from "@/components/LecturamaLogo";
import PdfUploader from "@/components/PdfUploader";
import LibraryFloatingBackground from "@/components/LibraryFloatingBackground";
import { saveStoredBook, parseFilenameTitleAndAuthor } from "@/lib/bookStorage";

const BookLibraryShelf = dynamic(() => import("@/components/BookLibraryShelf"), {
  ssr: false,
});

const PdfReader = dynamic(() => import("@/components/PdfReader"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center p-12 bg-[#FAF6F0] dark:bg-[#0E0D0C]">
      <div className="flex flex-col items-center space-y-4">
        <LecturamaLogo size={56} />
        <div className="w-9 h-9 border-3 border-[#D97706] border-t-transparent rounded-full animate-spin" />
        <p className="text-base font-bold text-zinc-700 dark:text-zinc-300 font-[family-name:var(--font-outfit)]">
          Preparando tu manuscrito en la biblioteca...
        </p>
      </div>
    </div>
  ),
});

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);

    // Auto-save initial book entry to IndexedDB
    const parsed = parseFilenameTitleAndAuthor(file.name);
    saveStoredBook({
      id: file.name,
      fileName: file.name,
      displayTitle: parsed.title,
      author: parsed.author,
      fileBlob: file,
      fileSize: file.size,
      totalPages: 1,
      lastReadPage: 1,
      lastReadAt: Date.now(),
      createdAt: Date.now(),
    });
  };

  const handleCloseReader = () => {
    setSelectedFile(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  if (selectedFile) {
    return <PdfReader file={selectedFile} onClose={handleCloseReader} />;
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] dark:bg-[#0E0D0C] text-zinc-900 dark:text-zinc-100 selection:bg-[#D97706] selection:text-white flex flex-col font-sans transition-colors duration-200 relative overflow-x-hidden">
      {/* Animated Zero-Gravity Literary Background */}
      <LibraryFloatingBackground />

      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 bg-[#FAF6F0]/80 dark:bg-[#0E0D0C]/80 backdrop-blur-md border-b border-[#D97706]/15 dark:border-zinc-800/80 shadow-[0_2px_15px_rgba(217,119,6,0.06)]">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-6xl mx-auto">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <LecturamaLogo size={34} withGlow={false} />
            <span className="font-[family-name:var(--font-outfit)] text-xl font-black tracking-wider text-[#D97706] dark:text-[#F59E0B] drop-shadow-2xs">
              LECTURAMA
            </span>
          </div>

          {/* Action Links */}
          <div className="flex items-center gap-3">
            <Link
              href="/changelog"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-white/90 hover:bg-white dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-[#D97706]/20 dark:border-zinc-700 shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer"
              title="Ver historial de cambios"
            >
              <span>📜</span>
              <span>Changelog</span>
            </Link>

            <a
              href="https://github.com/FelipeRomeroDUOC/CoderCup-Lecturama"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-zinc-900 hover:bg-[#D97706] text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-[#F59E0B] shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer group"
              title="Ver repositorio en GitHub"
            >
              <svg
                className="w-4 h-4 fill-current transition-transform duration-200 group-hover:scale-110"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Main Canvas */}
      <main className="flex-1 flex flex-col items-center justify-start pt-10 pb-20 px-4 w-full max-w-6xl mx-auto space-y-20">
        {/* Hero Section */}
        <section className="w-full flex flex-col items-center text-center relative">
          {/* Glowing Brand Monogram */}
          <div className="mb-6 relative flex items-center justify-center">
            <div
              className="absolute -inset-4 rounded-full bg-[#D97706]/20 dark:bg-[#D97706]/15 blur-2xl pointer-events-none"
              aria-hidden="true"
            />
            <div className="relative p-4 rounded-3xl bg-white/70 dark:bg-zinc-900/70 border border-[#D97706]/30 shadow-[0_0_35px_rgba(217,119,6,0.25)] backdrop-blur-sm">
              <LecturamaLogo size={72} />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800/80 shadow-xs mb-4">
            <span>📖 Comprensión Lectora Potenciada por IA</span>
          </div>

          <h1 className="font-[family-name:var(--font-outfit)] font-black text-4xl sm:text-6xl md:text-7xl text-zinc-900 dark:text-zinc-100 mb-4 tracking-tight drop-shadow-xs max-w-4xl">
            Aprende más leyendo. <span className="text-[#D97706] dark:text-[#F59E0B]">Juega mientras descubres.</span>
          </h1>

          <p className="font-[family-name:var(--font-patrick-hand)] text-2xl sm:text-3xl text-zinc-700 dark:text-zinc-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            La plataforma que convierte cada capítulo en un reto interactivo, ayudándote a conectar ideas, retener detalles y disfrutar la lectura a fondo.
          </p>

          {/* Stitch-Designed Book Lectern Dropzone */}
          <PdfUploader onFileSelect={handleFileSelect} />

          {/* Persistent Book Library Shelf */}
          <BookLibraryShelf
            onSelectBook={handleFileSelect}
            refreshTrigger={refreshTrigger}
          />
        </section>

        {/* Features Bento Grid */}
        <section className="w-full">
          <div className="text-center mb-10 space-y-2">
            <h2 className="font-[family-name:var(--font-outfit)] font-extrabold text-2xl sm:text-3xl text-zinc-900 dark:text-zinc-100">
              Conquista Cada Capítulo como un Nivel
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
              Diseñado para estimular la comprensión activa y el enfoque lector prolongado.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Gamified Chapters */}
            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-3xl p-7 border border-[#D97706]/20 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-[#D97706]/50 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/40 dark:bg-amber-500/10 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 space-y-3">
                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/60 rounded-2xl flex items-center justify-center border border-amber-200 dark:border-amber-800 text-2xl">
                  📖
                </div>
                <h3 className="font-[family-name:var(--font-outfit)] font-bold text-lg text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <span>Capítulos Gamificados</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold">
                    Niveles 🔒
                  </span>
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Avanza paso a paso en tu libro. Cada capítulo es un nivel que se desbloquea únicamente al responder con éxito las preguntas del capítulo anterior.
                </p>
              </div>
            </div>

            {/* Card 2: AI Quizzes with 4 Lives */}
            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-3xl p-7 border border-[#D97706]/30 dark:border-zinc-800 shadow-md hover:shadow-2xl hover:border-[#D97706] transition-all duration-300 relative overflow-hidden group md:-translate-y-2">
              <div className="absolute top-0 right-0 w-36 h-36 bg-amber-300/40 dark:bg-amber-500/15 rounded-full blur-3xl opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 space-y-3">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950 rounded-2xl flex items-center justify-center border border-amber-300 dark:border-amber-700 text-2xl">
                  🧠
                </div>
                <h3 className="font-[family-name:var(--font-outfit)] font-extrabold text-lg text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <span>8 Preguntas & 4 Vidas</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-semibold">
                    ❤️ x4
                  </span>
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Desafíos formulados al instante por IA con distractores verosímiles de alta calibración psicométrica y dificultad adaptada a tu edad.
                </p>
              </div>
            </div>

            {/* Card 3: Focus & Attention Training */}
            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-3xl p-7 border border-[#D97706]/20 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-[#D97706]/50 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/40 dark:bg-amber-500/10 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 space-y-3">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl flex items-center justify-center border border-indigo-200 dark:border-indigo-800 text-2xl">
                  💡
                </div>
                <h3 className="font-[family-name:var(--font-outfit)] font-bold text-lg text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <span>Tips de Enfoque y Foco</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-semibold">
                    Metacognición
                  </span>
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Recibe diagnósticos formativos y consejos prácticos de concentración lectora graduados según tu desempeño para evitar el piloto automático.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats & Gamification Banner */}
        <section className="w-full bg-zinc-900 text-zinc-100 rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-2xl border border-zinc-800">
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#D97706 1.5px, transparent 1.5px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D97706] to-transparent" />

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-zinc-800">
            <div className="flex flex-col items-center pt-4 sm:pt-0">
              <span className="font-[family-name:var(--font-outfit)] font-black text-3xl sm:text-4xl text-[#F59E0B] mb-1 drop-shadow-sm">
                100% On-Demand
              </span>
              <span className="text-xs uppercase tracking-widest text-zinc-400 font-bold">
                Generación IA bajo demanda
              </span>
            </div>

            <div className="flex flex-col items-center pt-4 sm:pt-0">
              <span className="font-[family-name:var(--font-outfit)] font-black text-3xl sm:text-4xl text-[#F59E0B] mb-1 drop-shadow-sm">
                8 Preguntas & 4 Vidas
              </span>
              <span className="text-xs uppercase tracking-widest text-zinc-400 font-bold">
                Calibración psicométrica
              </span>
            </div>

            <div className="flex flex-col items-center pt-4 sm:pt-0">
              <span className="font-[family-name:var(--font-outfit)] font-black text-3xl sm:text-4xl text-[#F59E0B] mb-1 drop-shadow-sm">
                0 Registros
              </span>
              <span className="text-xs uppercase tracking-widest text-zinc-400 font-bold">
                Progreso local instantáneo
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white/60 dark:bg-zinc-900/60 border-t border-[#D97706]/15 dark:border-zinc-800 w-full py-8 px-6 text-center mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-2 font-bold text-[#D97706]">
            <LecturamaLogo size={22} withGlow={false} />
            <span>LECTURAMA</span>
          </div>
          <p>© {new Date().getFullYear()} Lecturama &bull; Desarrollado para la CoderCup</p>
        </div>
      </footer>
    </div>
  );
}
