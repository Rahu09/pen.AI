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
    (commit `4648d9f`) and removed in the next commit; it is still in history.
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
  (D-011). The rewrite was not run in this chat: the working tree was dirty and
  the docs had not been committed yet.
- Open: No open decisions. Revoking the Pinecone
  key, rotating the Kinde secret and creating the Neon project have to be done
  by the owner.
- Next: ROADMAP phase 2. Owner revokes the Pinecone key, rotates the Kinde
  secret and creates the Neon project. Then delete the hardcoded key, add
  `directUrl`, run migrations, and rewrite ingest and retrieval on current
  LangChain with its pgvector store. Explain each retrieval step (embedding,
  storing, similarity search) while building it, so the owner can describe what
  LangChain does underneath.
