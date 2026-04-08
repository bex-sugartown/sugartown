# Sugartown Pink Moon Design System — PRD 3.0

| Metadata | Details |
| :--- | :--- |
| **Document** | Sugartown Design System PRD |
| **PRD Version** | **3.0 — Pink Moon** |
| **PRD Status** | 🟢 Active |
| **Owner** | Product (Bex Head) |
| **Primary Repo** | `sugartown` (pnpm monorepo) |
| **Scope** | Design System (Portable, CMS-Agnostic) |
| **Supersedes** | PRD v2.0 (Sanity Claus) |
| **Last Reviewed** | 2026-04-08 |

> **v2.0 → v3.0 changes:**
> - Pink Moon is now the primary design system identity (not a theme variant)
> - WordPress references removed (migration complete)
> - Repository structure updated to current monorepo (`packages/design-system`, `apps/web`, `apps/studio`, `apps/storybook`)
> - Typography: Libre Caslon Display replaces Playfair Display for narrative headings, Courier Prime replaces Fira Code for ALL monospace (metadata, code, catalogue)
> - Visual direction: sharp neutral surfaces + hot colour signal (from Pink Moon manifesto)
> - Prose-as-design-SoT documented as an architectural decision
> - Anti-slop governance integrated
> - Figma references removed (design intent is expressed through PRD + manifesto + HTML mocks + CSS tokens + Storybook)

---

## 1. Overview

Sugartown Pink Moon is a **portable, stateless design system** implemented as a monorepo package (`packages/design-system`) consumed by the web app (`apps/web`) and documented in Storybook (`apps/storybook`). It provides tokens, component primitives, and visual governance for the Sugartown knowledge platform.

### Philosophy

- **Single Source of Truth:** CSS token files are the canonical visual authority. Components consume semantic tokens. Everything else is derived.
- **Sharp Neutral, Hot Signal:** Surfaces are solid and opaque. Colour appears only where it earns its place — at CTAs, links, chips, and taxonomy markers. The interface is a white page with neon ink.
- **Academic Interface:** The system borrows from academic publishing, museum exhibition design, and card catalogue typography. Information is structured, labelled, and precisely placed.
- **Prose as Design Source of Truth:** Design intent is expressed through this PRD, the Pink Moon manifesto, HTML mocks, and CSS tokens — not through Figma or other visual design tools. This is a deliberate architectural decision with documented trade-offs (see §10).
- **Anti-Slop by Default:** The system's standards and governance are designed so that generic, AI-generated output is structurally incompatible with the design language. If you follow the system, slop doesn't happen.

---

## 2. Visual Direction: Pink Moon

Pink Moon is the visual language of a working library.

The aesthetic borrows from:
- **Academic publishing** — running headers, endnote marks, structured citation systems
- **Museum exhibition design** — generous white space, deliberate object placement, surfaces that recede
- **Letterpress printing** — the crispness of type against paper, the discipline of a limited ink palette
- **Card catalogues** — Courier Prime on index cards, structured metadata in label/value grids

### Default: Light

Pink Moon Light is the default mode. Dark mode is the after-hours library — same structure, different mood. Only two modes exist: Pink Moon Light and Pink Moon Dark. Classic dark/light modes are deprecated.

### Colour Discipline

The palette is **vivid accent colour over restrained neutral ground**:
- Canvas: warm white (light) / void-900 midnight (dark)
- Signal colours: pink `#FF247D`, seafoam `#2BD4AA`, lime `#D1FF1D`, maroon `#B91C68`
- Signal colours appear at structural boundaries only: chip fills, button fills, link text, blockquote borders, citation markers, status badges

**The Signal Rule:** A colour must communicate hierarchy, state, category, or navigation. If it doesn't, remove it.

### WCAG AA: Built-In

| Surface | Approach |
|---------|----------|
| Body text | Charcoal on white / white on void. No negotiation. |
| Headings | `--text-primary` (charcoal/white). Not brand colour. |
| Links | Maroon on light, pink on dark. |
| Chips | `color-mix()` with darkened variants for light mode (seafoam-700, lime-700). |
| Buttons | White on pink (primary), charcoal on lime (secondary), midnight outline (tertiary). |
| Hero overlays | Frosted panel with `backdrop-filter: blur(32px)`. Contrast guaranteed by panel, not image. |
| Focus rings | 2px solid `#FF247D`, 2px offset. |

---

## 3. Token Architecture

Three-tier CSS custom property system. All tokens use the `--st-` namespace.

### Tier 1: Primitives
Raw values: `--st-color-pink-500`, `--st-space-4`, `--st-radius-xs`. No semantic meaning.

### Tier 2: Semantic
Intent-mapped aliases: `--st-color-brand-primary`, `--st-color-text-secondary`, `--st-color-bg-surface`. Theme overrides operate at this tier.

### Tier 3: Component
Component-scoped tokens: `--st-card-border`, `--st-chip-bg`, `--st-button-radius`. Consumed by component CSS only.

### Canonical Token Files
- **DS package (canonical):** `packages/design-system/src/styles/tokens.css`
- **Web app (mirror):** `apps/web/src/design-system/styles/tokens.css`
- **Validation:** `pnpm validate:tokens` — must pass before any commit touching either file
- **Sync rule:** both files updated in the same commit, always

### Theme Files
- `theme.pink-moon.css` — Pink Moon overrides (both light and dark variants). This becomes the only theme file.
- `theme.light.css` — **deprecated.** Light mode overrides merge into `theme.pink-moon.css` as part of the Pink Moon Light variant. File retained during transition, removed in Phase 4 (Classic Deprecation).

---

## 4. Typography

### Font Stack

| Role | Font | Use |
|------|------|-----|
| **Narrative / Display** | Libre Caslon Display | h1, h2, hero titles, card titles. 1960s American Caslon revival — hand-lettered character, vintage-modern. |
| **UI / Body** | Fira Sans | Body text, subtitles, UI prose, labels. 400/500/600/700 weights. |
| **Catalogue / Metadata / Code** | Courier Prime | Chips, eyebrows, metadata labels, section headers, call numbers, hero meta, colophon, code blocks, inline code. Typewriter/catalogue feel throughout — one monospace voice, not two. |

> **Fira Code removed.** The site's code blocks are illustrative (short snippets, GROQ examples, CLI commands), not dense programming. Programming ligatures don't justify a second monospace font. Courier Prime provides typographic consistency across all monospaced surfaces.

### Type Scale (Restricted)

| Token | Size | Use |
|-------|------|-----|
| `--st-font-size-xs` | 0.75rem (12px) | Chips, eyebrow labels |
| `--st-font-size-sm` | 0.875rem (14px) | Metadata, helper text |
| `--st-font-size-md` | 1rem (16px) | Body |
| `--st-font-size-lg` | 1.125rem (18px) | Subtitle |
| `--st-font-size-xl` | 1.4rem (~22px) | Card titles |
| `--st-font-size-2xl` | 1.75rem (28px) | Feature titles |
| `--st-font-size-display` | 3rem (48px) | Hero headings |

### Line Heights
- `--st-line-height-tight`: 1.25 (headings)
- `--st-line-height-normal`: 1.5 (UI)
- `--st-line-height-relaxed`: 1.75 (longform body)

---

## 5. Radius & Borders

### Radius: Downplayed

Pink Moon uses minimal radius throughout. Sharp edges read as precision and catalogue rigour. The primitive token scale is retained for general use, but most components are reassigned to zero.

**Primitive scale (unchanged):**

| Token | Value |
|-------|-------|
| `--st-radius-xs` | 4px |
| `--st-radius-sm` | 8px |
| `--st-radius-md` | 12px |
| `--st-radius-lg` | 16px |
| `--st-radius-xl` | 35px |

**Component assignments (Pink Moon):**

| Component | Radius | Rationale |
|-----------|--------|-----------|
| Buttons | `0` | Sharp stamp edge |
| Chips | `0` | Index card label |
| Cards | `0` | Catalogue card |
| Hero panel | `0` | Sharp-edged frost panel |
| Callouts | `0` | Block quote container |
| Code blocks | `0` | Terminal frame |
| Blockquotes | `0` | Pull-quote container |
| Accordion | `0` | Panel edge |
| MetadataCard | `0` | Catalogue card |
| Media | `--st-radius-xl` (35px) | **Exception** — editorial image, rounded for softness |
| Theme toggle | `--st-radius-full` (pill) | **Exception** — affordance indicator |

### Borders: Visible

Borders use `softgrey-400` (#94A3B8) in light mode — visible enough to define structure, not heavy enough to dominate. In dark mode: `rgba(255,255,255,0.12)`.

---

## 6. Spacing (Restricted Scale)

8-point base. Off-scale values require explicit rationale.

| Token | Value |
|-------|-------|
| `--st-space-1` | 0.25rem (4px) |
| `--st-space-2` | 0.5rem (8px) |
| `--st-space-3` | 0.75rem (12px) |
| `--st-space-4` | 1rem (16px) |
| `--st-space-5` | 1.5rem (24px) |
| `--st-space-6` | 2rem (32px) |
| `--st-space-7` | 2.5rem (40px) |
| `--st-space-8` | 3.75rem (60px) |

**Semantic spacing tokens (pending — SUG-53):**

The mechanical 8-point scale above provides the building blocks. Semantic tokens that express *intent* (reading rhythm, section breathing room, editorial whitespace) are planned but not yet implemented. These will be added to both token files and documented in Storybook Foundations as a spacing + layout reference page.

Planned tokens:
- `--st-space-reading-gap` — paragraph spacing in longform body content (~20–24px)
- `--st-space-section-break` — gap between major page sections (~80–100px)
- `--st-space-hero-bottom` — breathing room below hero (~48–64px)
- `--st-space-card-gap` — archive grid card gap (~32px)
- `--st-space-margin-column` — marginalia column width at wide viewports (~240–280px)

See SUG-53 for scope and approach.

---

## 7. Component Inventory

### Primitives (DS Package)

| Component | Status | Pink Moon Direction |
|-----------|--------|---------------------|
| Accordion | Shipped | Zero radius, visible border, pink caret accent |
| Blockquote | Shipped | Solid bg, pink left-border, zero radius |
| Button | Shipped — **redesign pending** | "Due Date Slip" style: Courier Prime UC, hot solid fill (pink/lime), neutral grey tertiary. Dark 3px top-edge stripe on primary/secondary. Zero radius. Hover: lift + shadow. |
| Callout | Shipped | Solid bg, variant-coloured left border, zero radius |
| Card | Shipped | Solid surface, visible border, zero radius. Hover: lift + pink border |
| Chip | Shipped | Production `color-mix()` system. Courier Prime. Zero radius. |
| Citation | Shipped | Courier Prime superscript numerals, pink accent |
| CodeBlock | Shipped | Solid dark surface, Courier Prime, branded syntax colours |
| ContentNav | Shipped | Prev/next navigation pattern |
| FilterBar | Shipped | Solid surface, active = solid chip |
| Media | Shipped | Caption below, zero radius, duotone presets |
| Table | Shipped | Visible header border, zebra striping |

### Layout Additions (Pink Moon)

| Component | Status | Description |
|-----------|--------|-------------|
| MetadataCard | Planned | Catalogue card between hero and body. Label/value grid + chip rows. |
| Colophon | Planned | Publication footer: brand zone, nav columns, social, copyright, edition metadata strip |

---

## 8. Repository Structure

```
sugartown/
├── packages/design-system/        ← DS primitives (TSX, CSS Modules)
│   └── src/
│       ├── components/             ← 12 component directories
│       ├── styles/
│       │   ├── tokens.css          ← Tier 1/2/3 token definitions
│       │   ├── theme.light.css     ← Light mode overrides
│       │   └── theme.pink-moon.css ← Pink Moon overrides
│       └── index.ts                ← Barrel export
│
├── apps/web/                       ← React + Vite frontend
│   └── src/
│       ├── design-system/          ← Web adapter layer (JSX mirrors of DS TSX)
│       │   ├── components/         ← Card, Button, Chip, Accordion, Media adapters
│       │   ├── styles/             ← tokens.css (mirror), globals.css, utilities.css
│       │   └── index.js            ← Adapter exports
│       ├── components/             ← App-level: ContentCard, MetadataCard, Hero, etc.
│       ├── pages/                  ← Route templates
│       └── lib/                    ← queries.js, routes.js, sanity.js
│
├── apps/studio/                    ← Sanity Studio v5
│   └── schemas/                    ← Document + section + object schemas
│
├── apps/storybook/                 ← Storybook 10 (React 19, Vite 7)
│   └── .storybook/                 ← Config, mocks, documentation stories
│
└── docs/
    ├── briefs/design-system/       ← This PRD + tactical guide
    ├── backlog/                    ← Active epic specs
    ├── shipped/                    ← Completed epic archive
    └── drafts/                     ← Local-only working docs (gitignored)
```

---

## 9. Interaction & Elevation Standards

- **Card hover:** `translateY(-4px)` + pink border appears. No shadow glow.
- **Button hover:** `translateY(-1px)` + subtle drop shadow. No glow.
- **Chip hover:** `translateY(-1px)` + border brightens + subtle shadow.
- **Media hover:** `scale(1.05)` with `cubic-bezier(0.25, 0.46, 0.45, 0.94)` easing.
- **Focus rings:** 2px solid `#FF247D`, 2px offset. Never removed.
- **Hero panel:** `backdrop-filter: blur(32px) saturate(1.4)` — bounded, sharp-edged.
- **Sticky header:** `backdrop-filter: blur(20px)` — functional transparency on scroll.
- **Transitions:** Property-specific, never `transition: all`. Name what you're transitioning.

### Button: "Due Date Slip" Spec

The button is the most visible departure from the v2.0 design. It replaces the current solid-fill-with-glow pattern with a library-pastiche "due date slip" metaphor: a coloured card with a dark top-edge stripe, like an ink stamp on a checkout card.

**Typography:** Courier Prime, uppercase, 0.72rem, 400 weight, 0.06em letter-spacing.

| Variant | Fill | Text | Top Stripe (3px) | Dark Mode Adaptation |
|---------|------|------|-------------------|---------------------|
| **Primary** | `--st-color-pink-500` | `--st-color-white` | `rgba(0,0,0,0.15)` (dark edge) | Same fill — pink reads on dark |
| **Secondary** | `--st-color-lime-400` | `--st-color-charcoal` | `rgba(0,0,0,0.08)` (dark edge) | Same fill — lime reads on dark |
| **Tertiary** | `--st-color-softgrey-200` | `--st-color-charcoal` | `--st-color-softgrey-400` (neutral) | `--st-color-void-700` fill, `rgba(255,255,255,0.12)` stripe |

**States:**

| State | Treatment |
|-------|-----------|
| Default | As above |
| Hover | `translateY(-1px)`, `box-shadow: 0 2px 6px rgba(0,0,0,0.08)` (light) / `rgba(0,0,0,0.3)` (dark) |
| Focus | 2px solid `#FF247D`, 2px offset |
| Disabled | opacity 0.5, cursor not-allowed |

**Sizing:**

| Size | Padding | Font Size |
|------|---------|-----------|
| Default | `10px 20px 8px` (asymmetric — top-stripe compensated) | 0.72rem |
| Small (`--sm`) | `7px 14px 5px` | 0.65rem |

**Implementation notes:**
- `border-top: 3px solid` is the stripe — it's a border, not a pseudo-element
- Zero border-radius on all variants
- The top-stripe on primary/secondary is a *dark* edge (shadow), not the brand colour — the fill IS the brand colour. This creates the letterpress/stamp dimension.
- Tertiary's stripe is neutral (`softgrey-400`) — it's the only variant without hot colour

---

## 10. Image Overlays & Treatments

The Media component and HeroSection support configurable image overlays. These are a distinctive Sugartown surface — the duotone presets use the brand palette to unify diverse photography into a coherent visual language.

### Overlay Presets (Current — Keep)

| Preset | Effect | Use |
|--------|--------|-----|
| `duotone-standard` | Pink ~55% + Seafoam ~45% gradient map | Default for content images |
| `duotone-featured` | Pink ~70% + Seafoam ~50% | Hero images, featured cards |
| `duotone-subtle` | Pink ~30% + Seafoam ~25% | Background wash, supporting imagery |
| `duotone-extreme` | Pink ~85% + Seafoam ~70% + SVG filter | Dramatic editorial effect |
| `dark-scrim` | Dark gradient overlay | Text readability over images |
| `color` | Solid colour overlay with opacity/blend mode | Brand-tinted surfaces |
| `none` | No overlay | Unmodified photography |

### New Preset: Greyscale + Scrim (Pink Moon)

Added for the Pink Moon hero treatment. Desaturates the image to neutral greyscale, then applies a subtle gradient scrim for text contrast. The frosted panel sits over this — colour comes from the panel content (eyebrow, buttons, chips), not the image.

| Preset | Effect | Use |
|--------|--------|-----|
| `greyscale` | `filter: grayscale(100%) contrast(0.9)` + light gradient scrim | Pink Moon hero backgrounds. Prevents colour clash between photography and accent colours. |
| `greyscale-dark` | `filter: grayscale(100%) contrast(0.8) brightness(0.7)` + dark gradient scrim | Same, dark mode adaptation. Darker, lower contrast. |

**Rationale:** In the Pink Moon visual direction, colour is structural signal — it belongs on chips, buttons, links, and borders, not on background imagery. Greyscale images provide atmosphere without competing with the signal colours. The frosted panel guarantees WCAG AA contrast regardless of image content.

### Studio Schema

Image treatments are configured via the `mediaOverlay` object type on `heroSection.imageTreatment`. The new greyscale presets will be added to the `type` field's `options.list`:

```
{title: 'Greyscale', value: 'greyscale'},
{title: 'Greyscale (Dark)', value: 'greyscale-dark'},
```

The Media component already supports `filter` via CSS — implementation is a CSS addition, not a component rewrite.

---

## 11. Prose as Design Source of Truth

Sugartown has no Figma layer. This is a deliberate architectural decision, not an oversight.

### Where prose works

- **Token definitions** — CSS files ARE the spec. Figma variables would be a mirror.
- **Component behaviour** — README + Storybook is testable. Figma component pages are not.
- **Design philosophy** — no visual tool captures governance rules.
- **Editorial patterns** — citations, marginalia, colophon are content architecture.

### Where prose breaks down

- **Spatial relationships** — can't feel whitespace in prose. HTML mocks partially solve this.
- **Responsive behaviour** — need Storybook viewport testing for visual verification.
- **Full-page composition** — component specs don't show hierarchy conflicts.
- **Colour in context** — the "thumb test" requires human eyes.

### The mitigation

Claude Code as design tool (interactive HTML mocking), Storybook as visual reference (always in sync), preview panel for composition checks, anti-slop governance as quality gate.

### Trade-offs accepted

- No pixel-perfect handoff. The spec IS the code.
- No visual version control. Git history + manifesto "Resolved Questions."
- Scales to 1-2 people, not a team. If a visual designer joins, Figma enters the stack.

---

## 12. Anti-Slop Governance

Design quality is enforced through system standards, not visual review.

### Tests

1. **"Why Not Default?"** — for every token value, document why it isn't the generator default.
2. **Brand Fingerprint Audit** — desaturate to greyscale. Can you still tell it's Sugartown?
3. **"Generated or Designed?"** — could Cursor generate this with a one-line prompt? If yes, redesign.
4. **Transition Specificity Rule** — never `transition: all`. Name your properties.
5. **Theme Intent Documentation** — every theme variant needs a one-paragraph intent statement.

### Where Sugartown passes

Distinctive colour palette, branded shadows, radius hierarchy, transition specificity, card architecture, chip colour system, code block theming, editorial typography pairing.

### Where to watch

Callout status colours (generic), table zebra striping (no brand character), accordion (no visual personality), spacing scale (mechanically predictable).

---

## 13. Migration Path

### Phase 1: Documentation Consolidation (Current — SUG-21)
- PRD v3.0 (this document)
- Ruleset slimmed to tactical guide
- Stale docs archived

### Phase 2: Token Convergence
- Reconcile Pink Moon Light ↔ Light Classic differences
- Default mode flip to Pink Moon Light
- Libre Caslon Display + Courier Prime wired into token files

### Phase 3: Component Adaptation
- Card, Chip, MetadataCard, Colophon (High)
- Accordion, Callout, CodeBlock, FilterBar (Medium)
- All components × both Pink Moon modes in Storybook

### Phase 4: Classic Deprecation
- Classic dark/light removed from toggle
- Pink Moon Light + Dark are the only modes
- Token files simplified

### Phase 5: Academic Layer
- Sidenotes / marginalia at wide viewports
- Archive index view
- Glossary integration (SUG-35)
- Running headers on detail pages

---

## 14. Success Criteria

| Area | Metric |
|------|--------|
| Accessibility | WCAG AA on all text surfaces in both modes |
| Token Adoption | 0 hardcoded colour/radius/spacing values in components |
| Portability | DS package renders correctly without web app or Sanity |
| Consistency | All components documented in Storybook with argTypes + stories |
| Anti-Slop | Brand Fingerprint Audit passes (recognisable in greyscale) |

---

**End of PRD v3.0**
