---
paths:
  - "apps/web/src/lib/**"
  - "apps/web/src/pages/**"
---
# GROQ projections

Loads when a session reads the query layer or a page that projects from it. Moved verbatim from `CLAUDE.md` on 2026-09-04 (ST-112); rule-file edits go through the Instruction & Rule File Write Gate exactly as `CLAUDE.md` does.

### GROQ projection audit for nested image types

When writing a GROQ projection for an array of objects that contain image fields, verify the depth of the asset reference. Schema types that wrap `image` in another object (like `richImage`) require flattening:

```groq
// richImage: asset is a field of type 'image', which itself contains asset._ref
images[] {
  "asset": asset.asset->,   // dereference the INNER reference
  "hotspot": asset.hotspot,
  "crop": asset.crop,
  alt,
  caption
}
```

Do **not** write `asset->` on a `richImage` — that dereferences the `image` object, not the reference inside it, and silently returns null.
