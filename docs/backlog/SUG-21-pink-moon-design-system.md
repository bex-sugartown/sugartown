# SUG-21 — Pink Moon: Design System Identity

**Linear Issue:** SUG-21
**Status:** Backlog (scope expanded, final specs TBD)
**Priority:** Elevated — this is the design system's next major evolution

---

## Context

Pink Moon is no longer a theme variant. It is becoming the primary design system identity. Classic dark/light modes served as scaffolding — the system needed a stable baseline before it could develop a voice. It has one now.

Final specs will be delivered as an **updated PRD** (`docs/briefs/design-system/design-system-prd.md`). The PRD update consolidates working documents, retires redundant docs, and absorbs the manifesto decisions.

---

## Working Documents (local drafts — `docs/drafts/`, gitignored)

| Document | Purpose |
|----------|---------|
| `pink-moon-manifesto.md` | Visual philosophy: sharp neutral + hot signal, academic interface, component direction, migration path. **Updated 2026-04-07 to reflect Mock B direction.** |
| `ai-slop-manifesto.md` | Design governance: earmarks of AI-generated slop, anti-slop tests, Sugartown audit (pass/fail zones) |
| `pink-moon-mock-B-sharp-paper.html` | **Current direction.** Interactive mock: frosted hero panel over greyscale image, solid surfaces, zero radius, visible borders, Courier Prime mono, colophon footer, metadata card. Light/dark toggle. |
| `pink-moon-mock-A-quiet-glass.html` | Alternative explored: neutral translucent surfaces, colour only at edges. Retained for reference. |
| `pink-moon-mock.html` | Original base mock. Retained for reference. |

---

## Design System Documentation Audit

### Current State — All DS-Related Docs

| File | Lines | Tier | Role | Action |
|------|-------|------|------|--------|
| **`docs/briefs/design-system/design-system-prd.md`** | 543 | 1 — Canonical | Strategy: token architecture, theme governance, migration phases, component contracts | **UPDATE** — absorb manifesto decisions, Pink Moon as primary identity, revised component direction, new layout patterns |
| **`docs/briefs/design-system/design-system-ruleset.md`** | 1170 | 4 — Split | Philosophy + tactical naming + AI agent guidelines + a11y checklist + pre-ship checklist | **SPLIT** — extract philosophy into PRD §1, extract AI agent rules into CLAUDE.md, extract a11y into PRD §accessibility. What remains (~400 lines): tactical naming/BEM guide as a standalone reference. |
| **`packages/design-system/src/styles/tokens.css`** | 546 | 1 — Canonical | Token definitions (Tier 1/2/3) | **KEEP** — living source of truth. Validated by `pnpm validate:tokens`. |
| **`packages/design-system/src/components/COMPONENT_CONTRACTS.md`** | 382 | 2 → Retire | Chip, FilterBar, Card visual contracts | **RETIRE** — Chip and Card now have own README. Extract FilterBar into `FilterBar/README.md`, then archive this file to `docs/prompts/`. |
| **`packages/design-system/VISUAL_AUDIT.md`** | 351 | 4 — Retire | Epic 7 drift analysis vs WordPress `style 260118.css` | **ARCHIVE** — drift it maps is against the old WordPress source. Components have been rebuilt since. Move to `docs/prompts/`. |
| **`packages/design-system/src/components/Button/BUTTON_SPEC.md`** | 210 | 2 — Active | Button visual contract + Pink Moon overrides | **KEEP** — model for other component specs. Update Pink Moon section to reflect Mock B direction (solid fill, no frosted substrate). |
| **`packages/design-system/src/components/Card/README.md`** | 255 | 2 — Active | Card anatomy, variants, web adapter notes | **UPDATE** — add Pink Moon direction (solid surface, zero radius, visible border, hover = lift + pink border). |
| **`packages/design-system/src/components/Chip/README.md`** | 120 | 2 — Active | Chip anatomy, color system, render modes | **UPDATE** — add Courier Prime note, confirm production `color-mix()` system is the Pink Moon direction. |
| **`packages/design-system/src/styles/theme.pink-moon.css`** | 78 | 2 — Active | Pink Moon token overrides (dark + light) | **UPDATE** — reconcile with Mock B values. May simplify once classic modes are deprecated. |
| **`CLAUDE.md`** | 205+ | 3 — Governance | Operational conventions, token drift rules, reuse gate | **UPDATE** — absorb AI agent guidelines from ruleset. Add Pink Moon as the canonical direction. |
| **`MEMORY.md`** | 235 | 3 — Governance | Claude working memory: card architecture, token sync, component registry | **UPDATE** — add Pink Moon as primary identity, Courier Prime as mono font, Mock B as current direction. |

### Consolidation Plan — Target State

**Step 1: Update PRD** (the primary deliverable of this epic)
- Absorb from manifesto: visual philosophy, colour discipline, hero panel treatment, academic interface patterns, component evolution table, migration path
- Absorb from ruleset: philosophy section (~200 lines), accessibility requirements
- Add new sections: Colophon footer, Metadata Card, Courier Prime rationale, radius/border policy
- Add new section: Anti-slop governance tests (from `ai-slop-manifesto.md`)
- Update Theme section: Pink Moon Light (default) + Dark only. Classic modes deprecated.
- Update Component Contracts: per-component direction from manifesto table

**Step 2: Slim the Ruleset**
- Remove philosophy (now in PRD §1)
- Remove AI agent guidelines (move to CLAUDE.md)
- Remove accessibility section (now in PRD §accessibility)
- What remains: tactical naming/BEM guide, token consumption patterns, pre-ship checklist (~400 lines)
- Rename to `design-system-tactical-guide.md` or similar

**Step 3: Retire stale docs**
- `COMPONENT_CONTRACTS.md` → extract FilterBar README, then archive
- `VISUAL_AUDIT.md` → archive to `docs/prompts/`

**Step 4: Update operational docs**
- `CLAUDE.md` — add AI agent guidelines from ruleset, Pink Moon canonical direction
- `MEMORY.md` — update Card architecture section, add Pink Moon identity, Courier Prime

---

## Key Decisions (from manifesto, confirmed by Mock B)

- **Pink Moon Light = default mode** — the library metaphor is a lit room
- **Sharp neutral, hot signal** — surfaces are solid and opaque; colour only at CTAs, links, chips, taxonomy markers
- **Radius downplayed** — zero or minimal throughout (precision, catalogue rigour)
- **Borders visible** — `softgrey-400` in light mode, not hairline. Sharp edges read as intentional.
- **Courier Prime** for monospace — typewriter/catalogue, not terminal
- **Frosted panel limited to two surfaces** — hero panel (bounded, blurred, over greyscale image) and sticky header on scroll. Everything else is solid.
- **Headings in `--text-primary`** — charcoal/white, not brand colour. Headings are structure, not signal.
- **Hero images desaturated** — `filter: grayscale(100%)` prevents colour clash with panel text and accent colours
- **WCAG AA from ground up** — maroon for links on light, darkened chip variants, frosted panel guarantees contrast
- **Colophon footer** — publication-style footer incorporating existing contents (nav, social, copyright) plus edition metadata strip
- **Metadata Card** — catalogue card between hero and body (field set TBD after SUG-47 audit)

---

## Scope Outline (final breakdown TBD in updated PRD)

### Phase 1: Documentation Consolidation
1. Update PRD with manifesto decisions + ruleset philosophy + anti-slop governance
2. Slim ruleset to tactical-only guide
3. Archive `COMPONENT_CONTRACTS.md` and `VISUAL_AUDIT.md`
4. Update `CLAUDE.md` and `MEMORY.md`

### Phase 2: Token Convergence
5. Reconcile Pink Moon Light ↔ Light Classic token differences
6. Default mode flip to Pink Moon Light
7. Update `theme.pink-moon.css` to match Mock B values

### Phase 3: Component Adaptation
8. Card — solid surface, zero radius, visible border, hover = lift + pink border (High)
9. Chip — confirm production styles are the direction, add Courier Prime (High)
10. MetadataCard — new component, catalogue card layout (High)
11. Colophon — new footer component with edition metadata strip (High)
12. Accordion, Callout, CodeBlock, FilterBar — zero radius, solid surfaces (Medium)
13. Table, Media, ContentNav, Citation, Blockquote — zero radius, solid surfaces (Low)

### Phase 4: Infrastructure
14. Runtime toggle simplification (4 modes → 2)
15. Storybook stories for every component × both Pink Moon modes
16. Classic mode deprecation (behind settings toggle during transition)

---

## Related Issues

- **SUG-45** (Done) — Storybook argTypes audit — controls exist for all components
- **SUG-47** (Backlog) — Storybook/Studio props alignment audit — MetadataCard field set depends on this

## Non-Goals (for this epic)

- New page types or routes
- Sanity schema changes (unless MetadataCard requires a new schema object)
- Content migration
- Knowledge graph colour system (feeds from chip colours, but scoped separately)

---

*Created 2026-04-06. Updated 2026-04-07 with DS doc audit and consolidation plan.*
