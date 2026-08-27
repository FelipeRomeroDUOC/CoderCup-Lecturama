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
  /^\s*(\d{1,3}|[ivxlcdm]+)[\.\-\–\—\:]\s+([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑa-záéíóúñ\s\(\)\,\;\:\'\’\"\-]{2,70})$/i;

/**
 * Extracts and groups text into ordered lines from top to bottom of a page.
 */
async function getPageLines(
  pdfDocument: PDFDocumentProxy,
  pageNum: number
): Promise<{ lines: string[]; totalWords: number; pageHeight: number }> {
  try {
    const page = await pdfDocument.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.0 });
    const textContent = await page.getTextContent();

    if (!textContent.items || textContent.items.length === 0) {
      return { lines: [], totalWords: 0, pageHeight: viewport.height };
    }

    const pageHeight = viewport.height;
    const items: TextItemWithPosition[] = [];
    let fullText = "";

    for (const item of textContent.items) {
      if ("str" in item && typeof item.str === "string") {
        const str = item.str.trim();
        fullText += item.str + " ";
        if (str.length > 0 && Array.isArray(item.transform)) {
          const x = item.transform[4];
          const y = item.transform[5];
          const height = item.height || 12;
          // Filter out header/footer margin lines (top 20px and bottom 30px)
          if (y >= 30 && y <= pageHeight - 15) {
            items.push({ str: item.str, x, y, height });
          }
        }
      }
    }

    const totalWords = fullText.trim().split(/\s+/).filter(Boolean).length;
    if (items.length === 0) {
      return { lines: [], totalWords, pageHeight };
    }

    // Sort top-to-bottom, left-to-right
    items.sort((a, b) => b.y - a.y || a.x - b.x);

    const lines: string[] = [];
    let currentLine = "";
    let currentY = items[0].y;

    for (const item of items) {
      if (Math.abs(item.y - currentY) > 6) {
        if (currentLine.trim()) lines.push(currentLine.trim());
        currentLine = item.str;
        currentY = item.y;
      } else {
        currentLine += (currentLine ? " " : "") + item.str;
      }
    }
    if (currentLine.trim()) lines.push(currentLine.trim());

    return { lines, totalWords, pageHeight };
  } catch (err) {
    console.warn(`Error leyendo líneas de página ${pageNum}:`, err);
    return { lines: [], totalWords: 0, pageHeight: 800 };
  }
}

/**
 * Scans a range of pages in the PDF to find subchapter headers (such as "2. Las Cátedras de Virtudes")
 */
export async function detectSubchaptersInRange(
  pdfDocument: PDFDocumentProxy,
  startPage: number,
  endPage: number,
  idPrefix = "sub"
): Promise<Chapter[]> {
  const detectedHeaders: { title: string; pageNum: number }[] = [];

  for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
    const { lines, totalWords } = await getPageLines(pdfDocument, pageNum);
    if (totalWords < 20 || lines.length === 0) continue;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Pattern 1: Numbered title (e.g. "2. Las Cátedras de Virtudes")
      const numberedMatch = line.match(NUMBERED_TITLE_REGEX);
      if (numberedMatch) {
        const title = line.trim();
        // Avoid duplicate detections on the exact same page
        if (!detectedHeaders.some((h) => h.pageNum === pageNum)) {
          detectedHeaders.push({ title, pageNum });
          break;
        }
      }

      // Pattern 2: Canonical chapter prefix (e.g. "Capítulo 2: ...")
      if (CHAPTER_PREFIX_REGEX.test(line)) {
        if (!detectedHeaders.some((h) => h.pageNum === pageNum)) {
          detectedHeaders.push({ title: line.trim(), pageNum });
          break;
        }
      }

      // Pattern 3: Isolated number on its own line followed by title on the next line
      const isolatedArabic = line.match(ISOLATED_ARABIC_NUM_REGEX);
      if (isolatedArabic && i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        const nextWordCount = nextLine.split(/\s+/).length;
        if (
          nextWordCount >= 1 &&
          nextWordCount <= 6 &&
          /^[A-ZÁÉÍÓÚÑ]/.test(nextLine) &&
          !ISOLATED_ARABIC_NUM_REGEX.test(nextLine)
        ) {
          const title = `${isolatedArabic[1]}. ${nextLine}`;
          if (!detectedHeaders.some((h) => h.pageNum === pageNum)) {
            detectedHeaders.push({ title, pageNum });
            break;
          }
        }
      }

      // Pattern 4: Isolated Roman numeral followed by title on the next line
      const isolatedRoman = line.match(ISOLATED_ROMAN_NUM_REGEX);
      if (isolatedRoman && i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        const nextWordCount = nextLine.split(/\s+/).length;
        if (
          nextWordCount >= 1 &&
          nextWordCount <= 6 &&
          /^[A-ZÁÉÍÓÚÑ]/.test(nextLine) &&
          !ISOLATED_ROMAN_NUM_REGEX.test(nextLine)
        ) {
          const title = `${isolatedRoman[1].toUpperCase()}. ${nextLine}`;
          if (!detectedHeaders.some((h) => h.pageNum === pageNum)) {
            detectedHeaders.push({ title, pageNum });
            break;
          }
        }
      }
    }
  }

  if (detectedHeaders.length === 0) {
    return [];
  }

  const subchapters: Chapter[] = [];

  // If first subchapter doesn't start at startPage, create an opening subsection
  if (detectedHeaders[0].pageNum > startPage) {
    subchapters.push({
      id: `${idPrefix}-0`,
      title: "1. Introducción / Comienzo",
      pageNumber: startPage,
      startPage,
      endPage: detectedHeaders[0].pageNum - 1,
    });
  }

  for (let i = 0; i < detectedHeaders.length; i++) {
    const header = detectedHeaders[i];
    const nextHeader = detectedHeaders[i + 1];
    const subStart = header.pageNum;
    const subEnd = nextHeader ? nextHeader.pageNum - 1 : endPage;

    subchapters.push({
      id: `${idPrefix}-${i + 1}`,
      title: header.title,
      pageNumber: subStart,
      startPage: subStart,
      endPage: Math.max(subStart, subEnd),
    });
  }

  return subchapters;
}

/**
 * Scans entire document when outline is absent or generic.
 */
export async function detectVisualChapters(
  pdfDocument: PDFDocumentProxy,
  totalPages: number
): Promise<Chapter[]> {
  return detectSubchaptersInRange(pdfDocument, 1, totalPages, "visual");
}

/**
 * Scans adjacent chapters that share the same physical PDF page (chapterN.endPage === chapterN+1.startPage)
 * and calculates the exact item boundary (startItemIndex, endItemIndex) and splitFractionY.
 */
export async function enrichChaptersWithSharedPageSplits(
  pdfDocument: PDFDocumentProxy,
  chapters: Chapter[]
): Promise<Chapter[]> {
  const result: Chapter[] = chapters.map((ch) => ({
    ...ch,
    items: ch.items ? [...ch.items] : undefined,
  }));

  for (let i = 0; i < result.length - 1; i++) {
    const curr = result[i];
    const next = result[i + 1];

    if (curr.endPage === next.startPage) {
      const sharedPageNum = curr.endPage;
      try {
        const page = await pdfDocument.getPage(sharedPageNum);
        const textContent = await page.getTextContent();
        const viewport = page.getViewport({ scale: 1.0 });

        if (textContent.items && textContent.items.length > 0) {
          // Normalize next chapter title to find matching item
          const cleanNextTitle = next.title
            .toLowerCase()
            .replace(/^[0-9ivxlcdm]+[\.\-\–\—\:]\s*/i, "")
            .trim();

          const searchKeywords = cleanNextTitle
            .split(/\s+/)
            .filter((w) => w.length >= 3);

          let splitIndex = -1;
          let splitYFromBottom = viewport.height * 0.5;

          // Search from items
          for (let itemIdx = 0; itemIdx < textContent.items.length; itemIdx++) {
            const item = textContent.items[itemIdx];
            if ("str" in item && typeof item.str === "string") {
              const strLower = item.str.toLowerCase();

              const matchesTitle =
                (cleanNextTitle.length > 3 && strLower.includes(cleanNextTitle)) ||
                (searchKeywords.length >= 2 &&
                  searchKeywords.every((kw) => strLower.includes(kw))) ||
                (searchKeywords.length === 1 && strLower.includes(searchKeywords[0]));

              const matchesPrefix =
                CHAPTER_PREFIX_REGEX.test(item.str) ||
                NUMBERED_TITLE_REGEX.test(item.str);

              if (matchesTitle || matchesPrefix) {
                if (
                  itemIdx > 0 ||
                  (Array.isArray(item.transform) && item.transform[5] < viewport.height - 40)
                ) {
                  splitIndex = itemIdx;
                  if (Array.isArray(item.transform)) {
                    splitYFromBottom = item.transform[5];
                  }
                  break;
                }
              }
            }
          }

          if (splitIndex > 0) {
            const topY = viewport.height - splitYFromBottom;
            const fraction = Math.max(0.08, Math.min(0.92, (topY - 12) / viewport.height));

            curr.endItemIndex = splitIndex - 1;
            curr.splitFractionY = fraction;
            curr.partIndex = 1;
            curr.totalParts = 2;

            next.startItemIndex = splitIndex;
            next.splitFractionY = fraction;
            next.partIndex = 2;
            next.totalParts = 2;
          }
        }
      } catch (err) {
        console.warn(`Error calculating shared page split for page ${sharedPageNum}:`, err);
      }
    }
  }

  // Also recursively process sub-items if present
  for (const ch of result) {
    if (ch.items && ch.items.length > 1) {
      ch.items = await enrichChaptersWithSharedPageSplits(pdfDocument, ch.items);
    }
  }

  return result;
}
