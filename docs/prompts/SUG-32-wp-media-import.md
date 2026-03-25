# SUG-32 — WordPress Media Library Import & Asset Mapping

**Linear Issue:** SUG-32
**Priority:** Normal
**Status:** Backlog
**Deferred from:** SUG-31 (Phase 2)

---

## Context

SUG-31 Phase 1 is complete: all 93 Sanity-hosted images were audited, 17 renamed, 1 thumbnail swapped, and 54 orphans/duplicates archived and deleted. The asset library is now clean at **39 assets**, all following the naming convention in `docs/conventions/image-naming-convention.md`.

The remaining gap is the legacy WordPress media library. The WP site (now at **beckyhead.com**) contains additional images that were never migrated — original high-resolution photos, case study screenshots, diagrams, and illustrations that exist only in the WP `wp-content/uploads/` directory. Some of these are referenced by WP posts that were already migrated to Sanity as articles/case studies/nodes, but their images were either skipped during the WP content migration or uploaded as low-quality WP-resized versions.

**Current asset state after SUG-31:**
- 39 Sanity image assets, all named per convention
- 1 intentional orphan (`hero-retro-desk-6.webp` — kept for future use)
- `hero-` prefix established for hero/background images (extends original convention)
- `cs-beauty-` pattern established for genericized brand names

**Existing migration infrastructure:**
- `scripts/migrate/lib.js` — shared utilities (Sanity client, WP REST API, NDJSON I/O)
- `scripts/migrate/images.js` — WP image download + Sanity upload pipeline (manifest-based)
- `scripts/migrate/rename-images.js` — SUG-31 rename/convert/cleanup script
- `scripts/migrate/image-audit-fixes.js` — SUG-31 Phase 1.5 audit fix script
- `artifacts/image_manifest.json` — existing WP URL → Sanity asset ref mapping

---

## Objective

After this epic, every image visible on the legacy WordPress site (beckyhead.com) that is needed by Sanity content has been imported, named per convention, and assigned to its Sanity document. No content in the web app renders a missing or placeholder image. The WP media library has been fully inventoried, and a decision (import / skip / already-present) is recorded for every asset.

**Data layer:** No schema changes — images use existing `image` and `richImage` field types.
**Query layer:** No GROQ changes — image fields are already projected.
**Render layer:** No component changes — existing image rendering is correct.

This is a **content migration epic**, not a code epic.

---

## Learnings from SUG-31

These lessons must inform the Phase 2 script design:

### 1. `originalFilename` is metadata only
Sanity CDN URLs are content-hash-based (`/images/{projectId}/{dataset}/{hash}-{dims}.{ext}`). Renaming `originalFilename` changes what Studio shows, not the CDN URL. This means naming can be done as a post-upload patch — no need to pre-name files before upload.

### 2. Sanity CDN auto-converts to webp
The `auto('format')` parameter on `urlFor()` causes the CDN to serve webp regardless of the original upload format. Actual format conversion (jpg → webp) is about naming convention compliance and storage efficiency, not rendering correctness.

### 3. WP auto-generates thumbnail duplicates
WordPress creates `{name}-{W}x{H}.{ext}` variants for every upload (typically 150x150, 300x300, 1024xN). These are **not** separate assets — they are resized copies of the original. The migration script must:
- Import only the **original** (largest) version
- Skip all `*-{W}x{H}.*` variants
- Never import 150x150 thumbnails (SUG-31 deleted 13 of these)

### 4. Deep reference patching requires full document tree walking
Refs in Portable Text live at `sections[N].content[M].asset._ref`, not at top-level fields. The `findRefPaths()` utility in `image-audit-fixes.js` handles this — reuse it, don't write a new walker.

### 5. `hero-` prefix for hero/background images
SUG-31 audit established `hero-` as a doc type prefix for full-bleed hero and background images (retro desk photos, doll illustrations). Update the naming convention doc to include this prefix.

### 6. Brand name genericization
When a case study title doesn't use the original brand name (e.g. "Beauty Retail: From Monolith to Microservice" instead of "bareMinerals"), the image prefix should use a generic descriptor (`cs-beauty-`) not the brand name. This avoids leaking client names into public asset URLs.

---

## Scope

### Phase 1: WP media inventory

1. **Query WP media library** — fetch all `attachment` posts from `beckyhead.com/wp-json/wp/v2/media` (paginated). Record: ID, URL, title, alt text, MIME type, dimensions, upload date, attached post ID.
2. **Cross-reference with Sanity** — for each WP media item, check if it already exists in Sanity (by content hash match against existing asset URLs, or by filename pattern match against `originalFilename`).
3. **Generate decision CSV** — for each WP media item, record:
   - WP URL, title, dimensions, MIME type
   - Already in Sanity? (asset ID if yes)
   - Recommended action: `import`, `skip-duplicate`, `skip-thumbnail`, `skip-unused`
   - Proposed convention name (if importing)
   - Target Sanity document(s) to map to (if known)
4. **Manual review gate** — CSV must be reviewed and annotated before Phase 2 proceeds. Add a `becky_notes` column for overrides (same pattern as SUG-31 audit).

### Phase 2: Import & map

1. **Download originals** — from `beckyhead.com/wp-content/uploads/` (not the resized versions)
2. **Convert formats** — `.jpg` → `.webp` via `sharp`. Keep `.png` for diagrams, `.svg` for vectors.
3. **Upload to Sanity** — via `client.assets.upload('image', buffer, { filename })` with convention-compliant `filename`
4. **Patch `originalFilename`** — set convention name on each uploaded asset (if upload filename wasn't already correct)
5. **Map to documents** — for each imported image with a known target document, patch the document's image field to reference the new asset. Handle:
   - Featured images (`featuredImage`, `backgroundImage`, hero sections)
   - Inline content images (Portable Text image blocks in `sections[].content[]`)
   - Gallery images (`images[]` arrays)
6. **Verify** — confirm zero broken images on live site, all new assets render correctly

### Phase 3: Convention doc update

1. **Add `hero-` prefix** to `docs/conventions/image-naming-convention.md`
2. **Add brand genericization rule** to convention doc
3. **Update migration reference** to point to SUG-32 (not SUG-31) for the WP import spec

---

## Migration Script Constraints

**Script location:** `scripts/migrate/wp-media-import.js`

**Modes:**
- `--inventory` — query WP REST API, build decision CSV
- `--dry-run` — preview imports/mappings based on reviewed CSV
- `--execute` — download, convert, upload, map
- `--verify` — post-import check: every imported asset has refs, no broken images

**Target doc count:**
```groq
// Pre-flight: count WP media attachments
// Run against beckyhead.com/wp-json/wp/v2/media?per_page=100
// Expected: TBD (run during inventory phase)
```

**Skip conditions:**
- URL matches `*-{W}x{H}.*` pattern → skip (WP auto-thumbnail)
- URL matches `*-scaled.*` pattern → skip (WP scaled variant)
- Content hash already exists in Sanity → skip (already imported)
- CSV `becky_notes` column says `skip` → skip (manual override)

**Idempotency:** Re-running skips assets whose content hash already exists in Sanity. The manifest tracks WP URL → Sanity asset ID. Upload uses `client.assets.upload()` which deduplicates by content hash server-side.

---

## Files to Modify

**Scripts**
- `scripts/migrate/wp-media-import.js` — CREATE
- `package.json` — add `migrate:wp-media` script entry

**Docs**
- `docs/conventions/image-naming-convention.md` — add `hero-` prefix, brand genericization rule
- `docs/backlog/SUG-32-wp-media-import.md` — this file (update acceptance criteria as work progresses)

**No changes to:**
- Studio schemas (using existing image/richImage fields)
- GROQ queries (image fields already projected)
- Frontend components (image rendering already works)

---

## Non-Goals

- **Schema changes** — no new fields or section types. All image fields already exist.
- **Format conversion of existing Sanity assets** — SUG-31 handled this. Only new WP imports get converted.
- **WP content re-migration** — article/case study text content is already in Sanity. This epic only handles images.
- **Image optimization pipeline** — runtime optimization (responsive sizes, lazy loading) is a separate concern. This epic handles source asset migration only.

---

## Risks / Edge Cases

1. **WP site availability** — `beckyhead.com` must remain accessible during migration. If it goes down, the script has retry logic and can resume from the manifest.
2. **Large file sizes** — original WP uploads may be very large (4-6MB retro desk photos were common in SUG-31). The upload pipeline handles this but may be slow. Budget for extended run time.
3. **Orphaned WP attachments** — some WP media items may not be referenced by any WP post and may not have a corresponding Sanity document. These should be flagged `skip-unused` in the CSV unless manually overridden.
4. **Portable Text image mapping** — mapping inline images in PT content requires knowing the `_key` of the image block to patch. The script must fetch the full document and match by image position or context.
5. **Duplicate content hashes** — if the same image was uploaded to WP multiple times under different names, Sanity will deduplicate by hash. The manifest must handle many-WP-URLs → one-Sanity-asset.

---

## Acceptance Criteria

- [ ] WP media library fully inventoried (CSV with every attachment)
- [ ] Decision CSV reviewed and annotated by Becky before import
- [ ] All `import`-flagged assets uploaded to Sanity with convention names
- [ ] All uploaded assets mapped to their target Sanity documents (where applicable)
- [ ] Zero WP auto-thumbnails (`*-{W}x{H}.*`) imported
- [ ] Zero broken images on live site after import
- [ ] `hero-` prefix added to naming convention doc
- [ ] Brand genericization rule added to naming convention doc
- [ ] Migration script committed to `scripts/migrate/wp-media-import.js`
- [ ] Before/after manifest archived in `artifacts/`

---

## Post-Epic Close-Out

1. Move `docs/backlog/SUG-32-wp-media-import.md` → `docs/prompts/SUG-32-wp-media-import.md`
2. Commit: `docs: ship SUG-32 WordPress media import`
3. Run `/mini-release`
4. Transition SUG-32 to **Done** in Linear
5. Confirm clean tree before next epic
