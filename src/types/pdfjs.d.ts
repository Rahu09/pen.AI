// Minimal types for the copy of Mozilla's pdf.js that ships inside pdf-parse.
// Only what src/lib/pdf-loader.ts uses.
declare module "pdf-parse/lib/pdf.js/v1.10.100/build/pdf.js" {
  export interface PdfTextItem {
    str: string;
    // transform[5] is the item's vertical position on the page
    transform: number[];
  }

  export interface PdfPage {
    getTextContent(): Promise<{ items: PdfTextItem[] }>;
  }

  export interface PdfDocument {
    numPages: number;
    getPage(pageNumber: number): Promise<PdfPage>;
  }

  export function getDocument(source: {
    data: Uint8Array;
    useWorkerFetch?: boolean;
    isEvalSupported?: boolean;
    useSystemFonts?: boolean;
  }): { promise: Promise<PdfDocument> };
}
