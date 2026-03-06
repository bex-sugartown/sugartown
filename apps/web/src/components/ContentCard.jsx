/**
 * ContentCard — shared listing card for archive grids and taxonomy detail pages.
 *
 * Maps Sanity content items to the DS Card visual primitive.
 * Handles: docType derivation, SPA linking (via Card's href + <Link>), status/evolution
 * badges, taxonomy-to-structured-prop mapping, excerpt decoding, and docType-specific
 * footer fields.
 *
 * Taxonomy mapping (post EPIC-0158):
 *   - First project  → eyebrow suffix  ("Node · Sugartown CMS")
 *   - First category  → category prop   ("CATEGORY: AI Methodology" above/below title)
 *   - tools[]         → grey tool chips (Card tools prop)
 *   - tags[]          → pink tag chips  (Card tags prop)
 *   - Overflow projects/categories (2nd+) → added to tags[] as chips
 *
 * Usage:
 *   <ContentCard item={item} docType="article" />       // explicit docType
 *   <ContentCard item={item} />                          // derives from item._type
 *   <ContentCard item={item} variant="listing" />        // list display style
 */
import { Card } from '../design-system'
import { getCanonicalPath } from '../lib/routes'
import { decodeHtml } from '../lib/htmlUtils'

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

// Node statuses map to the `evolution` prop; all others to `status`.
// Values must match STATUS_BADGE_CLASS keys in Card.module.css.
const NODE_EVOLUTION_MAP = {
  explored:         'exploring',
  validated:        'validated',
  implemented:      'implemented',
  operationalized:  'operationalized',
  deprecated:       'deprecated',
  evergreen:        'evergreen',
}

// ─── Chip truncation ─────────────────────────────────────────────────────────
// Grid cards cap visible chips per group to keep card height manageable.
// List variant shows all chips — it has the horizontal space.
const MAX_CHIPS_GRID = 3

function truncateChips(chips, max, variant) {
  if (!chips || !chips.length || variant === 'listing') return chips
  if (chips.length <= max) return chips
  const visible = chips.slice(0, max)
  visible.push({ label: `+${chips.length - max}` })
  return visible
}

// ─── ContentCard ─────────────────────────────────────────────────────────────

export default function ContentCard({
  item,
  docType: docTypeProp,
  variant = 'default',
  showExcerpt = true,
  showHeroImage = true,
  imageOverride = null,
}) {
  const docType   = docTypeProp ?? DOC_TYPE_MAP[item._type] ?? item._type
  const path      = getCanonicalPath({ docType, slug: item.slug })
  const typeLabel = CONTENT_TYPE_LABELS[docType]
  const isNode    = docType === 'node'

  // ── Status → evolution (nodes) or status (articles / case studies) ──
  const rawStatus = item.status?.toLowerCase()
  let statusProp = undefined
  let evolutionProp = undefined

  if (rawStatus) {
    if (isNode) {
      evolutionProp = NODE_EVOLUTION_MAP[rawStatus] ?? rawStatus
    } else {
      statusProp = rawStatus
    }
  }

  // ── Thumbnail URL — imageOverride takes precedence ──
  const thumbnailUrl = showHeroImage
    ? (imageOverride?.asset?.url ?? item.heroImageUrl ?? item.heroImage?.asset?.url ?? null)
    : null

  // ── Eyebrow — content type label + first project name ──
  const firstProject = item.projects?.[0]
  const eyebrow = firstProject
    ? `${typeLabel} · ${firstProject.name}`
    : typeLabel

  // ── Category — first category promoted to structured label ──
  const firstCat = item.categories?.[0]
  const categoryProp = firstCat
    ? { label: firstCat.name, href: getCanonicalPath({ docType: 'category', slug: firstCat.slug }) }
    : undefined

  // ── Tools — string array → grey chip objects ──
  const toolChips = item.tools?.length
    ? item.tools.map((t) => ({ label: t }))
    : undefined

  // ── Tags — actual tags + overflow projects/categories (2nd+) ──
  const tagChips = []
  // Remaining projects (2nd, 3rd, etc.) stay as chips
  if (item.projects?.length > 1) {
    for (const p of item.projects.slice(1)) {
      tagChips.push({
        label: p.name,
        href: getCanonicalPath({ docType: 'project', slug: p.slug }),
        colorHex: p.colorHex || undefined,
      })
    }
  }
  // Remaining categories (2nd, 3rd, etc.) stay as chips
  if (item.categories?.length > 1) {
    for (const c of item.categories.slice(1)) {
      tagChips.push({
        label: c.name,
        href: getCanonicalPath({ docType: 'category', slug: c.slug }),
        colorHex: c.colorHex || undefined,
      })
    }
  }
  // All actual tags
  if (item.tags?.length) {
    for (const t of item.tags) {
      tagChips.push({
        label: t.name,
        href: getCanonicalPath({ docType: 'tag', slug: t.slug }),
      })
    }
  }

  // ── Excerpt — decoded HTML entities ──
  const excerptText = showExcerpt && item.excerpt
    ? decodeHtml(item.excerpt)
    : undefined

  // ── Truncate chip arrays for grid view ──
  const toolsDisplay = truncateChips(toolChips, MAX_CHIPS_GRID, variant)
  const tagsDisplay = truncateChips(
    tagChips.length > 0 ? tagChips : undefined,
    MAX_CHIPS_GRID,
    variant
  )

  return (
    <Card
      variant={variant}
      href={path}
      eyebrow={eyebrow}
      category={categoryProp}
      title={item.title}
      status={statusProp}
      evolution={evolutionProp}
      excerpt={excerptText}
      thumbnailUrl={thumbnailUrl}
      thumbnailAlt={item.heroImageAlt ?? ''}
      tools={toolsDisplay}
      tags={tagsDisplay}
      date={item.publishedAt}
      aiTool={isNode && item.aiTool ? item.aiTool : undefined}
    />
  )
}
