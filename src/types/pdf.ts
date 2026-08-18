export interface Chapter {
  id: string;
  title: string;
  pageNumber: number; // Start page
  startPage: number;
  endPage: number;
  items?: Chapter[];
}

export interface PdfDocumentInfo {
  numPages: number;
  title?: string;
  author?: string;
}
