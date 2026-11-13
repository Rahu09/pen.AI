import { afterEach, describe, expect, it, vi } from "vitest";
import { PLANS, formatPrice, getPlan, startOfQuotaPeriod } from "./stripe";

describe("PLANS", () => {
  it("gives Pro more of every limit than Free", () => {
    const free = getPlan(false);
    const pro = getPlan(true);

    expect(free.slug).toBe("free");
    expect(pro.slug).toBe("pro");
    expect(pro.quota).toBeGreaterThan(free.quota);
    expect(pro.pagesPerPdf).toBeGreaterThan(free.pagesPerPdf);
    expect(pro.maxFileSizeMb).toBeGreaterThan(free.maxFileSizeMb);
    // "Higher-quality answers" on the pricing page rests on these two.
    expect(pro.retrievalTopK).toBeGreaterThan(free.retrievalTopK);
    expect(pro.historyMessages).toBeGreaterThan(free.historyMessages);
  });

  it("shows prices in rupees without decimals", () => {
    expect(formatPrice(getPlan(false))).toBe("₹0");
    expect(formatPrice(getPlan(true))).toBe("₹199");
  });

  it("matches the UploadThing size limits (4 MB and 16 MB in core.ts)", () => {
    // The uploader sizes in src/app/api/uploadthing/core.ts are literal
    // strings UploadThing needs at build time, so they cannot read PLANS.
    // This test is what keeps the two in step.
    expect(PLANS.map((p) => p.maxFileSizeMb)).toEqual([4, 16]);
  });

  it("has a Stripe price for Pro", () => {
    expect(getPlan(true).price.priceIds.test).toMatch(/^price_/);
  });
});

describe("startOfQuotaPeriod", () => {
  afterEach(() => vi.useRealTimers());

  it("is midnight UTC on the first of the current month", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-13T18:30:00Z"));

    expect(startOfQuotaPeriod().toISOString()).toBe("2026-11-01T00:00:00.000Z");
  });

  it("uses the UTC month, not the local one, at a month boundary", () => {
    vi.useFakeTimers();
    // Still 31 December in UTC, already 1 January in India (UTC+5:30).
    vi.setSystemTime(new Date("2026-12-31T20:00:00Z"));

    expect(startOfQuotaPeriod().toISOString()).toBe("2026-12-01T00:00:00.000Z");
  });
});
