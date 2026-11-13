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
- Status: Accepted
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

---

# Open decisions

Not yet decided by the owner. Recommendations are Claude's and are not binding.

| # | Question | Options | Recommendation |
|---|---|---|---|
| O-7 | Confirm D-012 (own vector store and PDF loader on LangChain core)? | Keep it; or switch to the official `@langchain/pgvector` store | Keep it |

Resolved: O-1 became D-004, O-2 became D-005, O-3 became D-006, O-4 became
D-009, O-5 became D-010 and then D-011, O-6 became D-007 and then D-008.
