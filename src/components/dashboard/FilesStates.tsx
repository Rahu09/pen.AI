import { AlertCircle, SearchX, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ViewMode } from "./types";

/** Placeholder with the same shape as the real list, so nothing jumps. */
export function FilesSkeleton({ view }: { view: ViewMode }) {
  if (view === "list") {
    return (
      <div
        className="divide-y rounded-xl border bg-card"
        aria-busy="true"
        aria-label="Loading your files"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-3">
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="hidden h-4 w-32 sm:block" />
            <Skeleton className="h-8 w-8" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
      aria-busy="true"
      aria-label="Loading your files"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border bg-card">
          <Skeleton className="aspect-[16/10] rounded-none" />
          <div className="space-y-2 p-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyFiles({ onUpload }: { onUpload: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed bg-card/70 px-6 py-16 text-center">
      <UploadCloud
        className="h-10 w-10 text-muted-foreground"
        aria-hidden="true"
      />
      <h2 className="mt-4 font-serif text-3xl">Nothing to read yet</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Upload a PDF to start asking it questions. You can also drag a file
        anywhere onto this page.
      </p>
      <Button
        className="mt-6 rounded-full bg-foreground px-5 text-background hover:bg-foreground/85"
        onClick={onUpload}
      >
        Upload your first PDF
      </Button>
    </div>
  );
}

export function NoMatches({
  query,
  onClear,
}: {
  query: string;
  onClear: () => void;
}) {
  return (
    <div role="status" className="flex flex-col items-center py-16 text-center">
      <SearchX className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
      <h2 className="mt-3 text-base font-semibold">No files match</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Nothing is named like &ldquo;{query}&rdquo;.
      </p>
      <Button variant="outline" size="sm" className="mt-4" onClick={onClear}>
        Clear search
      </Button>
    </div>
  );
}

export function FilesError({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center py-16 text-center">
      <AlertCircle
        className="h-8 w-8 text-destructive-foreground"
        aria-hidden="true"
      />
      <h2 className="mt-3 text-base font-semibold">
        Your files couldn&apos;t be loaded
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Check your connection and try again.
      </p>
      <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}

/** Covers the page while a file is dragged over it. */
export function DropOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-background/80 p-6 backdrop-blur-sm">
      <div className="flex flex-col items-center rounded-xl border-2 border-dashed border-primary bg-card px-10 py-12 text-center shadow-paper-lifted">
        <UploadCloud className="h-10 w-10 text-primary" aria-hidden="true" />
        <p className="mt-3 text-base font-semibold">Drop the PDF to upload it</p>
      </div>
    </div>
  );
}
