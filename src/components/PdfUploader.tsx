"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";

interface PdfUploaderProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export default function PdfUploader({
  onFileSelect,
  disabled = false,
}: PdfUploaderProps) {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSelectFile = (file: File) => {
    setErrorMessage(null);
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setErrorMessage("Por favor selecciona un archivo PDF válido.");
      return;
    }

    onFileSelect(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndSelectFile(files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndSelectFile(files[0]);
    }
    // Reset input value so the same file can be re-selected if desired
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      {/* Lectern Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            triggerFileInput();
          }
        }}
        className={`group relative flex flex-col items-center justify-center p-8 sm:p-10 border-2 rounded-3xl cursor-pointer transition-all duration-300 text-center overflow-hidden ${
          isDragging
            ? "border-amber-500 bg-amber-50/80 dark:bg-amber-950/30 scale-[1.02] shadow-xl ring-4 ring-amber-500/20"
            : "border-dashed border-amber-300/70 hover:border-amber-500/90 bg-white/70 hover:bg-white dark:bg-zinc-900/60 dark:hover:bg-zinc-900 shadow-sm hover:shadow-lg dark:border-zinc-700/80"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {/* Subtle Ambient Background Light */}
        <div
          className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-400/10 dark:bg-amber-400/5 rounded-full blur-2xl pointer-events-none transition-opacity duration-300 group-hover:opacity-100"
          aria-hidden="true"
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          onChange={handleFileInputChange}
          disabled={disabled}
          className="hidden"
          aria-label="Seleccionar archivo PDF"
        />

        {/* Animated Book / Upload Icon */}
        <div className="relative mb-5 flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 flex items-center justify-center text-amber-700 dark:text-amber-300 shadow-inner group-hover:scale-110 group-hover:rotate-2 transition-transform duration-300">
            <svg
              className="w-8 h-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
              <path d="M6 6h10" />
              <path d="M6 10h10" />
              <path d="M12 14v4" />
              <path d="m9 16 3-3 3 3" />
            </svg>
          </div>
        </div>

        <div className="space-y-1.5 z-10">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
            {isDragging
              ? "¡Suelta tu libro aquí!"
              : "Coloca tu libro en el atril de lectura"}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
            Arrastra tu archivo PDF o haz clic para explorar en tus documentos
          </p>
        </div>

        {/* Button */}
        <div className="mt-6 z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              triggerFileInput();
            }}
            disabled={disabled}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 hover:bg-amber-600 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-amber-400 dark:hover:text-zinc-950 text-sm font-bold shadow-md hover:shadow-amber-600/20 transition-all duration-200 cursor-pointer"
          >
            <span>📖</span>
            <span>Explorar Libro (PDF)</span>
          </button>
        </div>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div
          role="alert"
          className="p-3 text-sm text-rose-700 bg-rose-50 rounded-xl border border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900 text-center animate-in fade-in"
        >
          {errorMessage}
        </div>
      )}
    </div>
  );
}
