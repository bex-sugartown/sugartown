# Sugartown — Claude Code Epic Prompt

**Epic ID:** EPIC-0157
## EPIC NAME: Unified Chip Primitive

**Priority:** P2 — Foundation for card adapter migration (EPIC-0158 depends on this).
**Origin:** EPIC-0156 audit item S3 (chip unification).

---

## Context

### What already exists

**DS Card chips (packages/design-system/src/components/Card/):**
- Two hardcoded chip styles inline in `Card.module.css`: `.chipTag` (filled pink bg) and `.chipTool` (outlined seafoam border)
- Rendered as raw `<span>` / `<a>` elements inside `Card.tsx` — no shared component
- S6 accent cascade rule (landed in EPIC-0156) tints `.chipTag` via `color-mix()` when card has `accentColor`

**Web TaxonomyChips (apps/web/src/components/TaxonomyChips.jsx):**
- Mature color system: single `--chip-color` CSS var → `color-mix()` for bg/border/text
- `colorHex` from Sanity project/category data drives `--chip-color` via inline style
- Fallback: `--st-color-accent` (#FF247D brand pink)
- Handles routing (react-router `<Link>`), deduplication, ordering (projects → categories → tags)
- TODO comment already references future DS Chip component

**DS Chip stub (packages/design-system/src/components/Chip/):**
- Referenced in TaxonomyChips TODO and MEMORY.md but does not yet exist as a component

### Files in scope for this epic

- `packages/design-system/src/components/Chip/Chip.tsx` — CREATE
- `packages/design-system/src/components/Chip/Chip.module.css` — CREATE
- `packages/design-system/src/components/Chip/index.ts` — CREATE
- `packages/design-system/src/components/Chip/Chip.stories.tsx` — CREATE
- `packages/design-system/src/components/Chip/README.md` — CREATE
- `packages/design-system/src/components/Card/Card.tsx` — UPDATE (render `<Chip>` instead of raw elements)
- `packages/design-system/src/components/Card/Card.module.css` — UPDATE (remove inline chip styles)
- `packages/design-system/src/components/Card/Card.stories.tsx` — UPDATE (verify chip rendering unchanged)
- `apps/web/src/components/TaxonomyChips.jsx` — UPDATE (render `<Chip>` from DS)
- `apps/web/src/components/TaxonomyChips.module.css` — UPDATE (retire chip styles, keep layout)
- `apps/web/src/design-system/components/chip/Chip.jsx` — CREATE (web adapter)
- `apps/web/src/design-system/components/chip/Chip.module.css` — CREATE (copy from DS)
- `apps/web/src/design-system/index.js` — UPDATE (add Chip export)

### Recent epics touching same surface area

- EPIC-0156 (Card Audit v3.2) — added chip rows to DS Card; landed S6 accentColor chip cascade rule. The `.chipTag` / `.chipTool` classes added in EPIC-0156 are being replaced by this epic.

---

## Objective

After this epic: (1) a `Chip` visual primitive exists in the design system package with a single `color-mix()`–based color model driven by a `colorHex` prop or named `color` preset; (2) DS Card renders `<Chip>` internally instead of raw `<span>`/`<a>` elements with hardcoded tag/tool styles; (3) TaxonomyChips in the web app renders `<Chip>` from the DS adapter, retiring its own chip CSS; (4) all chips across Storybook and the web app share identical visual treatment.

**Data layer:** No schema changes.
**Query layer:** No GROQ changes.
**Render layer:** New DS Chip component; Card.tsx integration; TaxonomyChips.jsx integration.

---

## Doc Type Coverage Audit

| Doc Type      | In scope? | Reason if excluded |
|---------------|-----------|-------------------|
| `page`        | ☐ No | Pages do not render chips |
| `article`     | ☒ Yes | TaxonomyChips renders on article detail + archive cards |
| `caseStudy`   | ☒ Yes | TaxonomyChips renders on case study detail + archive cards |
| `node`        | ☒ Yes | TaxonomyChips renders on node detail + archive cards |
| `archivePage` | ☐ No | Archive pages consume chips via ContentCard but have no chip schema |

---

## Scope

- [ ] Create DS `Chip` component (`Chip.tsx`, `Chip.module.css`, `index.ts`)
- [ ] Named color presets: `pink` (default), `seafoam`, `lime`, `violet`, `amber`
- [ ] `colorHex` prop for arbitrary color override (same `color-mix()` model as TaxonomyChips)
- [ ] `href` prop for linked chips (renders `<a>` with `position:relative; z-index:1` for card compatibility)
- [ ] `size` prop: `'md'` (default) | `'sm'`
- [ ] Chip Storybook stories (isolated: all presets, sizes, linked/unlinked, dark/light)
- [ ] Chip README
- [ ] Update DS Card.tsx to render `<Chip>` for `tags[]` and `tools[]`
- [ ] Remove `.chipTag`, `.chipTool`, `.chip` base styles from Card.module.css
- [ ] Preserve S6 accentColor cascade — migrate rule to target Chip's `--chip-color` var
- [ ] Card stories: verify chip rendering visually unchanged
- [ ] Create web adapter: `apps/web/src/design-system/components/chip/Chip.jsx` + CSS module
- [ ] Add `Chip` export to `apps/web/src/design-system/index.js`
- [ ] Update `TaxonomyChips.jsx` to render `<Chip>` from DS adapter
- [ ] Retire chip visual styles from `TaxonomyChips.module.css` (keep `.chipList` layout styles)

---

## Query Layer Checklist

No GROQ changes. Chip component is render-only.

---

## Schema Enum Audit

N/A — no enum fields introduced.

---

## Metadata Field Inventory

N/A — MetadataCard not touched.

---

## Themed Colour Variant Audit

| Surface / component | Dark | Light | Token(s) to set |
|---------------------|------|-------|-----------------|
| Chip bg (default/pink) | `color-mix(in srgb, var(--chip-color) 10%, transparent)` | same formula | `--chip-color` (inline or preset) |
| Chip border | `color-mix(in srgb, var(--chip-color) 30%, transparent)` | same formula | `--chip-color` |
| Chip text | `var(--chip-color)` | same formula | `--chip-color` |
| Chip hover bg | `color-mix(in srgb, var(--chip-color) 15%, transparent)` | same formula | `--chip-color` |

Color presets resolve to existing tokens — no new tokens needed:

| Preset | Resolves to |
|--------|-------------|
| `pink` (default) | `var(--st-color-pink)` — `#FF247D` |
| `seafoam` | `var(--st-color-seafoam)` — `#2BD4AA` |
| `lime` | `var(--st-color-lime)` — `#D1FF1D` |
| `violet` | `#A78BFA` (matches DS Card badge violet) |
| `amber` | `#FBBA24` (matches DS Card badge amber) |

Theme handling: `color-mix()` with transparent produces theme-appropriate results because card/page background shows through. No per-theme overrides needed.

---

## Non-Goals

- **No routing logic in Chip** — Chip renders `<a href>` or `<span>`. React Router `<Link>` wrapping is the web app's concern (TaxonomyChips handles this).
- **No chip categories** — tag/tool distinction is a color choice, not a structural type. `tags[]` gets pink preset, `tools[]` gets seafoam preset. The component doesn't know about taxonomy semantics.
- **No multi-select / interactive chips** — Chip is a display + link primitive, not a filter control.
- **No ContentCard changes** — ContentCard currently passes taxonomy data to TaxonomyChips, which will start rendering DS Chips. ContentCard itself is untouched until EPIC-0158.

---

## Technical Constraints

**Monorepo / tooling**
- DS component in `packages/design-system/src/components/Chip/`
- Web adapter in `apps/web/src/design-system/components/chip/`
- Both CSS modules must stay in sync (same drift rule as tokens.css and Card)

**Schema (Studio)**
- No schema changes.

**Query (GROQ)**
- No query changes.

**Render (Frontend)**
- Chip must work both inside DS Card (Storybook, no React Router) and inside TaxonomyChips (web app, with React Router `<Link>`)
- Inside DS Card: chips with `href` render as `<a>` with `position:relative; z-index:1` (above `::after` card hit-target)
- Inside TaxonomyChips: the web adapter Chip renders as `<span>`, and TaxonomyChips wraps it in a `<Link>` (preserving current react-router integration)
- `--chip-color` CSS custom property is the single color input. Presets set it via a class; `colorHex` sets it via inline style. `colorHex` wins over preset (inline style specificity).

**Design System → Web Adapter Sync**
- Web adapter Chip.jsx: thin JSX wrapper mirroring Chip.tsx (strip TypeScript, same props)
- Chip.module.css: copy from DS verbatim
- Add to `apps/web/src/design-system/index.js` barrel export

---

## Migration Script Constraints

N/A — no data migration.

---

## Files to Modify

**Design System (packages/design-system/)**
- `src/components/Chip/Chip.tsx` — CREATE
- `src/components/Chip/Chip.module.css` — CREATE
- `src/components/Chip/index.ts` — CREATE
- `src/components/Chip/Chip.stories.tsx` — CREATE
- `src/components/Chip/README.md` — CREATE
- `src/components/Card/Card.tsx` — UPDATE (import + render `<Chip>`)
- `src/components/Card/Card.module.css` — UPDATE (remove `.chip`, `.chipTag`, `.chipTool`; migrate accentColor cascade to `--chip-color`)

**Web App (apps/web/)**
- `src/design-system/components/chip/Chip.jsx` — CREATE (adapter)
- `src/design-system/components/chip/Chip.module.css` — CREATE (copy from DS)
- `src/design-system/index.js` — UPDATE (add Chip export)
- `src/components/TaxonomyChips.jsx` — UPDATE (render `<Chip>`)
- `src/components/TaxonomyChips.module.css` — UPDATE (retire chip visual styles, keep layout)

---

## Deliverables

1. **DS Chip component** — `Chip.tsx` + `Chip.module.css` exists, exports from `index.ts`
2. **Color presets** — 5 named presets (pink, seafoam, lime, violet, amber) all render correctly in Storybook
3. **colorHex override** — arbitrary hex drives chip appearance via `color-mix()`
4. **Card integration** — DS Card renders `<Chip>` for tags/tools arrays; old inline chip classes removed from Card.module.css
5. **accentColor cascade** — accent-tinted cards still tint their tag chips
6. **Web adapter** — `apps/web/src/design-system/components/chip/Chip.jsx` mirrors DS Chip
7. **TaxonomyChips integration** — TaxonomyChips renders DS Chip adapter; its own chip CSS retired
8. **Storybook stories** — isolated Chip stories + Card stories confirm visual parity

---

## Acceptance Criteria

- [ ] DS Chip renders in Storybook with all 5 presets + custom `colorHex` — visually correct in dark and light themes
- [ ] DS Card stories (DefaultFull, MetadataNode, CardGrid) render chips identically to pre-epic appearance
- [ ] accentColor story (DefaultWithAccent) shows tag chips tinted with the accent color, not default pink
- [ ] TaxonomyChips on a live web page (e.g. `/articles/[slug]`) renders chips using DS Chip adapter — visually identical to pre-epic
- [ ] `TaxonomyChips.module.css` no longer contains `.chip` base styles (only `.chipList` layout)
- [ ] `Card.module.css` (DS) no longer contains `.chip`, `.chipTag`, `.chipTool` selectors
- [ ] Web adapter Chip.module.css is byte-identical to DS Chip.module.css at commit time
- [ ] `apps/web/src/design-system/index.js` exports `Chip`

---

## Risks / Edge Cases

**Render risks**
- [ ] TaxonomyChips currently wraps chips in `<Link>` from react-router. The DS Chip must not conflict with this — Chip renders `<span>` when no `href`, and TaxonomyChips wraps it in `<Link>`. Verify no nested `<a>` tags.
- [ ] Chips with `colorHex` from Sanity (projects/categories with `colorHex` field) must still work — the `--chip-color` CSS var approach is preserved, just moved from TaxonomyChips.module.css to Chip.module.css.
- [ ] S6 accentColor cascade targets `.chipTag` class. After migration, the cascade needs to target the Chip component's root class or `--chip-color` var. Test with DefaultWithAccent story.
- [ ] Chip `size='sm'` must match current TaxonomyChips `.sm` modifier visually (0.7rem, tighter padding).

**Sync risks**
- [ ] Card.module.css in DS removes chip styles. The web adapter Card.module.css still has the old slot-based API and does NOT render chips — no sync needed for Card CSS. But the new Chip adapter CSS must be created.
