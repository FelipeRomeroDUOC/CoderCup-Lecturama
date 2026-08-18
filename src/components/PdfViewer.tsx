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
  currentPage: number;
  onDocumentLoadSuccess: (pdf: PDFDocumentProxy) => void;
  scale?: number;
}

export default function PdfViewer({
  file,
  currentPage,
  onDocumentLoadSuccess,
  scale = 1.0,
}: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(600);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

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
      // Cap at 850px for pleasant reading experience, minus padding
      setContainerWidth(Math.min(width - 32, 850));
    }
  }, []);

  useEffect(() => {
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [updateWidth]);

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
      className="flex flex-col items-center justify-center w-full min-h-[600px] p-4 bg-zinc-100 dark:bg-zinc-900/50 rounded-xl overflow-x-auto"
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
        <div className="shadow-lg rounded-lg overflow-hidden bg-white">
          <Page
            pageNumber={currentPage}
            width={containerWidth * scale}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            className="transition-all duration-150"
          />
        </div>
      </Document>
    </div>
  );
}
