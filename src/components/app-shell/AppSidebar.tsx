"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/Wordmark";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, isFilePage } from "./nav";
import { ThemeToggle } from "./ThemeToggle";
import { UsageCard } from "./UsageCard";
import { UserMenu, type ShellUser } from "./UserMenu";

/**
 * Desktop navigation. Full width on the file list and billing pages; narrows
 * to an icon rail on a single file's page so the PDF and chat get the room.
 */
export function AppSidebar({ user }: { user: ShellUser }) {
  const pathname = usePathname() ?? "";
  const compact = isFilePage(pathname);

  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col border-r bg-background/60 backdrop-blur-sm lg:flex",
        compact ? "w-16" : "w-60"
      )}
    >
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b",
          compact ? "justify-center" : "px-4"
        )}
      >
        <Link
          href="/"
          className="rounded-md outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="pen.AI home"
        >
          <Wordmark showName={!compact} />
        </Link>
      </div>

      <nav aria-label="Main" className="flex-1 space-y-1 p-2">
        {NAV_ITEMS.map(({ label, href, icon: Icon, isActive }) => {
          const active = isActive(pathname);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              aria-label={compact ? label : undefined}
              title={compact ? label : undefined}
              className={cn(
                "flex h-9 items-center gap-3 rounded-md text-sm font-medium outline-none ring-offset-background transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                compact ? "justify-center" : "px-3",
                active
                  ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {!compact ? label : null}
            </Link>
          );
        })}
      </nav>

      {!compact ? <UsageCard className="m-2" /> : null}

      <div
        className={cn(
          "flex shrink-0 gap-1 border-t p-2",
          compact ? "flex-col items-center" : "items-center"
        )}
      >
        <UserMenu user={user} compact={compact} />
        <ThemeToggle />
      </div>
    </aside>
  );
}
