"use client";

import { useState } from "react";
import PdfUploader from "@/components/PdfUploader";
import PdfReader from "@/components/PdfReader";

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
