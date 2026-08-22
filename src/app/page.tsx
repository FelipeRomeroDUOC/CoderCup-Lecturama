"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import PdfUploader from "@/components/PdfUploader";

const PdfReader = dynamic(() => import("@/components/PdfReader"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center p-12">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-8 h-8 border-4 border-zinc-400 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin" />
        <p className="text-sm text-zinc-500">Cargando visor...</p>
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
    <main className="relative flex min-h-screen flex-col items-center justify-center p-6 text-center">
      {/* Top Navbar / GitHub Link */}
      <header className="absolute top-6 right-6 z-10">
        <a
          href="https://github.com/FelipeRomeroDUOC/CoderCup-Lecturama"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer group"
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
      </header>

      <div className="w-full max-w-2xl space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight font-[family-name:var(--font-outfit)] text-zinc-900 dark:text-zinc-100">
            LECTURAMA
          </h1>
          <p className="text-2xl sm:text-3xl font-[family-name:var(--font-patrick-hand)] text-zinc-600 dark:text-zinc-300 max-w-lg mx-auto leading-relaxed">
            La plataforma que convierte la lectura en aprendizaje entretenido, donde cada libro esconde un reto.
          </p>
        </div>

        <PdfUploader onFileSelect={handleFileSelect} />
      </div>
    </main>
  );
}
