# Roadmap

Status key: `[ ]` not started, `[~]` in progress, `[x]` done.
Phase order is confirmed (D-006): dependencies are upgraded before the dashboard.

## Phase 1: Docs and context system

- [x] `CLAUDE.md` with read-first and update-before-finishing rules
- [x] `docs/PROJECT.md`, `docs/ROADMAP.md`, `docs/DECISIONS.md`, `docs/SESSION_LOG.md`
- [x] `.env.example`
- [x] README setup steps use pnpm and point at `.env.example`
- [ ] Add a LICENSE file (README links to one that does not exist)

## Phase 2: Secure and revive

Owner actions (need the service dashboards):

- [ ] Revoke the Pinecone API key (D-008: Pinecone is being removed, so revoke it, do not rotate)
- [ ] Rotate the Kinde client secret
- [ ] Create a Neon project (D-004) and put the pooled and direct connection strings in `.env`

History rewrite (D-011), after the docs are committed and the tree is clean:

- [x] Back up the repo (full `.git` copy, bundle and `.env` in `E:\production\pen.AI-backup-2026-11-13`)
- [x] Remove `.env` from all commits and replace the Pinecone key and Kinde secret values with placeholders in all commits (both stashes rewritten and kept)
- [x] Verify no commit, stash or stored object contains either value
- [ ] Owner: force-push `main` (`git push --force -u origin main`)
- [ ] Owner: delete the backup folder once the push is confirmed (it still contains the secrets)
- [ ] Owner, optional: ask GitHub Support to purge the old commits, which stay reachable by hash until GitHub garbage-collects them

Code:

- [ ] Delete the hardcoded key from `src/lib/pinecone.ts` (the history rewrite leaves a placeholder there)
- [ ] Add `directUrl` to `prisma/schema.prisma`, add `DIRECT_URL` to `.env.example`, run migrations against Neon
- [ ] Remove `relationMode = "prisma"`; enable the `vector` extension; add a page-chunk table with an embedding column and a cascading foreign key to `File` (D-008)
- [ ] Upgrade LangChain to the current split packages and rewrite ingest and retrieval on its pgvector store (D-009)
- [ ] Remove `@pinecone-database/pinecone`, `src/lib/pinecone.ts` and `PINECONE_API_KEY` (code and `.env.example`)
- [ ] Replace `gpt-3.5-turbo` with a current OpenAI chat model (D-005); move chat and embedding model names to config (`src/app/api/message/route.ts`)
- [ ] Give LangChain real work (D-009): text splitter for chunking, a retriever, and the retrieval-plus-prompt step as a streaming chain
- [ ] Run the app locally end to end: sign in, upload, chat, upgrade

## Phase 3: Dependency upgrade

One group per commit, app verified after each. The LangChain upgrade and the
Pinecone removal are in phase 2, because the retrieval code is rewritten there.

- [ ] Next.js and React to current majors (async request APIs, `params` as promise)
- [ ] tRPC 10 to 11 and TanStack Query 4 to 5
- [ ] Kinde SDK 1 to 2 (`getUser()` becomes async everywhere)
- [ ] UploadThing 5 to current (use the returned file URL, drop the hardcoded S3 host)
- [ ] Vercel `ai` 2 to current (`OpenAIStream` / `StreamingTextResponse` are gone)
- [ ] Prisma and Stripe to current; pin a current Stripe API version
- [ ] react-pdf to current; self-host the pdf.js worker instead of the CDN URL
- [ ] Tailwind 3 to 4 (optional, do last)

## Phase 4: Dashboard UI upgrade

Backend support:

- [ ] `getUserFiles`: order in the query, include message count
- [ ] `renameFile` mutation
- [ ] `deleteFile`: also remove the upload from UploadThing; vectors and messages go by foreign-key cascade
- [ ] Enforce the file quota from `PLANS`

UI:

- [ ] App shell: sidebar (Files, Billing) and top bar, separate from the marketing navbar (route groups)
- [ ] Usage strip: plan badge, files used against quota, upgrade button
- [ ] File card: PDF thumbnail, real message count, status badge, relative date
- [ ] Card menu: rename, delete with confirmation
- [ ] Search, sort, grid / list toggle
- [ ] Whole-page drag and drop upload
- [ ] Skeletons that match the card layout; empty state with a drop zone
- [ ] Dark mode (tokens exist in `globals.css`; no toggle, `<html>` is fixed to `light`)
- [ ] File page: resizable PDF / chat split, tabs on mobile
- [ ] Write `docs/DESIGN.md` once the direction is agreed

## Phase 5: Correctness

- [ ] `src/components/chat/ChatWrapper.tsx:7`: `Link` is imported from `lucide-react`, so "Back" on a failed upload is an icon, not a link
- [ ] `src/app/api/message/route.ts:60`: history takes the oldest 6 messages; should be the latest
- [ ] `src/app/api/uploadthing/core.ts:87`: over-limit PDFs are still embedded; the failure message always says "Too many pages" whatever the cause
- [ ] `src/components/Dashboard.tsx:49`: sorts the query cache array in place
- [ ] `src/components/Dashboard.tsx:83`: message count is the literal text "mocked"
- [ ] `src/components/MobileNav.tsx`: links to `/sign-up` and `/sign-out`, which do not exist; menu icon is `text-zinc-100` on a white bar
- [ ] `next.config.js`: redirect source `/sign-ip` is a typo for `/sign-up`
- [ ] `src/config/stripe.ts`: production price ID is empty and the code always reads `priceIds.test`
- [ ] `prisma/schema.prisma`: `stripeCurrentPeriodEnd` is a string written with `toDateString()`; should be `DateTime`
- [ ] `src/app/api/webhooks/stripe/route.ts`: `invoice.payment_succeeded` payload is cast to a Checkout Session
- [ ] `prisma/schema.prisma`: add indexes on `File.userId`, `Message.fileId`, `Message.userId`
- [ ] `src/app/pricing/page.tsx`: plan limits are hardcoded in copy instead of read from `PLANS`
- [ ] `src/app/auth-callback/page.tsx`: validate `origin` before redirecting
- [ ] `src/app/layout.tsx`: remove the no-op `content` attribute on `<html>`; put `Providers` inside `<body>`
- [ ] Branding: package name `quill`, metadata title "Quill - the SaaS for students" in `src/lib/utils.ts`
- [ ] Remove leftover `console.log` in `src/trpc/index.ts`

## Phase 6: Quality

- [ ] Test runner and tests for the tRPC router, the Stripe webhook and plan-limit logic
- [ ] GitHub Actions: install, type-check, lint, test, build
- [ ] Error boundaries and `not-found` / `error` pages for the dashboard routes
- [ ] Fix the lint warnings (hook dependency arrays)
- [ ] Decide whether to keep `qodana.yaml`

## Later ideas (not committed to)

- Answers that cite the PDF page they came from, with click-to-jump
- Multiple chats per file; chat across several files
