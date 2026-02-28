/**
 * ContentCard — shared listing card for archive grids and taxonomy detail pages.
 *
 * Maps Sanity content items to the DS Card visual primitive (variant="listing").
 * Handles: docType derivation, react-router linking, status badges, taxonomy chips,
 * excerpt decoding, and docType-specific meta lines.
 *
 * Replaces the inline ItemCard functions that were previously duplicated in
 * ArchivePage.jsx and TaxonomyDetailPage.jsx.
 *
 * Usage:
 *   <ContentCard item={item} docType="article" />       // explicit docType
 *   <ContentCard item={item} />                          // derives from item._type
 */
import { Link } from 'react-router-dom'
import { Card } from '../design-system'
import { getCanonicalPath } from '../lib/routes'
import { decodeHtml } from '../lib/htmlUtils'
import TaxonomyChips from './TaxonomyChips'
import styles from './ContentCard.module.css'

// ─── Shared constants ────────────────────────────────────────────────────────

// Maps Sanity _type → docType key for getCanonicalPath()
const DOC_TYPE_MAP = {
  article:   'article',
  caseStudy: 'caseStudy',
  node:      'node',
}

// Human-readable eyebrow labels per content type
const CONTENT_TYPE_LABELS = {
  article:   'Article',
  node:      'Node',
  caseStudy: 'Case Study',
}

// Status badge display labels — union of all values across content types
const STATUS_DISPLAY = {
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
    month: 'short',
    day: 'numeric',
  })
}

// ─── ContentCard ─────────────────────────────────────────────────────────────

export default function ContentCard({ item, docType: docTypeProp, showExcerpt = true, showHeroImage = true, imageOverride = null }) {
  const docType   = docTypeProp ?? DOC_TYPE_MAP[item._type] ?? item._type
  const path      = getCanonicalPath({ docType, slug: item.slug })
  const typeLabel = CONTENT_TYPE_LABELS[docType]
  const statusKey = item.status?.toLowerCase().replace(/[\s_]+/g, '-')

  // ── Eyebrow: type label + optional status badge ──
  const eyebrow = (
    <>
      {typeLabel && <span>{typeLabel}</span>}
      {statusKey && (
        <span className={styles.statusBadge} data-status={statusKey}>
          {STATUS_DISPLAY[statusKey] ?? item.status}
        </span>
      )}
    </>
  )

  // ── Meta line: docType-specific fields + date ──
  const metaParts = []
  if (docType === 'node' && item.aiTool) metaParts.push(item.aiTool)
  if (docType === 'caseStudy' && item.client) metaParts.push(item.client)
  if (docType === 'caseStudy' && item.role) metaParts.push(item.role)
  if (item.publishedAt) metaParts.push(formatDate(item.publishedAt))
  const metaText = metaParts.filter(Boolean).join(' · ')

  // Resolve card image: imageOverride takes precedence over per-item heroImage
  const cardImage = imageOverride ?? item.heroImage ?? null

  return (
    <Card
      as={Link}
      to={path}
      variant="listing"
      eyebrow={eyebrow}
      title={item.title}
      footer={
        <div className={styles.footer}>
          <TaxonomyChips
            categories={item.categories}
            tags={item.tags}
            projects={item.projects}
            size="sm"
          />
          {metaText && <p className={styles.meta}>{metaText}</p>}
        </div>
      }
    >
      {showHeroImage && cardImage && (
        <div className={styles.cardImage}>
          <img
            src={cardImage.asset?.url}
            alt={cardImage.alt ?? ''}
            className={styles.cardImageImg}
          />
        </div>
      )}
      {showExcerpt && item.excerpt && <p>{decodeHtml(item.excerpt)}</p>}
    </Card>
  )
}
