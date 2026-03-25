# SUG-31 — Image Asset Pipeline: Rename, Migrate & Convention Enforcement

**Linear Issue:** SUG-31
**Priority:** Normal
**Status:** Backlog

---

## Summary

Establish a naming convention for all image assets, migrate existing Sanity-hosted images to follow it, and import legacy WordPress media library assets into Sanity with consistent names.

---

## Naming Convention

```
{docType}-{subject}-{descriptor}[-{index}].{ext}

docType:    article | cs | node | project | tool | diagram | site
subject:    brand/client/topic slug (kebab-case)
descriptor: what the image shows (kebab-case)
index:      optional, for multiple similar images (1, 2, 3)
```

### Doc type prefixes

| Prefix | Use |
|--------|-----|
| `article-` | Article (blog) assets |
| `cs-` | Case study assets (images used in case study pages) |
| `node-` | Knowledge graph node assets |
| `project-` | Project taxonomy entity assets (logo, icon) |
| `tool-` | Tool taxonomy / tool screenshot assets |
| `diagram-` | Content-agnostic diagrams, architecture charts |
| `site-` | Site-level assets (favicon, logo, OG image) |

### Format rules

| Format | Use for |
|--------|---------|
| `.webp` | Photos, screenshots (lossy, smaller files) |
| `.png` | Diagrams with text/sharp edges (lossless) |
| `.svg` | Icons, logos (vector) |

### Migration from current names

| Current prefix | New prefix | Notes |
|----------------|------------|-------|
| `blog-` | `article-` | Matches Sanity `article` doc type |
| `project-` (case study content) | `cs-` | Distinguishes case study assets from project entity assets |
| `project-` (taxonomy entity) | `project-` | No change |
| `diagram-` | `diagram-` | No change |
| `tool-` | `tool-` | No change |
| `site-` | `site-` | No change |

---

## Scope

### Phase 1: Sanity image inventory & rename

1. **Export inventory** — GROQ query to build manifest: asset ID, original filename, CDN URL, and every document + field that references it
2. **Download archive** — bulk download all assets as backup
3. **Convert formats** — convert `.jpg` to `.webp` (photos/screenshots), keep `.png` for diagrams with text/sharp edges, keep `.svg` for icons/logos. Use `cwebp` or `sharp` for batch conversion. Preserve originals in the archive as rollback reference.
4. **Rename locally** — apply naming convention to converted files
5. **Re-upload** — upload renamed + converted files via Sanity client (creates new asset IDs)
6. **Patch references** — update every document field pointing to old asset IDs to point to new ones (image fields, PortableText inline images, array items)
7. **Verify** — confirm all references resolve, no broken images on live site
8. **Delete orphaned assets** — remove old unreferenced assets after verification

### Phase 2: WordPress legacy import

1. **Export WP media library** — query `wp_posts` for `post_type = 'attachment'`, download from `wp-content/uploads/`
2. **Convert formats** — same rules as Phase 1: `.jpg` to `.webp`, keep `.png` for diagrams, `.svg` for icons
3. **Rename** — apply naming convention
4. **Upload to Sanity** — via Sanity client
5. **Map to content** — assign to existing Sanity documents where applicable (case studies, about page, etc.)

---

## Migration script requirements

- **Idempotent** — safe to re-run without creating duplicates
- **Dry-run mode** — preview changes before execution
- **Before/after manifest** — CSV or JSON for review
- **Atomic reference patching** — batch mutations, not one-at-a-time
- **Rollback plan** — old assets retained until manual confirmation

---

## GROQ: Image asset inventory query

```groq
// All image assets with referencing documents
*[_type == "sanity.imageAsset"] {
  _id,
  originalFilename,
  url,
  "references": *[references(^._id)] {
    _id,
    _type,
    title,
    "slug": slug.current
  }
}
```

---

## Acceptance criteria

- [x] Naming convention documented in `docs/conventions/image-naming-convention.md`
- [x] All Sanity-hosted images renamed per convention (74 assets)
- [x] All document references updated (zero broken images — verified live)
- [ ] WordPress media library assets imported and named (Phase 2 — deferred)
- [x] Migration script committed to `scripts/migrate/rename-images.js`
- [x] Orphaned WP thumbnail assets cleaned up (9 deleted)
- [x] Before/after manifest archived in `artifacts/`
