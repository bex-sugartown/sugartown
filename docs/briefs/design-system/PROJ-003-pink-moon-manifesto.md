# Pink Moon Manifesto

### *A Working Philosophy for Sugartown's Visual Identity*

**Status:** Active — revised 2026-05-14 (v2)
**Companion:** [Anti-Slop Manifesto](./ai-slop-manifesto.md) · [PRD v3.0](./design-system-prd.md)
**Reference:** `AB-001_ledger_tradition_v2.html` · `SUG-78-ledger-tradition-mock.html`

---

## Part I: The Premise

Pink Moon is not a theme. It is the design system.

There were four mode variants. Now there are two: **Pink Moon Light** (default) and **Pink Moon Dark**. The classic light and dark modes served as scaffolding while the system found its voice. The scaffolding came down in v0.23.0 (SUG-83). Every selector, every token override, every CSS pair that referenced `[data-theme="light"]` or `[data-theme="dark"]` is gone. The system runs on `[data-theme="light-pink-moon"]` exclusively.

This is not a simplification. It is a commitment.

---

## Part II: The Ledger Tradition

Pink Moon has a historical argument behind it. The visual language is not borrowed from general "academic aesthetics" or a vague sense of seriousness. It comes from a specific genealogy: eight hundred years of humans solving the problem of **rendering structured content legibly at scale, across many hands, with the metadata intact.**

Scribes, accountants, cataloguers, and statisticians all arrived at the same answers independently:

- **Ruled columns** make structure visible without annotation
- **Marginal numbering** makes navigation possible without a separate index
- **Fixed card dimensions** make comparison possible across different hands and libraries
- **Monospaced labels** signal that this is data, not prose
- **Governed abbreviation** sacrifices elegance for consistency

These were not aesthetic choices. They were governance. Rules enforce correctness; when the visible structure of a page makes a missing field obvious, the system polices itself.

The Ledger Tradition (AB-001) names this genealogy explicitly:

| Reference | Period | What It Established |
|-----------|--------|---------------------|
| *The Domesday Book* | 1086 | A content model is older than software. Enforce templates; vary content within them |
| Pacioli's Double-Entry | 1494 | Layout enforces correctness. A gap in the structure is visible at a glance |
| The Library Card Catalog | 1841–1980s | Fixed dimensions, predictable metadata slots, cross-references as first-class citizens |
| The Mundaneum | 1910 | A knowledge graph is 115 years old. Lean into the lineage |
| Neurath's Isotype | 1925 | A design system is a visual language. Tokens are vocabulary; components are grammar |
| *Old Bailey* Proceedings | 1674–1913 | Searchable today because the original editors enforced the schema |

The North Star is design for the reader who is *looking something up*, not the viewer who is *being sold to*. Every Sugartown surface should feel closer to a well-ruled accounts book than to a marketing site. Density is a feature. Rules are a feature. Labels that look like labels are a feature.

### Why this matters for Sugartown specifically

Sugartown is not a portfolio site that happens to have taxonomy. It is a knowledge platform whose visual identity is built to expose its own ontology. The structured content is the point. The card is the direct descendant of the library card. The Knowledge Graph is the direct descendant of the Mundaneum. The MetadataCard is the direct descendant of Pacioli's ledger: every field has a place, and a missing field leaves a visible gap.

The Ledger Tradition layer makes this lineage legible inside the design system itself. It is not atmosphere. It is provenance.

---

## Part III: What Pink Moon Is

Pink Moon is the visual language of a working library.

Not a tech dashboard. Not a SaaS app. Not a portfolio that looks like every other portfolio. A **library**: the kind with card catalogues and foxed spines and a reading room where the light falls in a particular way and someone has opinions about the typeface on the call numbers.

### Sharp Neutral, Hot Signal

Surfaces are **neutral and opaque**. Colour appears **only where it earns its place** — at CTAs, links, chips, and taxonomy markers. The interface is a white page (or a dark page) with neon ink. Not frosted, not glowing, not ambient. Printed.

Two exceptions where translucency is used:

1. **The hero panel** — a bounded, blurred, semi-opaque container over the hero image. Text sits inside the panel. The image is visible around it, not behind the text. Contrast guaranteed by the panel, not the image.
2. **The sticky header** — becomes translucent on scroll for spatial awareness while reading. Functional, not decorative.

Everything else is solid.

### Radius: Downplayed

Zero radius on chips, cards, blockquotes, code blocks, metadata cards, buttons. Sharp edges read as precision and catalogue rigour. The two exceptions are the hero panel (slight) and the theme toggle (pill for affordance). Rounded corners are reserved; sharpness is the default.

### Borders: Visible, Not Heavy

`softgrey-400` in light mode. Visible enough to define structure, not heavy enough to dominate. In dark mode, `rgba(255,255,255,0.12)`. The darker light-mode outlines make the zero-radius edges read as intentional rather than unfinished.

The Ledger Tradition introduced hairline section dividers inside cards (the folio variant). The 2px ink column rule on MetadataCard. The `--st-color-rule-accent` neutral scale that sits between surfaces without competing with signal colours.

### The Signal Rule

A colour must *do something*. If it is not communicating hierarchy, state, category, or navigation, it does not belong. Cover the colour with your thumb. Did you lose information? If yes, it is structural. If no, it is ornament. Remove it.

---

## Part IV: Typography

The font stack changed in the Ledger Tradition update. The full Ledger stack:

| Role | Font | Use |
|------|------|-----|
| **Narrative / Display** | Cormorant Garamond | h1, h2, hero titles, card titles. Replaces EB Garamond. More editorial weight, stronger italic register. |
| **UI / Body** | DM Sans | Body text, subtitles, UI prose, labels. Replaces Fira Sans. Cleaner optical spacing at body sizes. |
| **Catalogue / Metadata / Code** | IBM Plex Mono | Chips, eyebrows, metadata labels, call numbers, hero meta, colophon, code blocks. Replaces Courier Prime. Ships 400/500/600/700 natively — `--st-label-weight: 600` is now a real weight, not synthesized. |

Cormorant Garamond runs at 18px on card titles (up from 16px). The italic variants are loaded and used intentionally for editorial lede text and section headings in the Ledger Tradition layer.

IBM Plex Mono is narrower than Courier Prime and handles dense chip rows without layout strain. The monospace voice is unified across all labelling surfaces: one font, one register, one association with structured data.

The token namespace is `--st-font-family-narrative`, `--st-font-family-ui`, `--st-font-family-mono`. Legacy `--st-font-sans` aliases exist for backward compat only.

---

## Part V: The Palette

### Neon Over Neutral

In light mode, the canvas is warm white. Surfaces are paper. Text is charcoal. The ground is quiet.

Into this quietness: pink (`#FF247D`), seafoam (`#2BD4AA`), lime (`#D1FF1D`), maroon (`#B91C68`). These are not background colours. They are *signal* colours, the neon underlining on an otherwise sober page.

In dark mode, the canvas inverts to midnight (`--st-color-void-900`) and the accent colours keep their intensity against the dark ground.

The Ledger Tradition neutral scale (no blue cast) now underpins the component layer:

| Token | Value | Purpose |
|-------|-------|---------|
| `--lt-neutral-100` | `#F2F2F3` | Page canvas (Ledger surfaces) |
| `--lt-neutral-200` | `#E4E4E5` | Table headers, secondary surfaces |
| `--lt-neutral-300` | `#C6C6C8` | Structural hairlines, card borders |
| `--lt-neutral-500` | `#7A7A7D` | Muted text, metadata labels |
| `--lt-color-rule-accent` | `→ neutral-300` | Hairline dividers in folio cards |

### Colour and Taxonomy

The signal colour discipline feeds directly into the Knowledge Graph colour system. When taxonomy chips carry project / category / tag colours, those colours need neutral ground to be readable. If the surfaces are already tinted, the chip colours compete. On white paper, they sing.

This is not an accidental relationship. The Ledger Tradition establishes neutral ground precisely so the taxonomy layer can carry meaning through colour without assistance from the surface it sits on.

### WCAG AA: Non-Negotiable

| Surface | Approach |
|---------|----------|
| Body text on canvas | Charcoal on white / white on void. No negotiation. |
| Headings | `--text-primary`. Not brand colour. Structure, not signal. |
| Chip/tag text | `color-mix()` resolves chip text against chip background. Light mode: darker variants (seafoam-700, lime-700). |
| Buttons | White on pink (primary). Charcoal on lime (secondary). Midnight outline (tertiary). |
| Hero overlays | Frosted panel. Contrast guaranteed by panel, not image. |
| Focus rings | 2px solid `#FF247D`, 2px offset. |

---

## Part VI: The Ledger Layer in the DS

The Ledger Tradition is not a separate theme. It is a structural layer applied inside Pink Moon Light. The components it touches are the content-rendering surfaces: cards, metadata, chips, section labels.

### What shipped in SUG-78 / SUG-82 / SUG-80

**Card titles:** Cormorant Garamond at 18px. The card title is the one place where the narrative serif appears in the content grid, marking content items as entries in a catalogue rather than product tiles.

**Card folio variant:** hairline section dividers using the `background-color + gap: 1px` technique so the parent's `--st-color-rule-accent` shows through as a hairline between regions. Canvas footer row with category in the footer zone. Pink border on hover via `--st-card-hover-border`.

**MetadataCard:** the fully realized ledger entry. 2px ink column rule on the left. Scalar field grid for label/value pairs. Chip container with correct padding. Call-number alignment. The MetadataCard is the Ledger Tradition's clearest expression in the DS: it is what Pacioli's double-entry looks like when rendered as a React component with structured Sanity data behind it.

**Chip and release ticker:** Cormorant Garamond in specific slots. IBM Plex Mono for labels. The typographic register of "structured data surface" is consistent.

**FilterBar compact density mode:** for archive pages where the filter bar shares space with content.

**WCAG AA correction pass:** token-only, corrected across component tokens. The design system's contrast governance runs through the token validator, not human review. `pnpm validate:tokens --strict-colors` is the enforcement layer.

**Callout `info` variant:** lime in dark mode. Font size bumped for legibility.

### The folio number pattern

Folio numbers (call numbers in the margin) appear in IBM Plex Mono at 10px, `--lt-color-ink` or `--st-color-maroon`, uppercase, rotated 90 degrees or positioned in the left margin depending on context. This is the clearest direct reference to the card catalogue and the account ledger: the item has a position in the collection, and that position is visible on the item itself.

---

## Part VII: Layout and Academic Patterns

### The Section Spacing Framework

Detail pages (articles, nodes, case studies) follow five rules enforced at the system level:

1. **Parent owns gap.** `.detailContext` owns inter-section spacing. Individual sections have zero vertical margin and zero vertical padding.
2. **Flex child width contract.** All `.detailContext` children have `width: 100%`.
3. **Catch-all over whitelist.** `> *` not a named selector list.
4. **Component margin zero.** Components with their own `margin-block` need it zeroed in detail context.
5. **Boundary elements.** Elements sitting between two spacing contexts get explicit margin.

These rules exist because the Ledger Tradition is about structured density, not about adding whitespace. The wrong answer to "this is too dense" is "remove spacing rules." The right answer is to layer information correctly so each region earns its space.

### Academic Patterns (current and planned)

| Pattern | Status | Description |
|---------|--------|-------------|
| **MetadataCard** | Shipped | Catalogue card between hero and body. Label/value grid + chip rows. Zero radius. |
| **Citation marks** | Shipped | IBM Plex Mono superscript numerals in pink. Endnote list at bottom. |
| **Taxonomy chips** | Shipped | IBM Plex Mono. `color-mix()` colour system. Knowledge graph signal colours. |
| **Colophon footer** | Planned | Publication footer. Dark ground. Edition metadata strip. |
| **Sidenotes / marginalia** | Deferred | At 1200px+, pull citations into margin column. |
| **Archive index view** | Deferred | Dense, scannable list with sortable columns alongside card grid. |
| **Glossary** | Deferred (SUG-35) | Dotted-underline annotations, hover definition cards. |
| **Figure captions** | Planned | Figure number, title, source attribution below images. |

### The Knowledge Graph

The Knowledge Graph is not a feature added to a portfolio. It is the reason the portfolio has the architecture it does. Every taxonomy document, every reference, every cross-content link is a node or edge in a graph that Paul Otlet was building with index cards in Brussels in 1910.

The force-graph canvas, the filter bar, the chip colour system, the cross-reference relationship types in the schema: these are implementations of a 115-year-old idea. The visual language should feel like it knows that.

---

## Part VIII: The Token Architecture

Three-tier CSS custom property system. All tokens under `--st-`.

- **Tier 1 — Primitives:** Raw values. `--st-color-pink-500`, `--st-space-4`, `--st-radius-xs`. No semantic meaning.
- **Tier 2 — Semantic:** Intent-mapped aliases. `--st-color-brand-primary`, `--st-color-text-secondary`. Theme overrides operate here.
- **Tier 3 — Component:** Scoped tokens. `--st-card-border`, `--st-chip-bg`. Consumed by component CSS only.

**Source of truth:** `tokens/source/tokens.json`. Both `tokens.css` files are generated via Style Dictionary v5 (`pnpm tokens:build`). Do not edit generated files. The pre-commit hook blocks it.

**Theme files** (`theme.pink-moon.css`) are hand-authored and override-only. No hex values that have no primitive anchor in `tokens.css`.

**Glassmorphism audit note:** `--st-color-bg-surface`, `--st-color-bg-surface-strong`, and `--st-card-bg` resolve to `rgba()` semi-transparent values in the dark-pink-moon block. Using these tokens for a label cell or header background produces a glassmorphism wash. Use a raw primitive (`--st-color-midnight-800`) or a semantic alias with no glassmorphism override for any surface that must be solid.

---

## Part IX: What Is Finished, What Is Not

### Converged

- Classic dark/light modes retired. Pink Moon Light + Dark are the only modes (SUG-83).
- Token coverage complete: 0 hardcoded hex/rgba values in component CSS. `validate:tokens --strict-colors` passes (SUG-68, SUG-85).
- Style Dictionary pipeline (SUG-86): both token files generated from `tokens/source/tokens.json`. Pre-commit gate active.
- Ledger Tradition structural pass (SUG-78, SUG-82, SUG-80): card titles, folio variant, MetadataCard, chip/ticker, FilterBar compact density, WCAG correction.
- Component cleanup: `EditorialCard` deleted. `CardGrid` web-adapter deleted. `DraftBadge` uses `Chip` internally. Legacy `aiTool` and `categoryPosition` Card props removed.
- SchemaERD refactored to DS primitives (SUG-20): no hardcoded radius, color, or background values.
- Storybook: Cormorant Garamond self-hosted in `apps/storybook/public/fonts/`. `@storybook/addon-a11y` active. Machine-readable component registry.

### In Progress

- Button "Due Date Slip" redesign (specified in PRD §9, not yet implemented).
- Colophon footer (planned, not built).

### Deferred

- Sidenotes / marginalia at wide viewports (academic layer Phase 4).
- Archive index view (card grid toggle).
- Glossary integration (SUG-35).
- Running headers on detail pages.
- Print stylesheet.

---

## Part X: The Default

Pink Moon Light is the default mode. The reasons:

**Practical:** WCAG contrast is simpler to guarantee on light backgrounds. Photography reads better on light (hero images are greyscale). Most users browse in well-lit environments. Print stylesheets inherit naturally.

**Philosophical:** The library metaphor is a *lit room*. Warm light on paper. The reading lamp is on. Dark mode is the after-hours library: same structure, different mood. Defaulting to light says this is a place of work, not a tech demo.

**Implementation:** `prefers-color-scheme: light` loads Pink Moon Light. Users toggle to Dark. Toggle persists in `localStorage`.

---

## Open Questions

1. **Archive density threshold** — at what item count does the card grid become overwhelming? Should the view toggle be user-controlled or content-driven?

2. **Margin column breakpoint** — sidenotes need ~250px margin + ~700px main column. 1200px or 1400px?

3. **Print stylesheet** — the Ledger Tradition invites printing. Should Pink Moon Light have a dedicated print stylesheet that reproduces the ruled-page aesthetic in ink?

4. **Folio numbers in component library** — should the folio / call-number pattern be formalized as a DS primitive (e.g. a `Folio` or `CallNumber` component), or remain a CSS class applied in context?

---

## Resolved

1. **Monospace font** — IBM Plex Mono. Narrower than Courier Prime, ships real weights, handles dense chip rows without layout strain. *Resolved: Ledger Tradition update (2026-04-24).*

2. **Narrative serif** — Cormorant Garamond. Stronger editorial weight and italic register than EB Garamond. Used at 18px on card titles. *Resolved: AB-001 v2.*

3. **UI sans** — DM Sans. Cleaner optical spacing at body sizes than Fira Sans. *Resolved: AB-001 v2.*

4. **Hero image treatment** — Frosted panel over greyscale image. Bounded, blurred, sharp-edged. Contrast guaranteed by panel. Image provides atmosphere only. *Resolved: Pink Moon mock B.*

5. **Classic mode retirement** — Complete. No `[data-theme="light"]` or `[data-theme="dark"]` selectors anywhere in the codebase. *Shipped: SUG-83, v0.23.0.*

6. **Token pipeline** — Style Dictionary v5. `tokens/source/tokens.json` is the single source of truth. Both generated files kept in sync via `pnpm tokens:build` and the pre-commit hook. *Shipped: SUG-86, v0.23.14.*

7. **Heading colour** — `--text-primary` (charcoal / white). Not brand colour. Headings are structure, not signal. *Resolved: Pink Moon mock B.*

---

*This document is the philosophy. What survives into the PRD are the decisions. The philosophy stays here to justify them.*
