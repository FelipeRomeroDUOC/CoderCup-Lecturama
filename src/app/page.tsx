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
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
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
