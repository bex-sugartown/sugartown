---
**Epic:** SUG-89 — Storybook & Chromatic coverage audit
**Linear Issue:** [SUG-89](https://linear.app/sugartown/issue/SUG-89)
**Status:** Backlog
**Priority:** 🟣 Soon
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-89 — Storybook & Chromatic coverage audit

Full audit and gap-fill of Storybook story coverage across DS primitives, web adapter components, and app-level components. Ensures every component with visual output has a story and Chromatic can baseline it.

## Background

Originally scoped to Card, ContentCard, and MetadataCard (all three now have stories). A 2026-05-04 audit revealed the gap is broader: 8 web adapter components and 1 DS primitive have no story file at all, several existing DS stories carry no explicit Chromatic parameter, and Chromatic Build 21 has a stale `patterns-previewbanner--default` baseline from the SUG-84 story purge that fires a `NoStoryMatchError` on every build.

The original scope (Card DS, ContentCard, MetadataCard) is fully done. The remaining work is the extended coverage.

## Objective

After this epic: every component with its own CSS module or web-specific behaviour has a Storybook story visible to Chromatic. All existing DS stories carry an explicit `chromatic` parameter. The stale PreviewBanner baseline is cleared. No more `NoStoryMatchError` on build.

## Coverage inventory

Audit run 2026-05-04. Status key: ✅ done · ⚠️ story exists, needs chromatic param · ❌ no story

### DS primitives (`packages/design-system/src/components/`)

| Component | Story | Chromatic param | Action needed |
|-----------|-------|-----------------|---------------|
| Accordion | ✅ | ⚠️ missing | Add `chromatic: { disableSnapshot: false }` + `WithDefaultOpen` story for open-state snapshot |
| Blockquote | ✅ | ⚠️ missing | Add `chromatic: { disableSnapshot: false }` |
| Button | ✅ | ✅ | — |
| Callout | ❌ | — | Write story (web adapter has one; DS primitive does not) |
| Card | ✅ (+ listing + grid) | ✅ | — |
| Chip | ✅ | ✅ | — |
| Citation | ✅ | ⚠️ missing | Add `chromatic: { disableSnapshot: false }` |
| CodeBlock | ✅ | ⚠️ missing | Add `chromatic: { disableSnapshot: false }` |
| ContentNav | ✅ | ⚠️ missing | Add `chromatic: { disableSnapshot: false }` |
| FilterBar | ✅ | ⚠️ missing | Add `chromatic: { disableSnapshot: false }` |
| Media | ✅ | ⚠️ missing | Add `chromatic: { disableSnapshot: false }` |
| Table | ✅ | ⚠️ missing | Add `chromatic: { disableSnapshot: false }` |

### Web adapter components (`apps/web/src/design-system/components/`)

| Component | Story | Chromatic param | Action needed |
|-----------|-------|-----------------|---------------|
| accordion | ❌ | — | Write story — own CSS module (updated Apr 26), web-specific animation wiring |
| blockquote | ❌ | — | Write story — own CSS |
| button | ❌ | — | Write story — own CSS |
| callout | ✅ | ✅ | — |
| card | ❌ | — | **Priority** — 372-line component, 21kb CSS, `<Link>` SPA nav, `children` escape hatch |
| chip | ❌ | — | Write story — own CSS (8kb), `<Link>`-based chips |
| citation | ❌ | — | Write story — own CSS |
| codeblock | ❌ | — | Write story — own CSS |
| data-table | ✅ | ✅ | — |
| grid | ✅ | ✅ | — |
| media | ❌ | — | Write story — own CSS (7kb) |
| section-label | ✅ | ✅ | — |
| table | ❌ | — | Write story — own CSS |
| tile | ✅ | ✅ | — |

### App-level components (`apps/web/src/components/`)

| Component | Story | Chromatic param | Action needed |
|-----------|-------|-----------------|---------------|
| CardBuilderSection | ✅ | ⚠️ missing | Add `chromatic: { disableSnapshot: false }` |
| ContactForm | ✅ | ⚠️ missing | Add `chromatic: { disableSnapshot: false }` |
| ContentBlock | ✅ | ⚠️ missing | Add `chromatic: { disableSnapshot: false }` |
| ContentCard | ✅ | ✅ | — |
| Footer | ✅ | ⚠️ missing | Add `chromatic: { disableSnapshot: false }` |
| Header | ✅ | ⚠️ missing | Add `chromatic: { disableSnapshot: false }` |
| Hero | ✅ | ✅ | — |
| ImageLightbox | ✅ | ⚠️ missing | Add `chromatic: { disableSnapshot: false }` |
| MetadataCard | ✅ | ✅ | — |
| MobileNav | ✅ | ⚠️ missing | Add `chromatic: { disableSnapshot: false }` |
| PageSections | ✅ | ⚠️ missing | Add `chromatic: { disableSnapshot: false }` |
| PageSidebar | ✅ | ✅ | — |
| Pagination | ✅ | ⚠️ missing | Add `chromatic: { disableSnapshot: false }` |
| Preheader | ✅ | ⚠️ missing | Add `chromatic: { disableSnapshot: false }` |
| ThemeToggle | ✅ | ⚠️ missing | Add `chromatic: { disableSnapshot: false }` |

### Chromatic baseline issues

| Issue | Action |
|-------|--------|
| `NoStoryMatchError: patterns-previewbanner--default` | Clear stale baseline in Chromatic UI — one-click accept/archive at [Build 21](https://www.chromatic.com/build?appId=69de2a8dfe5a14bc405087d5&number=21) |

## Scope

### Phase 1 — New stories (missing entirely)

- [ ] **DS Callout story** — default, with-title, coloured variants
- [ ] **Web adapter Card story** — all `variant` + `density` combos, SPA `<Link>` navigation, `children` slot, edge cases (long title, missing thumbnail, empty tags). Priority item.
- [ ] **Web adapter Accordion story** — collapsed default, open state via `defaultOpen`, multi-expand
- [ ] **Web adapter Blockquote story** — default, with attribution
- [ ] **Web adapter Button story** — variant + size combos
- [ ] **Web adapter Chip story** — all variants including `<Link>`-based chips
- [ ] **Web adapter Citation/CitationZone story** — inline citation, zone listing
- [ ] **Web adapter CodeBlock story** — with language label, without
- [ ] **Web adapter Media story** — image, video, caption states
- [ ] **Web adapter Table story** — populated, empty state

### Phase 2 — Add explicit chromatic params to existing stories

Add `parameters: { chromatic: { disableSnapshot: false } }` (or at story level where variant-specific) to:

- [ ] DS: Accordion, Blockquote, Citation, CodeBlock, ContentNav, FilterBar, Media, Table
- [ ] App: CardBuilderSection, ContactForm, ContentBlock, Footer, Header, ImageLightbox, MobileNav, PageSections, Pagination, Preheader, ThemeToggle

### Phase 3 — Clear stale baseline

- [ ] Accept/archive `patterns-previewbanner--default` in Chromatic UI (Build 21)

## Acceptance criteria

- [ ] Every component with its own CSS module has a Storybook story
- [ ] Every story file carries an explicit `chromatic: { disableSnapshot: false }` at meta or story level
- [ ] Accordion story includes a `WithDefaultOpen` story so Chromatic captures the open state
- [ ] Web adapter Card story covers all `variant` and `density` values using `<Link to>` for navigation
- [ ] Stale `patterns-previewbanner--default` baseline cleared — Chromatic build produces zero `NoStoryMatchError`
- [ ] Chromatic build after close-out has 0 component errors and all new stories baselined

## Technical notes

- Pure Storybook work — no component code changes, no schema changes
- Web adapter components (card, chip, accordion) use `react-router-dom` `<Link>` — stories must wrap in `MemoryRouter` or use the existing Storybook router decorator
- ContentCard and MetadataCard are data adapters — mock Sanity doc prop shapes, no live fetching
- Card web adapter API: `variant`, `density`, `title`, `eyebrow`, `category`, `categoryPosition`, `status`, `evolution`, `excerpt`, `project`, `metadata[]`, `tags[]`, `tools[]`, `toolsLabel`, `tagsLabel`, `date`, `nextStep`, `aiTool`, `kpiLink`, `thumbnailUrl`, `thumbnailAlt`, `accentColor`, `href`, `className`, `children`
- Story location convention: co-located with component (`ComponentName.stories.tsx` in same directory)
- Chromatic default behaviour: all stories are snapshotted unless `disableSnapshot: true` — the explicit `false` is documentation intent, not functional change
- Stale baseline fix: navigate to [Chromatic Build 21](https://www.chromatic.com/build?appId=69de2a8dfe5a14bc405087d5&number=21) and accept/archive the PreviewBanner snapshot

## Non-goals

- No changes to any component code
- No Chromatic configuration changes
- No schema, GROQ, or page template changes
- No new page routes

## Related

- **Linear:** [SUG-89](https://linear.app/sugartown/issue/SUG-89)
- **CLAUDE.md:** §Storybook coverage requirement
- **EPIC-0180:** Card convergence — produced the original unstoried components
- **SUG-84:** Component purge that deleted PreviewBanner (source of stale baseline)
- **SUG-96:** SUG-96 added Tile, Grid, SectionLabel, citedBlock stories — already done
