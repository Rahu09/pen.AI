# pen.AI

Chat-with-your-PDF SaaS. Next.js App Router, tRPC, Prisma/Postgres, Kinde auth,
UploadThing, Pinecone + OpenAI, Stripe. Package manager is **pnpm**.

## Before you do any work

The files below are the project's memory. They are imported here so they are in
context at the start of every chat. Treat them as the source of truth over your
own assumptions, and do not re-open a decision that is already logged unless
the user asks to.

@docs/PROJECT.md
@docs/ROADMAP.md
@docs/DECISIONS.md

Also read the top two or three entries of `docs/SESSION_LOG.md` (newest first)
to see where the last chat stopped.

If the code and the docs disagree, the code wins: say so, then fix the doc.

## Before you finish any chat that changed something

1. `docs/SESSION_LOG.md`: add an entry at the top (date, what was asked, what
   was done, what was left open, suggested next step).
2. `docs/DECISIONS.md`: append an entry for every decision the user made or
   approved in this chat. Record the context and the alternatives that were
   rejected, not only the outcome. Move anything settled out of "Open decisions".
3. `docs/ROADMAP.md`: tick finished items, add newly discovered work.
4. `docs/PROJECT.md`: update only if architecture, env vars, services or
   commands changed.

A chat that only answered a question needs no doc update.

## Commands

```bash
pnpm install          # also runs prisma generate
pnpm dev              # http://localhost:3000
pnpm build
pnpm lint
pnpm exec tsc --noEmit
```

There are no tests yet (see ROADMAP phase 6).

## Conventions

- `@/` maps to `src/`.
- Server components by default; add `"use client"` only where needed.
- UI primitives are shadcn/ui (style `default`, base colour `zinc`) in
  `src/components/ui`. Reuse them before adding new ones.
- All tRPC procedures live in `src/trpc/index.ts`; use `privateProcedure` for
  anything that touches user data and always scope queries by `userId`.
- Plan limits come from `src/config/stripe.ts` (`PLANS`). Do not hardcode limits
  elsewhere.

## Rules

- Never print, log or paste values from `.env`. Refer to variables by name only.
- Never hardcode a key or secret in source. New variables go in `.env.example`.
- The GitHub repo is public. Assume anything committed is world-readable.
- Never run `git commit`, `git push`, or anything else that writes history or
  touches the remote (amend, rebase, merge, tag, opening a PR). The owner does
  all of that. Do not offer to do it either. When work is finished, hand off:
  list the changed files and give a suggested commit message.
