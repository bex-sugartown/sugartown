---
**Epic:** SUG-160 — Article: I Was Online Before It Was a Thing + TechTimeline component
**Linear Issue:** [SUG-160](https://linear.app/sugartown/issue/SUG-160/article-i-was-online-before-it-was-a-thing-techtimeline-component)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (a) Merge-as-you-go — Phase 1 (TechTimeline component) merges first; Phase 2 (article + about updates) merges after
---

# SUG-160 — Article: I Was Online Before It Was a Thing + TechTimeline component

Build the `TechTimeline` DS component and publish the personal-history article "I Was Online Before It Was a Thing" — Bex's BBS-to-AI narrative with embedded timeline, doll computer photo section, and about page updates.

## Background

No long-form personal narrative exists on Sugartown today. The About page is a short positioning statement; the site's editorial voice is present in articles and nodes but has never been used for first-person memoir. The outline "I Was Online Before It Was a Thing" has been drafted to v3 and is marked ready for first draft. It requires a `TechTimeline` component that does not yet exist — a structured, archaeological-register timeline for embedding within article content. The component must ship before the article can be published.

About page updates are scoped to minor copy and metadata changes that reflect the article going live and establish Bex's pre-web network history as a signal alongside the current consulting positioning.

## Objective

After this epic: (1) a `TechTimeline` DS component exists, is documented in Storybook under Ledger, and can be embedded in any article via the section builder or portable text renderer; (2) the article "I Was Online Before It Was a Thing" is published at `/articles/i-was-online-before-it-was-a-thing`; (3) the About page carries a light update linking to or contextualising the article. Layers touched: DS component (packages + web adapter), Sanity schema (timeline entry type), GROQ query (timeline projection), React render (article + section builder), content (article body + about copy). AEO and SEO layers not in scope for Phase 1.

## Scope

### Phase 1 — TechTimeline component

- [ ] Define `techTimeline` section builder type in `apps/studio/schemas/` with `entries[]` array (year, headline, body, optional photo) — layer: schema
- [ ] Deploy schema — layer: schema
- [ ] `TechTimeline` DS primitive in `packages/design-system/src/components/TechTimeline/` — IBM Plex Mono year anchors, DM Sans body, optional photo slot, `--st-*` tokens throughout — layer: Design System
- [ ] Web adapter in `apps/web/src/design-system/components/TechTimeline/` — layer: Design System
- [ ] Register `techTimeline` case in `PageSections.jsx` — layer: Frontend
- [ ] Storybook story in Ledger category: default state, photo variant, edge case (long headline, missing photo) — layer: Storybook
- [ ] `pnpm tokens:build` + `pnpm validate:tokens` 0 errors — layer: Tooling

### Phase 2 — Article + About updates

- [ ] Article draft created in Sanity Studio as draft: "I Was Online Before It Was a Thing" with all 8 sections from outline; timeline section uses `techTimeline` entries for BBS years — layer: content
- [ ] Source / verify timeline entry detail (The Wave BBS specifics, Chapel Perilous screenshot, Feeverte screenshot, doll collection photos) — layer: content
- [ ] Photo assets uploaded to Sanity following `{docType}-{subject}-{descriptor}` naming convention — layer: content
- [ ] Content Write Gate proposal reviewed and approved before any Sanity patches — layer: content
- [ ] Article published at `/articles/i-was-online-before-it-was-a-thing` — layer: content
- [ ] About page updated with light copy and/or article cross-link — layer: content

## Phases

**Phase 1 — TechTimeline component** (schema + DS primitive + web adapter + Storybook)
Ships as its own merge + mini-release. Nothing in Phase 2 starts until Phase 1 is merged.

**Phase 2 — Article draft + About updates** (content, photos, publish)
Uses the Phase 1 component. Ships as its own merge + mini-release.

## Acceptance criteria

**Phase 1:**
- [ ] `techTimeline` schema type deployed; MCP writes succeed with a sample entry
- [ ] `TechTimeline` renders correctly in both `default` and `dark-pink-moon` Storybook themes
- [ ] All timeline entries have breathing room at mobile (vertical stack, year left-flush) and desktop (offset or two-column)
- [ ] `pnpm validate:tokens` returns 0 errors on the new component CSS
- [ ] No hardcoded color values in component CSS (`pnpm validate:tokens --strict-colors` passes)
- [ ] Storybook story covers: default, photo variant, long-headline edge case

**Phase 2:**
- [ ] Article exists as a published document in Sanity
- [ ] `/articles/i-was-online-before-it-was-a-thing` resolves in the web app with all 8 sections rendering
- [ ] Timeline section renders using `TechTimeline` component (not a prose approximation)
- [ ] Doll computer photos have captions in the deadpan register specified in the outline
- [ ] Content Write Gate proposal approved before any patches executed
- [ ] About page updated and published

## Technical notes

**Content Write Gate:** fires in Phase 2 for all article body content and about page copy. All article text is derived from the v3 outline — show before/after table covering headline, body text, and any about page fields before patching.

**Schema:** `techTimeline` is a new document section type. Fields: `entries[]` (array of `techTimelineEntry` object: `year` string, `headline` string, `body` portableText, `photo` richImage optional). Activation audit: read `apps/studio/schemas/objects/` and `PageSections.jsx` before writing schema to confirm naming conventions and registration pattern. Check whether `richImage` is the correct image wrapper type for optional timeline photos.

**TechTimeline Phase 0 mock required:** The TechTimeline component has a detailed visual spec in the outline (IBM Plex Mono year anchors, sparse layout, optional photo offset treatment, mobile vertical stack). Before writing any JSX: produce an HTML mock at `docs/drafts/SUG-160-techtimeline-mock.html` and get Phase 0 sign-off. The spec in the outline section "Component Spec: TechTimeline" is the starting point.

**Photo sourcing:** Chapel Perilous (1995) and Feeverte (1997) screenshots require archive recovery by Bex. Doll computer collection needs 5–8 photos. Do not publish Phase 2 until photo assets are available — the article's photo section is load-bearing for the tonal structure.

**Open questions to resolve before Phase 2 first draft:**
1. Did you use SFnet at a specific cafe? (Horseshoe, Ground Zero, Brain Wash, Club Coffee?)
2. The Wave BBS: sysop handle? Board flavour (games, chat, files, scene-specific)?
3. Critical Path webmail role: named or described by function?
4. Mondo 2000 connection: reader or contributor?
5. Name first boyfriend and BBS friends, or keep as "people I still know"?

**Model & Mode:** `/model opusplan` — Opus plans Phase 1 component architecture (DS primitive + schema design), Sonnet executes. Phase 2 is pure content with Content Write Gate; `/model sonnet` for Phase 2 session.

### Schema field proposal

| Field | What it is | Example value | Why it matters |
|-------|-----------|---------------|----------------|
| `year` (string) | Year anchor displayed in IBM Plex Mono | `"1987"` or `"Late 80s–early 90s"` | Allows fuzzy/approximate dates, not just integers |
| `headline` (string) | Bold entry title | `"The Wave."` | Primary scannable label per timeline node |
| `body` (portableText) | Entry narrative text | "Home dial-up, 1300 baud…" | Supports inline marks, links, bold |
| `photo` (richImage, optional) | Full-width or offset image for this entry | Chapel Perilous screenshot | Photo slots are optional per entry; when present, full-width or offset — not thumbnails |

## Model & Mode

`/model opusplan` for Phase 1 (component architecture decision: DS primitive vs page-specific, schema design, file structure). `/model sonnet` for Phase 2 (content-only session, Content Write Gate enforced).

## Non-Goals

- AEO/SEO optimisation pass on the article (can follow as its own content epic)
- About page visual redesign or structural changes (copy updates only)
- Animation beyond scroll-reveal on timeline entries
- Timeline entries embedded in portable text inline (section builder only for v1)
- Any changes to the existing article schema fields

## Related

- **Linear:** [SUG-160](https://linear.app/sugartown/issue/SUG-160/article-i-was-online-before-it-was-a-thing-techtimeline-component)
- **Article outline:** `docs/drafts/` (local only — Bex's machine)
- **Outline reference:** v3, corrected BBS section (SFnet confirmed, Community Memory removed), status: ready for first draft
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
