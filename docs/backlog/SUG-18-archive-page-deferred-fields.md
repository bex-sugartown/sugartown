# Archive Page — Deferred Fields

**Linear Issue:** [SUG-18](https://linear.app/sugartown/issue/SUG-18/archive-page-deferred-fields-wire-display-advanced-tab-configs)
**Status:** Backlog (post-launch)
**Schema file:** `apps/studio/schemas/documents/archivePage.ts`
**Date logged:** 2026-03-05

These fields exist in the Sanity Studio `archivePage` document type but are **not wired up** in the web app. They should be either removed from the schema or implemented in a future epic.

---

## Model & Mode [REQUIRED]

> Use the Opus plan-first workflow for this epic. Opus handles planning
> (Pre-Execution Gate → Files to Modify) in plan mode, then Sonnet handles
> execution (code changes, migration runs, acceptance tests) after you exit
> plan mode. (The `opusplan` preset was retired — set the split up manually.)
>
> **Session setup:**
> 1. `/model opus` — set once at session start
> 2. `Shift+Tab` until status bar reads "plan mode"
> 3. Paste this epic as the first prompt
> 4. Review Opus's plan against the gates below; push back until aligned
> 5. Exit plan mode (`Shift+Tab`), then `/model sonnet` takes over for execution
>
> **Override rule:** if Sonnet stalls during execution on something that's
> architectural rather than mechanical (e.g. an unexpected cross-workspace
> type error, a token cascade that isn't resolving), type `/model opus`
> for that single question, then `/model sonnet` to return. Note the
> override in the epic's post-mortem so we learn where Sonnet's ceiling is.
>
> **When to deviate from the plan-first workflow:**
> - Pure copy/content epics (no code): use `/model sonnet` — no planning depth needed
> - Pure architecture epics (Schema ERD, SSR strategy, monorepo boundary changes): use `/model opus` — execution benefits from sustained depth too

---

> **Updated 2026-11-20 by #210.** An audit of every `archivePage` field (table on #210) found three of
> the eight sections below already wired: `filterConfig` (5), `displayStyle` (7), and
> `cardOptions.showExcerpt` / `.showHeroImage` (part of 8). They left this epic's scope and moved out of
> the "Advanced (coming soon)" tab. `hero.heading` and `.subheading` are wired too, so only the hero
> background image (1) and `hero.content` remain. Section 6 is legacy, superseded by `filterConfig`.

## 1. Hero Background Image

**Field:** `hero.backgroundImage`

Full-bleed background image for the archive hero section. Uploaded in Studio but not rendered by any archive page template on the web side. `hero.content` (rich text under the heading) is also unread. `hero.heading` and `.subheading` are wired (#210).

## 2. Promoted Items

**Field:** `featuredItems` (array of references, max 6)

Lets editors pin specific documents to the top of the archive grid. The web app ignores this field and uses the default sort order.

## 3. Default Taxonomy Pins

**Field:** `taxonomyFilters` (object: `categories[]`, `tags[]`, `projects[]`)

Editor-side pre-filtering by taxonomy references to scope which content appears on the archive page. Not read by any GROQ query on the web side.

## 4. Date Range Filter

**Field:** `dateRange` (object: `startDate`, `endDate`)

Constrains the archive to a time window. Not consumed by the web app's query layer.

## 5. Filter Configuration (Facets) — out of scope, wired

**Field:** `filterConfig` (object: `facets[]`)

Read by `buildFilterModel()` (`apps/web/src/lib/filterModel.js`) and moved to the Filtering tab by #210. Whether every setting (for example `defaultSelectedSlugs`) is honoured end to end was not checked; file a bug if one is not.

## 6. Frontend Filter Controls — legacy

**Field:** `frontendFilters` (object: per-filter boolean toggles), with `enableFrontendFilters`

Superseded by `filterConfig` and labelled legacy in Studio by #210. The remaining decision is removal, with an unset on the archives that hold values.

Per-toggle visibility for content type, category, tag, project, date, and search filters. Toggles exist in Studio but the web app doesn't read them to conditionally show/hide filter UI.

## 7. Display Style — out of scope, wired

**Field:** `displayStyle` (`'grid'` | `'list'`)

Read by `ArchivePage.jsx` as the default layout and moved to the Display tab by #210. `/releases` uses `list`.

## 8. Card Options

**Field:** `cardOptions` (object: `showExcerpt`, `showHeroImage`, `compact`, `defaultImage`)

`showExcerpt` and `showHeroImage` are wired (grid layout only) and in the Display tab since #210. Still in scope:

- `compact`: not fetched, not read.
- `defaultImage`: inert. `archivePageBySlugQuery` asks for `cardOptions.imageOverride`, which the schema does not have, and `ContentCard` puts `imageOverride` ahead of an item's hero image, the opposite of the Studio description ("fallback when a content item has no image"). Wiring it means fixing both the field name and the order.

## 9. Sort, page size, pagination

**Fields:** `sortBy`, `itemsPerPage`, `showPagination`

The first two are fetched by `archivePageBySlugQuery` and never read; `showPagination` is not fetched. The archive sorts and paginates on fixed rules.

---

## Recommendation

**Option A — Remove from schema:** Strip these fields to reduce editor confusion. Re-add them when the feature is built.

**Option B — Move to a "Deferred" tab:** Add a fifth schema group/tab labelled "Deferred" or "Advanced (coming soon)" so editors can see the fields exist but understand they aren't live yet.

Either way, no web app work is needed until these are prioritised.
