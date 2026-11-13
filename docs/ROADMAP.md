# Roadmap

Status key: `[ ]` not started, `[~]` in progress, `[x]` done.
Phase 4 (dashboard) was done before phase 3 (dependencies) at the owner's request (D-014).

## Phase 1: Docs and context system

- [x] `CLAUDE.md` with read-first and update-before-finishing rules
- [x] `docs/PROJECT.md`, `docs/ROADMAP.md`, `docs/DECISIONS.md`, `docs/SESSION_LOG.md`
- [x] `.env.example`
- [x] README setup steps use pnpm and point at `.env.example`
- [ ] Add a LICENSE file (README links to one that does not exist)

## Phase 2: Secure and revive

Owner actions (need the service dashboards). The app cannot run until the first
two are done:

- [x] Create a Neon project (D-004); put the pooled string in `DATABASE_URL` and the direct string in `DIRECT_URL` in `.env`
- [x] Create a Gemini API key at https://aistudio.google.com/apikey and put it in `.env` as `GOOGLE_API_KEY` (D-013)
- [ ] Revoke the Pinecone API key; delete `PINECONE_API_KEY` and `OPENAI_API_KEY` from `.env` (D-008, D-013)
- [ ] Rotate the Kinde client secret
- [ ] On Vercel: set `DATABASE_URL`, `DIRECT_URL`, `GOOGLE_API_KEY`; remove `PINECONE_API_KEY` and `OPENAI_API_KEY`; use Node 22+

History rewrite (D-011):

- [x] Back up the repo
- [x] Remove `.env` from all commits and replace the Pinecone key and Kinde secret values with placeholders in all commits (both stashes rewritten and kept)
- [x] Verify no commit, stash or stored object contains either value
- [x] Owner: force-push `main`
- [x] Owner: delete the backup folder
- [ ] Owner, optional: ask GitHub Support to purge the old commits, which stay reachable by hash until GitHub garbage-collects them

Code (done 2026-11-13; database and Gemini paths verified by script the same day):

- [x] Hardcoded Pinecone key gone from the source (`src/lib/pinecone.ts` deleted)
- [x] `directUrl` in `prisma/schema.prisma`, `DIRECT_URL` in `.env.example`
- [x] `relationMode = "prisma"` removed; cascading foreign keys and indexes; `DocumentChunk` table with a `vector(1536)` column; migration `20261113000000_pgvector_and_foreign_keys` written (D-008)
- [x] LangChain moved to the current packages; ingest and retrieval rewritten (D-009, D-012)
- [x] `@pinecone-database/pinecone`, `ai` and `openai` removed from dependencies
- [x] Switched from OpenAI to Google Gemini for chat and embeddings (D-013)
- [x] `gpt-3.5-turbo` replaced (now `gemini-3.5-flash-lite`); model names and retrieval settings in `src/config/ai.ts`
- [x] LangChain does real work (D-009): document loader, text splitter, vector store and retriever, prompt template, streaming chain
- [x] Lockfile converted to the current pnpm format with the old versions kept; `node_modules` reinstalled

Still to do once the owner actions are done:

- [x] Apply the migrations to Neon (done by the owner)
- [x] `gemini-3.5-flash-lite` and `gemini-embedding-001` (1536 dimensions) work against the live API
- [x] Vector store on Neon: insert, search, per-file scoping, cascade deletes (13 checks)
- [x] Whole pipeline on a generated 4-page PDF: load, split, embed, store, retrieve (right page for 4 of 4 questions)
- [x] Sign in through Kinde from localhost (done by the owner)
- [x] Upload failed in the browser: the code downloaded the PDF from an old S3 host that now answers 403. Fixed by using the URL UploadThing returns (`file.url`)
- [x] `.env.example` restored to the updated template
- [x] Upload in the browser after the fix (owner): file is `SUCCESS`, 6 chunks stored with embeddings, viewer URL on `utfs.io`
- [ ] In the browser: ask a question in the chat (no messages are in the database yet, so the chat route has not been exercised over HTTP), delete a file, upgrade through Stripe

## Phase 3: Dependency upgrade

One group per commit, app verified after each. The LangChain upgrade and the
Pinecone removal are in phase 2, because the retrieval code is rewritten there.

- [x] Next.js 13.5 to 14.2.35 (React 18 kept). Needed first: Kinde SDK 2 does not support Next 13.3 to 14.2.34
- [ ] Next.js 15 or 16 and React 19 (async request APIs, `params` as promise)
- [ ] tRPC 10 to 11 and TanStack Query 4 to 5
- [x] Kinde SDK 1.8 to 2.13: `getUser()` awaited everywhere, `handleAuth()` route, link components from `/components`, `withAuth` middleware. SDK 1.8's token logging is gone
- [ ] UploadThing 5 to current (the hardcoded S3 host is already gone)
- [ ] Prisma and Stripe to current; pin a current Stripe API version
- [ ] react-pdf to current; self-host the pdf.js worker instead of the CDN URL
- [ ] `react-resizable-panels` 2 to 4 (API renamed) and the now-unused `react-loading-skeleton` removed
- [ ] Tailwind 3 to 4 (optional, do last)

## Phase 4: Dashboard UI upgrade

Built 2026-11-13 (D-014). Design notes: `docs/DESIGN.md`.

Backend support:

- [x] `getUserFiles`: ordered in the query, includes message count
- [x] `getUploadUsage`: uploads in the current calendar month
- [x] `renameFile` mutation
- [x] `deleteFile`: also removes the upload from UploadThing (chunks and messages go by foreign-key cascade)
- [x] Monthly upload quota from `PLANS` enforced in the upload middleware; `maxFileSizeMb` added to `PLANS`

UI:

- [x] App shell: sidebar (Files, Billing) on wide screens, top bar on narrow ones; public pages moved to a `(marketing)` route group
- [x] Usage card: plan badge, uploads used against quota, upgrade button
- [x] File card: first-page thumbnail, message count, status badge, relative date
- [x] Card menu: open, rename, delete with confirmation
- [x] Search, sort, grid / list toggle (view remembered)
- [x] Whole-page drag and drop upload, with size, type and quota checks
- [x] Skeletons that match the layout; empty, no-match and error states
- [x] Dark mode (light, dark, system) under `/dashboard`
- [x] File page: resizable PDF / chat split, tabs on narrow screens
- [x] Billing page restyled inside the shell
- [x] `docs/DESIGN.md`

Landing page (added at the owner's request the same day):

- [x] Landing page rebuilt: hero with a drawn product preview, how it works, plans from `PLANS`, under the hood
- [x] Marketing navbar simplified (works at phone width, so `MobileNav` is deleted); footer added
- [x] Page title and description say pen.AI instead of Quill; `/sign-up` redirect typo fixed

Checked in the browser, signed in, with real data: Files page, thumbnail,
usage card, rename (changed and changed back), file page with the icon rail,
billing page, landing page at desktop and phone width. Checked with sample
data: list view, delete dialog, upload dialog states, dark mode, the split
divider, PDF / Chat tabs.

Not yet checked:

- [ ] Upload from the button and by drag and drop; the quota message
- [ ] Deleting a file (also removes it from UploadThing)
- [ ] Asking a question: messages in the restyled chat
- [x] Owner's review of the flat design: they preferred the original look (D-015)
- [x] Original colours and motion brought back as "ink on aurora" (D-015): landing, navbar, footer, pricing, app shell, Files, billing, chat bubbles
- [x] Aceternity components and `framer-motion` removed (the aurora and the typed headline were rewritten in CSS); `public/dashboard-preview.jpg` and `public/file-upload-preview.jpg` deleted
- [x] Dark mode on the public pages, and the dark theme reworked to match the design (D-016)
- [x] Link check: signed-out `/dashboard` now goes to sign-in and returns to the page; pricing "Sign up" buttons go to sign-up; Free card says "Open your files" when signed in
- [ ] Owner's review of the "ink on aurora" look, light and dark (O-9)
- [ ] `public/thumbnail.png` (link preview image) still shows the old design
- [ ] Pricing page shows Pro as "$500": `PLANS` has `price.amount: 500` (cents or dollars is not clear); check what Stripe charges and fix the display
- [ ] The four `/payment/*` pages are empty stubs

## Phase 5: Correctness

- [x] `ChatWrapper.tsx`: "Back" on a failed upload was an icon, not a link (wrong `Link` import)
- [x] Chat history took the oldest 6 messages; now the latest 6, read before the new question is saved
- [x] Over-limit PDFs were still embedded; the page limit is now checked first
- [~] A failed upload showed "Too many pages" whatever the cause. The text is now neutral ("couldn't be processed"), but the real reason is still not stored or shown
- [x] Dashboard sorted the query cache array in place (replaced in phase 4)
- [x] Dashboard message count was the literal text "mocked" (replaced in phase 4)
- [x] `MobileNav.tsx` had dead links and an invisible icon (deleted; the navbar now fits on a phone)
- [x] `next.config.js`: redirect source `/sign-ip` fixed to `/sign-up`
- [ ] `src/config/stripe.ts`: production price ID is empty and the code always reads `priceIds.test`
- [ ] `prisma/schema.prisma`: `stripeCurrentPeriodEnd` is a string written with `toDateString()`; should be `DateTime`
- [x] `src/app/api/webhooks/stripe/route.ts`: `invoice.payment_succeeded` payload was cast to a Checkout Session. Worse, the renewal branch never ran (it required `metadata.userId`, which invoices do not carry), so a subscriber would have dropped to Free after the first month. Now typed per event and keyed by subscription id
- [ ] Stripe webhook: not yet exercised with a real test event (`stripe trigger` or a test checkout)
- [x] Indexes on `File.userId`, `Message.fileId`, `Message.userId`
- [x] `src/app/(marketing)/pricing/page.tsx`: plan limits are read from `PLANS`
- [ ] Pricing copy promises "Higher-quality responses" and "Priority support" for Pro; neither exists in the code (both plans use the same model). Owner to decide: keep, reword or remove
- [x] `src/app/(marketing)/auth-callback/page.tsx`: validate `origin` before redirecting (only plain in-app paths; anything else goes to `/dashboard`)
- [ ] Quota counts files that still exist: deleting a file gives the upload back. Count uploads in their own table if that matters
- [x] `src/app/layout.tsx`: no-op `content` attribute removed; `Providers` is inside `<body>`
- [~] Branding: page title and description fixed; package name is still `quill`
- [x] Remove leftover `console.log` in `src/trpc/index.ts` (and the commented-out ones in `src/lib/stripe.ts`)

## Phase 6: Quality

- [ ] Test runner and tests for the tRPC router, the Stripe webhook and plan-limit logic
- [ ] GitHub Actions: install, type-check, lint, test, build
- [x] Error boundaries and `not-found` / `error` pages: site 404, dashboard 404 (unknown or someone else's file), dashboard and root error boundaries, `global-error`
- [x] Fix the lint warnings (lint is clean as of 2026-11-13)
- [ ] Dev server logs "Invalid hook call ... reading 'useMemo'" once when `/auth-callback` first renders; the page still works. Recheck after the Next.js upgrade
- [ ] Decide whether to keep `qodana.yaml`

## Later ideas (not committed to)

- Answers that cite the PDF page they came from, with click-to-jump
- Multiple chats per file; chat across several files
