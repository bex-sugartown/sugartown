/**
 * MetadataCard — structured metadata surface for content detail pages.
 * (Colloquially: "MetaCard" throughout the codebase.)
 *
 * Renders a non-interactive Card (variant="metadata") containing:
 *   - Author byline (absorbed from detailMeta — authors[] via getAuthorByline)
 *   - Scalar field rows (projectId, status, priority, aiTool, conversationType,
 *     client, role, publishedAt)
 *   - Tool chips (via DS Chip component, seafoam colour)
 *   - KPI list (project KPIs — metric / current / target)
 *   - Taxonomy chips — split by type: Project / Category / Tags (separate rows)
 *
 * All props are optional — a row is suppressed entirely when its value is absent.
 * Returns null when no content would render (guards against empty card in UI).
 *
 * EPIC-0158: Migrated from old Card slot API (as="aside", children slot) to new
 * Card named-prop API with `children` escape hatch for custom body content.
 * Tool chips now use the DS Chip component instead of inline .toolChip CSS.
 *
 * Display label maps mirror the Sanity schema option lists so the raw stored
 * key (e.g. "architecture") shows the full title ("Architecture Planning").
 *
 * Used by: NodePage, ArticlePage, CaseStudyPage, ProjectDetailPage.
 * Not used by: RootPage / static pages (no content taxonomy).
 */
import { Link } from 'react-router-dom'
import { Card, Chip } from '../design-system'
import { getAuthorByline, getPrimaryAuthor } from '../lib/person'
import { getCanonicalPath } from '../lib/routes'
import TaxonomyChips from './TaxonomyChips'
import styles from './MetadataCard.module.css'

// ─── Display label maps (mirror Sanity schema option lists) ───────────────────

const STATUS_LABELS = {
  // Node statuses
  explored:      'Explored',
  validated:     'Validated',
  implemented:   'Implemented',
  deprecated:    'Deprecated',
  evergreen:     'Evergreen',
  // Article / CaseStudy statuses
  active:        'Active',
  shipped:       'Shipped',
  'in-progress': 'In Progress',
  in_progress:   'In Progress',
  paused:        'Paused',
  archived:      'Archived',
  draft:         'Draft',
  // Project statuses
  planning:      'Planning',
}

const AI_TOOL_LABELS = {
  claude:   'Claude',
  chatgpt:  'ChatGPT',
  gemini:   'Gemini',
  mixed:    'Agentic Caucus',
}

const CONVERSATION_TYPE_LABELS = {
  problem:      'Problem Solving',
  learning:     'Learning/Research',
  code:         'Code Generation',
  design:       'Design Discussion',
  architecture: 'Architecture Planning',
  debug:        'Debugging',
  reflection:   'Reflection',
}

const PRIORITY_LABELS = {
  1: 'P1 Critical',
  2: 'P2 High',
  3: 'P3 Medium',
  4: 'P4 Low',
  5: 'P5 Backlog',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MetadataCard({
  // Content fields
  authors,
  legacyAuthor,
  contentType,
  publishedAt,
  status,
  aiTool,
  conversationType,
  client,
  role,
  tools,
  // Project-specific fields
  projectId,
  priority,
  kpis,
  // Taxonomy
  categories,
  tags,
  projects,
}) {
  const statusKey       = status?.toLowerCase().replace(/[\s_]+/g, '-')
  const authorByline    = getAuthorByline(authors, legacyAuthor)
  const primaryAuthor   = getPrimaryAuthor(authors)
  const aiToolDisplay   = aiTool           ? (AI_TOOL_LABELS[aiTool]                       ?? aiTool)           : null
  const convTypeDisplay = conversationType  ? (CONVERSATION_TYPE_LABELS[conversationType]   ?? conversationType) : null
  const priorityDisplay = priority != null  ? (PRIORITY_LABELS[priority]                    ?? `P${priority}`)   : null

  // Build the author value — a <Link> when the primary author has a slug, plain
  // text otherwise (legacy string fallback or person without slug).
  let authorValue = null
  if (authorByline) {
    if (primaryAuthor?.slug) {
      const personPath = getCanonicalPath({ docType: 'person', slug: primaryAuthor.slug })
      authorValue = (
        <Link to={personPath} className={styles.authorLink}>
          {authorByline}
        </Link>
      )
    } else {
      authorValue = authorByline
    }
  }

  // Ordered scalar fields — only truthy entries render.
  // projectId and priority are inserted between contentType and aiTool so they
  // read naturally in both pure-project and mixed-content MetaCard usage.
  const fields = [
    authorValue                && { label: 'Author',       value: authorValue },
    contentType                && { label: 'Type',         value: contentType },
    projectId                  && { label: 'Project ID',   value: projectId },
    statusKey                  && { label: 'Status',       value: STATUS_LABELS[statusKey] ?? status },
    priorityDisplay            && { label: 'Priority',     value: priorityDisplay },
    aiToolDisplay              && { label: 'AI Tool',      value: aiToolDisplay },
    convTypeDisplay            && { label: 'Conversation', value: convTypeDisplay },
    client                     && { label: 'Client',       value: client },
    role                       && { label: 'Role',         value: role },
    formatDate(publishedAt)    && { label: 'Published',    value: formatDate(publishedAt) },
  ].filter(Boolean)

  // Guard: pre-migration data may contain nulls (unresolved string→ref dereferences)
  const validTools    = tools?.filter((t) => t && typeof t === 'object' && t.name) ?? []
  const hasTools      = validTools.length > 0
  const hasKpis       = kpis?.length > 0
  const hasProjects   = projects?.length > 0
  const hasCategories = categories?.length > 0
  const hasTags       = tags?.length > 0

  if (!fields.length && !hasTools && !hasKpis && !hasProjects && !hasCategories && !hasTags) return null

  return (
    <aside>
      <Card variant="metadata">
        <div className={styles.grid}>

          {/* Scalar field rows */}
          {fields.map(({ label, value }) => (
            <div key={label} className={styles.field}>
              <p className={styles.fieldLabel}>{label}</p>
              <p className={styles.fieldValue}>{value}</p>
            </div>
          ))}

          {/* Tools (DS Chip component, linked to /tools/:slug) */}
          {hasTools && (
            <div className={styles.field}>
              <p className={styles.fieldLabel}>Tools</p>
              <ul className={styles.chipList}>
                {validTools.map((tool) => (
                  <li key={tool._id}>
                    <Chip
                      label={tool.name}
                      href={tool.slug ? getCanonicalPath({ docType: 'tool', slug: tool.slug }) : undefined}
                      color="grey"
                      size="sm"
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* KPIs (project-specific — metric / current / target) */}
          {hasKpis && (
            <div className={styles.field}>
              <p className={styles.fieldLabel}>KPIs</p>
              <ul className={styles.kpiList}>
                {kpis.map((kpi, i) => (
                  <li key={i} className={styles.kpiItem}>
                    <span className={styles.kpiMetric}>{kpi.metric}</span>
                    <span className={styles.kpiProgress}>
                      <span className={styles.kpiCurrent}>{kpi.current || '\u2014'}</span>
                      {kpi.target && (
                        <span className={styles.kpiTarget}> / {kpi.target}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Taxonomy — one row per type, not a merged "Classification" block */}
          {hasProjects && (
            <div className={styles.field}>
              <p className={styles.fieldLabel}>Project</p>
              <TaxonomyChips projects={projects} size="sm" />
            </div>
          )}

          {hasCategories && (
            <div className={styles.field}>
              <p className={styles.fieldLabel}>Category</p>
              <TaxonomyChips categories={categories} size="sm" />
            </div>
          )}

          {hasTags && (
            <div className={styles.field}>
              <p className={styles.fieldLabel}>Tags</p>
              <TaxonomyChips tags={tags} size="sm" />
            </div>
          )}

        </div>
      </Card>
    </aside>
  )
}
