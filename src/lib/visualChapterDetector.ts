import type { PDFDocumentProxy } from "pdfjs-dist";
import { Chapter } from "@/types/pdf";
import { extractChapterText } from "./pdfTextExtractor";

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
      endPage: detectedHeaders[0].pageNum,
    });
  }

  for (let i = 0; i < detectedHeaders.length; i++) {
    const header = detectedHeaders[i];
    const nextHeader = detectedHeaders[i + 1];
    const subStart = header.pageNum;
    const subEnd = nextHeader ? nextHeader.pageNum : endPage;

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
 * and calculates the exact item boundary (startItemIndex, endItemIndex) and startSplitFractionY / endSplitFractionY.
 */
export async function enrichChaptersWithSharedPageSplits(
  pdfDocument: PDFDocumentProxy,
  chapters: Chapter[]
): Promise<Chapter[]> {
  // Collect all leaf/flat chapters in reading order
  const flatList: Chapter[] = [];
  const collectLeaves = (items: Chapter[]) => {
    for (const item of items) {
      if (item.items && item.items.length > 0) {
        collectLeaves(item.items);
      } else {
        flatList.push(item);
      }
    }
  };
  collectLeaves(chapters);

  for (let i = 0; i < flatList.length - 1; i++) {
    const curr = flatList[i];
    const next = flatList[i + 1];

    if (curr.endPage === next.startPage) {
      const sharedPageNum = curr.endPage;
      try {
        const page = await pdfDocument.getPage(sharedPageNum);
        const textContent = await page.getTextContent();
        const viewport = page.getViewport({ scale: 1.0 });

        if (textContent.items && textContent.items.length > 0) {
          // Clean title keywords
          const cleanNextTitle = next.title
            .toLowerCase()
            .replace(/^[0-9ivxlcdm]+[\.\-\–\—\:]\s*/i, "")
            .trim();

          const searchKeywords = cleanNextTitle
            .split(/\s+/)
            .filter((w) => w.length >= 3);

          // Group items by physical line (similar Y within 6px) to handle multi-span styled titles
          interface LineGroup {
            text: string;
            firstItemIndex: number;
            yFromBottom: number;
            height: number;
          }

          const lines: LineGroup[] = [];
          let curLineText = "";
          let curFirstIndex = -1;
          let curY = -9999;
          let curHeight = 16;

          for (let itemIdx = 0; itemIdx < textContent.items.length; itemIdx++) {
            const item = textContent.items[itemIdx];
            if ("str" in item && typeof item.str === "string") {
              const itemY = Array.isArray(item.transform) ? item.transform[5] : 0;
              const itemHeight = item.height || 16;

              if (Math.abs(itemY - curY) > 6) {
                if (curLineText.trim() && curFirstIndex >= 0) {
                  lines.push({
                    text: curLineText.trim(),
                    firstItemIndex: curFirstIndex,
                    yFromBottom: curY,
                    height: curHeight,
                  });
                }
                curLineText = item.str;
                curFirstIndex = itemIdx;
                curY = itemY;
                curHeight = itemHeight;
              } else {
                curLineText += (curLineText ? " " : "") + item.str;
                curHeight = Math.max(curHeight, itemHeight);
              }
            }
          }
          if (curLineText.trim() && curFirstIndex >= 0) {
            lines.push({
              text: curLineText.trim(),
              firstItemIndex: curFirstIndex,
              yFromBottom: curY,
              height: curHeight,
            });
          }

          let matchedLine: LineGroup | null = null;

          for (const line of lines) {
            const lineLower = line.text.toLowerCase();
            const yFraction = 1 - line.yFromBottom / viewport.height;

            // Exclude extreme bottom footers (bottom 12%) that are just page numbers or URLs/watermarks
            const isFooterNoise =
              yFraction > 0.86 &&
              (/^\d+$/.test(line.text.trim()) ||
                /@|http|www|\.com|\.org|\.cl|\.es/i.test(line.text));

            if (isFooterNoise) continue;

            // 1. Match full title or significant keywords of the next chapter
            const matchesFullTitle =
              cleanNextTitle.length > 3 && lineLower.includes(cleanNextTitle);
            const matchesAllKeywords =
              searchKeywords.length >= 2 && searchKeywords.every((kw) => lineLower.includes(kw));
            const matchesSingleKeyword =
              searchKeywords.length === 1 && lineLower.includes(searchKeywords[0]);

            // 2. If next.title has a specific chapter number (e.g. "Capítulo 4" or "4. ..."), match specifically that number
            let matchesSpecificChapterNumber = false;
            const chapterNumMatch = next.title.match(/(?:cap[ií]tulo\s+|^\s*)(\d+|[ivxlcdm]+)/i);
            if (chapterNumMatch) {
              const numStr = chapterNumMatch[1].toLowerCase();
              const lineNumMatch = line.text.match(/(?:cap[ií]tulo\s+|^\s*)(\d+|[ivxlcdm]+)[\.\-\–\—\:\s]/i);
              if (lineNumMatch && lineNumMatch[1].toLowerCase() === numStr) {
                matchesSpecificChapterNumber = true;
              }
            }

            if (
              matchesFullTitle ||
              matchesAllKeywords ||
              matchesSingleKeyword ||
              matchesSpecificChapterNumber
            ) {
              matchedLine = line;
              break;
            }
          }

          if (matchedLine) {
            // Physical top of the header in viewport space (distance from page top)
            const headerTopY = viewport.height - (matchedLine.yFromBottom + matchedLine.height);

            // If header is at the top of the page (<= 12% of page height), previous chapter simply ends on page before
            if (headerTopY / viewport.height <= 0.12) {
              curr.endPage = Math.max(curr.startPage, sharedPageNum - 1);
            } else {
              // 1. Cierre del capítulo anterior (Parte 1/2):
              // Corta 8px antes del inicio del nuevo capítulo para no mostrar nada del título
              const endCutY = Math.max(20, headerTopY - 8);
              curr.endItemIndex = Math.max(0, matchedLine.firstItemIndex - 1);
              curr.endSplitFractionY = Math.max(0.05, Math.min(0.95, endCutY / viewport.height));

              // 2. Inicio del nuevo capítulo (Parte 2/2):
              // Desplaza hasta 6px antes del título, eliminando cualquier residuo del párrafo anterior
              const startCutY = Math.max(0, headerTopY - 6);
              next.startItemIndex = matchedLine.firstItemIndex;
              next.startSplitFractionY = Math.max(0.0, Math.min(0.95, startCutY / viewport.height));
            }
          }
        }
      } catch (err) {
        console.warn(`Error calculating shared page split for page ${sharedPageNum}:`, err);
      }
    }
  }

  return chapters;
}

/**
 * Merges consecutive multiline headers on the same page and consolidates chapters with < 60 words.
 */
export async function mergeSmallAndMultiLineChapters(
  pdfDocument: PDFDocumentProxy,
  chapters: Chapter[]
): Promise<Chapter[]> {
  if (chapters.length <= 1) return chapters;

  // 1. First pass: Merge same-page consecutive entries (e.g. "El cónsul de las mil vidas" and "Samuel del Campo" on p. 5)
  const mergedSamePage: Chapter[] = [];
  for (let i = 0; i < chapters.length; i++) {
    const curr = chapters[i];
    const next = chapters[i + 1];

    if (curr.items && curr.items.length > 0) {
      curr.items = await mergeSmallAndMultiLineChapters(pdfDocument, curr.items);
    }

    if (next && curr.startPage === next.startPage && (!curr.items || curr.items.length === 0)) {
      try {
        const text = await extractChapterText(
          pdfDocument,
          curr.startPage,
          curr.endPage,
          curr.startItemIndex,
          curr.endItemIndex
        );
        const wordCount = text.split(/\s+/).filter(Boolean).length;

        // If curr is just a subtitle/heading fragment (< 60 words on the same start page)
        if (wordCount < 60) {
          next.title = `${curr.title}: ${next.title}`;
          continue; // Absorb curr into next
        }
      } catch {
        // Ignore extraction error
      }
    }

    mergedSamePage.push(curr);
  }

  // 2. Second pass: Consolidate any tiny chapters (< 50 words) that cannot form a valid reading level
  const finalChapters: Chapter[] = [];
  for (let i = 0; i < mergedSamePage.length; i++) {
    const curr = mergedSamePage[i];
    const next = mergedSamePage[i + 1];

    if (mergedSamePage.length > 1 && (!curr.items || curr.items.length === 0)) {
      try {
        const text = await extractChapterText(
          pdfDocument,
          curr.startPage,
          curr.endPage,
          curr.startItemIndex,
          curr.endItemIndex
        );
        const wordCount = text.split(/\s+/).filter(Boolean).length;

        if (wordCount < 50) {
          if (next) {
            next.startPage = Math.min(next.startPage, curr.startPage);
            next.title = `${curr.title} - ${next.title}`;
            continue;
          } else if (finalChapters.length > 0) {
            const prev = finalChapters[finalChapters.length - 1];
            prev.endPage = Math.max(prev.endPage, curr.endPage);
            continue;
          }
        }
      } catch {
        // Ignore extraction error
      }
    }

    finalChapters.push(curr);
  }

  return finalChapters;
}
