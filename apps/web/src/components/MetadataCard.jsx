/**
 * MetadataCard — structured metadata surface for content detail pages.
 * (Colloquially: "MetaCard" throughout the codebase.)
 *
 * SUG-52 card-catalog aesthetic:
 * - Dotted neutral outline (matches MarginColumn)
 * - bg-through-gap interior dividers (zero CSS borders inside)
 * - Scalar fields in a wrapping row
 * - Chip sections span full width below scalar row
 *
 *   PROJ-001
 *   AUTHOR  Bex    STATUS  Operationalized    TYPE  Node
 *   TOOLS   [Claude Code] [Sanity]
 *   CATEGORY [Engineering & DX]
 *   TAGS    [table] [ux] [portable text] ...
 *                                    PUBLISHED  Apr 1 2026
 *
 * All props are optional — a row is suppressed entirely when its value is absent.
 * Returns null when no content would render (guards against empty card in UI).
 *
 * Used by: NodePage, ArticlePage, CaseStudyPage, ProjectDetailPage.
 * Not used by: RootPage / static pages (no content taxonomy).
 */
import { Link } from 'react-router-dom'
import { Chip } from '../design-system'
import { getAuthorByline, getPrimaryAuthor } from '../lib/person'
import { getCanonicalPath } from '../lib/routes'
import TaxonomyChips from './TaxonomyChips'
import styles from './MetadataCard.module.css'

// ─── Display label maps (mirror Sanity schema option lists) ───────────────────

// Node evolution values (node.ts status field)
// Project lifecycle values (project.ts status field)
const STATUS_LABELS = {
  // Node evolution
  exploring:      'Exploring',
  validated:      'Validated',
  operationalized:'Operationalized',
  deprecated:     'Deprecated',
  evergreen:      'Evergreen',
  // Project lifecycle
  dreaming:       'Dreaming',
  designing:      'Designing',
  developing:     'Developing',
  testing:        'Testing',
  deploying:      'Deploying',
  iterating:      'Iterating',
}

const PRIORITY_LABELS = {
  1: 'P1 Critical',
  2: 'P2 High',
  3: 'P3 Medium',
  4: 'P4 Low',
  5: 'P5 Backlog',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Short mono-friendly date: "Feb 28 2026" */
function formatDateShort(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  const month = d.toLocaleDateString('en-US', { month: 'short' })
  const day   = d.getDate()
  const year  = d.getFullYear()
  return `${month} ${day} ${year}`
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MetadataCard({
  // Content fields
  authors,
  contentType,
  contentTypeHref,
  publishedAt,
  status,
  conversationType,
  client,
  role,
  tools,
  readingTime,
  // Project-specific fields
  projectId,
  priority,
  kpis,
  // Taxonomy
  categories,
  tags,
  projects,
  // Slots
  draftBadge,
}) {
  const statusKey       = status?.toLowerCase().replace(/[\s_]+/g, '-')
  const authorByline    = getAuthorByline(authors)
  const primaryAuthor   = getPrimaryAuthor(authors)
  const priorityDisplay = priority != null  ? (PRIORITY_LABELS[priority] ?? `P${priority}`)   : null

  // Author value — <Link> when person has a slug, plain text otherwise
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

  // ── Call number: project ID + name as catalog-card shelf label ───────────
  const callNumber = projectId || projects?.[0]?.projectId || null
  const callNumberProject = projects?.[0]
  const callNumberName = callNumberProject?.name || null
  const callNumberPath = callNumberProject?.slug
    ? getCanonicalPath({ docType: 'project', slug: callNumberProject.slug })
    : null

  // Type value — <Link> when contentTypeHref is provided, plain text otherwise
  const typeValue = contentType
    ? contentTypeHref
      ? <Link to={contentTypeHref} className={styles.typeLink}>{contentType}</Link>
      : contentType
    : null

  // ── Scalar fields — flat list, rendered in a wrapping flex row ──────────
  const scalarFields = [
    authorValue     && { label: 'Author',       value: authorValue },
    typeValue       && { label: 'Type',         value: typeValue },
    statusKey       && { label: 'Status',       value: STATUS_LABELS[statusKey] ?? status },
    client          && { label: 'Client',       value: client },
    role            && { label: 'Role',         value: role },
    priorityDisplay && { label: 'Priority',     value: priorityDisplay },
    readingTime     && { label: 'Reading Time', value: `${readingTime} min` },
  ].filter(Boolean)

  // ── Chip / taxonomy guards ──────────────────────────────────────────────
  const validTools    = tools?.filter((t) => t && t.name) ?? []
  const hasTools      = validTools.length > 0
  const hasKpis       = kpis?.length > 0
  const hasCategories = categories?.length > 0
  const hasTags       = tags?.length > 0
  const publishedDisplay = formatDateShort(publishedAt)

  // Project chips only when no call number ID available (fallback)
  const hasProjects      = projects?.length > 0
  const showProjectChips = hasProjects && !callNumber

  const hasScalars = scalarFields.length > 0

  if (
    !callNumber && !hasScalars && !hasTools && !hasKpis &&
    !showProjectChips && !hasCategories && !hasTags && !publishedDisplay && !draftBadge
  ) return null

  // Check if any chip sections exist
  const hasChips = hasTools || hasKpis || showProjectChips || hasCategories || hasTags

  return (
    <aside>
      <div className={styles.card}>

        {/* Draft badge — upper-right corner */}
        {draftBadge && (
          <div className={styles.draftBadgeSlot}>
            {draftBadge}
          </div>
        )}

        {/* Scalar fields — wrapping flex row with bg-through-gap dividers */}
        {(callNumber || hasScalars) && (
          <div className={styles.scalarRow}>

            {/* Call number — project ID + name as catalog shelf label */}
            {callNumber && (
              <div className={styles.scalarField}>
                <p className={styles.scalarLabel}>Project</p>
                <p className={styles.callNumber}>
                  {callNumberPath ? (
                    <Link to={callNumberPath} className={styles.callNumberLink}>
                      {callNumber}{callNumberName ? ` ${callNumberName}` : ''}
                    </Link>
                  ) : (
                    <>{callNumber}{callNumberName ? ` ${callNumberName}` : ''}</>
                  )}
                </p>
              </div>
            )}

            {scalarFields.map((field) => (
              <div key={field.label} className={styles.scalarField}>
                <p className={styles.scalarLabel}>{field.label}</p>
                <p className={styles.scalarValue}>{field.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Chip sections — full-width rows with bg-through-gap */}
        {hasChips && (
          <div className={styles.chipColumns}>

            {hasTools && (
              <div className={styles.chipRow}>
                <p className={styles.chipLabel}>Tools</p>
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

            {hasKpis && (
              <div className={styles.chipRow}>
                <p className={styles.chipLabel}>KPIs</p>
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

            {showProjectChips && (
              <div className={styles.chipRow}>
                <p className={styles.chipLabel}>Project</p>
                <TaxonomyChips projects={projects} size="sm" />
              </div>
            )}

            {hasCategories && (
              <div className={styles.chipRow}>
                <p className={styles.chipLabel}>Category</p>
                <TaxonomyChips categories={categories} size="sm" />
              </div>
            )}

            {hasTags && (
              <div className={styles.chipRow}>
                <p className={styles.chipLabel}>Tags</p>
                <TaxonomyChips tags={tags} size="sm" />
              </div>
            )}
          </div>
        )}

        {/* Published date — right-aligned footer */}
        {publishedDisplay && (
          <div className={styles.dateRow}>
            <p className={styles.dateLabel}>Published</p>
            <p className={styles.dateValue}>{publishedDisplay}</p>
          </div>
        )}

      </div>
    </aside>
  )
}
