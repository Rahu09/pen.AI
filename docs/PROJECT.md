# Project overview

Last verified against the code: 2026-11-13 (after the phase 2 code work).

## What it is

pen.AI lets a signed-in user upload a PDF and chat with it. The PDF is split
into chunks, each chunk is embedded, and the embeddings are stored in Postgres
with pgvector. Each question retrieves the most relevant chunks and sends them
to a chat model. Free and Pro plans differ in file size, pages per PDF and file
quota. Pro is a Stripe subscription.

The codebase started from the "Quill" tutorial project. The package name in
`package.json` is still `quill`.

- Repo: https://github.com/Rahu09/pen.AI (public)
- Deployed at: https://pen-ai.vercel.app (the deployment predates phase 2 and
  will not work until its environment variables are updated; see below)

## Stack (versions as pinned in package.json)

| Area | Library | Version |
|---|---|---|
| Framework | Next.js App Router, React | 14.2.35, 18.2.0 |
| API | tRPC + TanStack Query | 10.x, 4.x |
| Database | Prisma on PostgreSQL (Neon) with pgvector | 5.11 |
| Auth | Kinde (`@kinde-oss/kinde-auth-nextjs`) | 2.13 |
| Uploads | UploadThing | Works (upload from localhost, 2026-11-13). Files are served from `https://utfs.io/f/<key>`, which is what the SDK passes as `file.url`. |
| Retrieval | `@langchain/core`, `@langchain/textsplitters` | 1.4, 1.0 |
| Chat | Google `gemini-3.5-flash-lite` through `@langchain/google` (`ChatGoogle`) | 0.2 |
| Embeddings | Google `gemini-embedding-001`, 1536 numbers per chunk, through `@langchain/google-genai` | 2.3 |
| Payments | Stripe | 13.x, API version 2023-08-16 |
| UI | Tailwind 3.3, shadcn/ui, lucide, next-themes 0.4, react-resizable-panels 2.1. Fonts through `next/font`: Inter, Instrument Serif, Caveat | |
| PDF viewer | react-pdf | 7.x |
| PDF text extraction | pdf.js as bundled in `pdf-parse` 1.1 | |

Requires Node 22+ and pnpm 10+. Everything outside the Retrieval, Chat and
Embeddings rows is still about three years behind its current major (ROADMAP
phase 3).

## Directory map

```
prisma/schema.prisma          User, File, Message, DocumentChunk, UploadStatus
prisma/migrations/            SQL migrations (the second one enables pgvector)
src/middleware.ts             Kinde `withAuth` on /dashboard/*: signed-out visitors go to sign-in and come back to the page
src/app/
  layout.tsx                  Root: fonts, providers (theme, tRPC), toaster, viewport theme colour
  not-found.tsx, error.tsx    Site 404 (with navbar) and root error boundary
  global-error.tsx            Last resort if the root layout itself fails (inline styles)
  (marketing)/                Public pages; share the marketing navbar
    page.tsx                  Landing page (hero, how it works, plans, under the hood)
    pricing/page.tsx          Pricing table (limits partly hardcoded here)
    auth-callback/page.tsx    Syncs the Kinde user into the DB, then redirects
    payment/*                 Static policy pages
  dashboard/layout.tsx        Signed-in shell: loads user and plan, renders AppShell
  dashboard/page.tsx          Files page: auth check, renders Dashboard
  dashboard/[fileid]/page.tsx One file: ownership check, renders FileWorkspace
  dashboard/billing/page.tsx  BillingForm
  dashboard/not-found.tsx, error.tsx   404 and error boundary inside the app shell
  api/auth/[kindeAuth]        Kinde handler
  api/trpc/[trpc]             tRPC fetch adapter
  api/uploadthing             Upload router, quota check and ingest pipeline (core.ts)
  api/message                 Chat endpoint: retrieval chain, streams the answer
  api/webhooks/stripe         Stripe webhook
src/trpc/index.ts             The whole tRPC router
src/trpc/trpc.ts              publicProcedure / privateProcedure (Kinde check)
src/components/app-shell/*    AppShell, sidebar, mobile header, usage card, theme and account menus, plan context
src/components/dashboard/*    Files page: container, cards, list rows, toolbar, dialogs, upload, thumbnails
src/components/file/*         FileWorkspace: resizable PDF and chat, tabs on narrow screens
src/components/chat/*         ChatWrapper, ChatContext (optimistic + streaming), Messages
src/components/PdfRenderer.tsx, PdfFullscreen.tsx
src/components/Navbar.tsx, UserAccountNav.tsx   Marketing navbar only
src/components/StatusPage.tsx Shared layout for 404 and error screens
src/components/Aurora.tsx     The moving gradient (hero, Pro card, app page wash)
src/components/Wordmark.tsx   Logo: quill in an ink circle, name in the serif
src/components/marketing/*    TypedHeadline (typed hero title + ink underline), ProductPreview, Bloom, SiteFooter, shared button classes
src/components/ui/*           shadcn primitives
src/lib/pdfjs.ts              pdf.js worker setup; import Document and Page from here
src/config/stripe.ts          PLANS (monthly quota, pagesPerPdf, maxFileSizeMb, price IDs), getPlan()
src/config/ai.ts              Model names, chunk sizes, how many chunks to retrieve
src/lib/pdf-loader.ts         PdfPageLoader: PDF to one LangChain Document per page
src/lib/embeddings.ts         GeminiEmbeddings: text to vectors, separate modes for documents and questions
src/lib/vector-store.ts       DocumentChunkVectorStore: LangChain vector store on pgvector
src/lib/                      stripe, uploadthing, utils
```

## Flows

**Auth.** Kinde hosts login. After login the user lands on `/auth-callback`,
which calls `authCallback` to create the `User` row if missing, then redirects
to `origin` or `/dashboard`. Server pages and `privateProcedure` re-check the
session with `getKindeServerSession()`.

**Upload and ingest** (`src/app/api/uploadthing/core.ts`). The client picks
`freePlanUploader` (4 MB) or `proPlanUploader` (16 MB). On completion the server
creates a `File` row as `PROCESSING` and then:

1. Load: `PdfPageLoader` reads the PDF into one Document per page.
2. Check: if the page count is over the plan limit, or no page has any text
   (a scanned PDF), the file is marked `FAILED` and nothing is embedded.
3. Split: LangChain's `RecursiveCharacterTextSplitter` cuts each page into
   chunks of about 1,000 characters with 200 characters of overlap. Each chunk
   keeps its page number.
4. Embed and store: `DocumentChunkVectorStore.addDocuments` sends the chunks to
   the embedding model and inserts text plus vector into `DocumentChunk`.
5. The file is marked `SUCCESS`.

Before any of that, the upload middleware rejects the upload if the user has
reached the plan's monthly quota. The browser checks type, size and quota
first so it can say which limit was hit.

The client polls `getFile` by upload key and then navigates to
`/dashboard/[fileid]`.

**Files page.** `getUserFiles` returns the user's files, newest first, with a
message count each. Search, sort and the grid or list view are done in the
browser. Rename and delete update the list at once and roll back if the server
refuses. Deleting removes the row (chunks and messages cascade) and then the
PDF from UploadThing.

**Chat** (`src/app/api/message/route.ts`). After the auth and ownership checks,
the route reads the latest 6 messages as history, saves the new question, and
runs one LangChain chain:

1. Retrieve: the retriever embeds the question and asks Postgres for the 4
   chunks of this file whose vectors are closest (`<=>`, cosine distance).
2. Prompt: a chat prompt template is filled with those chunks (labelled by
   page), the history and the question.
3. Model: `ChatGoogle` (Gemini) streams the answer.
4. Parse: the output is reduced to plain text.

The route forwards the text stream to the browser and saves the full answer
when the stream ends. The client (`ChatContext.tsx`) adds the user message
optimistically and appends stream chunks into the React Query cache. Messages
are paged 10 at a time by cursor (`getFileMessages`).

**Billing.** `createStripeSession` opens Checkout for new subscribers or the
billing portal for existing ones. The webhook handles
`checkout.session.completed` (links the customer and subscription to the
user through the Checkout metadata) and `invoice.payment_succeeded` (finds
the user by subscription id and moves the period end forward on every
renewal). `getUserSubscriptionPlan()` in
`src/lib/stripe.ts` derives `isSubscribed` from those fields.

## Data model

- `User`: `id` (Kinde id), `email`, Stripe customer / subscription / price IDs,
  `stripeCurrentPeriodEnd` (stored as a string).
- `File`: `name`, `url`, `key`, `uploadStatus` (PENDING, PROCESSING, FAILED,
  SUCCESS), timestamps, optional `userId`.
- `Message`: `text`, `isUserMessage`, timestamps, optional `userId`, `fileId`.
- `DocumentChunk`: `content`, `pageNumber`, `embedding` (`vector(1536)`),
  `fileId`.

Real foreign keys with `ON DELETE CASCADE`: deleting a `User` removes their
files and messages; deleting a `File` removes its messages and chunks. `userId`
and `fileId` columns are indexed.

There is no vector index on `DocumentChunk.embedding`, on purpose: every search
is filtered to one file (a few hundred rows at most), so Postgres compares
exactly and instantly. An approximate index (HNSW) would only help when
searching across very many vectors.

The `embedding` column is `Unsupported("vector(1536)")` in the Prisma schema.
Prisma cannot read or write it through its typed API; `src/lib/vector-store.ts`
does it with parameterised raw SQL.

## Environment variables

Names only. Values live in `.env` (git-ignored). Template: `.env.example`.

| Variable | Used by |
|---|---|
| `KINDE_CLIENT_ID`, `KINDE_CLIENT_SECRET`, `KINDE_ISSUER_URL`, `KINDE_SITE_URL`, `KINDE_POST_LOGIN_REDIRECT_URL`, `KINDE_POST_LOGOUT_REDIRECT_URL` | Kinde SDK |
| `DATABASE_URL` | Prisma at runtime. Neon's pooled connection string. |
| `DIRECT_URL` | `prisma migrate`. Neon's direct connection string. |
| `UPLOADTHING_SECRET`, `UPLOADTHING_APP_ID` | UploadThing |
| `GOOGLE_API_KEY` | Gemini embeddings and chat (read by LangChain from the environment) |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Stripe client and webhook |
| `VERCEL_URL`, `PORT` | `absoluteUrl()` in `src/lib/utils.ts` |

`PINECONE_API_KEY` and `OPENAI_API_KEY` are no longer used and can be deleted
from `.env`.

## External services and their state (2026-11-13)

| Service | State |
|---|---|
| Postgres | Neon (D-004), Free plan, AWS Singapore. Both migrations applied, pgvector enabled. |
| Pinecone | Removed from the code (D-008). The old key was public until the history rewrite (D-011) and should be revoked. |
| Google Gemini | Chat and embeddings (D-013). Both models verified against the live API on 2026-11-13. Free tier, which has rate limits. |
| OpenAI | No longer used (D-013). The old key in `.env` was already invalid. |
| Kinde | Sign-in from localhost works (2026-11-13). SDK 2.13 since 2026-11-13 (1.8 printed tokens to the server log on sign-in). The client secret was public in git history from 2023-10-01 until the 2026-11-13 rewrite (D-011); whether it has been rotated since is not known. |
| Stripe | Only a test-mode price ID is configured; the production ID is empty. Keys not re-verified. |
| UploadThing | File URL is built from a hardcoded S3 host instead of the URL UploadThing returns. Keys not re-verified. |
| Vercel | Needs: new `DATABASE_URL`, `DIRECT_URL`, `GOOGLE_API_KEY`; Node 22+; `prisma migrate deploy` run once against Neon. |

## Health at last check (2026-11-13)

- `pnpm exec tsc --noEmit`: passes.
- `pnpm lint`: warnings only (hook dependency arrays, all pre-existing).
- `pnpm build`: passes.
- PDF loading and splitting: checked on a generated 3-page PDF (one page
  without text).
- `pnpm dev`: starts; the landing page renders.
- Vector store on Neon: insert, search, per-file scoping and cascade deletes
  checked by script with synthetic vectors (13 checks).
- Gemini: embeddings return 1536 numbers; the chat chain streams an answer
  from the context and says it does not know when the context lacks the answer.
- Whole pipeline on a generated 4-page PDF with real embeddings: the right
  page came back first for 4 of 4 questions.
- In the browser: sign-in and upload reach the server. The first uploads
  failed on a dead S3 URL, since fixed; the loader reads the uploaded PDF
  from the correct URL (3 pages, 6 chunks).
- Upload in the browser after the fix works (owner, 2026-11-13): the file is
  `SUCCESS` with 6 embedded chunks.
- Not verified: the chat route over HTTP (no messages stored yet), file
  deletion from the UI, Stripe.
- Phase 4 UI and landing page: type-check, lint and build pass. Checked in
  the browser signed in with real data (Files page, rename, file page,
  billing, landing at two widths) and with sample data (list view, dialogs,
  dark mode, split divider, phone tabs). Not yet exercised: upload, delete
  and chat through the new UI.
- "Ink on aurora" restyle (2026-11-13, after phase 4): type-check, lint
  and build pass. Checked in the browser: landing page at 375px, 800px and
  1440px (typing, underline, no sideways scroll), Files page in light and
  dark, billing, pricing, the file page.
- Dark mode on every page and the link check (same day): type-check and
  lint pass; build not rerun (the dev server was running). Every public
  and app link clicked or fetched, signed in and signed out.
- Next 14.2.35 and Kinde 2.13 (same day): type-check and lint pass.
  Signed out: every protected route redirects to sign-in with the return
  path. Signed in: landing, Files (with thumbnail), billing and the file
  page work.
- Production build on Next 14 (same day): passes after two fixes
  (`/auth-callback` wrapped in Suspense; `themeColor` moved to the
  `viewport` export). `/auth-callback` checked in the browser with a safe
  and an unsafe `origin`.
- Tests: none. CI: none.
