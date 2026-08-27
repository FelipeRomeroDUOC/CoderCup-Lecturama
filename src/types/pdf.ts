export interface Chapter {
  id: string;
  title: string;
  pageNumber: number; // Start page
  startPage: number;
  endPage: number;
  items?: Chapter[];
  startItemIndex?: number;
  startSplitFractionY?: number;
  endItemIndex?: number;
  endSplitFractionY?: number;
}

export interface PdfDocumentInfo {
  numPages: number;
  title?: string;
  author?: string;
}
