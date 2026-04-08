# Pink Moon Manifesto

### *A Working Philosophy for Sugartown's Visual Identity*

**Status:** Working draft — backend thinking for PRD and systems
**Date:** 2026-04-07 (revised from 2026-04-05)
**Companion:** [Anti-Slop Manifesto](./ai-slop-manifesto.md)
**Mock:** `pink-moon-mock-B-sharp-paper.html` (current direction)

---

## The Premise

Pink Moon is not a theme. It is the design system.

What currently exists as four mode variants (dark, light, dark-pink-moon, light-pink-moon) will converge into two: **Pink Moon Light** (default) and **Pink Moon Dark**. The "classic" dark and light modes served as scaffolding — the system needed a stable baseline before it could develop a voice. It has one now.

The convergence is iterative. The token architecture, component contracts, typography pairing, and interaction signatures stay. The *mood* sharpens. The default flips to light.

---

## The Reference: What Is Pink Moon?

Pink Moon is the visual language of a working library.

Not a tech dashboard. Not a SaaS app. Not a portfolio that looks like every other portfolio. A **library** — the kind with card catalogues and foxed spines and a reading room where the light falls in a particular way and someone has opinions about the typeface on the call numbers.

The aesthetic borrows from:
- **Academic publishing** — running headers, endnote marks, structured citation systems, the quiet authority of well-set marginalia
- **Museum exhibition design** — generous white space, deliberate object placement, labels that explain without crowding, surfaces that recede so the work can breathe
- **Letterpress printing** — the crispness of debossed type against soft paper, the discipline of a limited ink palette used with maximum intent
- **Card catalogues** — Courier Prime on index cards. Structured metadata in label/value grids. Call numbers in the corner. Information has a place and it stays in its place.

---

## The Visual Direction: Sharp Neutral, Hot Signal

### The Principle

Surfaces are **neutral and opaque**. Colour appears **only where it earns its place** — at CTAs, links, chips, and taxonomy markers. The interface is a white page (or a dark page) with neon ink. Not frosted, not glowing, not ambient. Printed.

The two exceptions where translucency is used:
1. **The hero panel** — a bounded, blurred, semi-opaque container over the hero image. Text sits inside the panel. The image is visible around it, not behind the text. Contrast is guaranteed by the panel, not the image.
2. **The sticky header** — becomes translucent on scroll so page content is visible through it. This is functional (spatial awareness while reading), not decorative.

Everything else is solid.

### Radius: Downplayed

Radii are reduced throughout. The system leans toward **sharp edges** — zero radius on chips, cards, blockquotes, code blocks, metadata cards, buttons. Rounded corners are reserved for the hero panel (slight) and the theme toggle (pill shape for affordance). The sharpness is deliberate: it reads as precision, formality, catalogue rigour. Not brutalist — just crisp.

### Borders: Visible, Not Heavy

Borders use `softgrey-400` in light mode — visible enough to define structure, not heavy enough to dominate. This is a step up from the previous `softgrey-200` hairlines, which disappeared on screen. The darker outlines make the zero-radius edges read as intentional. In dark mode, borders are `rgba(255,255,255,0.12)` — present but recessive.

### Typography: Catalogue Monospace

The monospace font shifts from **Fira Code** (terminal, developer) to **Courier Prime** (typewriter, catalogue). This appears on: chips, eyebrows, metadata labels, section headers, call numbers, hero meta, the colophon. The effect is library index card, not IDE. Fira Code remains available for actual code blocks where programming ligatures matter.

The narrative serif shifts from **Playfair Display** to **EB Garamond** — a 1960s American Caslon revival with hand-lettered character. Heavier than Playfair at display sizes, doesn't thin out on light backgrounds. Used for h1/h2, hero titles, card titles. UI sans (**Fira Sans**) is unchanged.

### Colour Discipline: Where Colour Lives

Colour is reserved for elements that communicate **category, action, or state**:

| Element | Colour Treatment |
|---------|-----------------|
| **Buttons** | "Due Date Slip" style — hot solid fill (pink primary, lime secondary), neutral fill tertiary. Dark top-edge stripe on primary/secondary (shadow edge, like a stamped card). Courier Prime uppercase. Hover: lift + subtle shadow. |
| **Chips** | Production Sugartown styles — `color-mix()` from `--_chip-color`, 8% bg, 35% border. Active: solid fill + white text |
| **Links** | Maroon (light mode), pink (dark mode) |
| **Headings (h2)** | `--text-primary` (charcoal/white), not brand colour — the heading is structure, not signal |
| **Hero eyebrow** | Lime accent — the one colour pop in the hero panel |
| **Blockquote left border** | Pink — the structural edge that marks the quotation |
| **Citation markers** | Pink superscript numerals |
| **Card hover border** | Pink — appears on hover only, the invitation |

Everything else — canvas, surfaces, cards, panels, metadata grids, body text — is neutral. White, soft grey, charcoal, void. The colour earns its brightness by being surrounded by calm.

This discipline feeds directly into the **knowledge graph** colour system: when taxonomy chips carry project/category/tag colours, those colours need neutral ground to be readable. If the surfaces are already tinted, the chip colours compete. On white paper, they sing.

---

## The Palette Thesis

### Neon Over Neutral

In light mode (the default), the canvas is warm white. Surfaces are paper. Text is charcoal. The ground is quiet.

Into this quietness: pink (`#FF247D`), seafoam (`#2BD4AA`), lime (`#D1FF1D`), maroon (`#B91C68`). These are not background colours. They are *signal* colours — the neon underlining on an otherwise sober page.

In dark mode, the canvas inverts to midnight (`--st-color-void-900`) and the accent colours keep their intensity against the dark ground.

### The Signal Rule

A colour must *do something*. If it's not communicating hierarchy, state, category, or navigation, it doesn't belong. Decorative colour is noise. Functional colour is signal. The test: cover the colour with your thumb. Did you lose information? If yes, the colour is structural. If no, it's ornament — remove it.

### WCAG AA: Non-Negotiable, Built-In

| Surface | Contrast Requirement | Approach |
|---------|---------------------|----------|
| Body text on canvas | 4.5:1 minimum | Charcoal on white (light), white on void (dark). No negotiation. |
| Heading text | 4.5:1 minimum | `--text-primary` (charcoal/white) for h2. Subheadings in `--text-secondary`. |
| Chip/tag text | 4.5:1 minimum | `color-mix()` resolves chip text against chip background. Light mode chips shift to darker variants (`--seafoam-700`, `--lime-700`). |
| Button text | 4.5:1 minimum | Primary (white on pink): passes. Secondary (charcoal on lime): passes. Tertiary (midnight on transparent): passes. |
| Hero image overlays | 4.5:1 for text | **Frosted panel** — `backdrop-filter: blur(32px)` + semi-opaque background. Text in bounded container. Contrast guaranteed by panel, not image. Hero images desaturated to greyscale (`filter: grayscale(100%)`) to prevent colour clash with panel text. |
| Focus rings | 3:1 against adjacent | 2px solid `#FF247D`, 2px offset. Passes on both white and void backgrounds. |
| Status badges | 4.5:1 | Light mode uses hue-shifted variants: dark goldenrod for amber, dark crimson for danger. |

### The Hero Panel

Hero images are desaturated to greyscale and overlaid with a subtle gradient scrim. The text panel is a bounded, blurred container — semi-opaque white (light) or midnight (dark) — positioned over the image. The image provides atmosphere. The panel provides contrast.

Key properties:
- **Background:** `rgba(255,255,255,0.18)` (light) / `rgba(13,18,38,0.45)` (dark)
- **Blur:** `backdrop-filter: blur(32px) saturate(1.4)`
- **Border:** subtle white hairline (`rgba(255,255,255,0.15)`)
- **Radius:** zero (sharp edges, matching the rest of the system)
- **Image filter:** `grayscale(100%) contrast(0.9)` (light) / `grayscale(100%) contrast(0.8) brightness(0.7)` (dark)

---

## Layout Additions

### Metadata Card (New)

A **catalogue card** component positioned immediately below the hero on detail pages. Structured label/value grid with:
- Type + call number header (e.g. "Node" / "PROJ-001")
- Author, status, conversation type, AI tool as text values
- Tools, categories, tags as chip rows (small variant)
- Published date right-aligned

This replaces the scattered metadata that currently lives inside the body content. One card, above the fold, with everything a reader needs to assess the piece before committing to reading it. The library metaphor: the card in front of the book.

> **Note:** MetadataCard field structure will be adjusted following SUG-47 (Storybook/Studio props alignment audit), which cross-checks component prop enums against the current Sanity schema. The fields shown in the mock (status, conversationType, etc.) are illustrative — final field set TBD after the audit confirms which values are active in Studio.

### Colophon Footer (New)

A **publication footer** that merges the current site footer contents with a colophon-style presentation. Dark (midnight-900) background. Incorporates all existing footer elements plus edition metadata:

- **Brand zone** — site title + tagline (Sugartown Digital / Content-driven digital experiences)
- **Navigation columns** — existing footer nav columns (Navigate, Legal) with link items
- **Social links** — GitHub, LinkedIn, Bluesky icons
- **Copyright** — existing copyright text
- **Edition metadata** (new) — version number, toolchain credits, license link

The colophon row (edition/toolchain/license) sits below the existing footer content as a subtle, monospace-styled "about this edition" strip. This treats the site as a published edition without losing any of the functional footer navigation users expect.

### Sticky Header with Scroll Transparency

The header uses a translucent background with blur — the only non-hero surface that uses `backdrop-filter`. This is functional: when scrolling longform content, the page content is visible through the header, maintaining spatial awareness. The logo and nav links remain crisp against the blur.

Light: `rgba(255,255,255,0.60)` with `blur(20px)`. Dark: `rgba(13,18,38,0.65)` with `blur(20px)`.

---

## The Academic Interface

### Current Academic Patterns (Keep and Amplify)

| Pattern | Where It Exists | Pink Moon Direction |
|---------|-----------------|---------------------|
| **Citation marks** | Superscript references in node body text, endnote list at bottom | Amplify. Pink superscript numerals in Courier Prime. |
| **Metadata grids** | Card metadata field (label/value pairs in CSS grid) | Elevated to its own component: MetadataCard. Catalogue card above the fold. |
| **Status evolution** | Exploring → Validated → Operationalized → Deprecated | Visualise as a progress track or timeline marker, not just a label. |
| **Taxonomy chips** | Project/category/tag chips on cards and detail pages | Courier Prime monospace. Production colour system. Knowledge graph colours as signal. |
| **Code blocks with syntax** | Custom Prism theme in brand colours | Keep. Fira Code stays for actual code. Pink keywords, seafoam strings, lime comments. |

### New Academic Patterns (Introduce)

| Pattern | Purpose | Implementation Direction |
|---------|---------|-------------------------|
| **Running headers** | Persistent section context on detail pages | Sticky header with translucent blur on scroll. Logo + nav. |
| **Sidenotes / marginalia** | Secondary commentary without disrupting flow | At wider breakpoints, pull citations into a margin column. Ref: [Tufte CSS](https://edwardtufte.github.io/tufte-css/). |
| **Colophon footer** | Site-as-publication identity | Three-column: edition, toolchain, license. Dark ground. |
| **Metadata card** | Structured document summary | Catalogue card between hero and body. Label/value grid + chip rows. |
| **Index page** | Master alphabetical index of all content | Back-of-book index: alphabetically sectioned, type indicators. Dense, scannable. |
| **Glossary** | Term definitions with inline annotation | SUG-35. Dotted-underline annotations, hover definition cards, `/glossary` archive. |
| **Bibliography** | Structured reference list per node/article | Formal bibliography block at foot. Courier Prime, structured. |
| **Figure captions** | Structured image annotations | Figure number, title, source attribution below images. Smaller type treatment. |

---

## Density and White Space

### The Problem

The site is currently dense. Archive pages present grids of cards with 10+ metadata fields each. Detail pages stack metadata, body content, and related items vertically.

### The Approach: Structured Breathing Room

The answer is not "remove information." It's *layer it*. Academic interfaces handle density through progressive disclosure.

**Strategies:**

1. **Card density modes** — Add a `summary` density: title + category + status only. Full metadata on detail page. Archives default to `summary` for large collections.

2. **Accordion for metadata sections** — On detail pages, group metadata into collapsible sections. Default: collapsed with one-line summary visible.

3. **Margin utilisation at wide viewports** — At 1200px+, pull metadata into a sticky sidebar. Main column is body text. Margin is structured metadata.

4. **Section dividers with purpose** — Styled section breaks that carry information: section number, word count, reading time.

5. **Archive page view toggle** — Card grid (current) vs. table/index view (new). The index view is a dense, scannable list with sortable columns.

6. **Whitespace tokens** — Semantic spacing for *breathing room*:
   - `--st-space-reading-gap`: gap between body paragraphs in longform
   - `--st-space-section-break`: gap between major sections
   - `--st-space-margin-column`: width of marginalia column at wide viewports

---

## Component Evolution: Current → Pink Moon

### Universal Pink Moon Traits

| Property | Light | Dark |
|----------|-------|------|
| Canvas | White (solid) | Void-900 (solid) |
| Surfaces | White (solid) | Void-800 (solid) |
| Borders | `softgrey-400` (visible, crisp) | `rgba(255,255,255,0.12)` |
| Radius | Zero or minimal throughout | Same |
| Colour | CTAs, chips, links, accents only | Same, with pink intensified |
| Hero panel | Translucent + blur (bounded) | Same, darker |
| Header | Translucent + blur on scroll | Same |

### Per-Component Direction

| Component | Current State | Pink Moon Direction | Priority |
|-----------|---------------|-------------------|----------|
| **Button** | ✅ Solid fill variants | **"Due Date Slip" redesign.** Courier Prime uppercase. Hot solid fill (pink primary, lime secondary), neutral grey tertiary. Dark top-edge stripe (3px, `rgba(0,0,0,0.15)`) on primary/secondary — evokes a stamped checkout card. Tertiary gets neutral top-stripe (`softgrey-400`). Zero radius. Hover: `translateY(-1px)` + subtle shadow. Dark mode: tertiary uses `void-700` fill. | **High** |
| **Card** | Token overrides only | Solid white/void surface. Visible border (`softgrey-400`). Zero radius. Hover: lift + pink border. No shadow glow. | **High** |
| **Chip** | Production styles | Keep as-is. `color-mix()` system works. Courier Prime monospace. Active: solid fill. | **High** |
| **MetadataCard** | New component | Catalogue card. Label/value grid. Chip rows for tools/categories/tags. Call number header. Zero radius. | **High** |
| **Accordion** | No Pink Moon | Visible border on trigger. Pink accent on caret. Zero radius. Content slides, not snaps. | **Medium** |
| **Callout** | Token overrides only | Solid background (canvas-subtle). Variant-coloured left border. Zero radius. | **Medium** |
| **CodeBlock** | Token overrides only | Solid dark surface. Fira Code (not Courier Prime). Visible border. Zero radius. | **Medium** |
| **FilterBar** | Token overrides only | Solid surface. Active filter: solid chip. Inactive: outlined. | **Medium** |
| **Table** | Token overrides only | Visible header border. Zebra striping with subtle tint. Zero radius. | **Low** |
| **Media** | Token overrides only | Caption below (not overlay). Zero radius on image container. | **Low** |
| **ContentNav** | Token overrides only | Solid sidebar at wide viewports. Active link: pink left-border. | **Low** |
| **Citation** | No Pink Moon | Courier Prime superscript numerals. Endnote list: structured, monospace. | **Low** |
| **Blockquote** | No Pink Moon | Solid `canvas-subtle` background. Pink left-border. Zero radius. | **Low** |
| **Colophon** | New component | Dark footer. Three-column grid. Courier Prime labels. Edition/toolchain/license. | **High** |

---

## The Default: Light

Pink Moon Light is the default mode. The reasons are practical and philosophical:

**Practical:**
- WCAG contrast is simpler to guarantee on light backgrounds
- Photography reads better on light (hero images are greyscale regardless)
- Most users browse in well-lit environments
- Print stylesheets inherit naturally from light

**Philosophical:**
- The library metaphor is a *lit room*. Warm light on paper. The reading lamp is on.
- Dark mode is the *after-hours* library. The stacks at midnight. Still functional, but a different mood.
- Defaulting to light says: this is a place of work, not a tech demo. The content is the point.

**Implementation:** `prefers-color-scheme: light` loads Pink Moon Light by default. Users can toggle to Pink Moon Dark. The toggle persists in `localStorage`. Classic dark/light modes deprecated behind a setting during transition.

---

## Migration Path: Classic → Pink Moon

### Phase 1: Token Convergence (Current)
- Reconcile Pink Moon Light and Light Classic token differences
- Default mode flips to Pink Moon Light
- Classic modes available via settings toggle

### Phase 2: Component Adaptation (Next)
- Card, Chip, MetadataCard, Colophon (High priority)
- Accordion, Callout, CodeBlock, FilterBar (Medium priority)
- All components tested in both Pink Moon Light and Dark
- Storybook stories for every component × every mode

### Phase 3: Classic Deprecation
- Classic dark/light modes removed from toggle
- Pink Moon Light and Dark are the only modes
- Token files simplified

### Phase 4: Academic Layer
- Sidenotes / marginalia at wide viewports
- Archive index view
- Glossary integration (SUG-35)
- Running headers on detail pages
- Bibliography blocks on nodes/articles

---

## Resolved Questions (from Mock B exploration)

1. ~~**Monospace for metadata**~~ → **Courier Prime.** Reads as "catalogue" not "terminal." Tested in mock, works well at small sizes on chips, labels, meta.

2. ~~**Hero image treatment**~~ → **Frosted panel over greyscale image.** Bounded, blurred, sharp-edged. Contrast guaranteed by panel. Image provides atmosphere only.

3. ~~**Heading colour**~~ → **`--text-primary`** for h2 (charcoal/white). Not brand colour. Headings are structure, not signal.

## Open Questions

1. ~~**Heading serif font**~~ → **Resolved: EB Garamond.** Evaluated 7 options in interactive mock (Playfair Display, Libre Baskerville, Crimson Pro, EB Garamond, Old Standard TT, Young Serif, EB Garamond). EB Garamond wins: 1960s American Caslon revival with hand-lettered character, distinctly vintage-modern without being sterile. Heavier than Playfair at display sizes, doesn't thin out on light backgrounds. Display-only weight — used for h1/h2 hero and card titles. Fira Sans remains the UI sans, Courier Prime remains the catalogue mono.

2. **Archive density threshold** — at what item count does the card grid become overwhelming? Should the view toggle be user-controlled or content-driven?

3. **Margin column breakpoint** — Tufte-style sidenotes need ~250px margin + ~700px main column. Breakpoint at 1200px? 1400px?

4. **Print stylesheet** — the academic metaphor invites printing. Should Pink Moon Light have a dedicated print stylesheet?

5. **Courier Prime for chips** — does the wider character width cause layout issues on dense chip rows? Need to test with real taxonomy data at volume.

---

*This document is the philosophy. What survives into the PRD should be the decisions. The philosophy stays here to justify them.*
