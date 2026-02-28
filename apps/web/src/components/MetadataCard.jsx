/**
 * MetadataCard — structured metadata surface for content detail pages.
 *
 * Renders a non-interactive Card (variant="metadata") containing:
 *   - Scalar field rows (status, aiTool, conversationType, client, role, publishedAt)
 *   - Tool chips (string array, seafoam outlined — see MetadataCard.module.css)
 *   - Taxonomy chips (categories, projects, tags) via TaxonomyChips
 *
 * All props are optional — a row is suppressed entirely when its value is absent.
 * Returns null when no content would render (guards against empty card in UI).
 *
 * Used by: NodePage, ArticlePage, CaseStudyPage.
 * Not used by: RootPage / static pages (no content taxonomy).
 */
import { Card } from '../design-system'
import TaxonomyChips from './TaxonomyChips'
import styles from './MetadataCard.module.css'

// Human-readable status labels — mirrors ContentCard STATUS_DISPLAY
const STATUS_LABELS = {
  active:        'Active',
  shipped:       'Shipped',
  'in-progress': 'In Progress',
  in_progress:   'In Progress',
  paused:        'Paused',
  archived:      'Archived',
  draft:         'Draft',
  explored:      'Explored',
}

function formatDate(dateStr) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function MetadataCard({
  contentType,
  publishedAt,
  status,
  aiTool,
  conversationType,
  client,
  role,
  tools,
  categories,
  tags,
  projects,
}) {
  const statusKey = status?.toLowerCase().replace(/[\s_]+/g, '-')

  // Ordered scalar fields — only truthy entries render
  const fields = [
    contentType                  && { label: 'Type',         value: contentType },
    statusKey                    && { label: 'Status',       value: STATUS_LABELS[statusKey] ?? status },
    aiTool                       && { label: 'AI Tool',      value: aiTool },
    conversationType             && { label: 'Conversation', value: conversationType },
    client                       && { label: 'Client',       value: client },
    role                         && { label: 'Role',         value: role },
    formatDate(publishedAt)      && { label: 'Published',    value: formatDate(publishedAt) },
  ].filter(Boolean)

  const hasTools    = tools?.length > 0
  const hasTaxonomy = categories?.length || tags?.length || projects?.length

  if (!fields.length && !hasTools && !hasTaxonomy) return null

  return (
    <Card variant="metadata" as="aside">
      <div className={styles.grid}>
        {/* Scalar field rows */}
        {fields.map(({ label, value }) => (
          <div key={label} className={styles.field}>
            <p className={styles.fieldLabel}>{label}</p>
            <p className={styles.fieldValue}>{value}</p>
          </div>
        ))}

        {/* Tools (string chips, seafoam outlined) */}
        {hasTools && (
          <div className={styles.field}>
            <p className={styles.fieldLabel}>Tools</p>
            <ul className={styles.toolChips}>
              {tools.map((tool) => (
                <li key={tool}>
                  <span className={styles.toolChip}>{tool}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Taxonomy (categories, projects, tags) */}
        {hasTaxonomy && (
          <div className={styles.field}>
            <p className={styles.fieldLabel}>Classification</p>
            <TaxonomyChips
              categories={categories}
              tags={tags}
              projects={projects}
              size="sm"
            />
          </div>
        )}
      </div>
    </Card>
  )
}
