# SUG-46 — Storybook Parity Restoration

**Linear Issue:** SUG-46
**Status:** Backlog
**Epic type:** Restoration (re-execution of lost SUG-38/39/40 work)

---

## Pre-Execution Completeness Gate

- [x] **Interaction surface audit** — all target components already exist in `apps/web/src/components/`. No new components are created; only story files and MDX docs are added.
- [x] **Use case coverage** — N/A (stories document existing components, no new API surface)
- [x] **Layout contract** — N/A (no new rendered sections)
- [x] **All prop value enumerations** — will be completed per-component during story authoring (see SUG-45 for argTypes audit)
- [x] **Correct audit file paths** — all 26 web component files verified to exist (see Files to Create below)
- [x] **Dark / theme modifier treatment** — stories inherit theme from the existing `withTheme` decorator in `preview.ts`. No new theme work.
- [x] **Studio schema changes scoped** — none. This epic is Storybook-only.
- [x] **Web adapter sync scoped** — N/A (no DS component changes)
- [x] **Composition overlap audit** — N/A
- [x] **Atomic Reuse Gate** — N/A (no new components, schemas, or CSS surfaces)

---

## Context

### What happened

SUG-38 (Storybook parity & deploy), SUG-39 (Tier 2+3 stories), and SUG-40 (MDX docs) were completed and tested locally between 2026-04-01 and 2026-04-03. All three were marked Done in Linear. However, the implementing code was **never committed or pushed** to GitHub. The local workspace was subsequently lost, and no code is recoverable from git history.

This was identified in a post-mortem on 2026-04-04. Root cause: no epic docs were created, so the close-out sequence (which requires commit → push → move doc → mini-release → then mark Done) was never triggered. A guardrail has been added to CLAUDE.md: "Linear Done = code in remote."

### What exists now (repo state)

- **15 story files** across 2 groups (Foundations / Components)
- **Storybook 10.3.4** with clean startup (SUG-41 fix applied)
- **26 web components** in `apps/web/src/components/` — only MetadataCard has a story
- **No MDX docs**, no manager theme, no sidebar reorganization
- **No Netlify deployment** of Storybook

### What existed before (from screenshot + Linear specs)

- **~30+ stories** across 4 groups: Foundations / Primitives / Patterns / Layout
- MDX docs: Welcome, Component Contracts, Contributing, Theme Guide, Token Reference
- Custom manager theme with Sugartown branding
- Deployed to `pinkmoon.sugartown.io`

---

## Objective

Restore Storybook to the state captured in the 2026-04-03 screenshot: full web component story coverage, MDX documentation pages, sidebar reorganization (Foundations / Primitives / Patterns / Layout), and custom branding. Deploy to `pinkmoon.sugartown.io`.

This epic does **not** redesign anything — it re-executes the proven specs from SUG-38/39/40 on the current Storybook 10 codebase.

---

## Scope

### Phase 1 — Sidebar reorganization + story sort

- [ ] Update `preview.ts` `storySort` to: `['Welcome', 'Foundations', 'Primitives', 'Patterns', 'Layout', '*']`
- [ ] Reclassify existing DS component stories with `title` prefixes matching the 4-group structure
- [ ] Commit checkpoint

### Phase 2 — Tier 1 stories (layout & navigation — every-page components)

- [ ] Hero (`apps/web/src/components/Hero.jsx`)
- [ ] Header (`apps/web/src/components/Header.jsx`)
- [ ] Footer (`apps/web/src/components/Footer.jsx`)
- [ ] MobileNav (`apps/web/src/components/MobileNav.jsx`)
- [ ] Preheader (`apps/web/src/components/Preheader.jsx`)
- [ ] ThemeToggle (`apps/web/src/components/ThemeToggle.jsx`)
- [ ] Commit checkpoint

### Phase 3 — Tier 2 stories (content patterns)

- [ ] ContentCard — variants: Node, Node·Listing, Article, Case Study, No Excerpt (from screenshot)
- [ ] DraftBadge — variants: Draft Document, Published+Draft Changes, Published (from screenshot)
- [ ] Pagination
- [ ] TaxonomyChips
- [ ] Badge (if component exists or extract from web components)
- [ ] Commit checkpoint

### Phase 4 — Tier 3 stories (specialist / utility)

- [ ] CardBuilderSection (needs mock PortableText fixtures)
- [ ] ContentBlock (needs mock PT blocks)
- [ ] PageSections (section builder dispatcher — mock section data)
- [ ] ContactForm (needs form action mock)
- [ ] ImageLightbox (needs mock image array)
- [ ] EditorialCard
- [ ] CardGrid
- [ ] PreviewBanner
- [ ] NodesExample (needs Sanity client mock)
- [ ] Commit checkpoint

### Phase 5 — MDX documentation pages

- [ ] Welcome / intro page (project overview, getting started)
- [ ] Theme Guide (dark / light / pink-moon, how to switch, token mapping)
- [ ] Component Contracts (Card API, MetadataCard vs ContentCard decision tree)
- [ ] Token Reference (colour, spacing, typography scales with visual swatches)
- [ ] Contributing (how to add a story, naming conventions, fixture patterns)
- [ ] Commit checkpoint

### Phase 6 — Branding + manager theme

- [ ] Custom manager theme: Sugartown logo, brand colours in sidebar/toolbar
- [ ] `manager.ts` with custom theme configuration
- [ ] Commit checkpoint

### Phase 7 — Netlify deployment

- [ ] Create Netlify site for Storybook
- [ ] Configure build: base `apps/storybook`, command `pnpm storybook:build`, publish `storybook-static/`
- [ ] Set custom domain `pinkmoon.sugartown.io` with DNS + TLS
- [ ] Add deploy config (`apps/storybook/netlify.toml` or root config)
- [ ] Verify deployed instance loads with all stories
- [ ] Commit checkpoint

---

## Non-Goals

- **New components** — no new DS or web components. Stories document what exists.
- **React 18→19 upgrade** — deferred. Current React 18 in Storybook works; upgrade is a separate concern.
- **Vite 5→7 upgrade** — same; separate concern.
- **CSF Factories migration** — stories use CSF3 format. CSF Factories (v10 feature) is optional and deferred.
- **argTypes audit** — tracked separately as SUG-45. This epic writes the stories; SUG-45 polishes the controls.
- **Studio schema changes** — none.

---

## Technical Constraints

**Story file locations:**
- DS component stories: `packages/design-system/src/components/{Name}/{Name}.stories.tsx`
- DS foundation stories: `packages/design-system/src/foundations/{Name}.stories.tsx`
- Web component stories: `apps/web/src/components/{Name}.stories.tsx`
- MDX docs: `packages/design-system/src/docs/{name}.mdx` or `apps/storybook/src/docs/{name}.mdx`

**Storybook config:**
- `apps/storybook/.storybook/main.ts` — story globs already cover both DS and web paths
- `apps/storybook/.storybook/preview.ts` — theme decorator, story sort
- `apps/storybook/.storybook/manager.ts` — CREATE for custom branding

**Mock data for web components:**
- Web components import from `src/lib/` (routes, queries, sanity client)
- Stories need mock data or static fixtures — do NOT import Sanity client in stories
- Consider a `__fixtures__/` directory for shared mock data (ContentCard variants, PT blocks)

**Sidebar group mapping (from screenshot):**

| Group | Story title prefix | Components |
|-------|-------------------|------------|
| Foundations | `Foundations/` | Colors, Component Contracts, Contributing, Theme Guide, Token Reference, Typefaces |
| Primitives | `Primitives/` | Badge, Blockquote, Button, Callout, Card, Chip, Citation, CodeBlock, FilterBar, Media, Table |
| Patterns | `Patterns/` | ContentCard, DraftBadge, MetadataCard, Pagination, TaxonomyChips, ThemeToggle |
| Layout | `Layout/` | Footer, Header, Hero, MobileNav, Preheader |

---

## Files to Create

**Phase 1 — Reclassify existing stories (UPDATE title prefix):**
- `packages/design-system/src/components/Blockquote/Blockquote.stories.tsx` — title: `Primitives/Blockquote`
- `packages/design-system/src/components/Button/Button.stories.tsx` — title: `Primitives/Button`
- `packages/design-system/src/components/Callout/Callout.stories.tsx` — title: `Primitives/Callout`
- `packages/design-system/src/components/Card/Card.stories.tsx` — title: `Primitives/Card`
- `packages/design-system/src/components/Chip/Chip.stories.tsx` — title: `Primitives/Chip`
- `packages/design-system/src/components/Citation/Citation.stories.tsx` — title: `Primitives/Citation`
- `packages/design-system/src/components/CodeBlock/CodeBlock.stories.tsx` — title: `Primitives/CodeBlock`
- `packages/design-system/src/components/ContentNav/ContentNav.stories.tsx` — title: `Primitives/ContentNav`
- `packages/design-system/src/components/FilterBar/FilterBar.stories.tsx` — title: `Primitives/FilterBar`
- `packages/design-system/src/components/Media/Media.stories.tsx` — title: `Primitives/Media`
- `packages/design-system/src/components/Table/Table.stories.tsx` — title: `Primitives/Table`
- `packages/design-system/src/components/Accordion/Accordion.stories.tsx` — title: `Primitives/Accordion`

**Phase 2 — Tier 1 stories (CREATE):**
- `apps/web/src/components/Hero.stories.tsx`
- `apps/web/src/components/Header.stories.tsx`
- `apps/web/src/components/Footer.stories.tsx`
- `apps/web/src/components/MobileNav.stories.tsx`
- `apps/web/src/components/Preheader.stories.tsx`
- `apps/web/src/components/ThemeToggle.stories.tsx`

**Phase 3 — Tier 2 stories (CREATE):**
- `apps/web/src/components/ContentCard.stories.tsx`
- `apps/web/src/components/DraftBadge.stories.tsx`
- `apps/web/src/components/Pagination.stories.tsx`
- `apps/web/src/components/TaxonomyChips.stories.tsx`

**Phase 4 — Tier 3 stories (CREATE):**
- `apps/web/src/components/CardBuilderSection.stories.tsx`
- `apps/web/src/components/ContentBlock.stories.tsx`
- `apps/web/src/components/PageSections.stories.tsx`
- `apps/web/src/components/ContactForm.stories.tsx`
- `apps/web/src/components/ImageLightbox.stories.tsx`
- `apps/web/src/components/EditorialCard.stories.tsx`
- `apps/web/src/components/CardGrid.stories.tsx`
- `apps/web/src/components/PreviewBanner.stories.tsx`

**Phase 5 — MDX docs (CREATE):**
- `packages/design-system/src/docs/Welcome.mdx`
- `packages/design-system/src/docs/ThemeGuide.mdx`
- `packages/design-system/src/docs/ComponentContracts.mdx`
- `packages/design-system/src/docs/TokenReference.mdx`
- `packages/design-system/src/docs/Contributing.mdx`

**Phase 6 — Branding (CREATE):**
- `apps/storybook/.storybook/manager.ts`

**Phase 7 — Deployment (CREATE):**
- `apps/storybook/netlify.toml`

---

## Acceptance Criteria

- [ ] Storybook sidebar shows 4 groups: Foundations, Primitives, Patterns, Layout — matching screenshot
- [ ] All 15 existing stories render under correct group (reclassified from Components)
- [ ] Tier 1 web component stories (6) render with mock data — no Sanity client imports
- [ ] Tier 2 web component stories (4+) render with correct variants matching screenshot
- [ ] Tier 3 web component stories (8) render with fixture data
- [ ] 5 MDX documentation pages render in Foundations group
- [ ] Custom manager theme displays Sugartown branding
- [ ] `storybook build` completes without errors
- [ ] Deployed to `pinkmoon.sugartown.io` and accessible
- [ ] All 4 themes switchable in deployed instance
- [ ] **Zero** addon resolution warnings on startup
- [ ] Each phase committed and pushed before starting the next (mid-epic checkpoint rule)

---

## Risks / Edge Cases

- **Web components depend on React Router / Sanity client** — stories must mock these. If mocking is too complex for a component (e.g. NodesExample fetches live data), defer to a stub story with a note.
- **MDX in Storybook 10** — SUG-40 noted a pnpm hoisting issue with `storybook/blocks` in SB9. Verify this is resolved in SB10 before writing MDX pages. If not, use plain story components as fallback.
- **Badge component** — visible in screenshot sidebar but no `Badge.jsx` exists in `apps/web/src/components/`. May be a re-export of Chip, a DraftBadge alias, or a component that was created as part of SUG-38 and also lost. Investigate before creating.
- **Netlify deploy budget** — each push-triggered build costs credits. Consider manual deploys or deploy-on-tag.

---

## Linear Housekeeping

When this epic begins:
- Reopen or re-status SUG-38, SUG-39, SUG-40 to reflect that the code was never shipped
- Link SUG-46 as the restoration epic that supersedes all three
- SUG-45 (argTypes audit) remains a follow-on — do not bundle

---

*Restoration epic created 2026-04-04. Supersedes SUG-38/39/40 (code lost, never pushed to remote).*
