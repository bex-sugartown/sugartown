# Sanity Studio Setup Notes

Operational notes for Sugartown's Sanity Studio (`apps/studio`).
For schema conventions see the epic template and MEMORY.md.

---

## Studio Access

- **Project:** `poalmzla`
- **Dataset:** `production`
- **Studio URL:** [Deployed via `sanity deploy`]
- **Local dev:** `pnpm dev` from `apps/studio` (or `pnpm dev` at repo root via Turbo)
- **Manage:** https://sanity.io/manage → project `poalmzla`

---

## Scheduling — Suppressed

**Sanity's scheduling / "Content Releases" feature is intentionally not used.**

The web client (`apps/web/src/lib/sanity.js`) always queries with `perspective: 'published'`.
This means:

- Only **published** documents are visible in the web app
- Draft documents (prefixed `drafts.*`) are invisible to the frontend regardless of any schedule set in Studio
- Scheduling a document in Studio does NOT publish it to the web at the scheduled time without additional configuration (a scheduled publishing webhook / Sanity Scheduled Publishing plugin)

**Do not set publication schedules in Studio** unless the full scheduled-publishing pipeline (webhook + deploy hook) has been wired up. Scheduled but unpublished documents will silently fail to appear on the site.

To publish content: use the **Publish** button in Studio (not the schedule option). Confirm it is visible on the live site via `pnpm validate:content`.

---

## Schema Registration

All document and section schemas must be registered in:

```
apps/studio/schemas/index.ts
```

Checklist when adding a new schema:
1. Create the schema file in the appropriate directory:
   - Documents: `apps/studio/schemas/documents/`
   - Sections: `apps/studio/schemas/sections/`
   - Objects: `apps/studio/schemas/objects/`
2. Import it in `index.ts` and add to `schemaTypes`
3. For section types: add `defineArrayMember({type: 'yourType'})` to every in-scope document's `sections[]` field
4. Run `tsc --noEmit` from `apps/studio` to confirm zero new type errors

---

## Studio Tabs (Groups)

Document schemas use `groups` to organise fields into tabs. Follow the pattern established by `person.ts` and `project.ts`:

```typescript
groups: [
  {name: 'basics',  title: 'Basics',  default: true},
  {name: 'profile', title: 'Profile'},
  {name: 'seo',     title: 'SEO'},
],
```

Every field should be assigned to a group via `group: 'basics'` etc. Ungrouped fields appear above the tabs and should be avoided for new schemas.

---

## `perspective: 'published'` — Why It Exists

The web client sets `perspective: 'published'` to prevent **draft shadowing**: when a document has both a published version and a draft (`drafts.{id}`), a query without this option can return the draft, exposing unpublished content or (worse) a draft with a conflicting slug that shadows the published doc.

**Consequence for debugging:** if a document you published in Studio does not appear on the site:
1. Check that the publish action completed (no pending draft in Studio)
2. Run `pnpm validate:content` to check for missing slugs or required fields
3. Check the browser console for GROQ query errors
4. Confirm `perspective: 'published'` is still set on the client in `apps/web/src/lib/sanity.js`

---

## Validator Scripts

| Script | What it checks |
|--------|----------------|
| `pnpm validate:content` | Missing slugs, missing title/name, orphaned taxonomy refs, duplicate slugs, archive page contentTypes integrity |
| `pnpm validate:urls` | URL authority — all app URLs match canonical route patterns |
| `pnpm validate:filters` | FilterModel / facet integrity for archive pages |
| `pnpm validate:tokens` | CSS token drift between `apps/web` and `packages/design-system` |

Run `pnpm validate:content` after every Studio publishing session that touches multiple documents.
