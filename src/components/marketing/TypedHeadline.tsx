import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

type Word = {
  text: string;
  accent?: boolean;
  /** start a new line after this word on screens from `sm` up */
  breakAfter?: boolean;
};

const LETTER_MS = 45;
const START_MS = 350;

/**
 * The hero headline, typed out letter by letter with a blue caret, the way
 * the original pen.AI page did it, and then the accent word is underlined
 * by hand.
 *
 * No JavaScript runs: every letter is in the HTML from the start (so the
 * layout never shifts and search engines see the text) and is hidden until
 * its own CSS animation delay. A second, one-letter-long animation draws the
 * caret on the letter being typed, so the caret travels along the line.
 * Screen readers get the plain sentence from `aria-label`.
 */
export function TypedHeadline({
  words,
  className,
}: {
  words: Word[];
  className?: string;
}) {
  let index = 0;
  const totalLetters = words.reduce((sum, w) => sum + w.text.length, 0);
  const doneMs = START_MS + totalLetters * LETTER_MS;

  return (
    <h1
      aria-label={words.map((w) => w.text).join(" ")}
      className={cn("font-serif tracking-[-0.01em]", className)}
    >
      {words.map((word, w) => (
        <span key={w} aria-hidden="true">
          <span
            className={cn(
              "relative inline-block whitespace-nowrap",
              word.accent && "italic text-primary"
            )}
          >
            {Array.from(word.text).map((letter, l) => {
              const delay = START_MS + index++ * LETTER_MS;
              return (
                <span
                  key={l}
                  className="motion-reduce:![animation:none]"
                  style={
                    {
                      animation: `type-in 1ms linear ${delay}ms both, caret-pass ${LETTER_MS}ms linear ${delay}ms`,
                    } as CSSProperties
                  }
                >
                  {letter}
                </span>
              );
            })}
            {word.accent ? <InkUnderline delayMs={doneMs + 150} /> : null}
          </span>
          {w < words.length - 1 ? " " : null}
          {word.breakAfter ? <br className="hidden sm:inline" /> : null}
        </span>
      ))}
      <span
        aria-hidden="true"
        className="ml-1 inline-block h-[0.8em] w-[0.06em] translate-y-[0.08em] bg-primary motion-reduce:hidden"
        // hidden until the last letter is typed, then blinks
        style={{
          animation: `type-in 1ms linear ${doneMs}ms both, caret 1s step-end ${doneMs}ms infinite`,
        }}
      />
    </h1>
  );
}

/**
 * A pen stroke under a word. `pathLength="1"` lets the dash maths work in
 * fractions of the path, so the draw animation is the same for any width.
 */
export function InkUnderline({
  delayMs = 0,
  className,
}: {
  delayMs?: number;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 300 24"
      preserveAspectRatio="none"
      className={cn(
        "pointer-events-none absolute -bottom-[0.12em] left-[-2%] h-[0.28em] w-[104%] overflow-visible text-primary/70",
        className
      )}
    >
      <path
        d="M3 15 C 60 7, 130 5, 196 9 S 280 15, 297 8"
        pathLength={1}
        fill="none"
        stroke="currentColor"
        strokeWidth={5}
        strokeLinecap="round"
        strokeDasharray="1"
        className="motion-reduce:![animation:none] motion-reduce:![stroke-dashoffset:0]"
        style={{
          strokeDashoffset: 1,
          animation: `draw 0.7s cubic-bezier(0.6, 0, 0.3, 1) ${delayMs}ms forwards`,
        }}
      />
    </svg>
  );
}
