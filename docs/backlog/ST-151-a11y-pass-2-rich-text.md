---
**Epic:** ST-151 — Pink Moon accessibility Pass 2: rich text, semantics, status chips
**Issue:** [#151](https://github.com/bex-sugartown/sugartown/issues/151)
**Status:** Backlog
**Priority:** 🟣 Soon
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one CHANGELOG line at end
**Visual:** yes
**Vspec:** `docs/drafts/ST-151-a11y-pass-2-rich-text.vspec.html`
---

# ST-151 — Pink Moon accessibility Pass 2: rich text, semantics, status chips

Make the four inline marks, the glossary and citation components, and the status chips accessible without relying on colour, using the 2026-10-10 decisions in the v2 accessibility audit.

## Background

Blocked by #150 (ST-150, Pass 1): `--st-color-text-signal` must exist before this epic starts. Pass 1 fixes contrast values. What remains is how marks are identified without colour (link, glossary term, citation, inline code), whether the glossary and citation components are operable by keyboard and screen reader (the auditor never saw their source), and two status colour maps that assign different hues to the same status (`--st-status-*` and `--st-chip-dot-*`). Documentation also contradicts the tokens. Glossary treatment reopens SUG-211 Option E (pink text on lime). Surfaces: article and node prose, glossary term pages, citation footnotes, status chips and dots, card label strips.

## Objective

After this epic, each inline mark has a cue other than colour, glossary terms and citation markers are real controls announced correctly, every status chip and dot reads from one map, label sizes meet the 11px floor, and the docs match the tokens. Layers touched: component CSS and markup (`GlossaryTermAnnotation.jsx`, citation components, portable-text serializers), tokens, docs. Not touched: Sanity schema or GROQ. If the glossary popover lacks a projected definition, stop and flag it.

## Scope

"Before" values were read from the repo on 2026-10-10. "After" values are the 2026-10-10 decisions in the v2 audit. Where the audit gives a ratio but not a token, the token choice is an activation audit item.

### 1. A3: glossary term (layer: tokens and component CSS)

Component: `apps/web/src/components/GlossaryTermAnnotation.jsx`. SUG-211 Option E set pink text on lime; this reverses it.

| Token | Theme | Before | After |
|---|---|---|---|
| `--st-glossary-annotation-bg` | light | `color-mix(in srgb, var(--st-color-lime-200) 45%, transparent)` | `var(--st-color-lime-200)` `#e8ff8a`, solid |
| `--st-glossary-annotation-bg` | dark | `var(--st-color-lime-200)`, solid | lime at 18% over the card |
| `--st-glossary-annotation-color` (text) | light | `var(--st-color-pink)` (3.25:1) | `var(--st-color-neutral-700)` `#4a4a4d` (8.03:1) |
| `--st-glossary-annotation-color` (text) | dark | `var(--st-color-pink)` (3.29:1) | `var(--st-color-lime-200)` (9.68:1) |
| Underline rule | light | pink, same token as text | 2px dotted, `var(--st-color-neutral-700)` |
| Underline rule | dark | pink | 2px dotted, `var(--st-color-lime-200)` |
| New: `--st-glossary-decoration-color`, `-style`, `-thickness` | both | do not exist | colour per theme as above, `dotted`, `2px` |

### 2. A6: prose links (layer: component CSS)

| Property | Before | After |
|---|---|---|
| Base `a` | `text-decoration: none`, underline on hover only | prose scopes only (portable text, article and node bodies): `text-decoration: underline` |
| Underline colour | n/a | `var(--st-color-pink)`, 1px |
| `--st-link-underline-offset` | `2px`, read by nothing | `3px`, read by the prose link rule |
| Nav and card links | bare | bare, unchanged |
| Text colour | pink (fixed in ST-150) | `--st-color-link-default`, unchanged by this epic |

### 3. A8: glossary and citation semantics (layer: frontend)

| Element | Before | After |
|---|---|---|
| Glossary trigger | recorded at activation (the auditor never saw the source) | `<button type="button">` (or `<a>` if it navigates) with `aria-expanded` and `aria-controls` |
| Glossary popover | recorded at activation | Esc closes it without moving focus, hoverable, persists until dismissed (WCAG 1.4.13) |
| Term on its own entry page | recorded at activation | wrapped in `<dfn>` |
| Citation marker | reads as "[1]" to a screen reader | `aria-label="Citation N"`, `role="doc-noteref"`, `id="cite-ref-N"` |
| Citation note | no back-link | `role="doc-endnote"` inside `role="doc-endnotes"`; back-link `role="doc-backlink"`, `aria-label="Back to citation N"`, `href="#cite-ref-N"` |
| Marker and index size | 0.72rem | 0.75rem minimum |

### 4. A9, A4 status and A13: one status map (layer: tokens and component CSS)

Decision: a grey chip and a pink dot for every status; ring dot for draft, solid dot for in progress; the uppercase word carries the state; crimson leaves draft. `--st-chip-dot-*` aliases `--st-status-*`. This replaces the per-status foreground fixes (A4) and the violet dot fix (A13), so no `amber-900` or `orange-800` is added.

Status chip foreground, light theme (`theme.pink-moon.css`; draft contrast 2.71, designing 3.77, testing 4.15 are the failures):

| Status | Before, light | After |
|---|---|---|
| draft | `var(--st-color-error)` crimson `#ff4757` | grey chip text (ring dot) |
| active, implemented, exploring, operationalized, developing | `var(--st-color-seafoam-800)` | grey chip text |
| evergreen | `var(--st-color-lime-800)` | grey chip text |
| validated | `var(--st-color-maroon)` | grey chip text |
| archived, deprecated | `var(--st-color-softgrey-700)` | grey chip text |
| dreaming | `var(--st-color-violet-600)` | grey chip text |
| designing | `var(--st-color-amber-700)` `#92700c` | grey chip text |
| testing, iterating | `var(--st-color-orange)`, `var(--st-color-sky)` (base) | grey chip text |

Dark theme: the base values in `tokens.css` apply (draft crimson, validated pink, designing amber, and so on); all become the same grey chip text. Audit figures: status text 18.83:1 light, 13.57:1 dark.

Dots (`--st-chip-dot-*`):

| Dot | Before, light | Before, dark | After, both themes |
|---|---|---|---|
| evergreen | `lime-600` | `lime` | pink |
| validated | `seafoam-700` | `seafoam` | pink |
| exploring | `amber-700` | `amber` | pink |
| deprecated | `neutral-500` | `softgrey-500` | pink |
| active | `pink` | `pink` | pink |
| draft | `violet` | `violet` | pink, ring (outline only) |
| operationalized | `seafoam` | `seafoam` | pink |

Pink dot contrast: 3.47:1 light (non-text), 4.82:1 dark. Activation audit: read the status values from the schema `options.list`; pick the grey chip text and border tokens (the audit gives ratios only).

### 4b. Featured tag: neutral like the regular tag (decided 2026-10-10; layer: tokens and component CSS)

The featured tag is the first tag in a card's tag list (code name: rubric chip, `--st-chip-rubric-*`, `.rubric` in `Chip.module.css`). It is not in the audit handoff; Bex decided it should not be pink. It takes the regular tag chip's colours in each theme (light: white tint, dark: dark blue). This replaces ST-150's dark `--st-chip-rubric-fg` change (pink-500 to pink-300), which stops being needed.

| Token | Theme | Before | After |
|---|---|---|---|
| `--st-chip-rubric-bg` | light | `color-mix(in srgb, var(--st-color-pink) 10%, white)` | same as `--st-chip-tag-bg` (`var(--st-color-white-50)`) |
| `--st-chip-rubric-bg` | dark | `color-mix(in srgb, var(--st-color-pink) 18%, var(--st-color-midnight-800))` | same as `--st-chip-tag-bg` (`var(--st-color-midnight-700)`) |
| `--st-chip-rubric-border` | both | `var(--st-color-pink)` | same as `--st-chip-border` (`var(--st-color-rule-accent)` light) |
| `--st-chip-rubric-fg` | light | `var(--st-color-maroon)` | same as `--st-chip-fg` (`var(--st-color-text-default)`) |
| `--st-chip-rubric-fg` | dark | `var(--st-color-pink-300)` (set in ST-150; was pink) | same as `--st-chip-fg` (`var(--st-color-softgrey-200)`) |

Activation audit: confirm what the featured tag's hover state should be (today `Chip.module.css` keeps the rubric border on hover; the audit says tags keep a pink border on hover), and whether the featured tag should still differ from the rest by weight or position.

### 5. Card titles and eyebrows (decided 2026-10-10; layer: component CSS)

| Element | Before | After |
|---|---|---|
| Card H3 title at 1.75rem (28px) | text colour | `var(--st-color-pink)`: large text, 3.47:1 light, 4.82:1 dark |
| Card title under 24px regular or 18.66px bold (default is `--st-card-title-size: var(--st-font-size-lg)`) | text colour | text colour, unchanged |
| Card eyebrow (`Card.module.css:229, 395, 508, 515`) | `var(--st-color-text-eyebrow)`, pink | text colour, so the card eyebrows no longer use the signal token |

The global `--st-color-text-eyebrow` token becomes `--st-color-text-signal` in ST-150; this epic stops the card rules from using it.

### 6. A11: label size floor (layer: tokens)

| Token | Before | After |
|---|---|---|
| `--st-label-size` | `0.65rem` (10.4px) | `0.6875rem` (11px) |
| `--st-metadata-density-label-size` | `0.55rem` (8.8px) | `0.6875rem` (11px) |

Check card footers and IndexCell for wrapping at 320px.

### 7. A15: documentation (layer: docs)

| Document | Before | After |
|---|---|---|
| Tactical Guide | pink-500 listed as `#FF69B4`; brand-secondary listed as seafoam; 44px touch-target rule for all targets | pink-500 `#FF247D`; brand-secondary maroon; WCAG 2.2 AA minimum 24x24px, 44px as the house target for primary actions only, chips exempt at 24 to 28px; Deep Pink Rule in token terms (small pink text on light uses `--st-color-text-signal`, never `--st-color-pink`) |
| `theme.pink-moon.css` comments (`--st-color-text-muted`, `--st-label-color`) | `#7A7A7D` | `#6C6C6F` |
| `colors_and_type.css` | `--st-label-color` default charcoal-400 (3.17:1); card titles described as narrative | default neutral-500; card titles UI sans |
| Base `--st-label-color` in `tokens.json` | `var(--st-color-charcoal-400)` | `var(--st-color-neutral-500)` |

Neither the Tactical Guide nor `colors_and_type.css` is tracked in this repo. Activation audit: locate both (Storybook docs, Drive or elsewhere) and confirm Bex wants them edited there.

## Phases

Single phase.

## Acceptance Criteria

- [ ] Prose sample containing link, glossary term, citation and inline code: each is distinguishable under CSS `filter: grayscale(1)`, both themes.
- [ ] Glossary text against its fill: 8.03:1 or more light, 9.68:1 or more dark. Dotted rule against fill 3:1 or more.
- [ ] The featured tag renders with the same colours as the other tags in both themes; no pink fill, border or text at rest.
- [ ] Card H3 title at 28px is pink; no card title under 24px is pink; card eyebrows render in text colour, both themes.
- [ ] Glossary trigger is reachable by Tab, opens on Enter and Space, closes on Esc with focus returned to the trigger, and the popover stays open when the pointer moves onto it.
- [ ] VoiceOver announces a citation marker as "Citation 1, link", and the back-link returns focus to the marker.
- [ ] No `--st-chip-dot-*` token holds a literal value; all alias `--st-status-*`.
- [ ] Labels render at 11px with no new wrapping in card footers at 320px.
- [ ] The Tactical Guide contains no `#FF69B4`, checked by `grep` on the located file.
- [ ] `pnpm validate:tokens --strict-colors` and `pnpm test:smoke` pass; one article with citations and glossary terms and one knowledge-graph node with a status chip render in both themes.

## Human QA Walkthrough — example local pages

> Activation audit: read `apps/web/src/App.jsx`, list every page-type whose CSS this epic
> can reach, and build the Human QA Walkthrough table (one example local URL per page-type,
> incl. unchanged pages as regression guards) per `docs/epic-template.md` §Human QA
> Walkthrough. Capture one real published slug per detail page-type and datestamp it.

## Technical notes

- **Upstream dependency:** #150 must be merged. This epic does not start before it.
- **Phase 0 gate fires** (Visual: yes). The v2 audit HTML is the vspec; sign-off covers the glossary, link, citation, inline-code and status chip specimens (sections 02b and 02c).
- **Activation audits.** (1) Read `apps/web/src/components/GlossaryTermAnnotation.jsx` and `apps/web/src/pages/GlossaryTermPage.jsx`; record element types, ARIA and event handling before changing them. (2) Run `grep -rn "citation" apps/web/src/components/` and the portable-text serializers (three files define PT components; see MEMORY.md PortableText registry) and update all that render markers. (3) Read the glossary term query in `apps/web/src/lib/queries.js` and confirm the popover has its definition; if not, stop and flag. (4) Read the status values from the schema `options.list`, not from memory. (5) Read the shipped card CSS and list every card variant whose title is under 24px, so none is made pink.
- **A12 resolved:** keep the pink focus ring with its 2px offset; no inner ring. Focused buttons keep the white label on pink-600.
- **Content Write Gate:** not applicable. **Schema:** none expected; stop and flag if needed.
- **Model & Mode [REQUIRED]:** `/model sonnet`. Component markup and CSS with decisions made. Use `/model opus` with plan mode only if the activation audit finds the popover must be rebuilt.

## Model & Mode [REQUIRED]

`/model sonnet`. Decisions are recorded; the work is CSS, ARIA and markup.

## Non-Goals

- Pass 1 token contrast work: ST-150.
- Chip neutral border non-text contrast: #51. Storybook a11y gate: #50.
- Focus ring change (A12): decided against.
- New schema fields or GROQ changes.

## Related

- **GitHub:** [#151](https://github.com/bex-sugartown/sugartown/issues/151)
- **Blocked by:** [#150](https://github.com/bex-sugartown/sugartown/issues/150)
- **Also:** #51, #50; SUG-211 (glossary term treatment, shipped)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
