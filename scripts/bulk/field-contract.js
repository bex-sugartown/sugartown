/**
 * field-contract.js — Bulk-Editable Field Contract
 *
 * Defines which Sanity document fields can be exported to CSV and safely
 * re-imported via patch operations. Each field entry specifies:
 *
 *   - csvColumn: deterministic column name in the CSV
 *   - groqPath: GROQ projection to extract the value
 *   - type: scalar type for validation on import
 *   - patchPath: Sanity patch path (dot-notation) for writing back
 *   - editable: whether this field can be written via bulk import
 *   - description: human-readable explanation for docs
 *
 * Naming convention (dot-delimited, mirrors Sanity structure):
 *   - Top-level: `title`, `excerpt`, `status`
 *   - Nested object: `seo.title`, `seo.description`, `dateRange.startDate`
 *   - Reference (slug): `categories` (comma-separated slugs)
 *   - Array of strings: `tools` (comma-separated values)
 *
 * This contract is the single source of truth for both export-csv.js and
 * import-csv.js. No field can be bulk-edited unless it's listed here.
 */

// ─── Field type enum ─────────────────────────────────────────────────────────

export const FIELD_TYPES = {
  STRING: 'string',
  TEXT: 'text',
  SLUG: 'slug',
  DATE: 'date',
  DATETIME: 'datetime',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  ENUM: 'enum',
  REF_SLUGS: 'ref_slugs',       // comma-separated slugs → reference array
  STRING_ARRAY: 'string_array',  // comma-separated values → string array
}

// ─── Shared fields (present on all 4 content types) ─────────────────────────

const SHARED_FIELDS = [
  {
    csvColumn: '_id',
    groqPath: '_id',
    type: FIELD_TYPES.STRING,
    patchPath: null,
    editable: false,
    description: 'Sanity document ID (required for import — never editable)',
  },
  {
    csvColumn: '_type',
    groqPath: '_type',
    type: FIELD_TYPES.STRING,
    patchPath: null,
    editable: false,
    description: 'Document type (article, caseStudy, node, page)',
  },
  {
    csvColumn: 'slug',
    groqPath: 'slug.current',
    type: FIELD_TYPES.SLUG,
    patchPath: 'slug.current',
    editable: true,
    description: 'URL slug',
  },
  {
    csvColumn: 'title',
    groqPath: 'title',
    type: FIELD_TYPES.STRING,
    patchPath: 'title',
    editable: true,
    description: 'Document title',
  },
  {
    csvColumn: 'excerpt',
    groqPath: 'excerpt',
    type: FIELD_TYPES.TEXT,
    patchPath: 'excerpt',
    editable: true,
    description: 'Short excerpt / summary (max 300 chars)',
  },
  {
    csvColumn: 'publishedAt',
    groqPath: 'publishedAt',
    type: FIELD_TYPES.DATETIME,
    patchPath: 'publishedAt',
    editable: true,
    description: 'Publication date (ISO 8601)',
  },
  {
    csvColumn: 'updatedAt',
    groqPath: 'updatedAt',
    type: FIELD_TYPES.DATETIME,
    patchPath: 'updatedAt',
    editable: true,
    description: 'Last updated date (ISO 8601)',
  },

  // ── SEO fields ────────────────────────────────────────────────────────
  {
    csvColumn: 'seo.title',
    groqPath: 'seo.title',
    type: FIELD_TYPES.STRING,
    patchPath: 'seo.title',
    editable: true,
    description: 'SEO meta title (max 60 chars)',
  },
  {
    csvColumn: 'seo.description',
    groqPath: 'seo.description',
    type: FIELD_TYPES.TEXT,
    patchPath: 'seo.description',
    editable: true,
    description: 'SEO meta description (max 160 chars)',
  },
  {
    csvColumn: 'seo.canonicalUrl',
    groqPath: 'seo.canonicalUrl',
    type: FIELD_TYPES.STRING,
    patchPath: 'seo.canonicalUrl',
    editable: true,
    description: 'Canonical URL override',
  },
  {
    csvColumn: 'seo.noIndex',
    groqPath: 'seo.noIndex',
    type: FIELD_TYPES.BOOLEAN,
    patchPath: 'seo.noIndex',
    editable: true,
    description: 'noindex robot directive (true/false)',
  },
  {
    csvColumn: 'seo.noFollow',
    groqPath: 'seo.noFollow',
    type: FIELD_TYPES.BOOLEAN,
    patchPath: 'seo.noFollow',
    editable: true,
    description: 'nofollow robot directive (true/false)',
  },
  {
    csvColumn: 'seo.og.title',
    groqPath: 'seo.openGraph.title',
    type: FIELD_TYPES.STRING,
    patchPath: 'seo.openGraph.title',
    editable: true,
    description: 'Open Graph title',
  },
  {
    csvColumn: 'seo.og.description',
    groqPath: 'seo.openGraph.description',
    type: FIELD_TYPES.TEXT,
    patchPath: 'seo.openGraph.description',
    editable: true,
    description: 'Open Graph description',
  },

  // ── Taxonomy (reference arrays — exported/imported as comma-separated slugs)
  {
    csvColumn: 'categories',
    groqPath: '"categories": categories[]->slug.current',
    type: FIELD_TYPES.REF_SLUGS,
    patchPath: 'categories',
    editable: true,
    refType: 'category',
    description: 'Category slugs (comma-separated, max 2)',
  },
  {
    csvColumn: 'tags',
    groqPath: '"tags": tags[]->slug.current',
    type: FIELD_TYPES.REF_SLUGS,
    patchPath: 'tags',
    editable: true,
    refType: 'tag',
    description: 'Tag slugs (comma-separated)',
  },
  {
    csvColumn: 'projects',
    groqPath: '"projects": projects[]->slug.current',
    type: FIELD_TYPES.REF_SLUGS,
    patchPath: 'projects',
    editable: true,
    refType: 'project',
    description: 'Project slugs (comma-separated)',
  },
  {
    csvColumn: 'authors',
    groqPath: '"authors": authors[]->slug.current',
    type: FIELD_TYPES.REF_SLUGS,
    patchPath: 'authors',
    editable: true,
    refType: 'person',
    description: 'Author slugs (comma-separated)',
  },

  // ── Tools (string array — exported/imported as comma-separated values)
  {
    csvColumn: 'tools',
    groqPath: 'tools',
    type: FIELD_TYPES.STRING_ARRAY,
    patchPath: 'tools',
    editable: true,
    description: 'Tools used (comma-separated from controlled vocab)',
  },
]

// ─── Type-specific fields ────────────────────────────────────────────────────

const ARTICLE_FIELDS = [
  {
    csvColumn: 'status',
    groqPath: 'status',
    type: FIELD_TYPES.ENUM,
    patchPath: 'status',
    editable: true,
    enumValues: ['draft', 'published', 'archived'],
    description: 'Content status',
  },
]

const CASE_STUDY_FIELDS = [
  {
    csvColumn: 'status',
    groqPath: 'status',
    type: FIELD_TYPES.ENUM,
    patchPath: 'status',
    editable: true,
    enumValues: ['draft', 'published', 'archived'],
    description: 'Content status',
  },
  {
    csvColumn: 'client',
    groqPath: 'client',
    type: FIELD_TYPES.STRING,
    patchPath: 'client',
    editable: true,
    description: 'Client name',
  },
  {
    csvColumn: 'employer',
    groqPath: 'employer',
    type: FIELD_TYPES.STRING,
    patchPath: 'employer',
    editable: true,
    description: 'Employer (e.g., Freelance, AKQA)',
  },
  {
    csvColumn: 'contractType',
    groqPath: 'contractType',
    type: FIELD_TYPES.ENUM,
    patchPath: 'contractType',
    editable: true,
    enumValues: ['full-time', 'contract', 'freelance', 'advisory'],
    description: 'Contract type',
  },
  {
    csvColumn: 'role',
    groqPath: 'role',
    type: FIELD_TYPES.STRING,
    patchPath: 'role',
    editable: true,
    description: 'Role / job title on this project',
  },
  {
    csvColumn: 'dateRange.startDate',
    groqPath: 'dateRange.startDate',
    type: FIELD_TYPES.DATE,
    patchPath: 'dateRange.startDate',
    editable: true,
    description: 'Project start date (YYYY-MM-DD)',
  },
  {
    csvColumn: 'dateRange.endDate',
    groqPath: 'dateRange.endDate',
    type: FIELD_TYPES.DATE,
    patchPath: 'dateRange.endDate',
    editable: true,
    description: 'Project end date (YYYY-MM-DD, blank if ongoing)',
  },
]

const NODE_FIELDS = [
  {
    csvColumn: 'status',
    groqPath: 'status',
    type: FIELD_TYPES.ENUM,
    patchPath: 'status',
    editable: true,
    enumValues: ['explored', 'validated', 'implemented', 'deprecated', 'evergreen'],
    description: 'Knowledge status',
  },
  {
    csvColumn: 'aiTool',
    groqPath: 'aiTool',
    type: FIELD_TYPES.ENUM,
    patchPath: 'aiTool',
    editable: true,
    enumValues: ['claude', 'chatgpt', 'gemini', 'mixed'],
    description: 'Primary AI tool used',
  },
  {
    csvColumn: 'conversationType',
    groqPath: 'conversationType',
    type: FIELD_TYPES.ENUM,
    patchPath: 'conversationType',
    editable: true,
    enumValues: ['problem', 'learning', 'code', 'design', 'architecture', 'debug', 'reflection'],
    description: 'Conversation type',
  },
  {
    csvColumn: 'challenge',
    groqPath: 'challenge',
    type: FIELD_TYPES.TEXT,
    patchPath: 'challenge',
    editable: true,
    description: 'Challenge description (max 500 chars)',
  },
  {
    csvColumn: 'insight',
    groqPath: 'insight',
    type: FIELD_TYPES.TEXT,
    patchPath: 'insight',
    editable: true,
    description: 'Key insight (max 1000 chars)',
  },
  {
    csvColumn: 'actionItem',
    groqPath: 'actionItem',
    type: FIELD_TYPES.STRING,
    patchPath: 'actionItem',
    editable: true,
    description: 'Action item (max 200 chars)',
  },
]

const PAGE_FIELDS = [
  {
    csvColumn: 'template',
    groqPath: 'template',
    type: FIELD_TYPES.ENUM,
    patchPath: 'template',
    editable: true,
    enumValues: ['default', 'full-width', 'sidebar'],
    description: 'Page template',
  },
]

// ─── Type → fields mapping ───────────────────────────────────────────────────

export const TYPE_FIELDS = {
  article: [...SHARED_FIELDS, ...ARTICLE_FIELDS],
  caseStudy: [...SHARED_FIELDS, ...CASE_STUDY_FIELDS],
  node: [...SHARED_FIELDS, ...NODE_FIELDS],
  page: [...SHARED_FIELDS, ...PAGE_FIELDS],
}

// Cross-type export uses only shared fields
export const CROSS_TYPE_FIELDS = SHARED_FIELDS

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Get the field definitions for a given content type.
 * If type is null/undefined, returns cross-type shared fields.
 */
export function getFieldsForType(type) {
  if (!type) return CROSS_TYPE_FIELDS
  return TYPE_FIELDS[type] || CROSS_TYPE_FIELDS
}

/**
 * Get only editable fields for a given type.
 */
export function getEditableFields(type) {
  return getFieldsForType(type).filter((f) => f.editable)
}

/**
 * Get a field definition by its CSV column name.
 */
export function getFieldByColumn(column, type) {
  return getFieldsForType(type).find((f) => f.csvColumn === column)
}

/**
 * Build a GROQ projection string from a list of field definitions.
 *
 * GROQ requires aliased projections for any dotted path (seo.title, etc.)
 * because bare `seo.title` in a projection is ambiguous.
 * Every field gets an explicit alias keyed to its csvColumn name.
 */
export function buildGroqProjection(fields) {
  const parts = []
  for (const f of fields) {
    if (f.groqPath.includes('"')) {
      // Already a named projection (e.g., "categories": categories[]->slug.current)
      parts.push(f.groqPath)
    } else {
      // Always alias — GROQ needs explicit keys for dotted paths
      parts.push(`"${f.csvColumn}": ${f.groqPath}`)
    }
  }
  return `{ ${parts.join(', ')} }`
}

/**
 * All supported content types.
 */
export const CONTENT_TYPES = ['article', 'caseStudy', 'node', 'page']
