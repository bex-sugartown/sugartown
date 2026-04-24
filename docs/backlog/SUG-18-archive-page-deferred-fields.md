# Archive Page — Deferred Fields

**Linear Issue:** [SUG-18](https://linear.app/sugartown/issue/SUG-18/archive-page-deferred-fields-wire-display-advanced-tab-configs)
**Status:** Backlog (post-launch)
**Schema file:** `apps/studio/schemas/documents/archivePage.ts`
**Date logged:** 2026-03-05

These fields exist in the Sanity Studio `archivePage` document type but are **not wired up** in the web app. They should be either removed from the schema or implemented in a future epic.

---

## Model & Mode [REQUIRED]

> Use Claude Code's `opusplan` alias for this epic. Opus handles planning
> (Pre-Execution Gate → Files to Modify), Sonnet handles execution
> (code changes, migration runs, acceptance tests). The handoff is automatic
> when you exit plan mode.
>
> **Session setup:**
> 1. `/model opusplan` — set once at session start
> 2. `Shift+Tab` until status bar reads "plan mode"
> 3. Paste this epic as the first prompt
> 4. Review Opus's plan against the gates below; push back until aligned
> 5. Exit plan mode (`Shift+Tab`) — Sonnet takes over for execution
>
> **Override rule:** if Sonnet stalls during execution on something that's
> architectural rather than mechanical (e.g. an unexpected cross-workspace
> type error, a token cascade that isn't resolving), type `/model opus`
> for that single question, then `/model opusplan` to return. Note the
> override in the epic's post-mortem so we learn where Sonnet's ceiling is.
>
> **When to deviate from opusplan:**
> - Pure copy/content epics (no code): use `/model sonnet` — no planning depth needed
> - Pure architecture epics (Schema ERD, SSR strategy, monorepo boundary changes): use `/model opus` — execution benefits from sustained depth too

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
