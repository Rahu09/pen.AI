import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import UpgradeButton from "@/components/UpgradeButton";
import { buttonVariants } from "@/components/ui/button";
import { Bloom } from "@/components/marketing/Bloom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PLANS, formatPrice } from "@/config/stripe";
import { cn } from "@/lib/utils";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { ArrowRight, Check, HelpCircle } from "lucide-react";
import Link from "next/link";

const Page = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  // Every limit shown here comes from PLANS, the same object the upload
  // checks read, so the page cannot drift from what the app enforces.
  const taglines: Record<string, string> = {
    free: "For small side projects.",
    pro: "For larger projects with higher needs.",
  };

  const pricingItems = PLANS.map((p) => {
    const isPro = p.slug === "pro";
    return {
      plan: p.name,
      tagline: taglines[p.slug],
      quota: p.quota,
      price: formatPrice(p),
      features: [
        {
          text: `${p.pagesPerPdf} pages per PDF`,
          footnote: "The maximum amount of pages per PDF-file.",
        },
        {
          text: `${p.maxFileSizeMb}MB file size limit`,
          footnote: "The maximum file size of a single PDF file.",
        },
        {
          text: "Mobile-friendly interface",
        },
        {
          text: isPro
            ? `Higher-quality answers: ${p.retrievalTopK} passages read per question`
            : `${p.retrievalTopK} passages read per question`,
          footnote:
            "How many passages of your PDF are found and read for each question. More passages let an answer draw on more of the document.",
        },
        {
          text: `Remembers the last ${p.historyMessages} messages`,
          footnote:
            "How much of the conversation is kept in mind when you ask a follow-up question.",
        },
      ],
    };
  });

  return (
    <>
      <MaxWidthWrapper className="relative isolate mb-8 mt-16 max-w-5xl text-center sm:mt-24">
        <Bloom className="-top-20" />
        <div className="mx-auto mb-10 sm:max-w-lg">
          <h1 className="font-serif text-6xl text-foreground sm:text-7xl">
            <em>Pricing</em>
          </h1>
          <p className="mt-5 text-muted-foreground sm:text-lg">
            Whether you&apos;re just trying out our service or need more,
            we&apos;ve got you covered.
          </p>
        </div>

        <div className="pt-12 grid grid-cols-1 gap-10 lg:grid-cols-2">
          <TooltipProvider>
            {pricingItems.map(({ plan, tagline, quota, price, features }) => {
              return (
                <div
                  key={plan}
                  className={cn("relative rounded-xl bg-card shadow-paper", {
                    "border-2 border-foreground": plan === "Pro",
                    "border border-border": plan !== "Pro",
                  })}
                >
                  {plan === "Pro" && (
                    <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background">
                      Upgrade now
                    </div>
                  )}

                  <div className="p-5">
                    <h3 className="my-3 text-center font-serif text-4xl">
                      {plan}
                    </h3>
                    <p className="text-muted-foreground">{tagline}</p>
                    <p className="my-5 font-serif text-6xl">
                      {price}
                    </p>
                    <p className="text-muted-foreground">per month</p>
                  </div>

                  <div className="flex h-20 items-center justify-center border-b border-t border-border bg-[linear-gradient(40deg,#eef2ff,#faf5ff)] dark:bg-[linear-gradient(40deg,rgb(30_27_75/0.5),rgb(46_16_101/0.5))]">
                    <div className="flex items-center space-x-1">
                      <p>{quota.toLocaleString()} PDFs/mo included</p>

                      <Tooltip delayDuration={300}>
                        <TooltipTrigger className="cursor-default ml-1.5">
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="w-80 p-2">
                          How many PDFs you can upload per month.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  <ul className="my-10 space-y-5 px-8">
                    {features.map(({ text, footnote }) => (
                      <li key={text} className="flex space-x-5">
                        <Check className="h-6 w-6 flex-shrink-0 text-primary" />
                        <div className="flex items-center space-x-1">
                          <p className="text-muted-foreground">{text}</p>
                          {footnote ? (
                            <Tooltip delayDuration={300}>
                              <TooltipTrigger className="cursor-default ml-1.5">
                                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent className="w-80 p-2">
                                {footnote}
                              </TooltipContent>
                            </Tooltip>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-border" />
                  <div className="p-5">
                    {plan === "Free" ? (
                      <Link
                        href={user ? "/dashboard" : "/sign-up"}
                        className={buttonVariants({
                          className: "w-full",
                          variant: "secondary",
                        })}
                      >
                        {user ? "Open your files" : "Sign up"}
                        <ArrowRight className="h-5 w-5 ml-1.5" />
                      </Link>
                    ) : user ? (
                      <UpgradeButton />
                    ) : (
                      <Link
                        href="/sign-up"
                        className={buttonVariants({
                          className: "w-full",
                        })}
                      >
                        Sign up
                        <ArrowRight className="h-5 w-5 ml-1.5" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </TooltipProvider>
        </div>
      </MaxWidthWrapper>
    </>
  );
};

export default Page;
