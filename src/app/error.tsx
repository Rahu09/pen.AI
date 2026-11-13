"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import {
  buttonSize,
  inkButton,
  paperButton,
} from "@/components/marketing/styles";
import { StatusPage } from "@/components/StatusPage";

/**
 * Error boundary for everything under the root layout that has no closer
 * boundary: the public pages, and the dashboard layout itself (an error
 * boundary never catches errors from the layout in its own folder, so a
 * failure while loading the app shell lands here, not in dashboard/error).
 * It does not draw the navbar, since the navbar may be what failed.
 * See dashboard/error.tsx for what `digest` and `reset` are.
 */
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <StatusPage
        note="ink spilled"
        title={
          <>
            Something went <em className="text-primary">wrong</em>.
          </>
        }
        actions={
          <>
            <button
              type="button"
              onClick={reset}
              className={`${inkButton} ${buttonSize.lg}`}
            >
              <RotateCcw className="h-4 w-4" />
              Try again
            </button>
            <Link href="/" className={`${paperButton} ${buttonSize.lg}`}>
              Home
            </Link>
          </>
        }
      >
        <p>The page hit an error before it could finish. Your files are safe.</p>
        {error.digest && (
          <p className="mt-3 font-mono text-xs text-muted-foreground/80">
            Reference: {error.digest}
          </p>
        )}
      </StatusPage>
    </main>
  );
}
