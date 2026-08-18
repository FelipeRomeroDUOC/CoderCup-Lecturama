export interface Chapter {
  id: string;
  title: string;
  pageNumber: number;
  items?: Chapter[];
}

export interface PdfDocumentInfo {
  numPages: number;
  title?: string;
  author?: string;
}
