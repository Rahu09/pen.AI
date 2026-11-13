"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// The original pen.AI hero colours (periwinkle to lilac base, five drifting
// blobs). Kept exactly; see docs/DESIGN.md, "Colour".
const BLOBS = [
  { color: "18 113 255", origin: "center", animation: "animate-first", opacity: 1 },
  { color: "221 74 255", origin: "calc(50% - 400px)", animation: "animate-second", opacity: 1 },
  { color: "100 220 255", origin: "calc(50% + 400px)", animation: "animate-third", opacity: 1 },
  { color: "200 50 50", origin: "calc(50% - 200px)", animation: "animate-fourth", opacity: 0.7 },
  { color: "140 0 160", origin: "calc(50% - 800px) calc(50% + 800px)", animation: "animate-fifth", opacity: 1 },
];

/**
 * The moving gradient behind the hero and the app header.
 *
 * Each blob is a radial gradient that drifts on its own 20 to 40 second CSS
 * loop; the blobs are blended with `hard-light` and blurred together. With
 * `interactive`, one more blob eases towards the pointer. Its position is
 * written straight to a CSS variable from a requestAnimationFrame loop, so
 * React does not re-render on every mouse move.
 *
 * Under prefers-reduced-motion nothing moves. In dark mode the base turns
 * deep indigo and the blobs are dimmed.
 */
export function Aurora({
  children,
  className,
  interactive = false,
  intensity = 1,
}: {
  children?: ReactNode;
  className?: string;
  interactive?: boolean;
  /** 0 to 1; lowers the blob opacity, for quieter backgrounds */
  intensity?: number;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!interactive) return;
    const root = rootRef.current;
    const blob = pointerRef.current;
    if (!root || !blob) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let x = 0;
    let y = 0;
    let targetX = 0;
    let targetY = 0;

    const tick = () => {
      x += (targetX - x) / 20;
      y += (targetY - y) / 20;
      blob.style.transform = `translate(${x}px, ${y}px)`;
      frame =
        Math.abs(targetX - x) > 0.5 || Math.abs(targetY - y) > 0.5
          ? requestAnimationFrame(tick)
          : 0;
    };

    const onMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      targetX = event.clientX - rect.left;
      targetY = event.clientY - rect.top;
      if (!frame) frame = requestAnimationFrame(tick);
    };

    root.addEventListener("pointermove", onMove);
    return () => {
      root.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, [interactive]);

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative isolate overflow-hidden bg-[linear-gradient(40deg,#c7d2fe,#e9d5ff)] dark:bg-[linear-gradient(40deg,#1e1b4b,#2e1065)]",
        className
      )}
    >
      <div
        aria-hidden="true"
        // at night the same blobs glow on indigo; brightness keeps them
        // from washing out the text
        className="pointer-events-none absolute inset-0 -z-10 blur-3xl dark:brightness-[0.6] dark:saturate-[1.2]"
        style={{ opacity: intensity }}
      >
        {BLOBS.map((blob) => (
          <div
            key={blob.color}
            className={cn(
              "absolute left-[10%] top-[10%] h-[80%] w-[80%] mix-blend-hard-light motion-reduce:animate-none",
              blob.animation
            )}
            style={
              {
                opacity: blob.opacity,
                transformOrigin: blob.origin,
                background: `radial-gradient(circle at center, rgb(${blob.color} / 0.8) 0, rgb(${blob.color} / 0) 50%) no-repeat`,
              } as CSSProperties
            }
          />
        ))}
        {interactive ? (
          <div
            ref={pointerRef}
            className="absolute -left-1/2 -top-1/2 h-full w-full opacity-70 mix-blend-hard-light"
            style={{
              background:
                "radial-gradient(circle at center, rgb(140 0 160 / 0.8) 0, rgb(140 0 160 / 0) 50%) no-repeat",
            }}
          />
        ) : null}
      </div>
      {children}
    </div>
  );
}
