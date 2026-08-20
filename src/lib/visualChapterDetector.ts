import type { PDFDocumentProxy } from "pdfjs-dist";
import { Chapter } from "@/types/pdf";

interface TextItemWithPosition {
  str: string;
  x: number;
  y: number;
  height: number;
}

const ISOLATED_ARABIC_NUM_REGEX = /^\s*(\d{1,3})\s*$/;
const ISOLATED_ROMAN_NUM_REGEX =
  /^\s*(I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII|XIII|XIV|XV|XVI|XVII|XVIII|XIX|XX)\s*$/i;
const CHAPTER_PREFIX_REGEX = /^\s*cap[ií]tulo\s+(\d+|[ivxlcdm]+)(.*)$/i;
const NUMBERED_TITLE_REGEX =
  /^\s*(\d{1,3}|[ivxlcdm]+)[\.\-\–\—\:]\s+([A-ZÁÉÍÓÚÑa-záéíóúñ\s]{2,50})$/i;

/**
 * Scans PDF pages to detect visual chapter / subchapter headers (e.g. bold isolated "2", "Capítulo 3", etc.)
 */
export async function detectVisualChapters(
  pdfDocument: PDFDocumentProxy,
  totalPages: number
): Promise<Chapter[]> {
  const detectedHeaders: { title: string; pageNum: number }[] = [];

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    try {
      const page = await pdfDocument.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.0 });
      const textContent = await page.getTextContent();

      if (!textContent.items || textContent.items.length === 0) continue;

      const pageHeight = viewport.height;
      const items: TextItemWithPosition[] = [];

      let fullPageText = "";

      for (const item of textContent.items) {
        if ("str" in item && typeof item.str === "string") {
          const str = item.str.trim();
          fullPageText += item.str + " ";
          if (str.length > 0 && Array.isArray(item.transform)) {
            // item.transform: [scaleX, skewY, skewX, scaleY, tx, ty]
            const x = item.transform[4];
            const y = item.transform[5];
            const height = item.height || 12;
            items.push({ str, x, y, height });
          }
        }
      }

      const totalWords = fullPageText.trim().split(/\s+/).filter(Boolean).length;
      // Skip pages with almost no content
      if (totalWords < 25) continue;

      // Filter text items in top 40% of the page
      const topItems = items
        .filter((item) => item.y >= pageHeight * 0.6)
        .sort((a, b) => b.y - a.y || a.x - b.x); // top-to-bottom, left-to-right

      if (topItems.length === 0) continue;

      // Group nearby items into top lines
      const topLines: string[] = [];
      let currentLine = "";
      let currentY = topItems[0].y;

      for (const item of topItems) {
        if (Math.abs(item.y - currentY) > 8) {
          if (currentLine.trim()) topLines.push(currentLine.trim());
          currentLine = item.str;
          currentY = item.y;
        } else {
          currentLine += (currentLine ? " " : "") + item.str;
        }
      }
      if (currentLine.trim()) topLines.push(currentLine.trim());

      // Evaluate the first 3 lines of the page for chapter headers
      let detectedTitle: string | null = null;

      for (let i = 0; i < Math.min(topLines.length, 3); i++) {
        const line = topLines[i];

        // Case 1: Chapter prefix (e.g. "Capítulo 2" or "Capítulo II: La llegada")
        if (CHAPTER_PREFIX_REGEX.test(line)) {
          detectedTitle = line;
          break;
        }

        // Case 2: Numbered title (e.g. "2. La llegada" or "II - El regreso")
        if (NUMBERED_TITLE_REGEX.test(line)) {
          detectedTitle = line;
          break;
        }

        // Case 3: Isolated Arabic number (e.g. "2")
        const arabicMatch = line.match(ISOLATED_ARABIC_NUM_REGEX);
        if (arabicMatch) {
          const num = arabicMatch[1];
          // If the next line is a short title (1-4 words), combine it
          const nextLine = topLines[i + 1];
          if (
            nextLine &&
            nextLine.split(/\s+/).length <= 4 &&
            !ISOLATED_ARABIC_NUM_REGEX.test(nextLine)
          ) {
            detectedTitle = `Capítulo ${num} - ${nextLine}`;
          } else {
            detectedTitle = `Capítulo ${num}`;
          }
          break;
        }

        // Case 4: Isolated Roman numeral (e.g. "II", "IV")
        const romanMatch = line.match(ISOLATED_ROMAN_NUM_REGEX);
        if (romanMatch) {
          const roman = romanMatch[1].toUpperCase();
          const nextLine = topLines[i + 1];
          if (
            nextLine &&
            nextLine.split(/\s+/).length <= 4 &&
            !ISOLATED_ROMAN_NUM_REGEX.test(nextLine)
          ) {
            detectedTitle = `Capítulo ${roman} - ${nextLine}`;
          } else {
            detectedTitle = `Capítulo ${roman}`;
          }
          break;
        }
      }

      if (detectedTitle) {
        // Prevent duplicate detections on adjacent/same pages
        const lastHeader = detectedHeaders[detectedHeaders.length - 1];
        if (!lastHeader || lastHeader.pageNum !== pageNum) {
          detectedHeaders.push({ title: detectedTitle, pageNum });
        }
      }
    } catch (err) {
      console.warn(`Error scanning page ${pageNum} for visual headers:`, err);
    }
  }

  if (detectedHeaders.length === 0) {
    return [];
  }

  // If first chapter doesn't start on page 1, create a preliminary section for pages 1 to (firstChapter.pageNum - 1)
  const chaptersList: Chapter[] = [];
  if (detectedHeaders[0].pageNum > 1) {
    chaptersList.push({
      id: "intro-0",
      title: "Sección Inicial",
      pageNumber: 1,
      startPage: 1,
      endPage: detectedHeaders[0].pageNum - 1,
    });
  }

  for (let i = 0; i < detectedHeaders.length; i++) {
    const header = detectedHeaders[i];
    const nextHeader = detectedHeaders[i + 1];
    const startPage = header.pageNum;
    const endPage = nextHeader ? nextHeader.pageNum - 1 : totalPages;

    chaptersList.push({
      id: `visual-${i + 1}`,
      title: header.title,
      pageNumber: startPage,
      startPage,
      endPage: Math.max(startPage, endPage),
    });
  }

  return chaptersList;
}
