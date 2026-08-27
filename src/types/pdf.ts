export interface Chapter {
  id: string;
  title: string;
  pageNumber: number; // Start page
  startPage: number;
  endPage: number;
  items?: Chapter[];
  startItemIndex?: number;
  endItemIndex?: number;
  splitFractionY?: number;
  partIndex?: number;
  totalParts?: number;
}

export interface PdfDocumentInfo {
  numPages: number;
  title?: string;
  author?: string;
}
