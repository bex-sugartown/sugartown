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
cs-bareminerals-homepage-banner.webp
cs-fx-networks-homepage-redesign.webp
cs-fx-networks-wcag-accessibility-scorecard.png
article-luxury-dot-com-unicorn-illustration.png
node-em-dash-ghostwriter-crime-scene.webp
project-bareminerals-logo.svg
tool-contentful-content-model-template.png
diagram-sugartown-knowledge-graph.png
diagram-content-model-full-dark.png
site-sugartown-favicon.png
```

---

## Migration reference

See `docs/backlog/SUG-31-image-asset-pipeline.md` for the full migration spec including GROQ inventory queries, reference patching, and WordPress import plan.
