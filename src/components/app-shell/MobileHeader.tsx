"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/Wordmark";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu, type ShellUser } from "./UserMenu";

/** Navigation for screens narrower than the sidebar breakpoint. */
export function MobileHeader({ user }: { user: ShellUser }) {
  const pathname = usePathname() ?? "";

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background/70 px-3 backdrop-blur-sm lg:hidden">
      <Link
        href="/dashboard"
        className="shrink-0 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="pen.AI, go to your files"
      >
        <Wordmark showName={false} />
      </Link>

      <nav aria-label="Main" className="flex min-w-0 flex-1 items-center gap-1">
        {NAV_ITEMS.map(({ label, href, icon: Icon, isActive }) => {
          const active = isActive(pathname);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors",
                active
                  ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>

      <ThemeToggle side="bottom" />
      <UserMenu user={user} compact />
    </header>
  );
}
