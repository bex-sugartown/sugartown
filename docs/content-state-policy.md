# Content State Policy

> EPIC-0176 · Content State Governance
> Last updated: 2026-03-14

---

## 1. Published-Only Contract

The Sugartown web app operates under a **published-only contract**: only documents that have been explicitly published in Sanity Studio are visible to end users. Draft documents are never served, regardless of environment.

This is enforced at the Sanity client level via `perspective: 'published'` in `apps/web/src/lib/sanity.js`. The perspective setting filters drafts before any GROQ query executes — individual queries do not need (and must not add) per-query `drafts.**` exclusion filters.

**Implication:** If a document has never been published, or has been unpublished, it does not exist from the web app's perspective. Detail pages return 404. Archive pages omit it from listings. Internal links to its slug will break.

---

## 2. Preview Mode

Preview mode is an opt-in, **dev-only** mechanism for content editors to see draft content before publishing.

### Activation

Set the environment variable in your local `.env`:

```
VITE_SANITY_PREVIEW=true
```

Then start the dev server normally (`pnpm dev`). The console will display a prominent warning:

```
⚠ PREVIEW MODE ACTIVE — draft content visible.
Production will show published content only.
```

### Constraints

- **Dev-only.** Preview mode is blocked in production builds. Running `pnpm build` with `VITE_SANITY_PREVIEW=true` set will fail with a clear error message (enforced by the `contentStateSafety` Vite plugin in `vite.config.js`).
- **No CDN.** Preview mode does not affect the `useCdn` setting — the CDN is only enabled in production builds (`import.meta.env.PROD`). Draft content is never cached.
- **Full perspective switch.** When active, the Sanity client uses `perspective: 'previewDrafts'`, which shows draft versions of documents even when a published version exists. This is intentional — it lets editors see their in-progress changes.

### Deactivation

Remove `VITE_SANITY_PREVIEW=true` from `.env` (or set it to any value other than `true`), then restart the dev server. The app returns to published-only mode.

---

## 3. Build-Time Safety

A Vite plugin (`sugartown:content-state-safety`) in `apps/web/vite.config.js` prevents preview mode from shipping to production:

```
🚫  BUILD BLOCKED: VITE_SANITY_PREVIEW=true is set in a production build.
    Preview mode must not ship to production — draft content would be visible.
```

**CI/CD note:** Ensure your CI/CD pipeline does not set `VITE_SANITY_PREVIEW=true` in the build environment. If it does, production builds will fail (by design).

---

## 4. Unpublish Implications

When a document is unpublished in Sanity Studio:

1. **Detail page → 404.** The document's slug becomes unreachable. Any user navigating to that URL sees `NotFoundPage`.
2. **Archive listings → omitted.** The document disappears from archive pages (articles, case studies, knowledge graph, taxonomy detail pages).
3. **Internal links → broken.** Any `link` or `ctaButton` objects pointing to the unpublished document's slug will 404. The `validate-content.js` orphaned reference check (check C) catches Sanity reference-based links, but hardcoded URL strings in `link` objects are not currently validated.
4. **Taxonomy detail pages → empty.** If all documents referencing a taxonomy term are unpublished, the taxonomy detail page renders an empty content list (not an error).

**Recommendation:** Before unpublishing, search Sanity Studio for references to the document. Sanity shows incoming references in the document inspector.

---

## 5. Slug Parity

A document's slug determines its public URL. The web app builds URLs via `getCanonicalPath({ docType, slug })` in `routes.js`.

**Key rules:**

- A published document's slug is the source of truth for its URL.
- If a draft and its published version have different slugs, the published slug is what users see. The draft slug becomes visible only in preview mode.
- `validate-content.js` check (E) detects duplicate slugs within the same type — but does not cross-check draft vs published slug divergence. This is a known gap.
- Never hardcode URLs outside of `routes.js`. Always use `getCanonicalPath()` or `TYPE_NAMESPACES` / `TAXONOMY_NAMESPACES`.

---

## 6. Draft-Only Detection

`validate-content.js` check (G) detects **draft-only documents** — documents that exist as drafts but have never been published. These are problematic because:

- They have slugs that resolve to routes, but those routes will 404 in production.
- Content editors may believe the content is live when it is not.
- In preview mode, the content appears normally — creating a "local works, prod 404s" discrepancy.

Run the validator:

```bash
pnpm validate:content
```

Draft-only documents are reported as warnings (not errors), since they may be intentional work-in-progress. The fix is to either publish them or delete them if no longer needed.

**Note:** Draft-only detection requires `VITE_SANITY_TOKEN` to be set (a read-only viewer token). Without it, the check is skipped.

---

## 7. Architecture Summary

| Layer | File | Responsibility |
|-------|------|----------------|
| Content state helper | `src/lib/contentState.js` | `getContentPerspective()`, `isPreviewMode()`, `logPreviewWarning()` |
| Sanity client | `src/lib/sanity.js` | Client creation, delegates perspective to `contentState.js` |
| Build safety | `vite.config.js` | `contentStateSafety` plugin — blocks preview in prod builds |
| Validation | `scripts/validate-content.js` | Check G — draft-only document detection |
| This document | `docs/content-state-policy.md` | Contract documentation |

---

## 8. Rationale

The published-only contract exists because Sugartown is a **production content engine**, not a CMS playground. Draft content is work-in-progress — it may be incomplete, incorrect, or unapproved. Exposing it to end users would undermine content quality and trust.

The preview mode infrastructure exists because content editors need to see their changes before publishing. Without it, the only way to verify content is to publish it (making it immediately live) or to read raw JSON in Sanity Studio.

The build-time safety check exists because a single line change (`'published'` → `'previewDrafts'`) would silently expose all draft content in production. Human review is not a reliable safeguard for a one-character change buried in a config file.
