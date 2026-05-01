---
**Epic:** SUG-89 — Chromatic parity stories — Card, ContentCard & MetadataCard
**Linear Issue:** [SUG-89](https://linear.app/sugartown/issue/SUG-89)
**Status:** Backlog
**Priority:** 🟣 Soon
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-89 — Chromatic parity stories — Card, ContentCard & MetadataCard

Add Chromatic-visible Storybook parity stories for the Card primitive and its related patterns (ContentCard, MetadataCard) to surface cross-component visual drift automatically.

## Background

Card, ContentCard, and MetadataCard were built and converged across EPIC-0180 and related epics, but no Storybook stories exist for any of them. Chromatic VRT has no baseline snapshots to diff against, so visual regressions in the Card component family are invisible until they ship. CLAUDE.md §Storybook coverage requirement mandates stories for every new or modified component with visual output. This epic closes that gap retroactively.

## Objective

After this epic, Card (DS primitive and web adapter), ContentCard, and MetadataCard each have complete Storybook stories visible to Chromatic. All variants and edge cases are covered. Any future CSS change to these components triggers an automatic Chromatic diff. No schema, query, or frontend render changes — this is pure Storybook authoring.

## Scope

- [ ] **Card — DS primitive story** (`packages/design-system/src/components/Card/`) — story covering every named `variant` value, every `density` value, and edge cases (long title, missing thumbnail, empty tags array) — layer: Storybook
- [ ] **Card — web adapter story** (`apps/web/src/design-system/components/card/`) — parity story mirroring the DS story with web-specific props (`<Link to>` instead of `<a>`) — layer: Storybook
- [ ] **ContentCard story** (`apps/web/src/components/ContentCard.jsx`) — story covering article, caseStudy, and node card shapes using mock Sanity doc props — layer: Storybook
- [ ] **MetadataCard story** (`apps/web/src/components/MetadataCard.jsx`) — story covering a populated field grid and a sparse state (minimal fields present) — layer: Storybook
- [ ] **Chromatic baseline pass** — confirm Chromatic picks up all new stories and creates baseline snapshots without diff failures — layer: CI/Chromatic

## Acceptance criteria

- [ ] Storybook renders Card DS primitive stories for all `variant` and `density` combinations without console errors
- [ ] Card web adapter stories mirror DS stories and SPA navigation links (`<Link to>`) are used correctly
- [ ] ContentCard story covers article, caseStudy, and node card shapes — all three render without errors
- [ ] MetadataCard story renders with a realistic mock data set (all fields populated) and a minimal mock (only required fields)
- [ ] Chromatic creates baseline snapshots for all new stories on first CI run
- [ ] No existing Storybook stories regress — Chromatic diff count on existing baselines = 0

## Technical notes

- No schema, GROQ, or frontend render changes — pure Storybook work in this epic
- ContentCard and MetadataCard are data adapters — stories must use mock Sanity doc prop shapes, not live data fetching
- Card API (from MEMORY.md): `variant`, `density`, `title`, `eyebrow`, `category`, `categoryPosition`, `status`, `evolution`, `excerpt`, `project`, `metadata[]`, `tags[]`, `tools[]`, `toolsLabel`, `tagsLabel`, `date`, `nextStep`, `aiTool`, `kpiLink`, `thumbnailUrl`, `thumbnailAlt`, `accentColor`, `href`, `className`
- Activation audits:
  - Read `apps/storybook/src/stories/` to confirm existing story file locations and naming conventions before writing new stories
  - Read `apps/web/src/components/ContentCard.jsx` and `MetadataCard.jsx` to extract exact prop interfaces before writing mock data shapes
  - Read `apps/web/src/design-system/components/card/Card.jsx` for web adapter prop API
- Model recommendation: `/model sonnet` — no architectural decisions, pure story authoring

## Non-Goals

- No changes to Card, ContentCard, or MetadataCard component code
- No Chromatic configuration changes (Chromatic is assumed to be already configured for the repo)
- No DS package component changes
- No new page routes or schema fields

## Related

- **Linear:** [SUG-89](https://linear.app/sugartown/issue/SUG-89)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Schema Enum Audit at activation if any component changes are discovered
- **CLAUDE.md:** §Storybook coverage requirement — the rule this epic closes
- **EPIC-0180:** Card convergence — the epic that produced the unstoried components
