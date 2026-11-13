import { ArrowUp } from "lucide-react";
import { Icons } from "@/components/Icons";
import { cn } from "@/lib/utils";

const PAGE_LINES = [
  { text: "3. Descaling", heading: true },
  { text: "Limescale builds up with use and slows the kettle down." },
  {
    text: "Descale the kettle every three months, or monthly in hard water areas.",
    match: true,
  },
  {
    text: "Fill it with one part white vinegar to two parts water. Leave the mix for one hour, then boil, empty and rinse three times.",
    match: true,
  },
  { text: "Do not use abrasive cleaners on the heating plate." },
  { text: "4. Warranty and support", heading: true },
  { text: "The K200 is covered for 24 months from the date of purchase." },
  { text: "Keep your receipt. Support is reached through the website." },
];

/**
 * A picture of the product, drawn in HTML: a page of the PDF lying on the
 * desk with the found passage highlighted, and the chat laid over it. Two
 * handwritten margin notes say what is going on. The page stays white in
 * dark mode, as PDF pages do in the app. It is an illustration, so
 * it is hidden from screen readers; the page copy says the same in words.
 */
export function ProductPreview({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative mx-auto grid max-w-5xl select-none text-left md:grid-cols-[1.05fr_1fr]",
        className
      )}
    >
      {/* the page */}
      <div className="relative md:-rotate-[1.5deg]">
        <div className="relative rounded-sm bg-white px-7 pb-6 pt-7 font-serif text-[1.05rem] leading-snug text-zinc-700 shadow-paper sm:px-9 sm:pt-9">
          <p className="font-sans text-[0.65rem] uppercase tracking-[0.2em] text-zinc-400">
            Kettle K200 · User manual
          </p>
          <div className="mt-4 space-y-2.5">
            {PAGE_LINES.map((line) =>
              line.heading ? (
                <p
                  key={line.text}
                  className="pt-1 text-xl text-zinc-950"
                >
                  {line.text}
                </p>
              ) : (
                <p key={line.text}>
                  {line.match ? (
                    <span className="marker text-zinc-950">{line.text}</span>
                  ) : (
                    line.text
                  )}
                </p>
              )
            )}
          </div>
          <p className="mt-6 text-right font-sans text-xs tabular-nums text-zinc-400">
            3
          </p>
          {/* folded corner */}
          <span className="absolute right-0 top-0 h-6 w-6 bg-[linear-gradient(225deg,#e9d5ff_50%,#f4f4f5_50%)] shadow-[-1px_1px_2px_rgb(0_0_0/0.06)]" />
        </div>

        <MarginNote className="-left-44 top-36 hidden w-40 -rotate-6 text-right xl:block">
          the passage it answered from
          <HandArrow className="ml-auto mt-1 h-8 w-16 -scale-x-100 rotate-[200deg]" />
        </MarginNote>
      </div>

      {/* the chat */}
      <div className="relative z-10 -mt-12 ml-6 mr-2 md:-ml-16 md:mr-0 md:mt-24">
        <div className="overflow-hidden rounded-xl border bg-card shadow-paper-lifted">
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <span className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />
            <span className="truncate text-xs font-medium text-muted-foreground">
              Kettle K200 user manual.pdf
            </span>
          </div>

          <div className="space-y-3 p-4 text-sm">
            <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2 text-primary-foreground">
              How often should I descale it?
            </div>
            <div className="flex items-end gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground">
                <Icons.logo className="h-3.5 w-3.5 fill-background" />
              </span>
              <div className="max-w-[88%] rounded-2xl rounded-bl-sm bg-muted px-3.5 py-2 text-foreground">
                Every three months, or monthly if your water is hard. Use one
                part white vinegar to two parts water, leave it an hour, then
                boil, empty and rinse three times.
                <span className="mt-1.5 block text-xs text-muted-foreground">
                  From page 3
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 border-t px-4 py-3 text-sm text-muted-foreground">
            Ask about this PDF…
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background">
              <ArrowUp className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>

        <MarginNote className="-right-40 bottom-10 hidden w-36 rotate-3 xl:block">
          <HandArrow className="mb-1 h-8 w-14 rotate-[160deg]" />
          and says so when it isn&apos;t in there
        </MarginNote>
      </div>
    </div>
  );
}

function MarginNote({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "absolute font-hand text-2xl leading-none text-foreground/75",
        className
      )}
    >
      {children}
    </div>
  );
}

/** A loose, hand-drawn arrow. Points right before rotation. */
function HandArrow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("block text-foreground/60", className)}
    >
      <path d="M3 22 C 16 6, 38 4, 58 14" />
      <path d="M50 7 L 59 14 L 49 19" />
    </svg>
  );
}
