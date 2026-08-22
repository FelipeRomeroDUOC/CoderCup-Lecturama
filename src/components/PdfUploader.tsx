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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      {/* Stitch-Designed Interactive Book Lectern Dropzone */}
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
        className={`group relative w-full p-10 sm:p-14 rounded-3xl border-2 border-dashed shadow-2xl flex flex-col items-center justify-center text-center overflow-hidden cursor-pointer transition-all duration-500 select-none ${
          isDragging
            ? "border-[#D97706] bg-gradient-to-br from-[#FFF7ED] to-[#FEF3C7] dark:from-zinc-900 dark:to-amber-950/40 scale-[1.02] shadow-[0_0_35px_rgba(217,119,6,0.35)]"
            : "border-[#D97706]/40 hover:border-[#D97706] bg-gradient-to-br from-[#FFFBF5] to-[#F5EAD4] dark:from-zinc-900/90 dark:to-zinc-950/90 hover:shadow-[0_0_30px_rgba(217,119,6,0.25)]"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {/* Ambient Decorative Lighting */}
        <div className="absolute -left-12 -top-12 w-40 h-40 bg-[#D97706]/10 dark:bg-[#D97706]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-12 -bottom-12 w-52 h-52 bg-[#D97706]/15 dark:bg-[#D97706]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-[#D97706]/10 to-transparent pointer-events-none" />

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          onChange={handleFileInputChange}
          disabled={disabled}
          className="hidden"
          aria-label="Seleccionar archivo PDF"
        />

        {/* Tactile Manuscript / Upload Icon */}
        <div className="relative z-10 mb-5">
          <div className="w-20 h-20 rounded-3xl bg-white/90 dark:bg-zinc-800/90 border border-[#D97706]/30 flex items-center justify-center text-[#D97706] shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
            <svg
              className="w-10 h-10 drop-shadow-sm"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
              <path d="M6 6h10" />
              <path d="M6 10h10" />
              <path d="M12 14v5" />
              <path d="m9.5 16.5 2.5-2.5 2.5 2.5" />
            </svg>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-2 relative z-10 max-w-md">
          <h2 className="font-[family-name:var(--font-outfit)] font-black text-2xl sm:text-3xl text-zinc-900 dark:text-zinc-100 tracking-tight group-hover:text-[#D97706] dark:group-hover:text-[#F59E0B] transition-colors">
            {isDragging
              ? "¡Suelta tu manuscrito aquí!"
              : "Coloca tu Libro en el Atril"}
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
            Arrastra y suelta tu archivo PDF o haz clic para explorar en tu biblioteca
          </p>
        </div>

        {/* Action Button */}
        <div className="mt-7 relative z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              triggerFileInput();
            }}
            disabled={disabled}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-zinc-900 hover:bg-[#D97706] text-white dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-[#F59E0B] text-sm sm:text-base font-extrabold shadow-xl hover:shadow-[0_10px_25px_rgba(217,119,6,0.35)] transition-all duration-300 cursor-pointer"
          >
            <span>📜</span>
            <span>Explorar Archivo PDF</span>
          </button>
        </div>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div
          role="alert"
          className="p-4 text-sm text-rose-700 bg-rose-50 rounded-2xl border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900 text-center font-medium animate-in fade-in"
        >
          {errorMessage}
        </div>
      )}
    </div>
  );
}
