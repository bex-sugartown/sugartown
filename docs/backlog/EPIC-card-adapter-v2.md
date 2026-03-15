# EPIC — Card Adapter Migration v2

**Epic ID:** (unassigned — backlog)
**Surface:** `apps/web` + `packages/design-system`
**Priority:** Deferred
**Created:** 2026-03-15
**Depends on:** EPIC-0158 (Web Card Adapter Migration — shipped v0.15.0)

---

## Objective

Complete the convergence of the web Card adapter onto the DS Card's named-prop API. EPIC-0158 shipped the initial migration — ContentCard, MetadataCard, and EditorialCard now use named props (`status`, `thumbnailUrl`, `tags[]`, `tools[]`, `href`, etc.) instead of the old slot-based API (`children`, `footer` as ReactNode, `titleHref`, `as`). However, the web adapter layer (`apps/web/src/design-system/components/card/Card.jsx`) is still a standalone JSX component with its own rendering logic rather than a thin passthrough to the DS Card. The two Card implementations (DS and web) have drifted since EPIC-0158, and the web adapter carries tech debt:

1. **API surface drift** — The DS Card has received props and CSS updates since v0.15.0 (through EPIC-0161 typography polish, EPIC-0174 cleanup, etc.) that the web adapter hasn't absorbed
2. **Dual CSS maintenance** — `Card.module.css` exists in both `packages/design-system/` and `apps/web/src/design-system/` with divergent property values (violates the token drift rule extended to CSS property parity per MEMORY.md)
3. **SPA navigation gap** — DS Card renders `<a href>` for the full-card link; the web adapter needs `react-router-dom <Link>` for SPA transitions without full-page reloads. EPIC-0158 noted this as "evaluate during implementation" — it was resolved pragmatically but needs a principled pattern
4. **TaxonomyChips integration** — Chips in the card footer use react-router `<Link>` for taxonomy routing. The relationship between Card's `tags[]`/`tools[]` named props and TaxonomyChips' routing capability needs a clean boundary

After this epic: the web Card adapter is a verified thin passthrough to the DS Card, with an explicit contract for SPA-specific overrides (Link rendering, chip routing). CSS parity between the two Card modules is enforced and verified. No rendering logic lives in the web adapter that duplicates DS Card logic.

**Data layer:** No schema changes.
**Query layer:** No query changes expected (EPIC-0158 already added `thumbnailUrl` and `accentColor` projections).
**Render layer:** Web Card adapter rewrite to true passthrough; CSS module sync; SPA navigation pattern formalized.

---

## Context

### Current state (post EPIC-0158)

**DS Card** (`packages/design-system/src/components/Card/`):
- Named-prop API: `variant`, `density`, `status`, `evolution`, `category`, `tags[]`, `tools[]`, `metadata[]`, `accentColor`, `href`, `thumbnailUrl`, `excerpt`, `date`, `aiTool`, `project`, `categoryPosition`
- Three variants: `default` | `listing` | `metadata`
- Orthogonal density: `default` | `compact`
- Full-card link via `::after` on title anchor
- Badge rendering, accentColor colorway, thumbnail zones

**Web Card adapter** (`apps/web/src/design-system/components/card/`):
- Mirrors the DS Card API but is a standalone JSX component, not a wrapper
- Has its own CSS module that may have drifted from the DS version
- Handles SPA concerns: react-router `<Link>` for internal navigation
- Contains rendering logic that duplicates DS Card logic

**Consumers (all updated in EPIC-0158):**
- `ContentCard.jsx` — archive grid cards, maps Sanity docs → Card named props
- `MetadataCard.jsx` — detail page sidebar, `variant='metadata'` with `metadata[]` rows
- `EditorialCard.jsx` — homepage/editorial surfaces
- Page files: ArticlePage, CaseStudyPage, NodePage, ArchivePage, TaxonomyDetailPage, PersonProfilePage, ProjectDetailPage

### Known drift items

Per MEMORY.md Card Component Architecture section:
> "Web adapter migration status: `apps/web/src/design-system/components/card/Card.jsx` and its `Card.module.css` still use the OLD slot-based API."

This note was written before EPIC-0158 shipped but reflects the ongoing concern: the web adapter is a parallel implementation, not a passthrough. EPIC-0158 updated the API shape but did not eliminate the duplication.

---

## Scope (draft — refine at activation)

### Phase 1 — CSS parity audit & sync
- [ ] Diff `packages/design-system/src/components/Card/Card.module.css` against `apps/web/src/design-system/components/card/Card.module.css`
- [ ] Catalog all divergences: missing classes, different property values, missing variants
- [ ] Sync the web CSS module to match the DS module exactly
- [ ] Document any intentional web-only overrides (with comments explaining why)

### Phase 2 — Passthrough architecture
- [ ] Evaluate architecture options:
  - **Option A:** Web Card.jsx imports and renders DS Card.tsx (compiled), adding only SPA-specific props
  - **Option B:** Web Card.jsx remains a standalone JSX file but is verified line-by-line against DS Card.tsx with a diffable structure
  - **Option C:** Codegen — script that generates web Card.jsx from DS Card.tsx (strip TypeScript, swap `<a>` for `<Link>`)
- [ ] Implement chosen option
- [ ] Formalize the SPA navigation pattern: how does `href` become a `<Link to>` in the web adapter?

### Phase 3 — TaxonomyChips boundary
- [ ] Define the contract between Card's `tags[]`/`tools[]` props and TaxonomyChips
  - Does Card render the chips, or does it provide a slot/render-prop for the consumer to render TaxonomyChips?
  - Current state: ContentCard passes structured data to Card's named props; Card renders chips internally; chips need to be react-router Links for SPA navigation
- [ ] Resolve: either Card accepts a `linkComponent` prop for chip rendering, or chips are rendered by the consumer in a designated footer zone

### Phase 4 — MEMORY.md cleanup
- [ ] Update MEMORY.md Card Component Architecture section to reflect the resolved state
- [ ] Remove the "migration epic not yet scoped" note
- [ ] Document the final passthrough pattern for future DS component web adapters

---

## Non-Goals

- Does **not** add new Card variants or props — this is a convergence epic, not a feature epic
- Does **not** change ContentCard, MetadataCard, or EditorialCard API — their interface to Card stays the same
- Does **not** modify DS Card.tsx — the DS Card is the source of truth, not the subject of change
- Does **not** introduce TypeScript to `apps/web` — the web adapter remains JSX
- Does **not** scope Storybook stories for web Card (deferred — Storybook stories exist for DS Card)

---

## Technical Constraints

- **CSS parity rule (MEMORY.md):** `.title`, `.variant-listing .title`, `.compact .title`, and all variant/modifier declarations must be identical across both Card CSS modules. When updating one, update the other in the same commit.
- **Token drift rule:** Both `tokens.css` files must stay in sync. If this epic discovers token references that exist in one Card module but not the other, that's a bug to fix.
- **SPA navigation:** `react-router-dom` `<Link>` must be used for internal navigation to avoid full-page reloads. The web adapter cannot simply render `<a href>` for internal paths.
- **Chip routing:** TaxonomyChips renders `<Link to="/tags/foo">` for SPA navigation. If Card renders chips internally, it needs a way to render Links instead of `<a>` tags.
- **No DS package changes:** The design system package is the authority. This epic adapts the web layer to match it — not the reverse.

---

## Files to Modify (estimated)

**Web Card adapter:**
- `apps/web/src/design-system/components/card/Card.jsx` — REWRITE (passthrough)
- `apps/web/src/design-system/components/card/Card.module.css` — SYNC with DS

**Documentation:**
- `MEMORY.md` — update Card Component Architecture section

**Potentially impacted (verify at activation):**
- `apps/web/src/components/ContentCard.jsx` — if Card API surface changes during passthrough
- `apps/web/src/components/MetadataCard.jsx` — same
- `apps/web/src/components/EditorialCard.jsx` — same

---

## Risks / Edge Cases

- **Breaking consumers** — If the passthrough changes any prop behavior (even subtly), all 8+ page callers could break. Comprehensive smoke-testing needed across all archive and detail routes.
- **SPA navigation regression** — Full-page reloads instead of SPA transitions are a UX regression that's easy to miss in development. Test: click a card on `/articles`, verify URL changes without a full page load.
- **Chip click propagation** — Clicking a chip inside a card with a full-card `::after` link must navigate to the chip target (tag/tool page), not the card target. The `::after` pattern uses `position: relative` + `z-index` on interactive children to lift them above the overlay — verify this works with both `<Link>` and `<a>` chip elements.
- **CSS specificity** — If the web adapter's CSS module has overrides that the DS module doesn't, removing them may change card appearance. Visual regression testing needed.
- **Build pipeline** — If Option A (import DS Card directly) is chosen, verify that the DS package builds correctly for web consumption (JSX/ESM, CSS modules resolved).

---

## Trigger for Activation

Activate this epic when:
- Visual inconsistencies between Card rendering and DS Card Storybook are reported
- A new Card feature is needed and the dual-maintenance cost becomes blocking
- A broader "design system convergence" sprint is planned
- The web adapter CSS drift causes a visible bug

---

## Acceptance Criteria (draft — refine at activation)

- [ ] Web `Card.module.css` is byte-identical to DS `Card.module.css` (or has documented, commented exceptions)
- [ ] Web `Card.jsx` contains zero rendering logic that duplicates DS Card — it is a passthrough or verified mirror
- [ ] All archive pages render without errors: `/articles`, `/case-studies`, `/knowledge-graph`
- [ ] All detail pages render MetadataCard without errors
- [ ] All taxonomy detail pages render ContentCard without errors
- [ ] SPA navigation works: clicking a card navigates without full-page reload
- [ ] Chip clicks navigate to the correct taxonomy page, not the card target
- [ ] `density='compact'` + `variant='listing'` combination renders correctly
- [ ] No nested `<a>` tags in card markup
- [ ] MEMORY.md Card Component Architecture section reflects the resolved state

---

*Created 2026-03-15. Initial migration shipped in EPIC-0158 (v0.15.0). See backlog item "Web Card adapter migration" in priority stack.*
