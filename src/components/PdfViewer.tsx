"use client";

import { useState, useRef, useEffect, useCallback, useMemo, memo } from "react";
import { Page } from "react-pdf";
import type { PDFDocumentProxy } from "pdfjs-dist";

interface PdfPageItemProps {
  pdf: PDFDocumentProxy;
  pageNum: number;
  width: number;
  onMountElement: (pageNum: number, el: HTMLDivElement | null) => void;
}

const PdfPageItem = memo(function PdfPageItem({
  pdf,
  pageNum,
  width,
  onMountElement,
}: PdfPageItemProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  // First page is loaded immediately, subsequent pages are loaded when near viewport
  const [shouldRender, setShouldRender] = useState<boolean>(pageNum <= 2);

  const handleRef = useCallback(
    (el: HTMLDivElement | null) => {
      containerRef.current = el;
      onMountElement(pageNum, el);
    },
    [pageNum, onMountElement]
  );

  // Lazy loading observer: loads page when within 600px of viewport
  useEffect(() => {
    if (shouldRender) return;

    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      {
        root: null,
        rootMargin: "600px 0px 600px 0px",
        threshold: 0,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [shouldRender]);

  // Approximate height based on standard A4/US Letter aspect ratio (1:1.414)
  const estimatedHeight = Math.round(width * 1.414);

  return (
    <div
      data-page-number={pageNum}
      ref={handleRef}
      className="flex flex-col items-center w-full min-h-[400px]"
    >
      <div
        className="shadow-lg rounded-lg overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center transition-all duration-150"
        style={{ width: `${width}px`, minHeight: shouldRender ? undefined : `${estimatedHeight}px` }}
      >
        {shouldRender ? (
          <Page
            pdf={pdf}
            pageNumber={pageNum}
            width={width}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            className="transition-all duration-150"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-zinc-400 space-y-2">
            <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-700 dark:border-zinc-700 dark:border-t-zinc-300 rounded-full animate-spin" />
            <span className="text-xs font-medium">Cargando página {pageNum}...</span>
          </div>
        )}
      </div>
      <span className="mt-2 text-xs font-medium text-zinc-400">
        Página {pageNum}
      </span>
    </div>
  );
});

interface PdfViewerProps {
  pdf: PDFDocumentProxy;
  startPage: number;
  endPage: number;
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
  pdf,
  startPage,
  endPage,
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
  const [containerWidth, setContainerWidth] = useState<number>(750);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const isProgrammaticScroll = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Register DOM elements per page
  const handleMountElement = useCallback(
    (pageNum: number, el: HTMLDivElement | null) => {
      if (el) {
        pageRefs.current.set(pageNum, el);
      } else {
        pageRefs.current.delete(pageNum);
      }
    },
    []
  );

  // Adjust page width responsively without rapid updates
  const updateWidth = useCallback(() => {
    if (containerRef.current) {
      const width = containerRef.current.clientWidth;
      const targetWidth = Math.min(Math.max(width - 32, 320), 850);
      setContainerWidth((prev) => (Math.abs(prev - targetWidth) > 10 ? targetWidth : prev));
    }
  }, []);

  useEffect(() => {
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [updateWidth]);

  // Memoize page range for current chapter
  const pages = useMemo(() => {
    const count = Math.max(1, endPage - startPage + 1);
    return Array.from({ length: count }, (_, i) => startPage + i);
  }, [startPage, endPage]);

  // Smooth scroll to a target page
  useEffect(() => {
    const targetPage = scrollToPage || startPage;
    const pageEl = pageRefs.current.get(targetPage);

    if (pageEl) {
      isProgrammaticScroll.current = true;
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      pageEl.scrollIntoView({ behavior: "smooth", block: "start" });

      scrollTimeoutRef.current = setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, 750);
    }

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [startPage, scrollToPage]);

  // Observe active visible page
  useEffect(() => {
    let debounceTimer: NodeJS.Timeout | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScroll.current) return;

        const intersectingEntries = entries.filter((e) => e.isIntersecting);
        if (intersectingEntries.length === 0) return;

        const topEntry = intersectingEntries.reduce((prev, curr) =>
          Math.abs(curr.boundingClientRect.top) <
          Math.abs(prev.boundingClientRect.top)
            ? curr
            : prev
        );

        const pageNum = Number(topEntry.target.getAttribute("data-page-number"));
        if (pageNum) {
          if (debounceTimer) clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            if (!isProgrammaticScroll.current) {
              onVisiblePageChange(pageNum);
            }
          }, 150);
        }
      },
      {
        root: null,
        rootMargin: "-10% 0px -40% 0px",
        threshold: [0, 0.25, 0.5],
      }
    );

    pageRefs.current.forEach((element) => {
      if (element) observer.observe(element);
    });

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      observer.disconnect();
    };
  }, [pages, onVisiblePageChange]);

  const renderedWidth = Math.round(containerWidth * scale);

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center w-full max-w-4xl mx-auto py-6 px-2 sm:px-4"
    >
      <div className="flex flex-col items-center gap-8 w-full">
        {pages.map((pageNum) => (
          <PdfPageItem
            key={pageNum}
            pdf={pdf}
            pageNum={pageNum}
            width={renderedWidth}
            onMountElement={handleMountElement}
          />
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
    </div>
  );
}
