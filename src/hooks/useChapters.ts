import { useState, useCallback } from "react";
import { Chapter } from "@/types/pdf";
import {
  detectVisualChapters,
  detectSubchaptersInRange,
  enrichChaptersWithSharedPageSplits,
} from "@/lib/visualChapterDetector";
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

        // 1. If outline is missing or empty, attempt visual layout detection across entire document
        if (!outline || outline.length === 0) {
          const visualChapters = await detectVisualChapters(pdfDocument, totalPages);

          if (visualChapters.length > 0) {
            const enriched = await enrichChaptersWithSharedPageSplits(pdfDocument, visualChapters);
            setChapters(enriched);
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
              ? nextItem.startPage
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

        // If outline only has 1 single generic entry with no children, scan for subchapters
        let enrichedChapters = resolvedChapters;
        if (
          resolvedChapters.length === 1 &&
          (!resolvedChapters[0].items || resolvedChapters[0].items.length === 0)
        ) {
          const single = resolvedChapters[0];
          try {
            const subchapters = await detectSubchaptersInRange(
              pdfDocument,
              single.startPage,
              single.endPage,
              single.id
            );
            if (subchapters.length > 1) {
              enrichedChapters = [
                {
                  ...single,
                  items: subchapters,
                },
              ];
            }
          } catch (scanErr) {
            console.warn("Error scanning subchapters for single outline entry:", scanErr);
          }
        }

        const finalChapters = await enrichChaptersWithSharedPageSplits(
          pdfDocument,
          enrichedChapters
        );
        setChapters(finalChapters);
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
