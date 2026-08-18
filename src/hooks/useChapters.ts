import { useState, useCallback } from "react";
import { Chapter } from "@/types/pdf";
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

  const extractChapters = useCallback(async (pdfDocument: PDFDocumentProxy) => {
    setIsLoadingChapters(true);
    try {
      const outline = (await pdfDocument.getOutline()) as PDFOutlineItem[] | null;

      if (!outline || outline.length === 0) {
        setChapters([]);
        setHasOutline(false);
        // TODO: En caso de que el PDF no tenga outline/tabla de contenidos embebida,
        // implementar en una fase posterior heurísticas o detección inteligente de capítulos.
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

      const parseOutlineItems = async (
        items: PDFOutlineItem[],
        prefix = ""
      ): Promise<Chapter[]> => {
        const parsed: Chapter[] = [];

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const currentId = prefix ? `${prefix}-${i}` : `${i}`;
          const pageNumber = await resolveDestinationToPage(item.dest);

          let subItems: Chapter[] | undefined = undefined;
          if (item.items && item.items.length > 0) {
            subItems = await parseOutlineItems(item.items, currentId);
          }

          parsed.push({
            id: currentId,
            title: item.title || `Capítulo ${i + 1}`,
            pageNumber,
            items: subItems,
          });
        }

        return parsed;
      };

      const resolvedChapters = await parseOutlineItems(outline);
      setChapters(resolvedChapters);
    } catch (err) {
      console.error("Error al extraer capítulos del PDF:", err);
      setChapters([]);
      setHasOutline(false);
    } finally {
      setIsLoadingChapters(false);
    }
  }, []);

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
