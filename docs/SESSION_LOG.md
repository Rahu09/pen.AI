# Session log

Newest entry first. One entry per chat that changed something.

Entry format:

```
## YYYY-MM-DD: Short title
- Asked: what the owner wanted
- Done: what changed (files, commits)
- Found: anything learned that is not obvious from the diff
- Open: what was left unfinished or undecided
- Next: suggested starting point for the next chat
```

---

## 2026-11-13: Phase 2 code work (same chat as the entry below)

- Asked: "pushed, start phase 2".
- Done:
  - Schema: `directUrl`, real cascading foreign keys, indexes, `DocumentChunk`
    with a `vector(1536)` column. Migration
    `20261113000000_pgvector_and_foreign_keys` written offline with
    `prisma migrate diff`.
  - Packages: removed `langchain` 0.0.166, `@pinecone-database/pinecone`, `ai`,
    `openai`; added `@langchain/core`, `@langchain/openai`,
    `@langchain/textsplitters`. Lockfile converted from pnpm v6 format to v9
    with the previously locked versions kept. `engines.node >= 22` and
    `pnpm.onlyBuiltDependencies` added to `package.json`.
  - New: `src/config/ai.ts`, `src/lib/pdf-loader.ts`, `src/lib/vector-store.ts`,
    `src/types/pdfjs.d.ts`. Deleted: `src/lib/pinecone.ts`, `src/lib/openai.ts`.
  - Rewritten: ingest in `src/app/api/uploadthing/core.ts` (load, limit check,
    split, embed and store) and `src/app/api/message/route.ts` (LangChain
    retrieval chain with streaming).
  - Fixed on the way: chat history used the oldest 6 messages; over-limit PDFs
    were embedded before being rejected.
  - Docs, README, `.env.example` and `CLAUDE.md` updated. Nothing committed.
  - Later in the same chat the owner switched the AI provider to Google Gemini
    (D-013). `@langchain/openai` replaced by `@langchain/google` (chat) and
    `@langchain/google-genai` (embeddings); new `src/lib/embeddings.ts`;
    `GOOGLE_API_KEY` replaces `OPENAI_API_KEY`. Type-check and build pass.
  - The owner asked to be guided through creating the Neon database; the steps
    were given in the chat (pooled string to `DATABASE_URL`, direct string to
    `DIRECT_URL`, then `pnpm exec prisma migrate deploy`).
- Found:
  - `@langchain/community` has been retired, which led to D-012.
  - The OpenAI key in `.env` is invalid (401).
  - `.env` still points at ElephantSQL; Neon has not been set up.
  - pnpm 10 cannot read the old lockfile format and would have re-resolved
    every dependency; converting with pnpm 9 first avoided that.
- Verified: type-check, lint, production build; PDF loader and splitter on a
  generated PDF. After the owner created the Neon project, applied the
  migrations and added `GOOGLE_API_KEY`: the vector store on Neon (insert,
  search, per-file scoping, cascade deletes), both Gemini models live, and the
  whole pipeline on a generated PDF with real embeddings. The dev server
  starts and the Kinde sign-in page loads.
- Not verified: the app in the browser while signed in (Kinde callback,
  UploadThing upload, chat route over HTTP, Stripe). Needs the owner to sign in.
- First browser test by the owner: sign-in worked; upload ended in "Too many
  pages" for a 3-page PDF. Cause: `core.ts` built the file URL from an S3 host
  that now returns 403, so an XML error page was parsed as a PDF. Fixed by
  using `file.url`. Also fixed the "Back" link on the failed-upload screen.
  Files uploaded before the fix have the dead URL stored and must be deleted
  and uploaded again.
- Noticed: `.env.example` went back to its committed (old) content at some
  point after Claude updated it; restored at the owner's request.
- Noticed: Kinde SDK 1.8 prints tokens to the server log on sign-in (ROADMAP
  phase 3).
  `.claude/launch.json` was added so the dev server can be started from the
  app's preview pane.
- Open: O-7 (confirm D-012). Owner actions at the top of ROADMAP phase 2.
- After the fix the owner uploaded again and reported it working; the
  database shows the file as `SUCCESS` with 6 embedded chunks. No chat
  messages are stored yet.
- Next: owner asks one question in the chat and deletes a file in the
  browser, then commits phase 2. After that, phase 3 (dependency upgrade),
  starting with the Kinde SDK. Fix whatever that turns up before starting phase 3.

## 2026-11-13: Repository analysis and docs scaffold

- Asked: Analyse the repository, plan how to update the project (dashboard UI
  upgrade in particular), and set up docs, a decision log and a `CLAUDE.md`
  that makes every chat read them first.
- Done: Read the whole codebase. Wrote `CLAUDE.md`, `docs/PROJECT.md`,
  `docs/ROADMAP.md`, `docs/DECISIONS.md`, this file and `.env.example`. Changed
  the README setup steps to pnpm. No application code was changed. Nothing was
  committed.
- Found:
  - The Pinecone API key is hardcoded in `src/lib/pinecone.ts` in a public repo.
  - A `.env` containing the Kinde client secret was committed on 2023-10-01
    (pre-rewrite commit `4648d9f`) and removed in the next commit.
  - `DATABASE_URL` points at ElephantSQL, which has been discontinued.
  - During the analysis a redaction command failed and the database connection
    string was printed into that chat's local tool output. Treat it as exposed.
  - Type-check passes; lint has warnings only; there are no tests.
  - The working tree had an uncommitted edit to `src/components/BillingForm.tsx`
    (two comment lines and a trailing comma) from before this chat. Left as is.
- Rule set by the owner: Claude never commits or pushes; the owner does all git
  history and remote operations. Recorded in `CLAUDE.md`.
- Decided: Neon for Postgres (D-004), stay on OpenAI (D-005), dependencies
  before the dashboard (D-006). Vector storage went back and forth: keep
  Pinecone (D-007), then superseded the same day by pgvector in Neon with
  Pinecone removed (D-008). Keep LangChain and migrate it (D-009). The owner
  said the project is being revived as interview material.
  Git history: first "leave it" (D-010), then superseded by "rewrite it"
  (D-011). After the owner committed the docs, Claude ran the rewrite locally
  with `git filter-repo`: `.env` removed from all commits, Pinecone key and
  Kinde secret values replaced with placeholders, both stashes kept. Verified
  that no commit, stash or stored object contains either value. All commit
  hashes changed. A full backup is in `E:\production\pen.AI-backup-2026-11-13`.
  The force-push has NOT been done; it is the owner's.
- Found during the rewrite: the Kinde client secret in the current `.env` is
  the same value that was committed in 2023, so it has never been rotated.
- Open: No open decisions. Revoking the Pinecone
  key, rotating the Kinde secret and creating the Neon project have to be done
  by the owner.
- Next: Owner force-pushes `main`, then ROADMAP phase 2. Owner revokes the
  Pinecone key, rotates the Kinde secret and creates the Neon project. Then delete the hardcoded key, add
  `directUrl`, run migrations, and rewrite ingest and retrieval on current
  LangChain with its pgvector store. Explain each retrieval step (embedding,
  storing, similarity search) while building it, so the owner can describe what
  LangChain does underneath.
