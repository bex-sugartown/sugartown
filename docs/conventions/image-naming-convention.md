# Image Asset Naming Convention

**Applies to:** All images uploaded to Sanity, migrated from WordPress, or created for any Sugartown content.

---

## Format

```
{docType}-{subject}-{descriptor}[-{index}].{ext}
```

| Segment | Description | Example |
|---------|-------------|---------|
| `docType` | Content type prefix (see table below) | `cs` |
| `subject` | Brand, client, or topic slug (kebab-case) | `bareminerals` |
| `descriptor` | What the image shows (kebab-case) | `homepage-banner` |
| `index` | Optional, for multiple similar images | `1`, `2`, `3` |
| `ext` | File extension per format rules below | `.webp` |

**Full example:** `cs-bareminerals-homepage-banner.webp`

---

## Doc type prefixes

| Prefix | Use for |
|--------|---------|
| `article-` | Article (blog) assets |
| `cs-` | Case study assets (images used in case study pages) |
| `node-` | Knowledge graph node assets |
| `project-` | Project taxonomy entity assets (logo, icon) |
| `tool-` | Tool taxonomy / tool screenshot assets |
| `diagram-` | Content-agnostic diagrams, architecture charts |
| `site-` | Site-level assets (favicon, logo, OG image) |
| `hero-` | Full-bleed hero and background images (retro desk photos, doll illustrations) |

---

## Brand name rules

When an image is used in a case study whose title **does not use the original brand name** (e.g. "Beauty Retail: From Monolith to Microservice"), use a generic descriptor instead of the brand. This avoids leaking client names into public asset URLs.

| Case study title | Image prefix | Not |
|-----------------|-------------|-----|
| "Beauty Retail: From Monolith to Microservice" | `cs-beauty-` | ~~`cs-bareminerals-`~~ |
| "FX Networks Website Redesign" | `cs-fx-networks-` | (brand name is in the title — OK to use) |

**Rule:** Match the image prefix to the **public-facing case study title**, not the internal client name.

---

## File format rules

| Format | Use for |
|--------|---------|
| `.webp` | Photos, screenshots (lossy, smaller files) |
| `.png` | Diagrams with text or sharp edges (lossless) |
| `.svg` | Icons, logos (vector) |

Avoid `.jpg` for new uploads. Convert existing `.jpg` to `.webp` during migration.

---

## Examples

```
cs-beauty-homepage-banner.webp
cs-fx-networks-homepage-redesign.webp
cs-fx-networks-wcag-accessibility-scorecard.png
article-luxury-dot-com-unicorn-illustration.png
hero-retro-desk-1.webp
hero-doll-imac-1999.png
node-em-dash-ghostwriter-crime-scene.webp
project-bareminerals-logo.svg
tool-contentful-content-model-template.png
diagram-sugartown-knowledge-graph.png
diagram-content-model-full-dark.png
site-sugartown-favicon.png
```

---

## Migration reference

- **SUG-31** (`docs/prompts/SUG-31-image-asset-pipeline.md`) — Phase 1: Sanity asset rename, convention enforcement, orphan cleanup
- **SUG-32** (`docs/backlog/SUG-32-wp-media-import.md`) — Phase 2: WordPress media library import from beckyhead.com
