import { useState, useCallback } from "react";
import { Chapter } from "@/types/pdf";
import { detectVisualChapters } from "@/lib/visualChapterDetector";
import type { PDFDocumentProxy } from "pdfjs-dist";

interface PDFOutlineItem {
  title: string;
  dest?: string | unknown[] | null;
  items?: PDFOutlineItem[];
}

export function useChapters() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [hasOutline, setHasOutline] = useState<boolean | null>(null);
  const [isLoadingChapters, setIsLoadingChapters] = useState<boolean>(false);

  const extractChapters = useCallback(
    async (pdfDocument: PDFDocumentProxy, totalPages: number) => {
      setIsLoadingChapters(true);
      try {
        const outline = (await pdfDocument.getOutline()) as PDFOutlineItem[] | null;

        // 1. If outline is missing or empty, attempt visual layout detection
        if (!outline || outline.length === 0) {
          const visualChapters = await detectVisualChapters(pdfDocument, totalPages);

          if (visualChapters.length > 0) {
            setChapters(visualChapters);
            setHasOutline(true);
            return;
          }

          setChapters([]);
          setHasOutline(false);
          return;
        }

        setHasOutline(true);

        const resolveDestinationToPage = async (
          dest: string | unknown[] | null | undefined
        ): Promise<number> => {
          if (!dest) return 1;

          let explicitDest: unknown[] | null = null;
          if (typeof dest === "string") {
            explicitDest = await pdfDocument.getDestination(dest);
          } else if (Array.isArray(dest)) {
            explicitDest = dest;
          }

          if (Array.isArray(explicitDest) && explicitDest.length > 0) {
            const destRef = explicitDest[0];
            if (typeof destRef === "object" && destRef !== null) {
              try {
                const pageIndex = await pdfDocument.getPageIndex(
                  destRef as { num: number; gen: number }
                );
                return pageIndex + 1;
              } catch {
                return 1;
              }
            } else if (typeof destRef === "number") {
              return destRef + 1;
            }
          }
          return 1;
        };

        interface RawChapterItem {
          id: string;
          title: string;
          startPage: number;
          items?: RawChapterItem[];
        }

        const parseOutlineItems = async (
          items: PDFOutlineItem[],
          prefix = ""
        ): Promise<RawChapterItem[]> => {
          const parsed: RawChapterItem[] = [];

          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const currentId = prefix ? `${prefix}-${i}` : `${i}`;
            const startPage = await resolveDestinationToPage(item.dest);

            let subItems: RawChapterItem[] | undefined = undefined;
            if (item.items && item.items.length > 0) {
              subItems = await parseOutlineItems(item.items, currentId);
            }

            parsed.push({
              id: currentId,
              title: item.title?.trim() || `Capítulo ${i + 1}`,
              startPage,
              items: subItems,
            });
          }

          return parsed;
        };

        const rawList = await parseOutlineItems(outline);

        // Assign startPage and endPage to all top-level and nested chapters
        const assignEndPages = (
          items: RawChapterItem[],
          parentEndPage: number
        ): Chapter[] => {
          return items.map((item, idx) => {
            const nextItem = items[idx + 1];
            const endPage = nextItem
              ? Math.max(item.startPage, nextItem.startPage - 1)
              : parentEndPage;

            const subItems = item.items
              ? assignEndPages(item.items, endPage)
              : undefined;

            return {
              id: item.id,
              title: item.title,
              pageNumber: item.startPage,
              startPage: item.startPage,
              endPage: Math.min(Math.max(item.startPage, endPage), totalPages),
              items: subItems,
            };
          });
        };

        const resolvedChapters = assignEndPages(rawList, totalPages);

        // If outline only has 1 massive chapter spanning all pages, attempt visual chapter splitting
        if (
          resolvedChapters.length === 1 &&
          resolvedChapters[0].startPage === 1 &&
          resolvedChapters[0].endPage >= totalPages &&
          totalPages >= 5
        ) {
          const visualChapters = await detectVisualChapters(pdfDocument, totalPages);
          if (visualChapters.length > 1) {
            setChapters(visualChapters);
            return;
          }
        }

        setChapters(resolvedChapters);
      } catch (err) {
        console.error("Error al extraer capítulos del PDF:", err);
        setChapters([]);
        setHasOutline(false);
      } finally {
        setIsLoadingChapters(false);
      }
    },
    []
  );

  const resetChapters = useCallback(() => {
    setChapters([]);
    setHasOutline(null);
    setIsLoadingChapters(false);
  }, []);

  return {
    chapters,
    hasOutline,
    isLoadingChapters,
    extractChapters,
    resetChapters,
  };
}
