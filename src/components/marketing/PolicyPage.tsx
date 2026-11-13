import Link from "next/link";
import type { ReactNode } from "react";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { Bloom } from "@/components/marketing/Bloom";
import { cn } from "@/lib/utils";

/** The four policy pages under /payment, in the order the nav lists them. */
export const POLICY_PAGES = [
  { href: "/payment/terms-of-services", label: "Terms" },
  { href: "/payment/privacy-policy", label: "Privacy" },
  { href: "/payment/cancellation", label: "Cancellation and refunds" },
  { href: "/payment/support", label: "Support" },
] as const;

/** The date the policies were last changed. Update it with the text. */
export const POLICIES_UPDATED = "14 November 2026";

/**
 * Shared layout for the policy pages: serif title, the date, a row of links
 * between the four pages, and the text set as readable prose.
 */
export function PolicyPage({
  title,
  intro,
  current,
  children,
}: {
  title: string;
  intro: string;
  current: (typeof POLICY_PAGES)[number]["href"];
  children: ReactNode;
}) {
  return (
    <MaxWidthWrapper className="relative isolate mb-24 mt-16 max-w-3xl sm:mt-24">
      <Bloom className="-top-20" />

      <header className="mb-10">
        <h1 className="font-serif text-5xl text-foreground sm:text-6xl">
          {title}
        </h1>
        <p className="mt-4 text-muted-foreground sm:text-lg">{intro}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated {POLICIES_UPDATED}
        </p>

        <nav aria-label="Policies" className="mt-6 flex flex-wrap gap-2">
          {POLICY_PAGES.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              aria-current={page.href === current ? "page" : undefined}
              className={cn(
                "rounded-full border px-3 py-1 text-sm transition-colors",
                page.href === current
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {page.label}
            </Link>
          ))}
        </nav>
      </header>

      <div className="prose prose-zinc max-w-none dark:prose-invert prose-headings:font-serif prose-headings:font-normal prose-h2:text-3xl">
        {children}
      </div>
    </MaxWidthWrapper>
  );
}
