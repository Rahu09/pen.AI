# Roadmap

Status key: `[ ]` not started, `[~]` in progress, `[x]` done.
Phase 4 (dashboard) was done before phase 3 (dependencies) at the owner's request (D-014).

## Phase 1: Docs and context system

- [x] `CLAUDE.md` with read-first and update-before-finishing rules
- [x] `docs/PROJECT.md`, `docs/ROADMAP.md`, `docs/DECISIONS.md`, `docs/SESSION_LOG.md`
- [x] `.env.example`
- [x] README setup steps use pnpm and point at `.env.example`
- [x] LICENSE file (MIT, as the README says)

## Phase 2: Secure and revive

Owner actions (need the service dashboards). The app cannot run until the first
two are done:

- [x] Create a Neon project (D-004); put the pooled string in `DATABASE_URL` and the direct string in `DIRECT_URL` in `.env`
- [x] Create a Gemini API key at https://aistudio.google.com/apikey and put it in `.env` as `GOOGLE_API_KEY` (D-013)
- [ ] Revoke the Pinecone API key; delete `PINECONE_API_KEY` and `OPENAI_API_KEY` from `.env` (D-008, D-013)
- [ ] Rotate the Kinde client secret
- [ ] On Vercel: set `DATABASE_URL`, `DIRECT_URL`, `GOOGLE_API_KEY`, `UPLOADTHING_TOKEN`; remove `PINECONE_API_KEY`, `OPENAI_API_KEY`, `UPLOADTHING_SECRET`, `UPLOADTHING_APP_ID`; use Node 22+
- [ ] Owner: delete `UPLOADTHING_SECRET` and `UPLOADTHING_APP_ID` from `.env` (unused since UploadThing 7)

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
- [x] In the browser: ask a question in the chat (2026-11-13, on a generated test PDF: right answer from page 1), delete a file (row, messages and the stored PDF removed)
- [ ] In the browser: upgrade through Stripe

## Phase 3: Dependency upgrade

One group per commit, app verified after each. The LangChain upgrade and the
Pinecone removal are in phase 2, because the retrieval code is rewritten there.

- [x] Next.js 13.5 to 14.2.35 (React 18 kept). Needed first: Kinde SDK 2 does not support Next 13.3 to 14.2.34
- [x] Next.js 16.4 and React 19.3 (D-022): `params` and `headers()` awaited, `middleware.ts` renamed `proxy.ts`, Turbopack build (webpack aliases removed), ESLint 9 flat config, OG images moved off the Edge runtime, react-markdown 10, Radix and lucide updated. Type-check, lint, tests and build pass
- [x] Browser check on Next 16: Files, upload, PDF viewer (react-pdf 11), chat, rename, delete, billing, sign-in redirect, theme toggle
- [ ] Owner: in `DATABASE_URL` and `DIRECT_URL` (`.env` and Vercel), change `sslmode=require` to `sslmode=verify-full`. Same behaviour today; silences the `pg` security warning and keeps full certificate checks when `pg` 9 changes what `require` means
- [x] tRPC 10 to 11.28 and TanStack Query 4 to 5.107: `useUtils`, `isPending` for mutations, `refetchInterval` reads `query.state.data`, `/auth-callback` redirects moved into effects (queries lost `onSuccess` / `onError`). Checked in the browser: Files, upload, chat, rename, delete, billing, auth callback
- [x] Kinde SDK 1.8 to 2.13: `getUser()` awaited everywhere, `handleAuth()` route, link components from `/components`, `withAuth` middleware. SDK 1.8's token logging is gone
- [x] UploadThing 5 to 7.7: `createRouteHandler`, `UTApi`, `file.ufsUrl`, `awaitServerData: false`; one `UPLOADTHING_TOKEN` replaces the secret and app id
- [x] Prisma 5 to 7.10: `prisma-client` generator (CommonJS) into `src/generated/prisma`, `prisma.config.ts`, `pg` driver adapter; TypeScript 5.2 to 5.9 (Prisma 7 needs 5.4+). Checked live against Neon: typed queries, raw SQL, pgvector search, `migrate status`
- [x] Stripe 13 to 23.1, API version pinned to `2026-10-28.endive`. Webhook reads the subscription from `invoice.parent.subscription_details` and the period end from the subscription item; `payment_method_types` dropped from Checkout. Key and Pro price checked live (read-only)
- [x] Browser check after Prisma 7 (fresh dev server): Files page with message count and thumbnail; upload of a generated PDF to `SUCCESS` (vector insert); chat answered from it; delete removed row and stored file
- [x] Production build after Prisma 7 and Stripe 23 (passed on Next 16, 2026-11-14)
- [ ] Stripe webhook against a real test event (`stripe trigger invoice.payment_succeeded` or a test checkout)
- [x] pdf.js worker served from our own build instead of the cdnjs URL; `react-pdf` 7.7.3 and `pdfjs-dist` 3.11.174 pinned exactly (they must match)
- [x] PDF viewer and fullscreen view were blank on Next 14 (`react-resize-detector` reported no width); now measured with Mantine's `useElementSize`, and `react-resize-detector` removed
- [x] react-pdf 7 to 11 with `pdfjs-dist` 6.3.289 (exact pin, matches react-pdf's own); worker is `pdf.worker.min.mjs`
- [x] `react-resizable-panels` 2 to 4.15.3 (`Group` / `Panel` / `Separator`, `useDefaultLayout`). Was pinned for React 18; unpinned to ^4.22 with React 19
- [x] Unused `react-loading-skeleton`, `react-element-to-jsx-string` and `@tabler/icons-react` removed
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

- [~] Upload from the button works (UploadThing 7, 2026-11-13); drag and drop and the quota message not yet checked
- [x] Deleting a file (also removes it from UploadThing; checked through `UTApi.listFiles`)
- [x] Asking a question: messages in the restyled chat
- [ ] Answers can start with the literal page label ("[Page 1]") copied from the prompt context. Adjust the prompt in `src/app/api/message/route.ts` (or turn it into the "cite the page" feature)
- [x] UploadThing storage cleaned (2026-11-13, owner approved): 23 files with no database row deleted (2024 uploads from the old deployment, failed uploads, an earlier duplicate). 1 file left, the one in use
- [x] Owner's review of the flat design: they preferred the original look (D-015)
- [x] Original colours and motion brought back as "ink on aurora" (D-015): landing, navbar, footer, pricing, app shell, Files, billing, chat bubbles
- [x] Aceternity components and `framer-motion` removed (the aurora and the typed headline were rewritten in CSS); `public/dashboard-preview.jpg` and `public/file-upload-preview.jpg` deleted
- [x] Dark mode on the public pages, and the dark theme reworked to match the design (D-016)
- [x] Link check: signed-out `/dashboard` now goes to sign-in and returns to the page; pricing "Sign up" buttons go to sign-up; Free card says "Open your files" when signed in
- [x] Owner's review of the "ink on aurora" look, light and dark: approved (D-021)
- [x] Link preview image is generated from code (`src/app/opengraph-image.tsx`, `twitter-image.tsx`) in the current design; `public/thumbnail.png` deleted
- [x] Pro price is INR 199 a month in `PLANS` and on the pricing page (D-022)
- [ ] Owner: create an INR 199 monthly price in Stripe and give Claude its id (or put it in `src/config/stripe.ts`). Until then checkout still charges the old INR 1,999
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
- [x] Pricing copy: Pro now does read more passages and keep more history per question; "Priority support" removed (D-023)
- [ ] Plan-based retrieval is type-checked and unit-tested at the config level only; not yet exercised in the browser on a Pro account
- [x] `src/app/(marketing)/auth-callback/page.tsx`: validate `origin` before redirecting (only plain in-app paths; anything else goes to `/dashboard`)
- [ ] Quota counts files that still exist: deleting a file gives the upload back. Count uploads in their own table if that matters
- [x] `src/app/layout.tsx`: no-op `content` attribute removed; `Providers` is inside `<body>`
- [x] Branding: page title, description and package name (`pen.ai`)
- [x] Chat: a failed send restored the old messages into the wrong cache entry, so nothing came back. It now restores the saved pages; the optimistic message no longer edits the cached page in place
- [x] `/auth-callback` retried forever when signed out; it now stops retrying on `UNAUTHORIZED` and goes to sign-in
- [x] Remove leftover `console.log` in `src/trpc/index.ts` (and the commented-out ones in `src/lib/stripe.ts`)

## Phase 6: Quality

- [x] Test runner and tests for the tRPC router, the Stripe webhook and plan-limit logic (Vitest, 43 tests, D-018)
- [x] GitHub Actions: install, type-check, lint, test, build (`.github/workflows/ci.yml`)
- [x] First CI run on GitHub is green (run #1, commit `c7f29ee`, 1m 30s, 43 tests)
- [ ] Tests not written yet: the chat route (`api/message`), `getUserSubscriptionPlan`, the vector store SQL (needs a real Postgres with pgvector, e.g. a service container in CI), React components
- [x] Error boundaries and `not-found` / `error` pages: site 404, dashboard 404 (unknown or someone else's file), dashboard and root error boundaries, `global-error`
- [x] Fix the lint warnings (lint is clean as of 2026-11-13)
- [x] Dev server logged "Invalid hook call" when `/auth-callback` first rendered: gone on Next 16
- [ ] Decide whether to keep `qodana.yaml`

## Later ideas (not committed to)

- Answers that cite the PDF page they came from, with click-to-jump
- Multiple chats per file; chat across several files
