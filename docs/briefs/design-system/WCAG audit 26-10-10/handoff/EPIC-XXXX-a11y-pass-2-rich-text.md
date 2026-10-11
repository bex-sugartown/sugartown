# EPIC-XXXX — Pink Moon accessibility, Pass 2: rich text in pink, and semantics

Rebuilt 10 Oct 2026 against the design-system canonical snapshot (7 Oct sync). Matches **Pink Moon Accessibility Audit v4** (approved 10 Oct). Supersedes all earlier Pass 2 drafts.
Revised 11 Oct 2026: no Pass 2 changes; re-synced with Pass 1 (featured rubric chip now neutral, border included).
Depends on: Pass 1 merged (light `--st-color-link-default` = `--st-color-text-brand`; code box tokens wired).
Every change is written as **current value → new value**. No PRD; assumptions below.

## The four inline marks after this epic

| Mark | Light | Dark | Cue that works without colour |
|---|---|---|---|
| Link | maroon text, pink underline | pink text, pink underline | solid underline |
| Glossary term | ink on pink-50, pink dotted underline | white on 14% pink, pink dotted underline | dotted underline + fill |
| Citation marker | maroon | pink | `[N]` superscript, mono |
| Inline code | maroon on softgrey-100, maroon-200 outline | pink-300 on midnight-700, pink-800 outline | mono, outlined box |

No lime and no seafoam in rich text. This supersedes SUG-211 Option E (seafoam code, lime glossary).

## Pre-Execution Completeness Gate

- [ ] **Epic ID** — OPEN (Bex): assign next EPIC number, rename file.
- [ ] **File paths** — OPEN (Claude Code, step 0): the glossary term component, the portable-text link serializer/prose styles and the footnote list are not in `packages/design-system/src/components`. Locate them and record element types, ARIA and current CSS before editing.
- [x] **Layout contract** — no layout changes. Colour, decoration, ARIA, markup semantics, two size tokens.
- [x] **Enum values** — none touched.
- [x] **Dark / theme treatment** — explicit per item.
- [ ] **Schema changes** — expected none. If the glossary popover needs a field that isn't in the GROQ projection, STOP and flag.
- [ ] **Web adapter** — OPEN: confirm whether the glossary and footnote components live in `packages/design-system`, `apps/web`, or both.

## Scope (execution order)

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

Card CSS also hard-codes `0.65rem` (`.folioStatus`, `.statusBadge`, `.chipGroupLabel`, `.compact` footer/date/folio) and `0.68rem` (`.compact .eyebrow`). Repoint each to `var(--st-label-size)`. Check card footers and IndexCell for wrapping at 320px.

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

## Technical Constraints

- Token-only rule: no raw hex in component CSS.
- No schema or GROQ changes. If required, stop and flag.
- Zero radius everywhere; no new shadows.

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

## Assumptions standing in for PRD

- Glossary popover content is already available client-side.
- Superseding SUG-211 Option E is accepted (decided 10 Oct, v4).

## Post-Epic Close-Out

1. `git status` must show nothing staged or unstaged
2. Run `/mini-release EPIC-XXXX [Epic name]` or `/release` for MINOR version bumps
3. Start next epic only after mini-release commit is confirmed
