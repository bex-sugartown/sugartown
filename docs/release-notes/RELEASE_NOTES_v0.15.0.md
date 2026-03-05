# Release Notes — v0.15.0

**Date:** 2026-03-05
**Scope:** Sugartown monorepo — apps/web, apps/studio, apps/storybook, packages/design-system

---

## What this release is

v0.15.0 aggregates five patch releases (0.14.1–0.14.5) into a coherent design system
foundation milestone. It delivers three new primitives (Card, Chip, theme system), migrates
all archive and metadata surfaces to the new Card API, implements 326 WordPress URL
redirects, and resolves pre-release token drift found by the new `validate:tokens` script.

---

## What changed

### Design system primitives: Card and Chip

The `packages/design-system` package now ships a named-prop `Card` component with a
formal API covering `variant` (`default`, `listing`, `metadata`), `density`, `status`,
`evolution`, `category`, `tags[]`, `tools[]`, `metadata[]`, `accentColor`, `href`,
and `thumbnailUrl`. Seventeen Storybook stories cover all combinations.

The new `Chip` component is polymorphic (`<span>` or `<a>`), supports three variants
(`tag` filled pink, `tool` outlined seafoam, `category` neutral), and accepts an optional
`colorHex` accent for per-instance colorways via `color-mix()`. Five stories.

`Button/index.ts` was missing its export — added.

### Light/dark theme system

A `ThemeToggle` component in the Header toggles `[data-theme]` on `<html>` and persists
the choice to `localStorage`. `index.html` defaults to `data-theme="dark"`. A
`theme.light.css` stylesheet provides full light-theme overrides; `theme.pink-moon.css`
was updated to the new token structure. Dark-mode overrides were applied across all DS
component CSS modules (Blockquote, Button, Callout, CodeBlock, Media, Table). Storybook's
docs canvas background now matches the active theme.

### Card adapter migration across all archive surfaces

The web Card adapter (`apps/web/src/design-system/components/card/`) was rewritten to
mirror the DS Card named-prop API. `ContentCard` maps Sanity document fields to DS Card
props and derives chip arrays from `projects[]`, `categories[]`, `tools[]`, and `tags[]`.
`MetadataCard` uses `variant='metadata'` with structured label/value rows and per-type
chip rows. `TaxonomyChips` was refactored to use the web Chip adapter. `ArchivePage` wires
the Sanity `displayStyle` field to the Card `variant` prop (`grid` → `default`,
`list` → `listing`).

### Token layer — drift resolved pre-release

The new `validate:tokens` script (added in this release) checks that every `var(--st-*)`
reference in CSS files resolves to a defined token. Running it as part of the release
process found that the DS package token file was missing 54 tokens present in the web
canonical file. All 54 were added before release (spacing `--st-space-7/8`; semantic
radius aliases including `--st-radius-button/tag/pill/callout/code/card/hero/media`;
background, text, link, state, and heading font aliases; spacing stack/inline/inset/gutter
aliases; shadow semantic aliases; Pill/Tag component tokens; media component tokens; and
legacy aliases). Additionally, `--st-button-radius` was corrected from `var(--st-radius-sm)`
(8 px) to `var(--st-radius-button)` (4 px). The web file was also missing `--st-radius-1/2/3`
— added. Both files now pass at 301 properties each, exit 0.

### Studio schema changes

Node `Status` was renamed to `Evolution`; project lifecycle stages were expanded
(Seed → Sprout → Growing → Mature → Stable → Sunset). `archivePage` gained a
`displayStyle` field and an expanded `cardOptions` object. The `status` field was removed
from `article` and `caseStudy` — editorial lifecycle is now handled by Sanity document
state. Sanity and `@sanity/vision` bumped from 5.12 → 5.13.

### URL redirects

326 legacy WordPress URLs were classified and redirected via `netlify.toml` across 5
decision batches. NodePage content section rendering was corrected. `validate:content` was
extended with additional integrity checks.

### Process

A two-tier mini-release cadence was established: PATCH per completed epic, MINOR
aggregating patches. `CLAUDE.md` documents the epic close-out sequence and studio schema
isolation rule.

---

## Not in this release

- Web Card adapter migration is complete for archive/taxonomy surfaces; CaseStudyPage,
  NodePage, ArticlePage, PersonProfilePage, ProjectDetailPage callers still use the old
  adapter (migration epic not yet scoped)
- 33 intentional token value mismatches remain between DS `:root` (light baseline) and
  web `:root` (dark baseline) — these are theme architecture differences, not errors
- Phase 2 IA sections (`/docs`, `/governance`, `/ai-ethics`, Platform sub-pages) remain
  deferred per the IA brief

---

## Validator state at release

```
pnpm validate:urls      ✅  passed (exit 0)

pnpm validate:tokens    ✅  0 missing from DS, 0 missing from web (301 properties each), exit 0
                            33 intentional value mismatches (dark vs light :root baseline)

pnpm validate:content   ❌  5 errors, 11 warnings — pre-existing Sanity content issues, not regressions
```

### validate:content detail

**5 errors — duplicate slugs (published + draft pairs):**

| Type | Slug | Issue |
|------|------|-------|
| `node` | `post-mortems-as-system-upgrades` | published + draft pair |
| `caseStudy` | `prestige-beauty-pilot-headless-cms-enterprise-design-system` | published + draft pair (`wp.caseStudy.388` + `drafts.wp.caseStudy.388`) |
| `tag` | `agile` | native + WP-migrated pair (`969ac270…` + `wp.tag.246`) |
| `page` | `about` | 3 docs: native published, native draft, WP-migrated (`wp.page.482`) |
| `page` | `cv-resume` | published + draft pair (`wp.page.207` + `drafts.wp.page.207`) |

**Root cause:** The validator uses `perspective: 'raw'` to catch all document variants.
Published + draft pairs are expected during active editing. The WP-migrated duplicates
(`wp.tag.246`, `wp.page.482`, `wp.page.207`) are leftover migration artefacts that should
be cleaned up in Studio.

**11 warnings — HTML entities in PortableText (legacy WP import):**

| Type | Title | Entity count |
|------|-------|-------------|
| `article` | Core Web Vitals Don't Belong to Frontend | 7 spans |
| `article` | Claude Code Joins the Agentic Caucus | 33 spans |
| `node` | Confession: I Don't Lack Memory… | 24 spans |
| `node` | System Changelog | 5 spans |
| `node` | Process Insight: When to Fire Your AI | 8 spans |
| `node` | Knowledge Graph Roadmap | 2 spans |
| `node` | How I Learned to Stop Renaming… | 4 spans |
| `node` | Which Chatbot Is Best for Web Design? | 2 spans |
| `node` | Architecture Decision: The "Overwrite" Risk | 5 spans |
| `node` | Visualizing the Knowledge Graph | 2 spans |
| `node` | Meta-Analysis: Am I Crazy for Building This? | 4 spans |

**Entities seen:** `&#8217;` (right single quote), `&#8220;` / `&#8221;` (left/right
double quotes), `&#8230;` (ellipsis), `&#8216;` (left single quote), `&#038;` (ampersand).
All originated from the WordPress HTML → PortableText migration.

**Fix:** Either run `decodePortableText()` in the page component render path, or clean
the source spans in Sanity Studio with a bulk migration script.

---

## Follow-up issues

1. **[Content] Clean WP-migrated duplicate documents** — Remove `wp.tag.246` (agile),
   `wp.page.482` (About Me), `wp.page.207` / `drafts.wp.page.207` (CV / Resume) in
   Sanity Studio. These are migration artefacts shadowing native documents.
   Priority: should-fix before next release.

2. **[Content] Decode HTML entities in PortableText** — 11 documents (2 articles, 9 nodes)
   contain literal `&#NNNN;` entities from the WordPress import. Options:
   (a) Write a bulk migration script to decode entities in Sanity, or
   (b) Apply `decodePortableText()` in the render path.
   Priority: should-fix (cosmetic, but affects content quality).

3. **[Tokens] Resolve 33 intentional value mismatches** — The DS package uses light
   defaults in `:root` while the web app uses dark defaults. Both files override via
   `[data-theme]` blocks, so runtime behaviour is correct. A future token architecture
   pass should unify the `:root` baseline (likely to dark, matching the web canonical
   file) so the validator reports 0 mismatches. Priority: nice-to-have.
