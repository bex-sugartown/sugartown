---
**Epic:** ST-151 — Pink Moon accessibility Pass 2: rich text in pink, and semantics
**Issue:** [#151](https://github.com/bex-sugartown/sugartown/issues/151)
**Status:** Backlog
**Priority:** 🟣 Soon
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one CHANGELOG line at end
**Visual:** yes
**Vspec:** `docs/drafts/ST-151-a11y-pass-2-rich-text.vspec.html`
---

# ST-151 — Pink Moon accessibility Pass 2: rich text in pink, and semantics

Make the four inline marks identifiable without colour, make the glossary and citation components operable by keyboard and screen reader, and move rich text to pink and maroon only, per the v4 audit and the 11 Oct handoff.

## Background

Blocked by #150 (Pass 1): light `--st-color-link-default` must be `--st-color-text-brand` and the inline-code box tokens must be wired first. The v4 audit (`docs/briefs/design-system/WCAG audit 26-10-10/Pink Moon Accessibility Audit v4 (standalone).html`) and handoff (`.../handoff/EPIC-XXXX-a11y-pass-2-rich-text.md`, revised 11 Oct) replace the earlier version of this epic, which used lime for the glossary term and code. The 11 Oct revision made no Pass 2 changes; the featured tag decision now lives in ST-150. Surfaces: article and node prose, glossary term pages and popovers, citation footnotes, card label rows.

## Objective

After this epic, links are underlined in prose, glossary terms are ink on pink-50 with a pink dotted rule, inline code is maroon on soft grey, glossary and citation components are real controls with correct ARIA, labels meet the 11px floor, and the docs match the tokens. Layers touched: tokens, theme CSS, component CSS and markup (glossary, citation, portable-text link), docs. Not touched: Sanity schema, GROQ (stop and flag if the glossary popover needs a field).

## The four inline marks after this epic

| Mark | Light | Dark | Cue that works without colour |
|---|---|---|---|
| Link | maroon text, pink underline | pink text, pink underline | solid underline |
| Glossary term | ink on pink-50, pink dotted underline | white on 14% pink, pink dotted underline | dotted underline + fill |
| Citation marker | maroon | pink | `[N]` superscript, mono |
| Inline code | maroon on softgrey-100, maroon-200 outline | pink-300 on midnight-700, pink-800 outline | mono, outlined box |

No lime and no seafoam in rich text. This supersedes SUG-211 Option E (seafoam code, lime glossary).

## Scope

### 1. Prose links underlined
Prose scopes only (portable text, article body, node body). Nav, card and chip links stay bare.

| Property | Current | New |
|---|---|---|
| color | `var(--st-color-link-default)` | unchanged (maroon light after Pass 1, pink dark) |
| text-decoration-line | locate | `underline` |
| text-decoration-color | locate | `var(--st-color-brand-primary)` |
| text-decoration-thickness | locate | `1px`; hover `2px` |
| text-underline-offset | locate | `var(--st-link-underline-offset)` (2px, existing) |

### 2. Inline code → maroon / pink (theme.pink-moon.css)

| Token | Current | New | Result |
|---|---|---|---|
| light `--st-code-inline-color` + `--st-code-inline-text` | `var(--st-color-seafoam-800)` | `var(--st-color-text-brand)` | 5.15 → 5.47 |
| light `--st-code-inline-border` | `1px solid var(--st-color-seafoam-300)` | `1px solid var(--st-color-maroon-200)` | — |
| light `--st-code-inline-bg` | `var(--st-color-softgrey-100)` | unchanged | — |
| dark `--st-code-inline-color` + `--st-code-inline-text` | `var(--st-color-seafoam-500)` | `var(--st-color-pink-300)` | 8.21 → 6.66 |
| dark `--st-code-inline-border` | `1px solid var(--st-color-seafoam-700)` | `1px solid var(--st-color-pink-800)` | — |
| dark `--st-code-inline-bg` | `var(--st-color-midnight-700)` | unchanged | — |

Mirror the light values into the `tokens.css` base `--st-code-inline-*` so the base and light theme agree. Leave `theme.light.css` (deprecated) untouched.

### 3. Glossary term → pink fill, ink text, pink dotted underline
Today `--st-glossary-annotation-color` (pink) drives both text and underline on a lime fill: 1.79 light, 3.29 dark.

| Token | Current | New |
|---|---|---|
| light `--st-glossary-annotation-bg` | `color-mix(in srgb, var(--st-color-lime-200) 45%, transparent)` | `var(--st-color-pink-50)` |
| dark `--st-glossary-annotation-bg` | `var(--st-color-lime-200)` | `color-mix(in srgb, var(--st-color-pink) 14%, var(--st-color-midnight-800))` |
| `tokens.css` base `--st-glossary-annotation-bg` | `var(--st-color-lime-200)` | `var(--st-color-pink-50)` |
| `--st-glossary-annotation-fg` (new, tokens.css) | — | `var(--st-color-text-default)` (ink on light, white on dark) |
| `--st-glossary-annotation-color` | `var(--st-color-pink)` | unchanged; now drives the underline only |

Component: text `color` → `var(--st-glossary-annotation-fg)`; underline `dotted`, colour `var(--st-glossary-annotation-color)`, 1px, offset `var(--st-link-underline-offset)`. Result: 17.38 light, 14.53 dark.

### 4. Glossary semantics
- The trigger is a `<button type="button">` (or `<a>` if it navigates), never a bare span.
- `aria-expanded` + `aria-controls` when the popover opens.
- The popover meets 1.4.13: dismissible with Esc without moving focus, hoverable, and stays open until dismissed.
- On the term's own glossary entry page, wrap the term in `<dfn>`.

### 5. Citation semantics and size
- Marker link: `aria-label="Citation N"` (keep the visible `[N]`), `role="doc-noteref"`, `id="cite-ref-N"`.
- Notes sit in `role="doc-endnotes"`. Each note gets a back-link `href="#cite-ref-N"`, `aria-label="Back to citation N"`, `role="doc-backlink"`.
- `--st-citation-size`: `0.72rem` → `0.75rem` (tokens.css).

### 6. Label size floor (tokens.css)

| Token | Current | New |
|---|---|---|
| `--st-label-size` | `0.65rem` | `0.6875rem` |
| `--st-metadata-density-label-size` | `0.55rem` | `0.6875rem` |

Card CSS also hard-codes `0.65rem` at `Card.module.css` l.126, 266, 423, 603, 607, 611 and `0.68rem` at l.599 (named in the handoff as `.folioStatus`, `.statusBadge`, `.chipGroupLabel` and the `.compact` footer, date, folio and eyebrow; confirm each selector). Repoint each to `var(--st-label-size)`. Check card footers and IndexCell for wrapping at 320px.

### 7. Focus ring (verify only)
Keep `2px solid var(--st-color-focus)`, 2px offset. Verify it shows against the pink-600 primary button (via the offset gap) and on canvas in both themes. No code change expected.

### 8. Documentation resync
- Tactical Guide: pink-500 is `#FF247D` (not `#FF69B4`); brand-secondary is maroon.
- theme.pink-moon.css comment: neutral-500 is `#6C6C6F` (the comment says `#7A7A7D`).
- Mark SUG-211 Option E as superseded by this epic in the code-inline and glossary token comments.
- Add to the Guide, in token terms:
  - Pink is the one hot colour; everything else is neutral.
  - Small pink text on light uses `--st-color-text-brand`. White on pink sits on `--st-color-pink-600` (hover pink-700).
  - Dark eyebrows and folio labels use `--st-color-text-default`.
  - Chips are neutral. Status dots are pink; draft is a ring.
  - Rich text uses pink and maroon only. Lime is the secondary button fill and nothing else.

## Phases

Single phase.

## Acceptance Criteria

- [ ] `pnpm validate:tokens --strict-colors` passes.
- [ ] In a prose sample with all four marks, each is distinguishable in greyscale (`filter: grayscale(1)`), both themes.
- [ ] Inline code text vs fill ≥ 5.47 light, ≥ 6.66 dark.
- [ ] Glossary text vs fill ≥ 17.38 light, ≥ 14.53 dark.
- [ ] grep finds no `lime` or `seafoam` in `--st-code-inline-*` or `--st-glossary-*` values.
- [ ] Glossary trigger: reachable by Tab, opens on Enter/Space, closes on Esc, focus returns to the trigger, and the popover stays open when the pointer moves onto it.
- [ ] VoiceOver or NVDA announces markers as "Citation 1, link"; the back-link returns focus to the marker.
- [ ] Labels compute to 11px; no new wrapping in card footers at 320px.
- [ ] Docs merged; grep finds no `#FF69B4`.
- [ ] Route smoke test: one article with citations, glossary terms and inline code, one knowledge-graph node, both themes.

## Human QA Walkthrough — example local pages

> Activation audit: read `apps/web/src/App.jsx`, list every page-type whose CSS this epic
> can reach, and build the Human QA Walkthrough table (one example local URL per page-type,
> incl. unchanged pages as regression guards) per `docs/epic-template.md` §Human QA
> Walkthrough. Capture one real published slug per detail page-type and datestamp it.

## Technical notes

**Review of the 11 Oct handoff (2026-10-11).** Token names, current values and contrast figures were checked against the repo. `--st-color-pink-50`, `-pink-300`, `-pink-800`, `-maroon-200` and `--st-citation-size` (0.72rem) exist. `--st-glossary-annotation-fg` is new, as stated. Recomputed: glossary ink on pink-50 17.38, dark 14.53; code maroon on soft grey 5.47, dark pink-300 on midnight-700 6.66.

**Decided 2026-10-11:** card titles stay ink (v4), replacing the 10 Oct pink-at-28px decision.

**Approved 2026-10-11:** (2) card eyebrows follow v4 (maroon on light, white on dark, set in ST-150); (3) lime is removed from rich text (glossary term and inline code), reversing the lime glossary decision from v2 and SUG-211 Option E. ST-150 and ST-151 ship in the same release.

**Gaps found in the handoff:**
- The glossary term, popover, portable-text link serializer and footnote list are not in `packages/design-system/src/components`. Locate them first (`apps/web/src/components/GlossaryTermAnnotation.jsx` and `GlossaryTermPage.jsx` are the likely starting points) and record element types, ARIA and current CSS before editing.
- The 1.79:1 "today" figure for the glossary term is the handoff's own measurement on its surface; the v2 audit gave 3.25. Re-measure the "before" in Storybook before quoting it.
- The pink dotted rule against the pink-50 fill is 3.28:1 (light) and 4.26:1 (dark): it clears the 3:1 non-text bar, but only just on light.
- The Tactical Guide and `colors_and_type.css` are not tracked in this repo; step 8 needs their location confirmed.
- Leftovers (not in this epic, see the leftovers issue): hero eyebrow, retiring chip presets, legacy status badges, dark label strip, the node-page sidebar duplication bug.

**Upstream dependency:** #150 merged. **Schema:** none expected. **Content Write Gate:** not applicable. **Phase 0 gate fires** (Visual: yes); the v4 audit specimens are the vspec.

## Model & Mode [REQUIRED]

`/model sonnet`. CSS, ARIA and markup with the decisions made. Use `/model opus` with plan mode only if the activation audit finds the popover must be rebuilt.

## Non-Goals

- Pass 1 token contrast and neutral chips: ST-150.
- Chip neutral border non-text contrast: #51. Storybook a11y gate: #50.
- Focus ring change (verify only).
- New schema fields or GROQ changes.

## Related

- **GitHub:** [#151](https://github.com/bex-sugartown/sugartown/issues/151)
- **Blocked by:** [#150](https://github.com/bex-sugartown/sugartown/issues/150)
- **Handoff:** `docs/briefs/design-system/WCAG audit 26-10-10/handoff/EPIC-XXXX-a11y-pass-2-rich-text.md`
- **Also:** #51, #50; SUG-211 (superseded by this epic)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
