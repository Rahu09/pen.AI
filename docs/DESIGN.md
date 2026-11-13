# Design notes

Written 2026-11-13 with ROADMAP phase 4. The direction below was chosen by
Claude while building and has not been reviewed item by item by the owner.

## Direction: "ink on aurora"

Revised 2026-11-13 at the owner's request: they preferred the original
look (the moving lavender and indigo gradient, the typed headline, the blue
accents) over the flat redesign, minus the glowing borders around pictures.
So the old palette and motion come back, and everything around them is
rebuilt with one idea: **pen.AI is about documents, so the interface borrows
from paper and ink, and the aurora is the only loud thing on screen.**

What makes it ours rather than a template:

- **A serif voice.** Headlines are set in Instrument Serif (a narrow
  editorial serif), with the key word in italic and in the accent blue.
  Interface text stays in Inter. Bold sans headlines are what every
  generated landing page uses, so we do not.
- **Marks a reader would make.** The accent word gets a hand-drawn
  underline that draws itself after the headline is typed. Matched passages
  are shown with a highlighter stroke (lilac, slightly skewed ends), not a
  tinted box. Two margin notes in handwriting (Caveat) point at the product
  picture. That is the limit: two notes, one underline.
- **Paper, not glass.** Pictures and cards are sheets: white, a hairline
  edge, a short tight shadow plus a long soft one, a page number in the
  corner. Nothing glows. No animated or gradient borders, no coloured
  shadows, no gradient text.
- **Folio numbering.** Steps are `01 02 03` in the serif, on a rule, the way
  the old page did "Step 1" on a top border.

## Colour

Kept from the original UI:

| Role | Value | Where |
|---|---|---|
| Aurora base | `#c7d2fe` to `#e9d5ff` (periwinkle to lilac), 40 degrees | Hero panel, app header wash |
| Aurora blobs | blue `18 113 255`, magenta `221 74 255`, cyan `100 220 255`, red `200 50 50` at 70%, plum `140 0 160` | Same, `hard-light` blend |
| Bloom | `#ff80b5` to `#9089fc`, blurred polygon at 30% | Behind sections on the landing page |
| Accent | blue 600 (the `primary` token, unchanged) | Links, primary buttons in the app, accent word |
| Old avatar | cyan 500 to blue 500 | File placeholder, usage bar |

Added: **ink** (`zinc-950`) for headlines and the main landing-page button,
and **paper** (the existing grain texture over white) as the page surface.
In the app, only semantic tokens are used, as before, so dark mode works;
the aurora wash is dimmed there.

## Type

- Display: Instrument Serif 400, normal and italic (`font-serif`). Hero
  `text-[2.6rem]` to `text-8xl`, section titles `text-4xl` to `text-5xl`,
  app page titles `text-4xl`. Tight leading (`leading-[0.95]` to `1.05`).
- Interface: Inter (`font-sans`). Body `text-sm` in the app, `text-lg` for
  landing-page lead text.
- Handwriting: Caveat (`font-hand`), margin notes only.

## Dark mode: ink on aurora at night

Added 2026-11-13 at the owner's request, for the public pages too.

- Page: indigo-black (`246 33% 6%`), not the old slate navy, so it belongs
  to the aurora. Cards are one step lighter, like carbon paper.
- Accent: blue lifted to `217 92% 68%` so it reads on ink.
- Aurora: the same blobs on a deep indigo base (`#1e1b4b` to `#2e1065`),
  dimmed and slightly more saturated. The bloom drops to 20%.
- Buttons invert: the ink pill becomes a paper pill, and the paper button
  becomes ink.
- Grain stays, as faint light specks (5%, screen blend).
- PDF pages stay white.

## Motion

- Aurora: five blurred blobs drifting on 20 to 40 second loops, plus one that
  follows the pointer in the hero. CSS only, no React re-render per frame.
- Headline: typed letter by letter (about 45 ms per letter) with a blue
  caret, then the underline draws in 0.7 s.
- Cards lift by 2px and their shadow lengthens on hover. Arrows in buttons
  nudge right. Nothing else moves.
- `prefers-reduced-motion`: the aurora stands still, the headline and
  underline appear at once.

## Layout

- `src/components/app-shell/AppShell.tsx` frames every page under
  `/dashboard`. It fills the viewport exactly (`h-[100dvh]`), so pages inside
  use `h-full` and flex instead of `calc(100vh - ...)`.
- Wide screens (`lg`, 1024px and up): a 240px sidebar with navigation, the
  usage card, the account menu and the theme switch. On a single file's page
  it narrows to a 64px icon rail, because the PDF and chat need the width.
- Narrow screens: a 56px top bar replaces the sidebar. The usage card moves
  into the Files page.
- Page content is centred with a maximum width (`max-w-6xl` for Files,
  `max-w-3xl` for Billing) and `px-4 sm:px-6 lg:px-8` gutters.
- The public pages are in the `(marketing)` route group with their own
  navbar and footer. Route groups do not change URLs.

## Theme rules

- Only the semantic tokens from `src/app/globals.css` (`background`,
  `foreground`, `card`, `muted`, `primary`, `border` and so on), plus the
  fixed aurora colours above. No raw `zinc-*`, `gray-*` or `blue-*` classes,
  because they do not follow the theme. Two exceptions: the PDF page in the
  landing-page picture (a document, always white) and the "under the hood"
  band (always ink).
- Light, dark and system themes through `next-themes`, on every page. The
  switch is in the marketing navbar, the app sidebar and the app top bar.
- A PDF page stays white in dark mode. It is a document, not interface.
- Status is never colour alone: every badge has an icon and a word.

## Spacing

- One `h1` per page. Tailwind's spacing scale only. Corners: `rounded-md`
  for controls, `rounded-xl` for cards and sheets, `rounded-3xl` for the
  hero panel.

## Components

Primitives are shadcn/ui in `src/components/ui`. Added in phase 4: `badge`,
`skeleton`. Dialogs reuse the existing `dialog`; menus the existing
`dropdown-menu`.

| Area | Files | Notes |
|---|---|---|
| Shell | `app-shell/*` | `PlanProvider` / `usePlan()` gives every page the user's plan limits without prop drilling |
| Files page | `dashboard/Dashboard.tsx` | Container: query, search, sort, view, dialogs, page-wide drop |
| File item | `dashboard/FileCard.tsx` | `FileCard` (grid) and `FileRow` (list) |
| Preview | `dashboard/PdfThumbnail.tsx`, `PdfFirstPage.tsx` | First page rendered with pdf.js, only when the card nears the viewport |
| Actions | `dashboard/FileActionsMenu.tsx`, `FileDialogs.tsx`, `use-file-actions.ts` | Rename and delete are optimistic and roll back on error |
| Upload | `dashboard/UploadDialog.tsx`, `use-pdf-upload.ts` | One dialog for the button and for page-wide drag and drop |
| States | `dashboard/FilesStates.tsx` | Skeleton, empty, no search matches, load error, drop overlay |
| File page | `file/FileWorkspace.tsx` | Resizable split on wide screens, PDF / Chat tabs on narrow ones |

## Behaviour rules

- Every list has four states: loading (a skeleton shaped like the result),
  empty, error with a retry, and content.
- Destructive actions ask first, and say what else goes with them (a file's
  chat messages).
- The view choice (grid or list) and the PDF / chat split are remembered in
  the browser (`localStorage`).
- Limits are checked in the browser for a specific message, and again on the
  server, which is the one that counts.
- Icon-only buttons have an `aria-label`. Everything works from the keyboard.

## Known gaps

- Failed files show one generic reason. The cause is not stored.
- The file thumbnail downloads the PDF in the browser; nothing is cached on
  the server.
- The sidebar cannot be collapsed by hand.
- The public pages have no dark mode.
- The pricing page is restyled only on the surface (type, cards, no glow);
  its layout and copy are the old ones.
