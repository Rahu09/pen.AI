"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { StatusPage } from "@/components/StatusPage";

/**
 * Error boundary for the dashboard pages. Next renders it in place of the
 * page that threw, inside the app shell, so the sidebar still works.
 *
 * In production Next hides a server error's message from the browser (it
 * could contain internals) and sends a `digest` instead: a short id that
 * also appears next to the full error in the server log. Showing it lets a
 * user quote it and lets us find the matching log line.
 *
 * `reset` re-renders the page that failed without a full reload, which is
 * enough when the cause was brief (a database cold start on Neon, a
 * dropped connection).
 */
export default function DashboardError({
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
    <StatusPage
      note="ink spilled"
      title={
        <>
          This page didn&apos;t <em className="text-primary">load</em>.
        </>
      }
      actions={
        <>
          <Button onClick={reset} className="rounded-full">
            <RotateCcw className="mr-1.5 h-4 w-4" />
            Try again
          </Button>
          <Link
            href="/dashboard"
            className={buttonVariants({ variant: "outline", className: "rounded-full" })}
          >
            Back to your files
          </Link>
        </>
      }
    >
      <p>Something went wrong on our side. Your files are safe.</p>
      {error.digest && (
        <p className="mt-3 font-mono text-xs text-muted-foreground/80">
          Reference: {error.digest}
        </p>
      )}
    </StatusPage>
  );
}
