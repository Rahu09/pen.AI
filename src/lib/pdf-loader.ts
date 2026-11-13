import { BaseDocumentLoader } from "@langchain/core/document_loaders/base";
import { Document } from "@langchain/core/documents";

/**
 * Turns a PDF into one LangChain Document per page.
 *
 * LangChain's own PDF loader lived in @langchain/community, which its
 * maintainers have retired, so this is a small loader built on the same base
 * class. It reads text with the copy of pdf.js that ships inside pdf-parse.
 *
 * Each Document carries `metadata.pageNumber`, which follows the text through
 * splitting and embedding so an answer can be traced back to a page.
 */
export class PdfPageLoader extends BaseDocumentLoader {
  /** Number of pages in the PDF, including pages with no text. Set by load(). */
  totalPages = 0;

  constructor(private readonly blob: Blob) {
    super();
  }

  async load(): Promise<Document[]> {
    // Imported from the inner path on purpose: pdf-parse's index file runs
    // debug code when it is imported directly.
    const pdfjsModule = await import(
      "pdf-parse/lib/pdf.js/v1.10.100/build/pdf.js"
    );
    // CommonJS module: depending on the bundler the exports are on the module
    // itself or on `.default`.
    const pdfjs =
      (pdfjsModule as unknown as { default?: typeof pdfjsModule }).default ??
      pdfjsModule;

    const data = new Uint8Array(await this.blob.arrayBuffer());
    const pdf = await pdfjs.getDocument({
      data,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    }).promise;

    this.totalPages = pdf.numPages;

    const documents: Document[] = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const { items } = await page.getTextContent();

      // pdf.js returns text as positioned fragments. Fragments on the same
      // line share a vertical position; a change means a new line.
      let lastY: number | undefined;
      let text = "";
      for (const item of items) {
        const y = item.transform[5];
        if (lastY !== undefined && y !== lastY) text += "\n";
        text += item.str;
        lastY = y;
      }

      // Scanned or image-only pages have no text layer.
      if (text.trim().length === 0) continue;

      documents.push(
        new Document({
          pageContent: text,
          metadata: { pageNumber, totalPages: pdf.numPages },
        })
      );
    }

    return documents;
  }
}
