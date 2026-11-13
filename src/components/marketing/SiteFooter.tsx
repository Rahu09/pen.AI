import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";
import { REPO_URL } from "@/config/site";
import { POLICY_PAGES } from "./PolicyPage";

export function SiteFooter() {
  return (
    <footer className="border-t border-foreground/10">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-8 text-sm text-muted-foreground sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 text-foreground">
          <Wordmark />
          <span className="font-hand text-lg text-muted-foreground">
            chat with your PDFs
          </span>
        </div>
        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center gap-x-6 gap-y-2"
        >
          <Link href="/pricing" className="hover:text-foreground">
            Pricing
          </Link>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground"
          >
            Source on GitHub
          </a>
          {POLICY_PAGES.map((page) => (
            <Link key={page.href} href={page.href} className="hover:text-foreground">
              {page.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
