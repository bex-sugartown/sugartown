# Archive Page — Deferred Fields

**Linear Issue:** [SUG-18](https://linear.app/sugartown/issue/SUG-18/archive-page-deferred-fields-wire-display-advanced-tab-configs)
**Status:** Backlog (post-launch)
**Schema file:** `apps/studio/schemas/documents/archivePage.ts`
**Date logged:** 2026-03-05

These fields exist in the Sanity Studio `archivePage` document type but are **not wired up** in the web app. They should be either removed from the schema or implemented in a future epic.

---

## 1. Hero Background Image

**Field:** `hero.backgroundImage`

Full-bleed background image for the archive hero section. Uploaded in Studio but not rendered by any archive page template on the web side.

## 2. Promoted Items

**Field:** `featuredItems` (array of references, max 6)

Lets editors pin specific documents to the top of the archive grid. The web app ignores this field and uses the default sort order.

## 3. Default Taxonomy Pins

**Field:** `taxonomyFilters` (object: `categories[]`, `tags[]`, `projects[]`)

Editor-side pre-filtering by taxonomy references to scope which content appears on the archive page. Not read by any GROQ query on the web side.

## 4. Date Range Filter

**Field:** `dateRange` (object: `startDate`, `endDate`)

Constrains the archive to a time window. Not consumed by the web app's query layer.

## 5. Filter Configuration (Facets)

**Field:** `filterConfig` (object: `facets[]`)

Stage 4 facet config — which facets appear, display order, single/multi selection mode, default selected slugs. Partially wired via `buildFilterModel()` but the full settings object is not respected end-to-end.

## 6. Frontend Filter Controls

**Field:** `frontendFilters` (object: per-filter boolean toggles)

Per-toggle visibility for content type, category, tag, project, date, and search filters. Toggles exist in Studio but the web app doesn't read them to conditionally show/hide filter UI.

## 7. Display Style

**Field:** `displayStyle` (`'grid'` | `'list'`)

Lets editors choose between card grid and list layout. The web app always renders the grid layout regardless of this setting.

## 8. Card Options

**Field:** `cardOptions` (object: `showExcerpt`, `showHeroImage`, `compact`, `defaultImage`)

Controls for excerpt visibility, hero image visibility, compact card mode, and a fallback default image. None of these are read by the web app's `ContentCard` or archive page templates.

---

## Recommendation

**Option A — Remove from schema:** Strip these fields to reduce editor confusion. Re-add them when the feature is built.

**Option B — Move to a "Deferred" tab:** Add a fifth schema group/tab labelled "Deferred" or "Advanced (coming soon)" so editors can see the fields exist but understand they aren't live yet.

Either way, no web app work is needed until these are prioritised.
