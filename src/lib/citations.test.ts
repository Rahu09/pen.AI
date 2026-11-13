import { describe, expect, it } from "vitest";
import { citationHref, linkCitations, pageFromHref } from "./citations";

describe("linkCitations", () => {
  it("turns a [p. N] citation into a link to that page", () => {
    expect(linkCitations("It opened in 1964 [p. 2].")).toBe(
      "It opened in 1964 [p. 2](#page-2)."
    );
  });

  it("accepts the spellings the model or older answers use", () => {
    expect(linkCitations("[Page 1] A [p 3] B [p.4] C [page 5]")).toBe(
      "[p. 1](#page-1) A [p. 3](#page-3) B [p. 4](#page-4) C [p. 5](#page-5)"
    );
  });

  it("leaves other bracketed text alone", () => {
    const text = "See [the appendix] and [1] and [p. x].";
    expect(linkCitations(text)).toBe(text);
  });
});

describe("pageFromHref", () => {
  it("reads the page back from a citation link", () => {
    expect(pageFromHref(citationHref(12))).toBe(12);
  });

  it("returns null for any other link", () => {
    expect(pageFromHref("https://example.com")).toBeNull();
    expect(pageFromHref("#page-")).toBeNull();
    expect(pageFromHref(undefined)).toBeNull();
  });
});
