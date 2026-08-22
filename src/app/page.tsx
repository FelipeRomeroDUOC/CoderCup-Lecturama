"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import LecturamaLogo from "@/components/LecturamaLogo";
import PdfUploader from "@/components/PdfUploader";

const PdfReader = dynamic(() => import("@/components/PdfReader"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center p-12 bg-[#FAF8F5] dark:bg-zinc-950">
      <div className="flex flex-col items-center space-y-4">
        <LecturamaLogo size={48} />
        <div className="w-8 h-8 border-3 border-amber-400 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin" />
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 font-[family-name:var(--font-outfit)]">
          Preparando tu libro en la biblioteca...
        </p>
      </div>
    </div>
  ),
});

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleCloseReader = () => {
    setSelectedFile(null);
  };

  if (selectedFile) {
    return <PdfReader file={selectedFile} onClose={handleCloseReader} />;
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-6 text-center bg-[#FAF8F5] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-amber-500 selection:text-white transition-colors duration-200">
      {/* Ambient Warm Atmosphere Glows */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-400/10 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Top Navbar */}
      <header className="absolute top-6 left-6 right-6 z-10 flex items-center justify-between">
        {/* Brand Link */}
        <div className="flex items-center gap-2">
          <LecturamaLogo size={32} withGlow={false} />
          <span className="text-sm font-extrabold tracking-wider text-zinc-800 dark:text-zinc-200 font-[family-name:var(--font-outfit)]">
            LECTURAMA
          </span>
        </div>

        {/* Action Links */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/changelog"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-white/80 hover:bg-white dark:bg-zinc-900/80 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer"
            title="Ver historial de versiones"
          >
            <span>📜</span>
            <span>Changelog</span>
          </Link>

          <a
            href="https://github.com/FelipeRomeroDUOC/CoderCup-Lecturama"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-white/80 hover:bg-white dark:bg-zinc-900/80 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer group"
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
      </header>

      {/* Hero Body */}
      <div className="w-full max-w-2xl space-y-8 pt-12 pb-6 z-10">
        <div className="space-y-4 flex flex-col items-center">
          {/* Main Brand Isotype */}
          <LecturamaLogo size={76} />

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 shadow-xs">
            <span>✨ Biblioteca Interactiva & Gamificada</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight font-[family-name:var(--font-outfit)] text-zinc-900 dark:text-zinc-100">
            LECTURAMA
          </h1>

          <p className="text-2xl sm:text-3xl font-[family-name:var(--font-patrick-hand)] text-zinc-600 dark:text-zinc-300 max-w-lg mx-auto leading-relaxed">
            La plataforma que convierte la lectura en aprendizaje entretenido, donde cada libro esconde un reto.
          </p>
        </div>

        {/* Book Uploader Lectern */}
        <PdfUploader onFileSelect={handleFileSelect} />
      </div>
    </main>
  );
}
