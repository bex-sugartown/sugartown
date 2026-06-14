/**
 * ContentList — app adapter that maps content items to the DS List (register).
 *
 * The DS List/ListItem primitive is content-agnostic; this adapter owns the
 * content concerns: which field becomes the gutter tag (node → status, else
 * category), the status→dot-colour map, date formatting, and href construction
 * via getCanonicalPath (URL Authority Rule). Replaces the old card-as-list-row
 * (ContentCard variant="listing") in list mode.
 *
 * SUG-167.
 */
import { List } from '../design-system'
import { getCanonicalPath } from '../lib/routes'
import styles from './ContentList.module.css'

// Real node status enum (apps/studio/schemas/documents/node.ts) — no `active`.
const STATUS_LABELS = {
  exploring: 'Exploring',
  validated: 'Validated',
  operationalized: 'Operationalized',
  deprecated: 'Deprecated',
  evergreen: 'Evergreen',
}

// Pre-formatted ledger date, e.g. "28 Apr 2026".
function formatDate(iso) {
  if (!iso) return undefined
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return undefined
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function toRow(item, fallbackDocType) {
  const docType = fallbackDocType ?? item._type
  const status = item.status?.toLowerCase()
  // Node rows show status (+ dot); others show their first category. The type
  // check honours the passed docType (entity sections) or the item's own _type
  // (mixed archives). Category projections alias name↔title across queries.
  const isNode = docType === 'node' || item._type === 'node'
  const useStatus = isNode && status && STATUS_LABELS[status]
  const cat = item.categories?.[0]
  const tag = useStatus ? STATUS_LABELS[status] : (cat?.name ?? cat?.title)
  return {
    key: item._id,
    tag,
    title: item.title,
    date: formatDate(item.publishedAt),
    href: getCanonicalPath({ docType, slug: item.slug }),
    leading: useStatus ? <span className={styles.statusDot} data-status={status} /> : null,
  }
}

export default function ContentList({ items = [], docType, title, count }) {
  const rows = items.map((item) => toRow(item, docType))
  return <List variant="register" items={rows} title={title} count={count} />
}
