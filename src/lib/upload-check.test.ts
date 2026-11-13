import { describe, expect, it } from "vitest";
import { checkPdf, describeFailure } from "./upload-check";

describe("checkPdf", () => {
  it("accepts a PDF within the page limit that has text", () => {
    expect(checkPdf({ totalPages: 5, pagesWithText: 5, pagesPerPdf: 5 })).toBeNull();
  });

  it("refuses a PDF over the page limit", () => {
    expect(checkPdf({ totalPages: 6, pagesWithText: 6, pagesPerPdf: 5 })).toBe(
      "TOO_MANY_PAGES"
    );
  });

  it("refuses a PDF with no text (a scan)", () => {
    expect(checkPdf({ totalPages: 3, pagesWithText: 0, pagesPerPdf: 5 })).toBe(
      "NO_TEXT"
    );
  });

  it("reports the page limit first when both apply", () => {
    expect(checkPdf({ totalPages: 9, pagesWithText: 0, pagesPerPdf: 5 })).toBe(
      "TOO_MANY_PAGES"
    );
  });
});

describe("describeFailure", () => {
  const free = { pagesPerPdf: 5, proPagesPerPdf: 25, isSubscribed: false };

  it("names the page count and offers Pro when Pro would accept the PDF", () => {
    const result = describeFailure("TOO_MANY_PAGES", { ...free, pageCount: 12 });

    expect(result.description).toContain("12 pages");
    expect(result.description).toContain("allows 5");
    expect(result.upgradeHelps).toBe(true);
  });

  it("does not offer Pro when the PDF is too long for Pro as well", () => {
    expect(
      describeFailure("TOO_MANY_PAGES", { ...free, pageCount: 40 }).upgradeHelps
    ).toBe(false);
  });

  it("does not offer Pro to a subscriber", () => {
    expect(
      describeFailure("TOO_MANY_PAGES", {
        pageCount: 40,
        pagesPerPdf: 25,
        proPagesPerPdf: 25,
        isSubscribed: true,
      }).upgradeHelps
    ).toBe(false);
  });

  it("explains a scanned PDF", () => {
    expect(describeFailure("NO_TEXT", { ...free, pageCount: 3 }).title).toBe(
      "No text found in this PDF"
    );
  });

  it("falls back for files that failed before reasons were stored", () => {
    expect(describeFailure(null, { ...free, pageCount: null }).title).toBe(
      "This PDF couldn't be processed"
    );
  });
});
