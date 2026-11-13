import { Bloom } from "@/components/marketing/Bloom";
import { cn } from "@/lib/utils";

/**
 * The layout every "something went wrong" screen shares: a handwritten note,
 * a serif headline with one italic word, a sentence, and the way out.
 * Plain markup with no hooks, so both server pages (not-found) and client
 * error boundaries can use it.
 */
export function StatusPage({
  note,
  title,
  children,
  actions,
  className,
}: {
  /** Short handwritten line above the title, e.g. "page 404". */
  note: string;
  title: React.ReactNode;
  children: React.ReactNode;
  actions: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative isolate flex flex-col items-center justify-center px-4 py-24 text-center sm:py-32",
        className
      )}
    >
      <Bloom className="top-0" />
      <p className="font-hand text-2xl text-primary -rotate-2">{note}</p>
      <h1 className="mt-2 max-w-xl text-balance font-serif text-5xl leading-tight text-foreground sm:text-6xl">
        {title}
      </h1>
      <div className="mt-5 max-w-md text-muted-foreground">{children}</div>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {actions}
      </div>
    </div>
  );
}
