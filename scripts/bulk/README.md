# Bulk Content Operations — CSV Export + Re-Import

Structured export/import tooling for treating Sanity content as editable data.

## Quick Start

```bash
# Export all articles with all available fields
pnpm bulk:export -- --type article

# Export only SEO fields for articles
pnpm bulk:export -- --type article --fields title,slug,seo.title,seo.description

# Export across all content types (shared fields only)
pnpm bulk:export -- --type all

# See available fields for a type
pnpm bulk:export -- --type caseStudy --list-fields

# Dry-run import (validate + diff preview, no writes)
pnpm bulk:import -- scripts/bulk/artifacts/export-article-2026-02-27.csv --dry-run

# Apply import with backup
pnpm bulk:import -- scripts/bulk/artifacts/export-article-2026-02-27.csv --apply --backup
```

## Workflow

```
1. EXPORT → CSV
   pnpm bulk:export -- --type article --fields title,seo.title,seo.description

2. EDIT in Sheets/Excel
   Open the CSV, edit cells, save

3. VALIDATE (dry-run)
   pnpm bulk:import -- edited.csv --dry-run
   Review the diff report in scripts/bulk/artifacts/

4. APPLY
   pnpm bulk:import -- edited.csv --apply --backup
   Changes are patched to Sanity. Backup NDJSON is saved.
```

## Field Naming Convention

CSV column names use dot-delimited paths that mirror the Sanity document structure:

| Column | Sanity Path | Type | Notes |
|---|---|---|---|
| `_id` | `_id` | string | 🔒 Read-only, required for import |
| `_type` | `_type` | string | 🔒 Read-only, required for import |
| `title` | `title` | string | |
| `slug` | `slug.current` | slug | |
| `excerpt` | `excerpt` | text | Max 300 chars |
| `publishedAt` | `publishedAt` | datetime | ISO 8601 |
| `updatedAt` | `updatedAt` | datetime | ISO 8601 |
| `status` | `status` | enum | Values vary by type |
| `seo.title` | `seo.title` | string | Max 60 chars |
| `seo.description` | `seo.description` | text | Max 160 chars |
| `seo.canonicalUrl` | `seo.canonicalUrl` | string | |
| `seo.noIndex` | `seo.noIndex` | boolean | true/false |
| `seo.noFollow` | `seo.noFollow` | boolean | true/false |
| `seo.og.title` | `seo.openGraph.title` | string | |
| `seo.og.description` | `seo.openGraph.description` | text | |
| `categories` | `categories[]` | ref_slugs | Comma-separated category slugs |
| `tags` | `tags[]` | ref_slugs | Comma-separated tag slugs |
| `projects` | `projects[]` | ref_slugs | Comma-separated project slugs |
| `authors` | `authors[]` | ref_slugs | Comma-separated person slugs |
| `tools` | `tools[]` | string_array | Comma-separated from controlled vocab |

### Type-Specific Fields

**Case Study:** `client`, `employer`, `contractType`, `role`, `dateRange.startDate`, `dateRange.endDate`

**Node:** `aiTool`, `conversationType`, `challenge`, `insight`, `actionItem`

**Page:** `template`

## Import Safety Rules

1. **Patch-only** — the importer never creates new documents or overwrites entire documents. Only explicitly changed fields are patched.

2. **Empty cells = no change** — leaving a cell blank means "keep current value". This is critical for partial edits.

3. **Clearing a field** — to explicitly remove a value, use the sentinel `__CLEAR__` in the cell.

4. **Validation before write** — all cells are type-checked, enum values are validated, reference slugs are resolved against Sanity before any write happens.

5. **Dry-run default** — if you forget `--apply`, the script defaults to `--dry-run` and shows you the diff without writing anything.

6. **Backup** — use `--backup` with `--apply` to save a full NDJSON snapshot of affected documents before patching.

## File Structure

```
scripts/bulk/
├── README.md              ← this file
├── field-contract.js      ← single source of truth for editable fields
├── export-csv.js          ← CSV export script
├── import-csv.js          ← CSV import script with validation + dry-run
└── artifacts/             ← output directory
    ├── .gitkeep
    ├── export-*.csv       ← generated exports
    ├── diff-preview-*.md  ← dry-run diff reports
    ├── changelog-*.ndjson ← post-apply change logs
    └── backup-*.ndjson    ← pre-apply document snapshots
```

## Extending

To add a new bulk-editable field:

1. Add the field definition to `field-contract.js` in the appropriate array (SHARED_FIELDS or type-specific)
2. The export and import scripts automatically pick it up — no other changes needed

Fields that should **never** be bulk-editable: `content` (Portable Text), `sections` (page builder), `featuredImage` (asset references), `legacySource` (migration metadata).
