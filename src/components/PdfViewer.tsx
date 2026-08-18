"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import type { PDFDocumentProxy } from "pdfjs-dist";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  file: File;
  startPage: number;
  endPage: number;
  onDocumentLoadSuccess: (pdf: PDFDocumentProxy) => void;
  onVisiblePageChange: (pageNumber: number) => void;
  scale?: number;
  activeChapterTitle?: string;
  hasNextChapter?: boolean;
  hasPrevChapter?: boolean;
  onNextChapter?: () => void;
  onPrevChapter?: () => void;
  scrollToPage?: number;
}

export default function PdfViewer({
  file,
  startPage,
  endPage,
  onDocumentLoadSuccess,
  onVisiblePageChange,
  scale = 1.0,
  activeChapterTitle,
  hasNextChapter = false,
  hasPrevChapter = false,
  onNextChapter,
  onPrevChapter,
  scrollToPage,
}: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(650);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Generate object URL for the local file
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setFileUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  // Adjust page width responsively
  const updateWidth = useCallback(() => {
    if (containerRef.current) {
      const width = containerRef.current.clientWidth;
      // Cap at 850px for reading comfort, minus container padding
      setContainerWidth(Math.min(width - 32, 850));
    }
  }, []);

  useEffect(() => {
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [updateWidth]);

  // Page range for the current chapter
  const pages = Array.from(
    { length: Math.max(1, endPage - startPage + 1) },
    (_, i) => startPage + i
  );

  // Scroll to a specific page when requested or when startPage changes
  useEffect(() => {
    const targetPage = scrollToPage || startPage;
    const pageEl = pageRefs.current.get(targetPage);
    if (pageEl) {
      pageEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [startPage, scrollToPage]);

  // Observe which page is currently in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const pageNum = Number(entry.target.getAttribute("data-page-number"));
            if (pageNum) {
              onVisiblePageChange(pageNum);
            }
          }
        }
      },
      {
        root: null,
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0,
      }
    );

    pageRefs.current.forEach((element) => {
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [pages, onVisiblePageChange]);

  if (!fileUrl) {
    return (
      <div className="flex items-center justify-center p-12 text-zinc-500">
        Cargando archivo...
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center w-full max-w-4xl mx-auto py-6 px-2 sm:px-4"
    >
      <Document
        file={fileUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={
          <div className="flex flex-col items-center justify-center p-16 space-y-3">
            <div className="w-8 h-8 border-4 border-zinc-400 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin" />
            <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
              Cargando documento PDF...
            </p>
          </div>
        }
        error={
          <div className="p-8 text-center text-red-600 dark:text-red-400 space-y-2">
            <p className="font-semibold">Error al cargar el archivo PDF.</p>
            <p className="text-sm">Por favor verifica que el archivo no esté dañado.</p>
          </div>
        }
      >
        <div className="flex flex-col items-center gap-8 w-full">
          {pages.map((pageNum) => (
            <div
              key={pageNum}
              data-page-number={pageNum}
              ref={(el) => {
                if (el) pageRefs.current.set(pageNum, el);
                else pageRefs.current.delete(pageNum);
              }}
              className="flex flex-col items-center w-full"
            >
              <div className="shadow-lg rounded-lg overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <Page
                  pageNumber={pageNum}
                  width={containerWidth * scale}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="transition-all duration-150"
                />
              </div>
              <span className="mt-2 text-xs font-medium text-zinc-400">
                Página {pageNum}
              </span>
            </div>
          ))}

          {/* End of Chapter Card */}
          <div className="w-full max-w-lg mt-6 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm text-center space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Fin del capítulo
              </span>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {activeChapterTitle || "Capítulo completado"}
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Has llegado al final de las páginas de este capítulo.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {hasPrevChapter && onPrevChapter && (
                <button
                  type="button"
                  onClick={onPrevChapter}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                >
                  ← Capítulo Anterior
                </button>
              )}

              {hasNextChapter && onNextChapter && (
                <button
                  type="button"
                  onClick={onNextChapter}
                  className="px-5 py-2 text-sm font-medium rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-sm transition-colors"
                >
                  Siguiente Capítulo →
                </button>
              )}
            </div>
          </div>
        </div>
      </Document>
    </div>
  );
}
