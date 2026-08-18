import type { PDFDocumentProxy } from "pdfjs-dist";

interface TextItem {
  str: string;
  hasEOL?: boolean;
}

/**
 * Extracts plain text from a range of pages in a PDF document.
 * Concatenates lines and paragraphs cleanly.
 */
export async function extractChapterText(
  pdf: PDFDocumentProxy,
  startPage: number,
  endPage: number
): Promise<string> {
  const textBlocks: string[] = [];
  const safeStart = Math.max(1, startPage);
  const safeEnd = Math.min(pdf.numPages, endPage);

  for (let pageNum = safeStart; pageNum <= safeEnd; pageNum++) {
    try {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      const pageStrings: string[] = [];

      for (const item of textContent.items) {
        if ("str" in item) {
          const textItem = item as TextItem;
          pageStrings.push(textItem.str);
          if (textItem.hasEOL) {
            pageStrings.push("\n");
          } else {
            pageStrings.push(" ");
          }
        }
      }

      const rawPageText = pageStrings.join("").trim();
      if (rawPageText.length > 0) {
        textBlocks.push(rawPageText);
      }
    } catch (err) {
      console.warn(`No se pudo extraer texto de la página ${pageNum}:`, err);
    }
  }

  // Join pages with double newlines and normalize multiple spaces
  return textBlocks
    .join("\n\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}
