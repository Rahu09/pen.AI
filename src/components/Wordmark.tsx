import { Icons } from "@/components/Icons";
import { cn } from "@/lib/utils";

/**
 * The pen.AI logo: the quill in an ink circle, and the name in the serif.
 * `tone="inverse"` swaps ink and paper, for dark backgrounds.
 */
export function Wordmark({
  showName = true,
  className,
}: {
  showName?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground">
        <Icons.logo className="h-4 w-4 fill-background" aria-hidden="true" />
      </span>
      {showName ? (
        <span className="font-serif text-[1.45rem] leading-none tracking-tight">
          pen<span className="italic text-primary">.AI</span>
        </span>
      ) : null}
    </span>
  );
}
