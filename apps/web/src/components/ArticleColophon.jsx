/**
 * ArticleColophon — "Filed under" + status footer for article detail pages.
 *
 * Two rows (SUG-88):
 *   Filed under — taxonomy chips; first chip receives pink rubric (featured).
 *   Status      — single status chip with rule-dot + meta date string.
 *
 * Only renders when at least one of tags, categories, or status is present.
 */
import { Chip } from '../design-system'
import { getCanonicalPath } from '../lib/routes'
import styles from './ArticleColophon.module.css'

function formatDateShort(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const STATUS_LABELS = {
  exploring:       'Exploring',
  validated:       'Validated',
  operationalized: 'Operationalized',
  evergreen:       'Evergreen',
  deprecated:      'Deprecated',
  active:          'Active',
  draft:           'Draft',
}

export default function ArticleColophon({ tags, categories, status, publishedAt }) {
  // Filed under: categories first, then tags — first chip in the combined list is featured
  const filedChips = [
    ...(categories ?? []).map((c) => ({ _id: c._id, name: c.name, slug: c.slug, docType: 'category' })),
    ...(tags ?? []).map((t) => ({ _id: t._id, name: t.name, slug: t.slug, docType: 'tag' })),
  ]

  const statusKey = status?.toLowerCase().replace(/[\s_]+/g, '-')
  const statusLabel = statusKey ? (STATUS_LABELS[statusKey] ?? status) : null
  const dateLabel = formatDateShort(publishedAt)

  if (!filedChips.length && !statusLabel) return null

  return (
    <div className={styles.colophon}>
      {filedChips.length > 0 && (
        <div className={styles.row}>
          <span className={styles.rowLabel}>Filed under</span>
          <ul className={styles.chipList}>
            {filedChips.map((chip, i) => (
              <li key={chip._id}>
                <Chip
                  variant="tag"
                  featured={i === 0}
                  label={chip.name}
                  href={chip.slug ? getCanonicalPath({ docType: chip.docType, slug: chip.slug }) : undefined}
                  size="sm"
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {statusLabel && (
        <div className={styles.row}>
          <span className={styles.rowLabel}>Status</span>
          <div className={styles.statusRow}>
            <Chip variant="status" status={statusKey} size="sm">
              {statusLabel}
            </Chip>
            {dateLabel && <span className={styles.dateMeta}>{dateLabel}</span>}
          </div>
        </div>
      )}
    </div>
  )
}
