// Shared class strings for the public pages. The app uses the shadcn
// `buttonVariants` instead; the landing page has its own ink-and-paper look
// (docs/DESIGN.md).

const focus =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background";

/** Main call to action: an ink pill. Put `arrowNudge` on its arrow icon. */
export const inkButton = `group inline-flex items-center justify-center gap-2 rounded-full bg-foreground font-medium text-background transition-colors hover:bg-foreground/85 ${focus}`;

/** Second action, on the aurora or on paper. */
export const paperButton = `inline-flex items-center justify-center gap-2 rounded-full bg-background/60 font-medium text-foreground ring-1 ring-inset ring-foreground/10 backdrop-blur transition-colors hover:bg-background ${focus}`;

export const buttonSize = {
  sm: "h-9 px-4 text-sm",
  lg: "h-12 px-6 text-[0.95rem]",
};

export const arrowNudge =
  "h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none";

/** Page section width and gutters. */
export const section = "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8";
