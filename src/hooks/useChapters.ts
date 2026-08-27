import { useState, useCallback } from "react";
import { Chapter } from "@/types/pdf";
import {
  detectVisualChapters,
  detectSubchaptersInRange,
  enrichChaptersWithSharedPageSplits,
  mergeSmallAndMultiLineChapters,
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
            const merged = await mergeSmallAndMultiLineChapters(pdfDocument, visualChapters);
            const enriched = await enrichChaptersWithSharedPageSplits(pdfDocument, merged);
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

        // Subdivide macro sections (> 3 pages) with visual subchapter detection
        const enrichedChapters: Chapter[] = [];

        for (let i = 0; i < resolvedChapters.length; i++) {
          const ch = resolvedChapters[i];
          const nextCh = resolvedChapters[i + 1];
          const pageSpan = ch.endPage - ch.startPage + 1;

          if (pageSpan >= 3 && (!ch.items || ch.items.length === 0)) {
            try {
              // If next section starts on ch.endPage, limit scan to endPage - 1 so we don't capture next section's opening
              const scanEndPage =
                nextCh && nextCh.startPage === ch.endPage
                  ? Math.max(ch.startPage, ch.endPage - 1)
                  : ch.endPage;

              const subchapters = await detectSubchaptersInRange(
                pdfDocument,
                ch.startPage,
                scanEndPage,
                ch.id
              );

              if (subchapters.length > 1) {
                // Ensure the last subchapter reaches ch.endPage
                subchapters[subchapters.length - 1].endPage = ch.endPage;

                enrichedChapters.push({
                  ...ch,
                  items: subchapters,
                });
                continue;
              }
            } catch (scanErr) {
              console.warn(`Error scanning subchapters for section ${ch.title}:`, scanErr);
            }
          }

          enrichedChapters.push(ch);
        }

        const mergedChapters = await mergeSmallAndMultiLineChapters(
          pdfDocument,
          enrichedChapters
        );

        const finalChapters = await enrichChaptersWithSharedPageSplits(
          pdfDocument,
          mergedChapters
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
