# Decision log

Append-only. Newest entry at the bottom. One entry per decision the owner made
or approved. To reverse a decision, add a new entry that supersedes the old one;
do not edit history.

Entry format:

```
## D-NNN: Title
- Date: YYYY-MM-DD
- Status: Accepted | Superseded by D-NNN
- Context: what prompted it, as discussed in the chat
- Decision: what was chosen
- Alternatives: what was considered and why it lost
- Consequences: what this commits us to
```

---

## D-001: Keep project memory in the repo (CLAUDE.md + docs/)

- Date: 2026-11-13
- Status: Accepted
- Context: The owner is restarting work on the project after a long gap and
  wants every Claude chat to start with the same context: what the project is,
  what is planned, and what was already decided and why.
- Decision: `CLAUDE.md` at the repo root imports `docs/PROJECT.md`,
  `docs/ROADMAP.md` and `docs/DECISIONS.md`, and tells each chat to read the top
  of `docs/SESSION_LOG.md` before working and to update the docs before
  finishing.
- Alternatives: A single large `CLAUDE.md` (would grow without structure and mix
  stable facts with running history). An external tool such as Notion (not
  versioned with the code and not loaded automatically).
- Consequences: Each working chat ends with a doc update. The decision log is
  loaded in full every chat, so entries must stay short.

## D-002: Redesign the dashboard

- Date: 2026-11-13
- Status: Accepted (scope and order still open)
- Context: The owner named the dashboard UI as the one change they definitely
  want. The current screen is a plain file grid with a placeholder message count
  and no search, status or usage information.
- Decision: The dashboard will be redesigned. The proposed scope is ROADMAP
  phase 4; it has been presented but not yet confirmed item by item.
- Alternatives: None discussed.
- Consequences: Needs small backend additions (message counts, rename, proper
  delete, quota enforcement).

## D-003: Claude never commits or pushes

- Date: 2026-11-13
- Status: Accepted
- Context: Claude offered to commit the docs scaffold. The owner replied "never
  commit or push anything. handoff that to me".
- Decision: The owner does every commit, push and other history or remote
  operation. Claude finishes work by listing changed files and suggesting a
  commit message.
- Alternatives: Claude commits on request (rejected by the owner).
- Consequences: Rule is in `CLAUDE.md`. Work is batched in the working tree
  until the owner commits, so each hand-off must say exactly which files belong
  together.

## D-004: Neon for the Postgres database

- Date: 2026-11-13
- Status: Accepted (owner set the criteria; Claude picked Neon against them)
- Context: The old ElephantSQL database is gone. The owner asked for a host
  that is free, pleasant to use, and easy to explain in an interview.
- Decision: Neon, on its Free plan, created directly at neon.com.
- Alternatives:
  - Supabase: free projects pause after 7 days without database activity and
    need a manual restore, which is a poor fit for a portfolio app that is
    visited occasionally. It also bundles auth and storage that would overlap
    with Kinde and UploadThing and blur the architecture story.
  - Vercel Postgres: no longer exists as a product; Vercel moved it to Neon.
- Consequences:
  - Free plan at the time of the decision: 1 GB storage per project, 100
    compute-hours a month, no overage billing. Compute suspends after 5 idle
    minutes, so the first request after a quiet period is slower.
  - Use the pooled connection string for the app and the direct one for
    migrations (`directUrl` in `schema.prisma`).
  - Interview points: serverless Postgres with storage separated from compute,
    scale to zero, connection pooling for serverless functions, and database
    branching for preview deployments.

## D-005: Keep OpenAI for chat and embeddings

- Date: 2026-11-13
- Status: Superseded by D-013 (same day)
- Context: `gpt-3.5-turbo` is hardcoded and has to be replaced. Claude raised
  switching chat to Claude with OpenAI kept for embeddings.
- Decision: Stay on OpenAI for both.
- Alternatives: Claude for chat (deferred, not rejected).
- Consequences: One provider and one key. The exact chat and embedding model
  names are chosen from OpenAI's current documentation when phase 2 is
  implemented, and go in config rather than inline in the route.

## D-006: Upgrade dependencies before the dashboard redesign

- Date: 2026-11-13
- Status: Superseded by D-014 (same day)
- Context: The dashboard redesign is the change the owner most wants, but the
  whole stack is about three years behind.
- Decision: ROADMAP order stands: phase 3 (dependencies) before phase 4
  (dashboard).
- Alternatives: Dashboard first for visible progress (rejected: the dashboard
  code uses tRPC, React Query and Next APIs that all change in the upgrade, so
  it would be written twice).
- Consequences: No visible UI change until phases 2 and 3 are done.

## D-007: Keep Pinecone for vector storage

- Date: 2026-11-13
- Status: Superseded by D-008 (same day)
- Context: Choosing Neon made it possible to store vectors in Postgres with
  `pgvector` and remove Pinecone. Claude recommended that. The owner chose to
  keep Pinecone because they want to understand how it works.
- Decision: Stay on Pinecone. Create a new serverless index and move to the
  current client.
- Alternatives: `pgvector` in Neon (deferred, not rejected). It suits the
  workload, since every search is scoped to one file of at most 25 pages, and it
  would make file deletion cascade to vectors. It needs raw SQL through Prisma.
- Consequences: Two data stores stay in play, so `deleteFile` must delete the
  file's vectors from Pinecone explicitly. Pinecone code should be kept behind
  one module (`src/lib/pinecone.ts`) so a later move to `pgvector` is contained.

## D-008: Move vectors to pgvector in Neon and remove Pinecone

- Date: 2026-11-13
- Status: Accepted. Supersedes D-007.
- Context: After D-007 the owner asked why Claude wanted to drop LangChain,
  then proposed the opposite pairing: keep LangChain, remove Pinecone. The
  owner said the project is being revived as interview material.
- Decision: Page embeddings are stored in the Neon database with the
  `pgvector` extension. Pinecone, its client and its key are removed.
- Alternatives: Keep Pinecone (D-007). Rejected on reflection: every search is
  scoped to one file of at most 25 pages, so a dedicated vector database adds a
  service without adding capability at this scale.
- Consequences:
  - One data store. Vectors reference `File` with a cascading foreign key, so
    deleting a file removes its vectors.
  - `relationMode = "prisma"` must be removed from the schema so real foreign
    keys exist. The vector column is declared as `Unsupported(...)` in Prisma
    and created by a SQL migration.
  - Vectors share Neon's 1 GB free storage (about 6 KB per page).
  - The Pinecone key is revoked, not rotated.
  - Interview framing: an honest migration story (started on Pinecone, moved to
    pgvector because of the workload), with the condition under which a
    dedicated vector store would be the right call again.

## D-009: Keep LangChain, migrate to the current packages, and use it properly

- Date: 2026-11-13
- Status: Accepted. Resolves O-4.
- Context: LangChain 0.0.166 is used for three thin wrappers (PDF loader,
  embeddings, vector store). Claude recommended dropping it. The owner chose to
  keep it, for interview value.
- Decision: Keep LangChain and migrate to the current split packages. Use its
  pgvector vector store for D-008.
- Alternatives: Drop LangChain and call the OpenAI SDK and the database
  directly (rejected by the owner; fewer dependencies but no LangChain
  experience to show).
- Consequences:
  - To justify the dependency, LangChain should do more than wrap three calls:
    a text splitter for chunking, a retriever, and the retrieval-plus-prompt
    step as a chain with streaming.
  - LangChain hides the mechanics, so each step (embedding, storing, similarity
    search) must be explained as it is built, and the owner should be able to
    describe what happens underneath.
  - LangChain JS changes often; expect future upgrades to cost more than they
    would with direct SDK calls. Verify class names and import paths against
    the current docs when implementing.

## D-010: Do not rewrite git history for the leaked secrets

- Date: 2026-11-13
- Status: Superseded by D-011 (same day)
- Context: The Pinecone key is in the current source and the Kinde client
  secret is in a 2023 commit, both in a public repo. The owner's view: they are
  old keys and are being changed anyway.
- Decision: Leave history as it is. Revoke the Pinecone key and rotate the
  Kinde secret; that is the whole remedy.
- Alternatives: Rewrite history and force-push (rejected: it changes every
  commit hash and gains nothing once the keys are dead).
- Consequences: The old values stay readable in the public history forever, so
  this is only safe once the revoke and the rotation in ROADMAP phase 2 have
  actually been done. Until then both keys are live and exposed.

## D-011: Rewrite git history to remove the leaked secrets

- Date: 2026-11-13
- Status: Accepted. Supersedes D-010.
- Context: Shortly after D-010 the owner said "just rewrite the commit
  history".
- Decision: Remove `.env` from every commit and replace the hardcoded Pinecone
  key in `src/lib/pinecone.ts` with a placeholder across all history, then
  force-push `main`.
- Scope found on 2026-11-13: one branch (`main`), no tags, no forks, no pull
  requests. The key is in 29 commits, introduced in `c86c60a`. `.env` exists
  only in `4648d9f`. Two local stashes exist and may also contain the key.
- Alternatives: Revoke and rotate only (D-010).
- Consequences:
  - Every commit hash changes. Any other clone must be re-cloned.
  - The working tree must be clean first, so the docs commit comes before the
    rewrite.
  - The force-push is the owner's (D-003).
  - It does not replace revoking the Pinecone key and rotating the Kinde
    secret: GitHub can keep serving old commits by hash until it garbage
    collects them, and anyone may already have copied the values.
- Outcome (2026-11-13): Run locally by Claude with `git filter-repo`, at the
  owner's explicit request (a one-off exception to D-003; the push stays with
  the owner). 38 commits became 37 (the "Delete .env" commit became empty and
  was dropped). All hashes changed, so the hashes quoted above are pre-rewrite:
  `c86c60a` is now `e629269` and `4648d9f` is now `b4511f2`. Not yet pushed.

## D-012: Own vector store and PDF loader on top of LangChain core

- Date: 2026-11-13
- Status: Made by Claude while implementing phase 2. Not yet confirmed by the
  owner.
- Context: D-009 said to use LangChain's pgvector vector store. At install time
  `@langchain/community`, the package that holds LangChain's Prisma vector
  store and its PDF loader, turned out to be retired by its maintainers
  ("sunset ... effective immediately"). The official standalone replacement,
  `@langchain/pgvector`, stores only id, text, vector and a JSON metadata
  column through a separate `pg` connection, so it cannot have a real `fileId`
  foreign key, which D-008 relies on for cascading deletes.
- Decision: Depend only on `@langchain/core`, `@langchain/openai` and
  `@langchain/textsplitters`. Write two small classes on LangChain's own base
  classes: `DocumentChunkVectorStore extends VectorStore`
  (`src/lib/vector-store.ts`, raw SQL through Prisma) and
  `PdfPageLoader extends BaseDocumentLoader` (`src/lib/pdf-loader.ts`).
  Everything above them is standard LangChain: splitter, retriever, prompt
  template, chain, chat model, streaming.
- Alternatives:
  - `@langchain/community` anyway: works today, but it is a retired package
    with a very large dependency tree.
  - `@langchain/pgvector`: official, but a second database connection layer and
    no foreign key, so file deletion would need its own cleanup code again.
- Consequences:
  - About 150 lines of our own code to maintain, including the only raw SQL in
    the app.
  - The SQL that does the similarity search is in the repo and readable, which
    serves the goal of being able to explain it.
  - The direct `ai` and `openai` dependencies were removed, since LangChain now
    makes the model calls and the route streams the text itself.
  - Chat model chosen under D-005: `gpt-6-luna`, OpenAI's most efficient model
    at the time, with low reasoning effort. Not yet exercised against the live
    API because the stored OpenAI key is invalid.

## D-013: Google Gemini for chat and embeddings

- Date: 2026-11-13
- Status: Accepted. Supersedes D-005.
- Context: After the phase 2 code was written for OpenAI, the stored OpenAI
  key turned out to be invalid. The owner then said "the ai model is gemini".
  They did not say whether that covered embeddings too; Claude applied it to
  both so that only one provider and one key are needed.
- Decision: Chat uses `gemini-3.5-flash-lite` through `@langchain/google`
  (`ChatGoogle`). Embeddings use `gemini-embedding-001` at 1536 dimensions
  through `@langchain/google-genai`, wrapped in `GeminiEmbeddings`
  (`src/lib/embeddings.ts`). The key is `GOOGLE_API_KEY`.
- Alternatives:
  - OpenAI (D-005): needs a paid key; the old one no longer works.
  - Gemini for chat with OpenAI for embeddings: two providers and two keys for
    no benefit.
- Consequences:
  - Both models are on the Gemini API free tier, which has rate limits. A large
    PDF or several uploads in a row may be throttled.
  - `@langchain/google` (the package LangChain recommends for new projects) has
    no embeddings class yet, so embeddings use `@langchain/google-genai`, which
    LangChain keeps under long-term support but calls legacy. Move embeddings
    to `@langchain/google` when it gains an embeddings class.
  - The vector column stays `vector(1536)`, so the migration written for D-008
    is unchanged.
  - `@langchain/openai` is removed. The parts of D-012 that name OpenAI
    packages and `gpt-6-luna` no longer apply; its decision about the vector
    store and PDF loader stands.
  - Not yet exercised against the live API: `GOOGLE_API_KEY` is not in `.env`.

## D-014: Do the dashboard redesign before the dependency upgrade

- Date: 2026-11-13
- Status: Accepted. Supersedes D-006.
- Context: With phase 2 working, the owner said "execute phase 4 first, with
  all the UI updates".
- Decision: Phase 4 (dashboard UI) was built on the current stack (Next 13.5,
  tRPC 10, React Query 4). Phase 3 follows.
- Alternatives: Upgrade first (D-006).
- Consequences:
  - The new UI code uses APIs that change in phase 3: `trpc.useContext()`,
    React Query 4 options such as `isLoading` and `keepPreviousData`, and
    synchronous `getUser()` and `params`. Expect to touch the new files
    again during the upgrade.
  - Two small libraries were added: `next-themes` (theme switching) and
    `react-resizable-panels` pinned to 2.x.
  - The design direction is in `docs/DESIGN.md`. It was chosen by Claude
    while building and is not yet reviewed by the owner.
  - Quota is enforced as uploads per calendar month, to match the pricing
    page's "PDFs/mo".

## D-015: Bring back the original look, as "ink on aurora"

- Date: 2026-11-13
- Status: Accepted (direction asked for by the owner; the details were
  designed by Claude and are not yet reviewed, see O-9). Resolves O-8.
- Context: After seeing the flat phase 4 design, the owner said they "still
  liked the old UI look": keep its colour and animation, upgrade it as much
  as possible, remove the glowing borders around pictures, and design it so
  it looks unique rather than machine-made.
- Decision: Keep the original palette (periwinkle to lilac gradient with
  drifting blue, magenta, cyan, red and plum blobs; the pink-to-violet
  bloom; blue 600 accent) and its motion (moving gradient, typed headline).
  Build everything around it from paper and ink: Instrument Serif
  headlines with an italic accent word, a hand-drawn underline that draws
  itself, highlighter marks on matched passages, two handwritten margin
  notes, paper-sheet cards with a soft shadow. No glowing or animated
  borders, no gradient text. The app gets a dimmed aurora wash behind page
  headers and serif page titles; dark mode keeps working. Written up in
  `docs/DESIGN.md`.
- Alternatives:
  - Keep the flat phase 4 design (rejected by the owner).
  - Restore the old Aceternity components as they were: they include the
    glowing borders the owner wants gone, re-render React on every mouse
    move, and use `framer-motion` for effects CSS can do.
- Consequences:
  - The Aceternity components and `framer-motion` are deleted; the aurora
    (`src/components/Aurora.tsx`) and the typed headline
    (`src/components/marketing/TypedHeadline.tsx`) are plain CSS, and both
    stand still under `prefers-reduced-motion`.
  - Two more Google fonts (Instrument Serif, Caveat) load on every page.
  - The landing page uses fixed zinc colours and stays light only.

## D-016: Dark mode on every page, in the "ink on aurora" style

- Date: 2026-11-13
- Status: Accepted (asked for by the owner; the palette was chosen by Claude
  and is part of the O-9 review).
- Context: The owner asked for dark mode on the landing page too, and for
  the dark theme to match the design in D-015. Until then public pages were
  forced to light, and the app's dark theme used shadcn's default slate.
- Decision: Themes apply on every page, with a switch in the marketing
  navbar. Dark tokens move to an indigo-black page and lighter blue accent;
  the aurora gets a deep indigo base. Public pages use theme tokens instead
  of fixed zinc colours. PDF pages stay white; the "under the hood" band
  stays ink. Details in `docs/DESIGN.md`.
- Alternatives: Keep public pages light only (the D-015 state; rejected by
  the owner's request). Keep shadcn's slate dark theme (does not belong to
  the aurora palette).
- Consequences: Any new public-page markup must use theme tokens. A visitor
  whose system is dark sees the landing page dark by default.

## D-017: Next.js 14 before Kinde SDK 2, Next 15+ later

- Date: 2026-11-13
- Status: Accepted (owner asked Claude to start on the work it can do;
  the order was forced by the SDK and chosen by Claude).
- Context: The roadmap had the Kinde SDK upgrade early because SDK 1.8
  logs tokens. Kinde SDK 2.13 supports Next ~13.0 to 13.2 and 14.2.35+, not
  the 13.5 in use.
- Decision: Move Next to 14.2.35 (React 18 kept, synchronous `params` and
  request APIs unchanged), then Kinde to 2.13. Next 15 or 16 with React 19
  stays a separate step.
- Alternatives: Jump straight to Next 16 and React 19 (async `params`,
  `cookies()`, tRPC and React Query changes all at once; a much larger
  change to verify). Stay on Kinde 1.8 (keeps the token logging).
- Consequences: Two Next upgrades instead of one, but each is small enough
  to check in the browser.

## D-018: Vitest with mocked services; CI on GitHub Actions

- Date: 2026-11-13
- Status: Accepted (owner asked for tests and CI; the tools and the
  approach were chosen by Claude).
- Context: ROADMAP phase 6. No tests or CI existed. The riskiest code is
  the server side: per-user scoping in the tRPC router, the Stripe webhook
  (which had a renewal bug fixed the same day), quota enforcement and the
  sign-in redirect check.
- Decision: Vitest 5 for unit tests, files next to the code as
  `*.test.ts`. Prisma, Kinde, Stripe and UploadThing are replaced with
  mocks (`vi.mock`), so tests need no keys, database or network. The tRPC
  router is tested through `appRouter.createCaller`. GitHub Actions runs
  install, type-check, lint, test and build on pushes to `main` and on pull
  requests, with placeholder (non-secret) environment values for the build.
- Alternatives:
  - Jest: needs extra setup for TypeScript and ESM; Vitest runs the
    project's TypeScript directly and has the same API.
  - Tests against a real Postgres: would also cover the raw pgvector SQL,
    but needs a database in CI (a service container). Left for later.
  - Real secrets in CI: not needed for build or tests, and the repo is
    public.
- Consequences:
  - Mocked tests check the code's decisions (what it queries, what it
    refuses), not that Prisma or Stripe behave as assumed.
  - `core.ts` exports its upload middleware, and the redirect check moved
    to `src/lib/safe-redirect.ts`, so both can be tested.

## D-019: Pin react-pdf 7 and react-resizable-panels 4.15 until React 19

- Date: 2026-11-13
- Status: Superseded by D-022 (pins lifted with React 19).
- Context: react-pdf 10 (pdf.js 5) does not load under Next 14's webpack,
  react-pdf 11 needs React 19, and react-resizable-panels 4.16+ imports
  React 19's `Activity`, which fails the production build on React 18.
- Decision: Keep react-pdf 7.7.3 with `pdfjs-dist` 3.11.174 (exact pins,
  the two must match) but serve the worker from our own build; pin
  react-resizable-panels to 4.15.3. Revisit both in the Next 15/16 and
  React 19 step.
- Alternatives: Webpack workarounds for pdf.js 5 on Next 14 (fragile, and
  thrown away at the Next upgrade). Staying on panels 2 (its API is gone
  in 4, so the port would be done later anyway).
- Consequences: Two exact pins in package.json that a routine update must
  not loosen. ROADMAP phase 3 lists them under the Next 15/16 item.

## D-020: Prisma 7 with the node-postgres adapter, CommonJS client

- Date: 2026-11-13
- Status: Accepted (owner asked for Prisma and Stripe upgrades; the setup
  was chosen by Claude).
- Context: Prisma 7 requires a driver adapter, a generated client outside
  `node_modules`, and connection strings in `prisma.config.ts`. Its guide
  suggests making the project an ES module.
- Decision: `@prisma/adapter-pg` (node-postgres) on the pooled
  `DATABASE_URL`; the `prisma-client` generator with `moduleFormat = "cjs"`
  into `src/generated/prisma` (git-ignored); `prisma.config.ts` uses
  `DIRECT_URL` for migrations.
- Alternatives:
  - `@prisma/adapter-neon` (Neon's serverless driver over WebSockets/HTTP):
    better for edge runtimes, but everything here runs on Node, and `pg`
    keeps the app independent of the Postgres host.
  - `"type": "module"` for the whole project: not required with
    `moduleFormat = "cjs"`, and it would ripple through Next 14's config
    files.
- Consequences: Imports of `PrismaClient` and `Prisma` come from
  `@/generated/prisma/client`. `pnpm install` must run `prisma generate`
  (postinstall) before type-check or build, which CI already does.

## D-021: The "ink on aurora" design is approved

- Date: 2026-11-14
- Status: Accepted. Resolves O-9.
- Context: The owner was asked to review the look from D-015 and D-016 in
  light and dark.
- Decision: "It's good, keep it." The design in `docs/DESIGN.md` stands.
- Alternatives: None raised.
- Consequences: New screens follow `docs/DESIGN.md` without a further
  review of the direction.

## D-022: Pro costs INR 199 a month

- Date: 2026-11-14
- Status: Accepted.
- Context: The pricing page showed "$500" while the Stripe price charged
  INR 1,999 a month. The owner said "keep it 199 a month" and, asked which
  currency, chose rupees only.
- Decision: One price, INR 199 a month, shown as "₹199". `PLANS` carries
  the amount and the currency; `formatPrice()` renders it.
- Alternatives: INR 199 plus a USD 1.99 price (two Stripe prices and code to
  pick one per visitor). USD 199.
- Consequences: The Stripe price id in `src/config/stripe.ts` still points
  at the old INR 1,999 price. Until the owner creates an INR 199 monthly
  price and its id is put there, checkout charges more than the page says.

## D-023: Pro reads more of the document; no support promise

- Date: 2026-11-14
- Status: Accepted (owner picked Claude's recommended option).
- Context: The pricing page promised Pro "Higher-quality responses" and
  "Priority support". Both plans got identical answers and there is no
  support channel.
- Decision: Make the first claim true and remove the second. Pro retrieves
  8 passages per question instead of 4 and sends the last 12 messages as
  history instead of 6 (`retrievalTopK`, `historyMessages` in `PLANS`,
  read by the chat route). "Priority support" is gone from the page.
- Alternatives: Remove both lines (plans would differ only in upload
  limits). Also add a support email for Pro (needs someone to answer it).
  A stronger model for Pro (costs more per answer and may not be on the
  free Gemini tier).
- Consequences: Same model for both plans; the difference is how much of
  the PDF and the conversation it sees. Pro prompts are about twice as
  long, so they use more of the Gemini quota. The pricing page states the
  actual numbers, read from `PLANS`.

## D-022: Next 16 and React 19, built with Turbopack

- Date: 2026-11-14
- Status: Accepted (owner asked for the Next 16 / React 19 upgrade; the
  details were chosen by Claude). Supersedes the pins in D-019.
- Context: Last step of ROADMAP phase 3. Kinde 2.13, tRPC 11 and React
  Query 5 all support Next 16 and React 19.
- Decision: Next 16.4.6 and React 19.3.1. Build with Turbopack (Next 16's
  default), so the old webpack aliases for `canvas` and `encoding` are
  removed (pdf.js 6 handles `canvas` itself). `middleware.ts` becomes
  `proxy.ts`. ESLint 9 with a flat `eslint.config.mjs`, since `next lint`
  is gone. The OG and Twitter images run on Node instead of the
  deprecated Edge runtime. react-pdf 11 with `pdfjs-dist` pinned to the
  version it depends on; react-resizable-panels unpinned.
- Alternatives:
  - Next 15 first: one more step to verify, and Next 15 is already behind.
  - Keep webpack (`next build --webpack`): would keep the aliases, but
    Turbopack is the default and faster, and the aliases are no longer
    needed.
  - Turn off React's new hook lint rules: rejected; the six findings were
    fixed instead (`useHasMounted` with `useSyncExternalStore`, state
    adjusted during render, an unused ref removed).
- Consequences: Route `params`, `headers()` and `cookies()` are promises.
  `pdfjs-dist` must move together with react-pdf.

---

# Open decisions

Not yet decided by the owner. Recommendations are Claude's and are not binding.

| # | Question | Options | Recommendation |
|---|---|---|---|
| O-7 | Confirm D-012 (own vector store and PDF loader on LangChain core)? | Keep it; or switch to the official `@langchain/pgvector` store | Keep it |

Resolved: O-9 became D-021. O-8 became D-015. O-1 became D-004, O-2 became D-005, O-3 became D-006, O-4 became
D-009, O-5 became D-010 and then D-011, O-6 became D-007 and then D-008.
