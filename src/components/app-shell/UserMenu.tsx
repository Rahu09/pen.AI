"use client";

import Link from "next/link";
import { CreditCard, Gem, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { usePlan } from "./plan-context";

export type ShellUser = {
  name: string;
  email: string;
  imageUrl: string;
};

const initials = (name: string, email: string) =>
  (name || email)
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");

export function UserMenu({
  user,
  compact = false,
}: {
  user: ShellUser;
  /** Avatar only, without the name and email next to it */
  compact?: boolean;
}) {
  const { isSubscribed } = usePlan();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex items-center gap-2 rounded-md text-left outline-none ring-offset-background transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          compact ? "p-1" : "min-w-0 flex-1 p-1.5"
        )}
        aria-label="Account menu"
      >
        <Avatar className="h-7 w-7">
          {user.imageUrl ? (
            <AvatarImage
              src={user.imageUrl}
              alt=""
              referrerPolicy="no-referrer"
            />
          ) : null}
          <AvatarFallback className="text-xs font-medium">
            {initials(user.name, user.email)}
          </AvatarFallback>
        </Avatar>
        {!compact ? (
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">
              {user.name || "Your account"}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              {user.email}
            </span>
          </span>
        ) : null}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" side="top" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <span className="block truncate text-sm font-medium">
            {user.name || "Your account"}
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          {isSubscribed ? (
            <Link href="/dashboard/billing">
              <CreditCard className="mr-2 h-4 w-4" aria-hidden="true" />
              Manage subscription
            </Link>
          ) : (
            <Link href="/pricing">
              <Gem className="mr-2 h-4 w-4" aria-hidden="true" />
              Upgrade to Pro
            </Link>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          {/* A plain link: Kinde's logout route ends the session and redirects. */}
          <a href="/api/auth/logout">
            <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
            Log out
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
