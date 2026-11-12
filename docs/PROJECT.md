# Project overview

Last verified against the code: 2026-11-13.

## What it is

pen.AI lets a signed-in user upload a PDF and chat with it. The PDF is split by
page, embedded, and stored in a vector index; each question retrieves the most
relevant pages and sends them to a chat model. Free and Pro plans differ in file
size, pages per PDF and file quota. Pro is a Stripe subscription.

The codebase started from the "Quill" tutorial project, and some of that
branding is still in the code (package name, page metadata, Pinecone index name).

- Repo: https://github.com/Rahu09/pen.AI (public)
- Deployed at: https://pen-ai.vercel.app (landing page responds; signed-in
  flows are expected to fail, see "External services")

## Stack (versions as pinned in package.json)

| Area | Library | Version |
|---|---|---|
| Framework | Next.js App Router, React | 13.5.2, 18.2.0 |
| API | tRPC + TanStack Query | 10.x, 4.x |
| Database | Prisma on PostgreSQL | 5.11 |
| Auth | Kinde (`@kinde-oss/kinde-auth-nextjs`) | 1.8 |
| Uploads | UploadThing | 5.x |
| Retrieval | LangChain, Pinecone client, OpenAI embeddings | 0.0.166, 1.1, 4.x |
| Chat | OpenAI `gpt-3.5-turbo` streamed with Vercel `ai` | `ai` 2.2 |
| Payments | Stripe | 13.x, API version 2023-08-16 |
| UI | Tailwind 3.3, shadcn/ui, Aceternity UI, framer-motion, lucide | |
| PDF viewer | react-pdf | 7.x |

Every row is roughly three years behind its current major. See ROADMAP phase 3.

## Directory map

```
prisma/schema.prisma          User, File, Message, UploadStatus
src/middleware.ts             Kinde authMiddleware on /dashboard/:path, /auth-callback
src/app/
  page.tsx                    Landing page
  pricing/page.tsx            Pricing table (limits partly hardcoded here)
  auth-callback/page.tsx      Syncs the Kinde user into the DB, then redirects
  dashboard/page.tsx          Server page: auth check, loads plan, renders Dashboard
  dashboard/[fileid]/page.tsx PDF viewer + chat, side by side
  dashboard/billing/page.tsx  BillingForm
  payment/*                   Static policy pages
  api/auth/[kindeAuth]        Kinde handler
  api/trpc/[trpc]             tRPC fetch adapter
  api/uploadthing             Upload router and ingest pipeline (core.ts)
  api/message                 Chat endpoint (streams the answer)
  api/webhooks/stripe         Stripe webhook
src/trpc/index.ts             The whole tRPC router
src/trpc/trpc.ts              publicProcedure / privateProcedure (Kinde check)
src/components/Dashboard.tsx  File grid (the screen being redesigned)
src/components/chat/*         ChatWrapper, ChatContext (optimistic + streaming), Messages
src/components/PdfRenderer.tsx, PdfFullscreen.tsx
src/components/ui/*           shadcn and Aceternity primitives
src/config/stripe.ts          PLANS (quota, pagesPerPdf, price IDs)
src/lib/                      stripe, pinecone, openai, uploadthing, utils
```

## Flows

**Auth.** Kinde hosts login. After login the user lands on `/auth-callback`,
which calls `authCallback` to create the `User` row if missing, then redirects
to `origin` or `/dashboard`. Server pages and `privateProcedure` re-check the
session with `getKindeServerSession()`.

**Upload and ingest** (`src/app/api/uploadthing/core.ts`). The client picks
`freePlanUploader` (4 MB) or `proPlanUploader` (16 MB). On completion the server
creates a `File` row as `PROCESSING`, downloads the PDF, loads it page by page
with LangChain `PDFLoader`, embeds each page with OpenAI and writes to the
Pinecone index `quill` with `fileId` as metadata. Status becomes `SUCCESS`, or
`FAILED` if the page count exceeds the plan. The client polls `getFile` by
upload key and then navigates to `/dashboard/[fileid]`.

**Chat** (`src/app/api/message/route.ts`). Saves the user message, runs a
similarity search (top 4, filtered by `fileId`), builds a prompt from those
pages plus previous messages, streams the completion back, and saves the answer
when the stream completes. The client (`ChatContext.tsx`) adds the user message
optimistically and appends stream chunks into the React Query cache.
Messages are paged 10 at a time by cursor (`getFileMessages`).

**Billing.** `createStripeSession` opens Checkout for new subscribers or the
billing portal for existing ones. The webhook handles
`checkout.session.completed` and `invoice.payment_succeeded` and writes the
Stripe IDs and period end onto `User`. `getUserSubscriptionPlan()` in
`src/lib/stripe.ts` derives `isSubscribed` from those fields.

## Data model

- `User`: `id` (Kinde id), `email`, Stripe customer / subscription / price IDs,
  `stripeCurrentPeriodEnd` (stored as a string).
- `File`: `name`, `url`, `key`, `uploadStatus` (PENDING, PROCESSING, FAILED,
  SUCCESS), timestamps, optional `userId`.
- `Message`: `text`, `isUserMessage`, timestamps, optional `userId`, `fileId`.

`relationMode = "prisma"` is set, so there are no database-level foreign keys
and no indexes on `userId` / `fileId`.

## Environment variables

Names only. Values live in `.env` (git-ignored). Template: `.env.example`.

| Variable | Used by |
|---|---|
| `KINDE_CLIENT_ID`, `KINDE_CLIENT_SECRET`, `KINDE_ISSUER_URL`, `KINDE_SITE_URL`, `KINDE_POST_LOGIN_REDIRECT_URL`, `KINDE_POST_LOGOUT_REDIRECT_URL` | Kinde SDK |
| `DATABASE_URL` | Prisma |
| `UPLOADTHING_SECRET`, `UPLOADTHING_APP_ID` | UploadThing |
| `OPENAI_API_KEY` | Embeddings and chat |
| `PINECONE_API_KEY` | Present in `.env` but not read: the key is hardcoded in `src/lib/pinecone.ts` |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Stripe client and webhook |
| `VERCEL_URL`, `PORT` | `absoluteUrl()` in `src/lib/utils.ts` |

## External services and their state (2026-11-13)

| Service | State |
|---|---|
| Postgres | `DATABASE_URL` points at ElephantSQL, which has been discontinued. Replacement is Neon (D-004); not created yet. Not yet re-verified by connecting. |
| Pinecone | Client is configured for the legacy `gcp-starter` environment with index `quill`. Being removed (D-008): vectors move to `pgvector` in Neon. The key is in the public repo and must be revoked. |
| OpenAI | `gpt-3.5-turbo` is hardcoded in the chat route. Staying on OpenAI (D-005); model to be replaced in phase 2. |
| Kinde | Client secret was committed on 2023-10-01 and is still in git history. Must be rotated. |
| Stripe | Only a test-mode price ID is configured; the production ID is empty. |
| UploadThing | File URL is built from a hardcoded S3 host instead of the URL UploadThing returns. |

## Health at last check

- `pnpm exec tsc --noEmit`: passes.
- `pnpm lint`: warnings only (hook dependency arrays).
- Tests: none. CI: none.
- The app has not been run end to end since the analysis began, because the
  database is unavailable.
