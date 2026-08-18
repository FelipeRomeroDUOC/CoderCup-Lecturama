"use client";

import { useState } from "react";
import PdfUploader from "@/components/PdfUploader";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

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

        {!selectedFile ? (
          <PdfUploader onFileSelect={handleFileSelect} />
        ) : (
          <div className="p-6 border rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                Archivo cargado
              </p>
              <p className="text-base font-medium text-zinc-900 dark:text-zinc-100 truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-zinc-500">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>

            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={handleRemoveFile}
                className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cambiar archivo
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
