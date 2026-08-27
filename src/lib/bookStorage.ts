import type { PDFDocumentProxy } from "pdfjs-dist";

export interface StoredBook {
  id: string;
  fileName: string;
  displayTitle: string;
  author?: string;
  fileBlob: Blob;
  fileSize: number;
  coverDataUrl?: string;
  totalPages?: number;
  totalChapters?: number;
  lastReadPage?: number;
  lastReadChapterId?: string;
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
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const books = (request.result as StoredBook[]) || [];
        books.sort((a, b) => b.lastReadAt - a.lastReadAt);
        resolve(books);
      };

      request.onerror = (e) => {
        console.warn("IndexedDB getAll request error:", request.error || e);
        resolve([]);
      };

      transaction.onerror = (e) => {
        console.warn("IndexedDB getAll transaction error:", transaction.error || e);
        resolve([]);
      };
    });
  } catch (err) {
    console.warn("Error fetching books from IndexedDB:", err);
    return [];
  }
}

/**
 * Save or update a book in IndexedDB safely by merging existing record.
 */
export async function saveStoredBook(book: StoredBook): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      transaction.oncomplete = () => resolve();
      transaction.onerror = (e) => {
        console.warn("IndexedDB save transaction error:", transaction.error || e);
        resolve();
      };
      transaction.onabort = (e) => {
        console.warn("IndexedDB save transaction aborted:", transaction.error || e);
        resolve();
      };

      const getReq = store.get(book.id);
      getReq.onsuccess = () => {
        const existing = getReq.result as StoredBook | undefined;
        const merged: StoredBook = {
          id: book.id,
          fileName: book.fileName || existing?.fileName || book.id,
          displayTitle: book.displayTitle || existing?.displayTitle || book.fileName || "Libro",
          author: book.author || existing?.author,
          fileBlob: book.fileBlob || existing?.fileBlob || new Blob(),
          fileSize: book.fileSize || existing?.fileSize || 0,
          coverDataUrl: book.coverDataUrl || existing?.coverDataUrl,
          totalPages: book.totalPages || existing?.totalPages,
          totalChapters: book.totalChapters || existing?.totalChapters,
          lastReadPage: book.lastReadPage || existing?.lastReadPage || 1,
          lastReadAt: book.lastReadAt || existing?.lastReadAt || Date.now(),
          createdAt: existing?.createdAt || book.createdAt || Date.now(),
        };
        store.put(merged);
      };
      getReq.onerror = () => {
        store.put(book);
      };
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
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      transaction.oncomplete = () => resolve();
      transaction.onerror = (e) => {
        console.warn("IndexedDB delete transaction error:", transaction.error || e);
        resolve();
      };
      transaction.onabort = (e) => {
        console.warn("IndexedDB delete transaction aborted:", transaction.error || e);
        resolve();
      };

      store.delete(id);
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
  lastReadPage: number,
  lastReadChapterId?: string
): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => resolve();
      transaction.onabort = () => resolve();

      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const existing = getRequest.result as StoredBook | undefined;
        if (existing) {
          existing.lastReadPage = lastReadPage;
          if (lastReadChapterId) {
            existing.lastReadChapterId = lastReadChapterId;
          }
          existing.lastReadAt = Date.now();
          store.put(existing);
        }
      };
      getRequest.onerror = () => resolve();
    });
  } catch (err) {
    console.warn("Error updating book progress in IndexedDB:", err);
  }
}

/**
 * Update the total chapters detected for an existing book.
 */
export async function updateBookChapterCount(
  id: string,
  totalChapters: number
): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => resolve();
      transaction.onabort = () => resolve();

      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const existing = getRequest.result as StoredBook | undefined;
        if (existing && existing.totalChapters !== totalChapters) {
          existing.totalChapters = totalChapters;
          store.put(existing);
        }
      };
    });
  } catch (err) {
    console.warn("Could not update book chapter count in IndexedDB:", err);
  }
}

/**
 * Clean and format a filename into a legible book title and optional author.
 */
export function parseFilenameTitleAndAuthor(fileName: string): {
  title: string;
  author?: string;
} {
  let clean = fileName.replace(/\.pdf$/i, "");
  clean = clean.replace(/\[.*?\]|\(.*?\)/g, "").trim();

  // If separated by '-' (e.g. "Cuentos_de_la_selva-Horacio_Quiroga")
  if (clean.includes("-")) {
    const parts = clean.split("-").map((p) =>
      p
        .replace(/[_-]+/g, " ")
        .trim()
        .split(" ")
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    );

    if (parts.length >= 2) {
      return {
        title: parts[0],
        author: parts.slice(1).join(" - "),
      };
    }
  }

  const formatted = clean
    .replace(/[_-]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    title: formatted || "Libro sin título",
  };
}

export function formatFallbackTitle(fileName: string): string {
  return parseFilenameTitleAndAuthor(fileName).title;
}

/**
 * Safe client-side extraction of book title, author and first-page cover thumbnail
 * directly from an already loaded PDFDocumentProxy (zero race conditions).
 */
export async function extractMetaAndCoverFromPdf(
  pdf: PDFDocumentProxy,
  fileName: string
): Promise<{
  displayTitle: string;
  author?: string;
  coverDataUrl?: string;
}> {
  const fallback = parseFilenameTitleAndAuthor(fileName);
  let displayTitle = "";
  let author: string | undefined = fallback.author;

  // 1. Try reading PDF metadata
  try {
    const metadata = await pdf.getMetadata();
    const info = metadata?.info as Record<string, unknown> | undefined;
    const metaTitle = info?.Title;
    const metaAuthor = info?.Author || info?.Creator;

    if (typeof metaTitle === "string" && metaTitle.trim().length > 2) {
      const trimmed = metaTitle.trim();
      if (!/^untitled|^document|^microsoft word/i.test(trimmed)) {
        displayTitle = trimmed;
      }
    }

    if (typeof metaAuthor === "string" && metaAuthor.trim().length > 2) {
      const trimmedAuthor = metaAuthor.trim();
      if (!/^anonymous|^desconocido|^microsoft|^adobe|^calibre/i.test(trimmedAuthor)) {
        author = trimmedAuthor;
      }
    }
  } catch {
    // Ignore metadata read error
  }

  // 2. Render Page 1 to canvas for cover thumbnail and text scraping
  let coverDataUrl: string | undefined = undefined;
  try {
    const page1 = await pdf.getPage(1);

    try {
      const textContent = await page1.getTextContent();
      const items = textContent.items as Array<{ str?: string }>;
      const lines = items
        .map((it) => it.str?.trim() || "")
        .filter((str) => str.length > 1 && !/^\d+$|^p[aá]gina/i.test(str));

      if (!displayTitle && lines.length > 0) {
        displayTitle = lines.slice(0, 2).join(" ");
        if (displayTitle.length > 60) {
          displayTitle = displayTitle.slice(0, 60) + "...";
        }
      }

      if (!author && lines.length >= 2) {
        const candidateAuthor = lines.find(
          (l) =>
            l !== displayTitle &&
            l.length > 3 &&
            l.length < 35 &&
            /^[A-ZÁÉÍÓÚÑ]/.test(l) &&
            !/editorial|tomo|edici[oó]n|volumen|cap[ií]tulo/i.test(l)
        );
        if (candidateAuthor) {
          author = candidateAuthor;
        }
      }
    } catch {
      // Ignore text extraction error
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
    displayTitle = fallback.title;
  }

  return {
    displayTitle,
    author,
    coverDataUrl,
  };
}
