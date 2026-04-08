/**
 * MetadataCard — structured metadata surface for content detail pages.
 * (Colloquially: "MetaCard" throughout the codebase.)
 *
 * Layout inspired by library catalog cards — a single CSS grid (4 columns)
 * with scalar fields split into left + right columns, chip rows spanning
 * the full width, and published date in the right column at the bottom.
 *
 *   PROJ-001                                    [DRAFT]
 *   AUTHOR        Bex              STATUS     Evergreen
 *   CONVERSATION  Reflection       TYPE       Node
 *   TOOLS         [Claude Code] [Sanity]
 *   CATEGORY      [AI Collaboration] [Ways of Working]
 *   TAGS          [prompt eng] [ai workflows] …
 *                                  PUBLISHED  Feb 28 2026
 *
 * All props are optional — a row is suppressed entirely when its value is absent.
 * Returns null when no content would render (guards against empty card in UI).
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

// AI_TOOL_LABELS removed — aiTool is duplicative with tools chips (SUG-33)

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
  // SUG-48: conversationType deprecated — categories/tags are canonical for classification
  const convTypeDisplay = null
  const priorityDisplay = priority != null  ? (PRIORITY_LABELS[priority]                    ?? `P${priority}`)   : null

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

  // ── Call number: project ID as catalog-card shelf label ──────────────────
  const callNumber = projectId || projects?.[0]?.projectId || null
  const callNumberProject = projects?.[0]
  const callNumberPath = callNumberProject?.slug
    ? getCanonicalPath({ docType: 'project', slug: callNumberProject.slug })
    : null

  // ── Scalar fields — split into left + right columns ─────────────────────
  // Left column: identity/context fields
  // Right column: classification/status fields (Status at top)
  const leftCol = [
    authorValue     && { label: 'Author',       value: authorValue },
    convTypeDisplay && { label: 'Conversation', value: convTypeDisplay },
    client          && { label: 'Client',       value: client },
    role            && { label: 'Role',         value: role },
  ].filter(Boolean)

  // Type value — <Link> when contentTypeHref is provided, plain text otherwise
  const typeValue = contentType
    ? contentTypeHref
      ? <Link to={contentTypeHref} className={styles.typeLink}>{contentType}</Link>
      : contentType
    : null

  const rightCol = [
    statusKey       && { label: 'Status',   value: STATUS_LABELS[statusKey] ?? status },
    typeValue       && { label: 'Type',     value: typeValue },
    priorityDisplay && { label: 'Priority', value: priorityDisplay },
  ].filter(Boolean)

  // Interleave left/right into sequential grid cells:
  // [left₁, right₁, left₂, right₂, …] — each pair fills one grid row
  const maxRows = Math.max(leftCol.length, rightCol.length)
  const scalarCells = []
  for (let i = 0; i < maxRows; i++) {
    scalarCells.push({ side: 'left',  field: leftCol[i]  || null })
    scalarCells.push({ side: 'right', field: rightCol[i] || null })
  }

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

  const hasScalars = leftCol.length > 0 || rightCol.length > 0

  if (
    !callNumber && !hasScalars && !hasTools && !hasKpis &&
    !showProjectChips && !hasCategories && !hasTags && !publishedDisplay && !draftBadge
  ) return null

  return (
    <aside>
      <Card variant="metadata">
        <div className={styles.grid}>

          {/* Call number — project ID */}
          {callNumber && (
            <p className={styles.callNumber}>
              {callNumberPath ? (
                <Link to={callNumberPath} className={styles.callNumberLink}>
                  {callNumber}
                </Link>
              ) : (
                callNumber
              )}
            </p>
          )}

          {/* Draft badge — upper-right of grid */}
          {draftBadge && (
            <div className={styles.draftBadgeSlot}>
              {draftBadge}
            </div>
          )}

          {/* Scalar fields — interleaved left/right pairs */}
          {scalarCells.map(({ side, field }, i) =>
            field ? (
              <div key={field.label} className={styles.field}>
                <p className={styles.fieldLabel}>{field.label}</p>
                <p className={styles.fieldValue}>{field.value}</p>
              </div>
            ) : (
              <span key={`pad-${side}-${i}`} className={styles.fieldPad} />
            )
          )}

          {/* Tools (DS Chip component, linked to /tools/:slug) */}
          {hasTools && (
            <div className={styles.chipField}>
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
            <div className={styles.chipField}>
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

          {/* Projects — fallback chip row when no call number ID */}
          {showProjectChips && (
            <div className={styles.chipField}>
              <p className={styles.fieldLabel}>Project</p>
              <TaxonomyChips projects={projects} size="sm" />
            </div>
          )}

          {hasCategories && (
            <div className={styles.chipField}>
              <p className={styles.fieldLabel}>Category</p>
              <TaxonomyChips categories={categories} size="sm" />
            </div>
          )}

          {hasTags && (
            <div className={styles.chipField}>
              <p className={styles.fieldLabel}>Tags</p>
              <TaxonomyChips tags={tags} size="sm" />
            </div>
          )}

          {/* Published date — right-aligned in cols 3–4 */}
          {publishedDisplay && (
            <div className={styles.dateRow}>
              <p className={styles.fieldLabel}>Published</p>
              <p className={styles.dateValue}>{publishedDisplay}</p>
            </div>
          )}

        </div>
      </Card>
    </aside>
  )
}
