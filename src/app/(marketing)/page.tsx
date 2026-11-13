import Link from "next/link";
import { RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { ArrowRight } from "lucide-react";
import { Aurora } from "@/components/Aurora";
import { Bloom } from "@/components/marketing/Bloom";
import { ProductPreview } from "@/components/marketing/ProductPreview";
import { TypedHeadline } from "@/components/marketing/TypedHeadline";
import {
  arrowNudge,
  buttonSize,
  inkButton,
  paperButton,
  section,
} from "@/components/marketing/styles";
import { PLANS } from "@/config/stripe";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    title: "Upload a PDF",
    body: "Drop a contract, a paper or a manual onto the page. It is ready in a few seconds.",
  },
  {
    title: "It is read once",
    body: "The text is cut into short passages, and each passage is indexed by what it means, not only by the words in it.",
  },
  {
    title: "Ask in plain words",
    body: "Your question is matched to the passages closest in meaning, and the answer is written from those passages alone.",
  },
];

const UNDER_THE_HOOD = [
  {
    term: "Search",
    detail:
      "Each passage is stored as a vector in PostgreSQL with pgvector, next to the rest of the data. A question is answered by a cosine-similarity search over one file's passages.",
  },
  {
    term: "Models",
    detail:
      "Google Gemini turns text into vectors and writes the answers, streamed as they are generated.",
  },
  {
    term: "Pipeline",
    detail:
      "LangChain runs the steps: load the PDF, split it, embed it, retrieve, prompt, answer.",
  },
  {
    term: "App",
    detail:
      "Next.js, tRPC and Prisma, with Kinde for sign-in, UploadThing for files and Stripe for the Pro plan.",
  },
];

export default async function Home() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  const primary = cn(inkButton, buttonSize.lg);
  const cta = user ? (
    <Link href="/dashboard" className={primary}>
      Open your files
      <ArrowRight className={arrowNudge} aria-hidden="true" />
    </Link>
  ) : (
    <RegisterLink className={primary}>
      Get started free
      <ArrowRight className={arrowNudge} aria-hidden="true" />
    </RegisterLink>
  );

  return (
    <main className="overflow-x-clip">
      {/* Hero: the original moving gradient, now a panel on the page */}
      <div className="px-2 pt-2 sm:px-4 lg:px-6">
        <Aurora
          interactive
          className="grain rounded-[1.75rem] pb-40 pt-16 sm:pb-56 sm:pt-24 lg:pb-64"
        >
          <div className={cn(section, "flex flex-col items-center text-center")}>
            <p className="animate-fade-up rounded-full bg-background/50 px-3.5 py-1 text-xs font-medium text-foreground/75 ring-1 ring-inset ring-foreground/10 backdrop-blur motion-reduce:animate-none">
              Chat with your PDFs, free to start
            </p>

            <TypedHeadline
              className="mt-6 max-w-5xl text-[2.6rem] leading-[0.95] text-foreground sm:text-7xl lg:text-8xl"
              words={[
                { text: "Query" },
                { text: "your" },
                { text: "documents", accent: true, breakAfter: true },
                { text: "in" },
                { text: "seconds." },
              ]}
            />

            <p
              className="mt-7 max-w-xl animate-fade-up text-base text-foreground/75 sm:text-lg motion-reduce:animate-none"
              style={{ animationDelay: "250ms" }}
            >
              Upload a PDF and ask it questions. pen.AI finds the passages that
              matter and answers from what the document says. When the answer
              isn&apos;t in there, it tells you so.
            </p>

            <div
              className="mt-9 flex animate-fade-up flex-wrap items-center justify-center gap-3 motion-reduce:animate-none"
              style={{ animationDelay: "400ms" }}
            >
              {cta}
              <Link href="/pricing" className={cn(paperButton, buttonSize.lg)}>
                See pricing
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Free plan: {PLANS[0].quota} PDFs a month, no card needed.
            </p>
          </div>
        </Aurora>
      </div>

      {/* The product, laid over the bottom of the hero */}
      <section className={cn(section, "relative isolate -mt-32 sm:-mt-44 lg:-mt-48")}>
        <Bloom className="top-24" />
        <ProductPreview />
      </section>

      {/* How it works */}
      <section className={cn(section, "relative isolate pb-24 pt-28 sm:pt-36")}>
        <Bloom className="-top-10 opacity-60" />
        <div className="max-w-2xl">
          <h2 className="font-serif text-4xl leading-[1.05] text-foreground sm:text-5xl">
            Start chatting in <em className="text-primary">minutes</em>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Three steps, and only the first one is yours.
          </p>
        </div>

        <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-12">
          {STEPS.map((step, index) => (
            <li key={step.title} className="border-t border-foreground/15 pt-5">
              <span className="font-serif text-5xl leading-none text-primary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Plans */}
      <section className={cn(section, "pb-24")}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-4xl leading-[1.05] text-foreground sm:text-5xl">
              Two plans, <em>no surprises</em>
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Start free. Move to Pro when your documents get longer.
            </p>
          </div>
          <Link href="/pricing" className={cn(paperButton, buttonSize.sm)}>
            Compare plans
          </Link>
        </div>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2">
          {PLANS.map((plan) => {
            const isPro = plan.slug === "pro";
            const limits = [
              [`${plan.quota}`, "PDFs a month"],
              [`${plan.pagesPerPdf}`, "pages per PDF"],
              [`${plan.maxFileSizeMb} MB`, "per file"],
            ];
            const body = (
              <>
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-serif text-3xl text-foreground">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isPro ? "For longer documents" : "No card needed"}
                  </p>
                </div>
                <dl className="mt-8 grid grid-cols-3 gap-3 border-t border-foreground/10 pt-5">
                  {limits.map(([value, label]) => (
                    <div key={label}>
                      <dt className="sr-only">{label}</dt>
                      <dd className="font-serif text-3xl leading-none text-foreground">
                        {value}
                      </dd>
                      <dd className="mt-1.5 text-sm text-muted-foreground">{label}</dd>
                    </div>
                  ))}
                </dl>
              </>
            );

            return (
              <li key={plan.slug}>
                {isPro ? (
                  <Aurora className="grain h-full rounded-xl p-7" intensity={0.55}>
                    {body}
                  </Aurora>
                ) : (
                  <div className="h-full rounded-xl border border-border bg-card p-7 shadow-paper">
                    {body}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* Under the hood: the one dark band, ink on the page */}
      <section className="bg-zinc-950 text-zinc-300 dark:border-y dark:border-white/10 dark:bg-black/40">
        <div
          className={cn(
            section,
            "grid gap-12 py-20 lg:grid-cols-[1fr_1.6fr] lg:py-28"
          )}
        >
          <div>
            <h2 className="font-serif text-4xl leading-[1.05] text-white sm:text-5xl">
              Under the <em className="text-[#c7d2fe]">hood</em>
            </h2>
            <p className="mt-4 max-w-sm text-zinc-400">
              For the curious: what happens between your question and the
              answer.
            </p>
          </div>
          <dl className="divide-y divide-white/10 border-y border-white/10">
            {UNDER_THE_HOOD.map(({ term, detail }) => (
              <div
                key={term}
                className="grid gap-2 py-5 sm:grid-cols-[8rem_1fr] sm:gap-6"
              >
                <dt className="font-serif text-2xl italic text-white">{term}</dt>
                <dd className="text-[0.95rem] leading-relaxed">{detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Closing call to action */}
      {/* The bloom colours as two radial glows. `closest-side` makes each
          one reach full transparency exactly at the section's nearest edge,
          so the colour can never end on a visible line. */}
      <section className="relative isolate">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-60 dark:opacity-35"
          style={{
            backgroundImage:
              "radial-gradient(closest-side at 38% 55%, rgb(255 128 181 / 0.45), transparent), radial-gradient(closest-side at 62% 50%, rgb(144 137 252 / 0.5), transparent)",
          }}
        />
        <div className={cn(section, "py-24 text-center")}>
          <h2 className="mx-auto max-w-2xl font-serif text-4xl leading-[1.05] text-foreground sm:text-6xl">
            Your PDF has the answer. <em className="text-primary">Ask it.</em>
          </h2>
          <div className="mt-9 flex justify-center">{cta}</div>
        </div>
      </section>
    </main>
  );
}
