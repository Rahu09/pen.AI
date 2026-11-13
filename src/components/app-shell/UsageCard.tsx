"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { trpc } from "@/app/_trpc/client";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { usePlan } from "./plan-context";

/** Shows how much of the plan's monthly upload quota has been used. */
export function UsageCard({ className }: { className?: string }) {
  const plan = usePlan();
  const { data, isLoading } = trpc.getUploadUsage.useQuery();

  const used = data?.used ?? 0;
  const isFull = used >= plan.quota;
  const percent = Math.min(100, Math.round((used / plan.quota) * 100));

  return (
    <section
      aria-label="Plan usage"
      className={cn("rounded-xl border bg-card p-3 text-sm shadow-paper", className)}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium">Uploads this month</span>
        <Badge variant={plan.isSubscribed ? "default" : "secondary"}>
          {plan.name}
        </Badge>
      </div>

      {isLoading ? (
        <Skeleton className="mt-3 h-4 w-24" />
      ) : (
        <p
          className={cn(
            "mt-2 flex items-center gap-1.5 text-muted-foreground",
            isFull && "text-destructive-foreground"
          )}
        >
          {isFull ? (
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          ) : null}
          <span>
            <span className="font-medium text-foreground">{used}</span> of{" "}
            {plan.quota} PDFs{isFull ? " · limit reached" : ""}
          </span>
        </p>
      )}

      <Progress
        value={percent}
        className="mt-2 h-1.5"
        // the cyan-to-blue of the original file avatars
        indicatorColor="bg-gradient-to-r from-cyan-500 to-blue-500"
        aria-label={`${used} of ${plan.quota} uploads used`}
      />

      {!plan.isSubscribed ? (
        <Link
          href="/pricing"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "mt-3 w-full"
          )}
        >
          Upgrade to Pro
        </Link>
      ) : null}
    </section>
  );
}
