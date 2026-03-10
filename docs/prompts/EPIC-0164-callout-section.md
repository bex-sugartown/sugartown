# Sugartown — Claude Code Epic Prompt

**Epic ID:** EPIC-0164
## EPIC NAME: Callout Section Type — Schema, GROQ & Renderer

**Status:** ACTIVE
**Backlog ref:** Dependency for Item #8 (Soon) — "Configure Sections for all pages"
**Origin:** DS Callout component exists (Storybook ✅, web adapter ✅) but has no Sanity authoring path

---

## Pre-Execution Completeness Gate

- [x] **Layout contract** — No new layout. The DS Callout component (`packages/design-system/src/components/Callout/Callout.tsx`) already renders five variants with icon, title, and body. This epic creates a `calloutSection` schema and wires it into the section builder. Callout renders at full content width within the sections flow, same as `textSection` or `ctaSection`.
- [x] **All prop value enumerations** — Callout `variant`: `'default' | 'info' | 'tip' | 'warn' | 'danger'` (from `Callout.tsx`). Verified against `Callout.module.css` — all 5 variants have styles. The Sanity schema field will use the same values.
- [x] **Correct audit file paths** — all paths verified (see Context)
- [x] **Dark / theme modifier treatment** — Callout has full theme coverage. Dark mode: per-variant `--st-callout-bg` and `--st-callout-border-color` in `Callout.module.css` lines 66–97. Light mode: `[data-theme="light"]` and `[data-theme="light-pink-moon"]` overrides for info/tip/warn/danger in lines 99–126. Default variant inherits from `--st-callout-bg`/`--st-callout-border-color` tokens. No new tokens needed — this epic just wires the existing component.
- [x] **Studio schema changes scoped** — Yes. New `calloutSection` object schema in `schemas/sections/`. Commit prefix: `feat(studio):` for the schema commit.
- [x] **Web adapter sync scoped** — Not applicable. DS Callout component and web adapter already exist and are unchanged.

---

## Context

### What already exists — DO NOT recreate

**DS Callout component (shipped):**
- `packages/design-system/src/components/Callout/Callout.tsx`
- Props: `variant?: 'default' | 'info' | 'tip' | 'warn' | 'danger'`, `icon?: ReactNode | null`, `title?: string`, `children: ReactNode`, `className?`
- 5 variants with Lucide icons: default (Heart/pink), info (Info/muted), tip (Lightbulb/seafoam), warn (AlertTriangle/amber), danger (AlertOctagon/red)
- `icon={undefined}` → default icon; `icon={null}` → no icon; `icon={<X/>}` → custom
- Full dark + light + pink-moon theme coverage in CSS module
- Storybook stories: 5 stories (one per variant)

**Web adapter (shipped, synced v7c):**
- `apps/web/src/design-system/components/callout/Callout.jsx` — JSX mirror with Lucide `VARIANT_ICONS` map
- `apps/web/src/design-system/components/callout/Callout.module.css` — synced with DS
- Exported from `apps/web/src/design-system/index.js`

**Section builder pattern (established):**
- Section types are `object` schemas in `apps/studio/schemas/sections/`
- Registered in `schemas/index.ts`
- Added as `defineArrayMember({type: '...'})` in each doc type's `sections[]`
- GROQ conditional projection: `_type == "calloutSection" => { fields }`
- PageSections.jsx switch case: `case 'calloutSection': return <CalloutSection />`
- Existing section types follow this exact pattern: `heroSection`, `textSection`, `imageGallery`, `ctaSection`, `htmlSection`, `cardBuilderSection`

### Files this epic will create or modify

- `apps/studio/schemas/sections/calloutSection.ts` — CREATE
- `apps/studio/schemas/index.ts` — ADD `calloutSection` import + register
- `apps/studio/schemas/documents/page.ts` — ADD `calloutSection` to `sections[]`
- `apps/studio/schemas/documents/article.ts` — ADD `calloutSection` to `sections[]`
- `apps/studio/schemas/documents/caseStudy.ts` — ADD `calloutSection` to `sections[]`
- `apps/studio/schemas/documents/node.ts` — ADD `calloutSection` to `sections[]`
- `apps/web/src/lib/queries.js` — ADD `calloutSection` projection to ALL 4 slug queries
- `apps/web/src/components/PageSections.jsx` — ADD `calloutSection` case + `CalloutSection` sub-component, ADD Callout import

### Files this epic does NOT touch

- `packages/design-system/` — DS Callout component is unchanged
- `apps/web/src/design-system/components/callout/` — web adapter is unchanged
- `apps/web/src/components/PageSections.module.css` — Callout uses its own CSS module; no PageSections styles needed
- Archive queries — archive cards don't render sections
- `portableTextComponents.jsx` — Callout is a section type, not a PortableText block type

---

## Objective

After this epic: editors can add callout sections (tip, warning, info, danger, or default) to any page, article, case study, or node via the section builder in Studio. Callouts render using the existing DS Callout component with full theme support.

**Data layer:** New `calloutSection` object schema + registration in `index.ts` + addition to `sections[]` on all 4 content doc types.
**Query layer:** New `_type == "calloutSection" => { ... }` conditional projection in all 4 slug queries.
**Render layer:** New `case 'calloutSection'` in `PageSections.jsx` switch + `CalloutSection` sub-component.

---

## Doc Type Coverage Audit

| Doc Type    | In scope? | Reason |
|-------------|-----------|--------|
| `page`      | ☑ Yes | Has `sections[]`; callouts are useful for service/platform page highlighted notes |
| `article`   | ☑ Yes | Has `sections[]`; callouts are natural for tips/warnings in technical articles |
| `caseStudy` | ☑ Yes | Has `sections[]`; callouts useful for project highlights, caveats |
| `node`      | ☑ Yes | Has `sections[]`; callouts useful for AI conversation insights, warnings |
| `archivePage` | ☐ No | Structural config doc; no `sections[]` field |

---

## Scope

- [ ] Create `apps/studio/schemas/sections/calloutSection.ts` — callout section schema
- [ ] Register `calloutSection` in `apps/studio/schemas/index.ts`
- [ ] Add `calloutSection` to `sections[]` array on `page.ts`, `article.ts`, `caseStudy.ts`, `node.ts`
- [ ] Add GROQ conditional projection for `calloutSection` in all 4 slug queries
- [ ] Add `case 'calloutSection'` to `PageSections.jsx` switch + `CalloutSection` sub-component
- [ ] Import `Callout` from design-system in `PageSections.jsx`

---

## Query Layer Checklist

- [ ] `pageBySlugQuery` — ADD `_type == "calloutSection" => { variant, title, body }`
- [ ] `articleBySlugQuery` — ADD same projection
- [ ] `caseStudyBySlugQuery` — ADD same projection
- [ ] `nodeBySlugQuery` — ADD same projection
- Archive queries — NOT AFFECTED: do not project `sections[]`

---

## Schema Enum Audit

| Field name | Schema file | `value` → Display title |
|-----------|-------------|--------------------------|
| `variant` | `calloutSection.ts` (CREATE) | `default → Default (pink)`, `info → Info`, `tip → Tip`, `warn → Warning`, `danger → Danger` |

These values must match exactly: the DS Callout component's `variant` prop accepts these 5 strings, and the `Callout.module.css` has class selectors for each (`.default`, `.info`, `.tip`, `.warn`, `.danger`).

---

## Metadata Field Inventory

N/A — callouts are content sections, not metadata.

---

## Themed Colour Variant Audit

N/A — the DS Callout component already has full theme coverage. Verified in `Callout.module.css`:

| Variant | Dark | Light | Pink Moon |
|---------|------|-------|-----------|
| `default` | pink bg/border from `--st-callout-bg`/`--st-callout-border-color` tokens | inherits from tokens | inherits from tokens |
| `info` | `rgba(255,255,255,0.05)` bg, `rgba(255,255,255,0.10)` border | `--st-color-softgrey-50` bg, `rgba(0,0,0,0.08)` border | same as light |
| `tip` | `rgba(43,212,170,0.08)` bg, seafoam border | `#f3fff8` bg, seafoam border | same as light |
| `warn` | `rgba(255,193,7,0.10)` bg, amber border | `#fff9e6` bg, amber border | same as light |
| `danger` | `rgba(220,38,38,0.10)` bg, red border | `#fff1f2` bg, red border | same as light |

No new tokens or theme overrides needed.

---

## Non-Goals

- **DS Callout component changes** — the component is unchanged.
- **Custom icon override** — the DS Callout accepts `icon` prop but the Sanity schema won't expose it. Editors get the default icon per variant. Custom icons are a future enhancement.
- **Rich text body** — v1 uses plain `text` (multiline string) for the callout body. This keeps the schema simple. Rich text body (PortableText inside the callout) is a future enhancement — it would require nested PortableText config and a more complex renderer.
- **PortableText integration** — Callout is a standalone section type, not a PortableText inline block. Editors add it via the section builder, not inside a textSection's rich text editor.

---

## Technical Constraints

**Monorepo / tooling**
- pnpm workspaces; `apps/studio`, `apps/web`
- No migration script needed — no existing callout data

**Schema (Studio)**
- `calloutSection` is an `object` type in `schemas/sections/`
- Fields:
  ```
  calloutSection {
    _type: 'calloutSection'
    variant: string ('default' | 'info' | 'tip' | 'warn' | 'danger')  — required, defaults to 'default'
    title: string — optional bold title above the body
    body: text — required, multiline plain text for the callout content
  }
  ```
- `variant` field: type `string`, `options.list` with 5 entries, layout `'radio'`, `initialValue: 'default'`
- `body` field: type `text`, `rows: 4`, required validation
- `title` field: type `string`, optional, max 100 chars
- Icon: NOT a schema field — determined by `variant` at render time (DS Callout handles this)
- Preview: show title (or "Callout") as title, variant as subtitle, use appropriate Sanity icon (`InfoOutlineIcon` from `@sanity/icons`)

**Query (GROQ)**
- Add conditional projection to all 4 slug queries inside the `sections[]` projection:
  ```groq
  _type == "calloutSection" => {
    variant,
    title,
    body
  }
  ```
- Fields are all scalar — no references or nested projections needed

**Render (Frontend)**
- Add to `PageSections.jsx`:
  1. Import: `import { Callout } from '../design-system'`
  2. Sub-component:
     ```jsx
     function CalloutSection({ section }) {
       if (!section.body) return null
       return (
         <Callout variant={section.variant} title={section.title}>
           <p>{section.body}</p>
         </Callout>
       )
     }
     ```
  3. Switch case: `case 'calloutSection': return <CalloutSection key={key} section={section} />`
- The DS Callout wraps children in `.body` div — pass `<p>{section.body}</p>` as children
- Null guard: if `body` is empty, return null

**Design System → Web Adapter Sync**
- Not required — no DS component created or modified

---

## Migration Script Constraints

N/A — no migration. No existing callout data in Sanity.

---

## Files to Modify

**Studio**
- `apps/studio/schemas/sections/calloutSection.ts` — CREATE
- `apps/studio/schemas/index.ts` — ADD import + register
- `apps/studio/schemas/documents/page.ts` — ADD `defineArrayMember({type: 'calloutSection'})` to `sections[]`
- `apps/studio/schemas/documents/article.ts` — ADD same
- `apps/studio/schemas/documents/caseStudy.ts` — ADD same
- `apps/studio/schemas/documents/node.ts` — ADD same

**Frontend**
- `apps/web/src/lib/queries.js` — ADD `calloutSection` projection to `pageBySlugQuery`, `articleBySlugQuery`, `caseStudyBySlugQuery`, `nodeBySlugQuery`
- `apps/web/src/components/PageSections.jsx` — ADD import, sub-component, switch case

---

## Deliverables

1. **Schema** — `calloutSection.ts` exists in `schemas/sections/`, registered in `index.ts`
2. **Document wiring** — `sections[]` in page, article, caseStudy, node all include `defineArrayMember({type: 'calloutSection'})`
3. **GROQ projections** — all 4 slug queries include `_type == "calloutSection" => { variant, title, body }`
4. **Renderer** — `PageSections.jsx` has `case 'calloutSection'` and renders `<Callout>` without errors
5. **End-to-end** — a callout section added to an article in Studio renders with correct variant styling on the article detail page

---

## Acceptance Criteria

- [ ] `tsc --noEmit` in `apps/studio` reports zero NEW errors
- [ ] Studio hot-reloads without errors; "Callout Section" appears as an option in the section builder for all 4 doc types (page, article, caseStudy, node)
- [ ] Create a callout with `variant: 'tip'` and `title: 'Pro Tip'` and `body: 'This is a tip.'` on a test article → navigate to article detail page → callout renders with seafoam tip styling, Lightbulb icon, bold title, and body text
- [ ] Test all 5 variants: default (pink/Heart), info (muted/Info), tip (seafoam/Lightbulb), warn (amber/AlertTriangle), danger (red/AlertOctagon) — each renders with correct colour and icon
- [ ] Callout with `title` omitted → renders without title row (icon still shows if variant has one)
- [ ] Callout with empty `body` → renders nothing (null guard)
- [ ] Verify on light theme: variant colours switch to light-mode overrides
- [ ] GROQ query test: query a document with a callout section → response includes `{ _type: "calloutSection", variant, title, body }`
- [ ] `pnpm validate:urls` passes
- [ ] `pnpm validate:taxonomy` passes

---

## Risks / Edge Cases

**Schema risks**
- [ ] Does `calloutSection` collide with any existing type name? Run `grep -rn "name: 'calloutSection'" apps/studio/schemas/` before creating.
- [ ] The `variant` field options list must match exactly: `default`, `info`, `tip`, `warn`, `danger`. If the DS Callout adds new variants in the future, the schema must be updated to match.

**Query risks**
- [ ] All 4 slug queries must be updated. Use the Query Layer Checklist — do not rely on memory. Verify with `grep -n 'calloutSection' apps/web/src/lib/queries.js` after making changes — expect 4 matches.

**Render risks**
- [ ] What if `variant` is null/undefined? DS Callout defaults to `'default'` — safe.
- [ ] What if `body` contains line breaks? Plain `text` type preserves newlines. The `<p>` wrapper won't handle them. Consider splitting on `\n` and rendering multiple `<p>` tags, or using CSS `white-space: pre-line` on the body. Recommend `white-space: pre-line` as the simpler approach — no need to split.
- [ ] The DS Callout wraps body content in a `.body` div that sets `p` margin styles. Ensure the sub-component passes a `<p>` element as children, not raw text, to match the CSS expectations.

---

## Post-Epic Close-Out

1. **Confirm clean tree** — `git status` must show nothing staged or unstaged
2. **Run mini-release** — `/mini-release EPIC-XXXX Callout Section Type`
3. **Start next epic** — only after mini-release commit is confirmed
