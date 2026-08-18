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
  const setRef = useCallback(
    (el: HTMLDivElement | null) => {
      onMountElement(pageNum, el);
    },
    [pageNum, onMountElement]
  );

  return (
    <div
      data-page-number={pageNum}
      ref={setRef}
      className="flex flex-col items-center w-full"
    >
      <div className="shadow-lg rounded-lg overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <Page
          pdf={pdf}
          pageNumber={pageNum}
          width={width}
          renderTextLayer={true}
          renderAnnotationLayer={true}
          className="transition-all duration-150"
        />
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
  const [containerWidth, setContainerWidth] = useState<number>(650);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const isProgrammaticScroll = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Callback to register DOM elements per page
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

  // Adjust page width responsively
  const updateWidth = useCallback(() => {
    if (containerRef.current) {
      const width = containerRef.current.clientWidth;
      setContainerWidth(Math.min(width - 32, 850));
    }
  }, []);

  useEffect(() => {
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [updateWidth]);

  // Memoize page range for the current chapter
  const pages = useMemo(() => {
    const count = Math.max(1, endPage - startPage + 1);
    return Array.from({ length: count }, (_, i) => startPage + i);
  }, [startPage, endPage]);

  // Smooth scroll to a target page with programmatic scroll silencing
  useEffect(() => {
    const targetPage = scrollToPage || startPage;
    const pageEl = pageRefs.current.get(targetPage);

    if (pageEl) {
      isProgrammaticScroll.current = true;
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      pageEl.scrollIntoView({ behavior: "smooth", block: "start" });

      // Unlock programmatic scroll once animation concludes
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

  // Observe visible page without triggering state thrashing
  useEffect(() => {
    let debounceTimer: NodeJS.Timeout | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScroll.current) return;

        // Find intersecting entry with the highest visibility
        const intersectingEntries = entries.filter((e) => e.isIntersecting);
        if (intersectingEntries.length === 0) return;

        // Pick the entry closest to top of viewport
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
          }, 100);
        }
      },
      {
        root: null,
        rootMargin: "-10% 0px -40% 0px",
        threshold: [0, 0.25, 0.5, 0.75],
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

  const renderedWidth = containerWidth * scale;

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
