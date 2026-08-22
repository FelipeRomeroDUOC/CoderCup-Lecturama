import type { PDFDocumentProxy } from "pdfjs-dist";

export interface StoredBook {
  id: string;
  fileName: string;
  displayTitle: string;
  fileBlob: Blob;
  fileSize: number;
  coverDataUrl?: string;
  totalPages?: number;
  lastReadPage?: number;
  lastReadAt: number;
  createdAt: number;
}

const DB_NAME = "lecturama_library_db";
const DB_VERSION = 1;
const STORE_NAME = "books";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("IndexedDB is only available in browser environments."));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("lastReadAt", "lastReadAt", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Retrieve all saved books ordered by last read timestamp (descending).
 */
export async function getAllStoredBooks(): Promise<StoredBook[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const books = (request.result as StoredBook[]) || [];
        books.sort((a, b) => b.lastReadAt - a.lastReadAt);
        resolve(books);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn("Error fetching books from IndexedDB:", err);
    return [];
  }
}

/**
 * Save or update a book in IndexedDB.
 */
export async function saveStoredBook(book: StoredBook): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(book);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn("Error saving book to IndexedDB:", err);
  }
}

/**
 * Delete a book from IndexedDB.
 */
export async function deleteStoredBook(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn("Error deleting book from IndexedDB:", err);
  }
}

/**
 * Update the last read page and timestamp for an existing book.
 */
export async function updateBookProgress(
  id: string,
  lastReadPage: number
): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const existing = getRequest.result as StoredBook | undefined;
      if (existing) {
        existing.lastReadPage = lastReadPage;
        existing.lastReadAt = Date.now();
        store.put(existing);
      }
    };
  } catch (err) {
    console.warn("Could not update book progress in IndexedDB:", err);
  }
}

/**
 * Clean and format a filename into a legible book title fallback.
 */
export function formatFallbackTitle(fileName: string): string {
  let clean = fileName.replace(/\.pdf$/i, "");
  // Replace underscores and hyphens with spaces
  clean = clean.replace(/[_-]+/g, " ");
  // Remove common artifacts like (1), [PDF], etc.
  clean = clean.replace(/\[.*?\]|\(.*?\)/g, "").trim();
  // Capitalize first letters
  return clean
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Safe client-side extraction of book title and first-page cover thumbnail
 * directly from an already loaded PDFDocumentProxy (zero race conditions).
 */
export async function extractMetaAndCoverFromPdf(
  pdf: PDFDocumentProxy,
  fileName: string
): Promise<{
  displayTitle: string;
  coverDataUrl?: string;
}> {
  let displayTitle = "";

  // 1. Try reading PDF metadata
  try {
    const metadata = await pdf.getMetadata();
    const metaTitle = (metadata?.info as Record<string, unknown>)?.Title;
    if (typeof metaTitle === "string" && metaTitle.trim().length > 2) {
      const trimmed = metaTitle.trim();
      if (!/^untitled|^document|^microsoft word/i.test(trimmed)) {
        displayTitle = trimmed;
      }
    }
  } catch {
    // Ignore metadata read error
  }

  // 2. Render Page 1 to canvas for cover thumbnail and text scraping
  let coverDataUrl: string | undefined = undefined;
  try {
    const page1 = await pdf.getPage(1);

    // If title not found in metadata, try first page text
    if (!displayTitle) {
      try {
        const textContent = await page1.getTextContent();
        const items = textContent.items as Array<{ str?: string }>;
        const lines = items
          .map((it) => it.str?.trim() || "")
          .filter((str) => str.length > 2 && !/^\d+$|^p[aá]gina/i.test(str));

        if (lines.length > 0) {
          displayTitle = lines.slice(0, 2).join(" ");
          if (displayTitle.length > 60) {
            displayTitle = displayTitle.slice(0, 60) + "...";
          }
        }
      } catch {
        // Ignore text extraction error
      }
    }

    // Render cover thumbnail on a canvas
    if (typeof document !== "undefined") {
      const unscaledViewport = page1.getViewport({ scale: 1.0 });
      const targetWidth = 240;
      const scale = targetWidth / unscaledViewport.width;
      const viewport = page1.getViewport({ scale });

      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        await page1.render({
          canvasContext: ctx,
          canvas,
          viewport,
        }).promise;
        coverDataUrl = canvas.toDataURL("image/jpeg", 0.8);
      }
    }
  } catch (err) {
    console.warn("Could not generate page 1 cover thumbnail:", err);
  }

  // 3. Fallback to cleaned filename
  if (!displayTitle || displayTitle.trim().length < 2) {
    displayTitle = formatFallbackTitle(fileName);
  }

  return {
    displayTitle,
    coverDataUrl,
  };
}
