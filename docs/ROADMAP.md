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

- [ ] Next.js and React to current majors (async request APIs, `params` as promise)
- [ ] tRPC 10 to 11 and TanStack Query 4 to 5
- [ ] Kinde SDK 1 to 2 (`getUser()` becomes async everywhere). Do this early: SDK 1.8 prints the access, ID and refresh tokens to the server log on every sign-in
- [ ] UploadThing 5 to current (the hardcoded S3 host is already gone)
- [ ] Prisma and Stripe to current; pin a current Stripe API version
- [ ] react-pdf to current; self-host the pdf.js worker instead of the CDN URL
- [ ] Tailwind 3 to 4 (optional, do last)

## Phase 4: Dashboard UI upgrade

Backend support:

- [ ] `getUserFiles`: order in the query, include message count
- [ ] `renameFile` mutation
- [ ] `deleteFile`: also remove the upload from UploadThing (chunks and messages now go by foreign-key cascade)
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

- [x] `ChatWrapper.tsx`: "Back" on a failed upload was an icon, not a link (wrong `Link` import)
- [x] Chat history took the oldest 6 messages; now the latest 6, read before the new question is saved
- [x] Over-limit PDFs were still embedded; the page limit is now checked first
- [ ] `src/components/chat/ChatWrapper.tsx`: a failed upload always says "Too many pages", whatever the cause (also shown for scanned PDFs with no text, and for processing errors)
- [ ] `src/components/Dashboard.tsx:49`: sorts the query cache array in place
- [ ] `src/components/Dashboard.tsx:83`: message count is the literal text "mocked"
- [ ] `src/components/MobileNav.tsx`: links to `/sign-up` and `/sign-out`, which do not exist; menu icon is `text-zinc-100` on a white bar
- [ ] `next.config.js`: redirect source `/sign-ip` is a typo for `/sign-up`
- [ ] `src/config/stripe.ts`: production price ID is empty and the code always reads `priceIds.test`
- [ ] `prisma/schema.prisma`: `stripeCurrentPeriodEnd` is a string written with `toDateString()`; should be `DateTime`
- [ ] `src/app/api/webhooks/stripe/route.ts`: `invoice.payment_succeeded` payload is cast to a Checkout Session
- [x] Indexes on `File.userId`, `Message.fileId`, `Message.userId`
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
- [ ] Dev server logs "Invalid hook call ... reading 'useMemo'" once when `/auth-callback` first renders; the page still works. Recheck after the Next.js upgrade
- [ ] Decide whether to keep `qodana.yaml`

## Later ideas (not committed to)

- Answers that cite the PDF page they came from, with click-to-jump
- Multiple chats per file; chat across several files
