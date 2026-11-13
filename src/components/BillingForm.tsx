"use client";

import { format } from "date-fns";
import { Check, Loader2 } from "lucide-react";
import { trpc } from "@/app/_trpc/client";
import { usePlan } from "@/components/app-shell/plan-context";
import { PageWash } from "@/components/app-shell/PageWash";
import { UsageCard } from "@/components/app-shell/UsageCard";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { useToast } from "./ui/use-toast";

interface BillingFormProps {
  subscriptionPlan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>;
}

const BillingForm = ({ subscriptionPlan }: BillingFormProps) => {
  const plan = usePlan();
  const { toast } = useToast();

  const { mutate: createStripeSession, isPending } =
    trpc.createStripeSession.useMutation({
      onSuccess: ({ url }) => {
        if (url) window.location.href = url;
        if (!url) {
          toast({
            title: "There was a problem...",
            description: "Please try again in a moment",
            variant: "destructive",
          });
        }
      },
      onError: () => {
        toast({
          title: "Couldn't open billing",
          description: "Please try again in a moment.",
          variant: "destructive",
        });
      },
    });

  const limits = [
    `${plan.quota} PDF uploads per month`,
    `Up to ${plan.pagesPerPdf} pages per PDF`,
    `Up to ${plan.maxFileSizeMb} MB per file`,
  ];

  return (
    <div className="relative isolate">
      <PageWash />
      <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <header>
          <h1 className="font-serif text-4xl leading-none tracking-tight sm:text-5xl">
            Billing
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your plan, what it includes, and how much of it you have used.
          </p>
        </header>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            createStripeSession();
          }}
        >
          <Card className="rounded-xl shadow-paper">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="font-serif text-3xl font-normal">
                  {plan.name} plan
                </CardTitle>
                <Badge variant={plan.isSubscribed ? "default" : "secondary"}>
                  Current
                </Badge>
              </div>
              <CardDescription>
                {plan.isSubscribed
                  ? "Thanks for subscribing. Manage or cancel your subscription at any time."
                  : "You are on the free plan. Upgrade for larger files and more uploads."}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <ul className="space-y-2 text-sm">
                {limits.map((limit) => (
                  <li key={limit} className="flex items-center gap-2">
                    <Check
                      className="h-4 w-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    {limit}
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="flex flex-col items-start gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <Loader2
                    className="mr-2 h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : null}
                {plan.isSubscribed ? "Manage subscription" : "Upgrade to Pro"}
              </Button>

              {plan.isSubscribed && subscriptionPlan.stripeCurrentPeriodEnd ? (
                <p className="text-sm text-muted-foreground">
                  {subscriptionPlan.isCanceled
                    ? "Your plan will be canceled on "
                    : "Your plan renews on "}
                  {format(
                    new Date(subscriptionPlan.stripeCurrentPeriodEnd),
                    "d MMM yyyy"
                  )}
                  .
                </p>
              ) : null}
            </CardFooter>
          </Card>
        </form>

        {/* The sidebar shows usage on wide screens; below that it goes here. */}
        <UsageCard className="lg:hidden" />
      </div>
    </div>
  );
};

export default BillingForm;
