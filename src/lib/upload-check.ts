import type { UploadFailure } from "@/generated/prisma/client";

/**
 * Decides whether a read PDF can be processed on the user's plan, before
 * anything is spent on embeddings. Returns why not, or null if it can.
 */
export function checkPdf({
  totalPages,
  pagesWithText,
  pagesPerPdf,
}: {
  totalPages: number;
  /** Pages that produced any text. A scanned PDF has none. */
  pagesWithText: number;
  pagesPerPdf: number;
}): UploadFailure | null {
  if (totalPages > pagesPerPdf) return "TOO_MANY_PAGES";
  if (pagesWithText === 0) return "NO_TEXT";
  return null;
}

/**
 * What the app tells the user about a failed upload. `upgradeHelps` is true
 * when the Pro plan would accept this PDF, so the screen can offer it.
 */
export function describeFailure(
  reason: UploadFailure | null,
  {
    pageCount,
    pagesPerPdf,
    proPagesPerPdf,
    isSubscribed,
  }: {
    pageCount: number | null;
    pagesPerPdf: number;
    proPagesPerPdf: number;
    isSubscribed: boolean;
  }
): { title: string; description: string; upgradeHelps: boolean } {
  switch (reason) {
    case "TOO_MANY_PAGES": {
      const pages = pageCount ? `${pageCount} pages` : "more pages than your plan allows";
      const upgradeHelps =
        !isSubscribed && (pageCount === null || pageCount <= proPagesPerPdf);
      return {
        title: "This PDF is too long",
        description: `It has ${pages}; your plan allows ${pagesPerPdf} per PDF.${
          upgradeHelps ? ` Pro allows ${proPagesPerPdf}.` : ""
        } Split it into smaller files and upload those.`,
        upgradeHelps,
      };
    }
    case "NO_TEXT":
      return {
        title: "No text found in this PDF",
        description:
          "It looks like a scan or a set of images, so there is nothing to search. Upload a PDF with selectable text, or run it through OCR first.",
        upgradeHelps: false,
      };
    case "PROCESSING_ERROR":
      return {
        title: "Something went wrong while reading this PDF",
        description:
          "The file may be damaged, or a service we use was unavailable. Delete it and try uploading again.",
        upgradeHelps: false,
      };
    default:
      // Files that failed before reasons were recorded.
      return {
        title: "This PDF couldn't be processed",
        description:
          "It may have more pages than your plan allows, or contain no selectable text.",
        upgradeHelps: false,
      };
  }
}
