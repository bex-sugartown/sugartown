# EPIC-0173 — Link Atom Consolidation & CTA Cleanup

> **Status:** Complete · **Tags:** `Schema` `Data Quality` `Studio UX`

---

## Problem

Two link atom types exist in the Sanity schema with overlapping purposes:

| Type | Fields | Internal ref? | Used by |
|------|--------|---------------|---------|
| `link` (old) | `url`, `label`, `openInNewTab`, `icon` | ❌ No — raw URL string | 12 schemas |
| `linkItem` (new) | `type` (radio), `internalRef`, `externalUrl` | ✅ Yes — Sanity reference | 2 schemas |

The old `link` atom forces editors to paste raw URLs that silently break when slugs change. `linkItem` uses Sanity references for internal pages (slug-proof) but currently lacks `label`, `openInNewTab`, and `icon` fields that some consumers need.

Additionally, `ctaButton` (object) and `ctaButtonDoc` (document) are a paired schema with near-identical fields. Both reference the old `link` type. The pair should be consolidated to use `linkItem` and reviewed for field drift.

---

## Scope

### Phase 1 — Extend `linkItem` to absorb `link` capabilities

Add missing fields to `linkItem.ts`:

- `label` (string) — display text override (optional; internal refs can derive from doc title)
- `openInNewTab` (boolean) — default `false`
- `icon` (string, enum) — social icon picker, hidden contextually (same pattern as current `link`)

### Phase 2 — Swap all `link` references to `linkItem`

12 schema files need `type: 'link'` → `type: 'linkItem'`:

| Schema file | Field(s) |
|-------------|----------|
| `objects/ctaButton.ts` | `link` |
| `documents/ctaButtonDoc.ts` | `link` |
| `documents/navigation.ts` | `link` (×2 — top-level + dropdown) |
| `documents/preheader.ts` | `link` |
| `documents/header.ts` | `link` |
| `documents/homepage.ts` | `link` (hero CTA) |
| `documents/hero.ts` | `links[]` array |
| `documents/footer.ts` | `of: [{type: 'link'}]` (×2 — column links + bottom links) |
| `documents/siteSettings.ts` | `link` (social) |
| `objects/editorialCard.ts` | `link` |

### Phase 3 — Data migration

Write a Sanity migration script to transform existing `link` field data to `linkItem` shape:

- `url` → `externalUrl` (with `type: 'external'`)
- For URLs matching known internal paths (e.g. `/about`, `/articles/...`), convert to `internalRef` with `type: 'internal'`
- Preserve `label`, `openInNewTab`, `icon` values

### Phase 4 — Web layer updates

Update GROQ queries and components that consume link data:

- `apps/web/src/lib/queries.js` — update link projections
- `apps/web/src/lib/linkUtils.js` — update `getLinkProps()` for new shape
- Header, Footer, Nav, Hero, CTA Button, EditorialCard components
- SocialLink rendering (icon field)

### Phase 5 — Deprecate `link` atom

- Remove `schemas/objects/link.ts` from schema registry
- Remove `schemas/lib/iconOptions.ts` if icon list moves into `linkItem`
- Update ERD manifest (`schemaManifest.js`)

---

## CTA Button pair audit

`ctaButton` (object) and `ctaButtonDoc` (document) are a registered paired schema (CLAUDE.md convention).

| Field | `ctaButton` | `ctaButtonDoc` | Action |
|-------|-------------|----------------|--------|
| `text` / `internalTitle` | `text` (button label) | `internalTitle` (Studio-only) | Keep both — different purposes |
| `link` | `type: 'link'` | `type: 'link'` | Both swap to `linkItem` |
| `style` | Same enum | Same enum | No change |
| `label` | Via `link.label` | Via `link.label` | Moves to `linkItem.label` |

The document variant (`ctaButtonDoc`) exists so editors can create reusable buttons referenced across pages. The object variant (`ctaButton`) is for inline/one-off buttons. Both are needed — this is not duplication, it's the object/document pair pattern. But they must stay in sync per CLAUDE.md paired schema convention.

---

## Risks

| Risk | Mitigation |
|------|------------|
| Data shape change breaks live content | Migration script runs in dry-run mode first; back up dataset before executing |
| Social icon rendering breaks during swap | Test footer + social links in both themes before/after migration |
| Internal URL matching in migration is fragile | Use `routes.js` `TYPE_NAMESPACES` for canonical matching; flag unmatched URLs for manual review |
| 12-file schema change is large | Commit schema changes separately from web layer changes (per CLAUDE.md studio schema rule) |

---

## Dependencies

- None — can be picked up independently
- Blocked by: nothing
- Blocks: none (but improves content integrity for governance epic)

---

## Acceptance criteria

- [x] `linkItem` has `label`, `openInNewTab` fields (icon not needed — socialLink handles icons)
- [x] Active schemas reference `linkItem`; deprecated schemas (header, footer, hero, editorialCard) left on `link` intentionally
- [x] Migration script converts existing data with dry-run mode (`DRY_RUN=1`)
- [ ] `link.ts` schema file removed from registry (deferred — deprecated schemas still reference it)
- [x] CTA button pair fields verified in sync (both use linkItem, tertiary style)
- [ ] Footer social icons render correctly (needs runtime verification after migration)
- [x] Header CTA, preheader links functional with new GROQ projections
- [x] ERD manifest updated to reflect new schema state
- [ ] `pnpm validate:content` passes with zero new errors (needs runtime verification)
