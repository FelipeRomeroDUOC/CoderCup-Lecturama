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
      <div className="w-full max-w-xl space-y-8">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">
            ¿Quién Quiere Ser Lector?
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Herramienta para leer libros con elementos de gamificación
          </p>
        </div>

        <PdfUploader onFileSelect={handleFileSelect} />
      </div>
    </main>
  );
}
