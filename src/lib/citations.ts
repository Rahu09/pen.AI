/**
 * Page citations in answers.
 *
 * The chat prompt labels each retrieved passage with its page ("[Page 3]")
 * and asks the model to cite the pages it used as "[p. 3]". The model only
 * ever sees text, so a citation is text too. Here, before the answer is
 * rendered as markdown, each citation becomes a markdown link to "#page-3";
 * the message renderer turns those links into buttons that move the PDF
 * viewer to that page.
 *
 * Doing this at render time (not when the answer is saved) means stored
 * answers stay plain text, and older answers that started with a copied
 * "[Page 1]" label get working citations too.
 */

// "[p. 3]", "[p 3]", "[p.3]", "[page 3]", "[Page 3]" (case-insensitive).
const CITATION = /\[(?:p\.?|page)\s*(\d{1,4})\]/gi;

/** The href a citation link gets, and how to read the page back from it. */
export const citationHref = (page: number) => `#page-${page}`;

export function pageFromHref(href: string | undefined): number | null {
  const match = href?.match(/^#page-(\d+)$/);
  return match ? Number(match[1]) : null;
}

/** Rewrites every page citation in `text` as a markdown link. */
export function linkCitations(text: string): string {
  return text.replace(
    CITATION,
    (_whole, page: string) => `[p. ${Number(page)}](${citationHref(Number(page))})`
  );
}
