/**
 * CardBuilderSection — EPIC-0160
 *
 * Renders an editor-assembled card grid (or list) from `cardBuilderSection` data.
 * Each card maps cardBuilderItem fields to the web Card adapter props.
 *
 * Image overlays: mediaOverlay treatments (duotone, dark scrim, colour overlay)
 * Title links: internal (via getCanonicalPath) or external URL
 * Citation: rendered as footnote in card footer (CitationNote from DS)
 * Tags: chip links navigating to /tags/:slug
 *
 * Grid layout: max 3 columns, column count derived from card count.
 *   1 card → 1 col, 2 or 4 cards → 2 cols, 3/5/6+ → 3 cols.
 */
import { PortableText } from '@portabletext/react'
import { urlFor } from '../lib/sanity'
import { getCanonicalPath } from '../lib/routes'
import { Card, Chip, CitationMarker, CitationNote, CitationZone } from '../design-system'
import { LinkAnnotation } from './portableTextComponents'
import { getOverlayStyles, parseOverlay, ensureSvgFilter } from '../design-system/components/media/Media'
import styles from './CardBuilderSection.module.css'

/**
 * Pre-scan portable text blocks for citationRef mark definitions.
 * Returns a Map<sanityIndex, cardLocalIndex> so body markers use
 * card-local numbering (1..N) regardless of what the editor stored.
 */
function buildCitationIndexMap(body) {
  const map = new Map()
  let localIndex = 0
  if (!body) return map
  for (const block of body) {
    if (!block.markDefs) continue
    for (const def of block.markDefs) {
      if (def._type === 'citationRef' && def.index != null && !map.has(def.index)) {
        localIndex++
        map.set(def.index, localIndex)
      }
    }
  }
  return map
}

/**
 * Minimal portable text renderer for card body — styled text only, no images.
 * Factory function: accepts a citation index map so body markers use
 * card-local numbering that matches the footnote numbering in the footer.
 */
function makeBodyComponents(citationIndexMap) {
  return {
    block: {
      normal: ({ children }) => <p className={styles.bodyParagraph}>{children}</p>,
    },
    marks: {
      strong: ({ children }) => <strong>{children}</strong>,
      em: ({ children }) => <em>{children}</em>,
      code: ({ children }) => <code>{children}</code>,
      link: ({ value, children }) => (
        <LinkAnnotation value={value} className={styles.bodyLink}>{children}</LinkAnnotation>
      ),
      citationRef: ({ value, children }) => {
        const localIndex = citationIndexMap.get(value?.index) ?? value?.index ?? 1
        return (
          <>
            {children}
            <CitationMarker index={localIndex} />
          </>
        )
      },
    },
  }
}

/**
 * Resolve href from a linkItem-shaped object.
 * Used for both titleLink and citation links (same GROQ projection shape).
 * Internal links use getCanonicalPath; external links pass through.
 */
function resolveLinkHref(link) {
  if (!link) return undefined

  if (link.type === 'internal' && link.internalUrl && link.internalType) {
    return getCanonicalPath({
      docType: link.internalType,
      slug: link.internalUrl,
    })
  }

  if (link.type === 'external' && link.externalUrl) {
    return link.externalUrl
  }

  return undefined
}

/**
 * Map tag/tool references → chip props with navigation hrefs.
 */
function mapTaxonomyRefs(refs, docType) {
  if (!refs?.length) return undefined
  return refs
    .filter((r) => r && r.title && r.slug?.current)
    .map((r) => ({
      label: r.title,
      href: getCanonicalPath({ docType, slug: r.slug.current }),
    }))
}

/**
 * Compute grid column count from card count.
 * 1 → 1 col, 2 or 4 → 2 cols, 3/5/6+ → 3 cols.
 */
function getGridCols(count) {
  if (count === 1) return 1
  if (count === 2 || count === 4) return 2
  return 3
}

/**
 * Render a single card from cardBuilderItem data.
 * Wraps the Card in a div with a data-image-effect attribute so
 * CSS can target the thumbnail <img> for greyscale/overlay effects.
 */
function BuilderCard({ card, variant }) {
  const href = resolveLinkHref(card.titleLink)
  const tags = mapTaxonomyRefs(card.tags, 'tag')
  const tools = mapTaxonomyRefs(card.tools, 'tool')
  const thumbnailUrl = card.image?.asset
    ? urlFor(card.image.asset).width(600).quality(85).url()
    : undefined

  // Build card-local citation index map so body markers match footnote numbering
  const citationIndexMap = buildCitationIndexMap(card.body)
  const cardBodyComponents = makeBodyComponents(citationIndexMap)

  const { parsedType: overlayType, preset: overlayPreset, showPanel } = parseOverlay(card.overlay)
  const hasOverlay = overlayType && overlayType !== 'none'
  const isExtreme = overlayType === 'duotone' && overlayPreset === 'extreme'

  // Overlay classes + styles target the thumbnail, not the whole card
  const thumbOverlayClass = [
    (hasOverlay || showPanel) && styles.cardOverlay,
    overlayType === 'duotone' && styles.cardDuotone,
    isExtreme && styles.cardDuotoneExtreme,
    overlayType === 'dark-scrim' && styles.cardDarkScrim,
    overlayType === 'color' && styles.cardColorOverlay,
    overlayType === 'greyscale' && styles.cardGreyscale,
    showPanel && styles.cardPanel,
  ]
    .filter(Boolean)
    .join(' ') || undefined

  const thumbOverlayStyles = hasOverlay ? getOverlayStyles(card.overlay) : undefined

  // Hotspot → object-position on the thumbnail image
  const hotspot = card.image?.hotspot
  const thumbStyle = {
    ...thumbOverlayStyles,
    ...(hotspot ? { '--st-card-thumb-position': `${Math.round(hotspot.x * 100)}% ${Math.round(hotspot.y * 100)}%` } : {}),
  }

  if (isExtreme) ensureSvgFilter()

  // Build footer content: citations + tools + tags rendered beneath the dashed line
  const hasFooterContent = card.citations?.length > 0 || tools?.length > 0 || tags?.length > 0
  const footerContent = hasFooterContent ? (
    <div className={styles.cardFooterContent}>
      {card.citations?.length > 0 && (
        <div className={styles.citationFooter}>
          <CitationZone>
            {card.citations.map((cite, i) => {
              const citeHref = resolveLinkHref(cite.link)
              const displayLabel = cite.linkLabel || cite.link?.internalTitle || cite.text
              return (
                <CitationNote key={i} index={i + 1}>
                  {cite.text && <span className={styles.citationPrefix}>{cite.text} </span>}
                  {citeHref ? (
                    <a
                      href={citeHref}
                      target={cite.link?.type === 'external' ? '_blank' : undefined}
                      rel={cite.link?.type === 'external' ? 'noopener noreferrer' : undefined}
                      className={styles.citationLink}
                      aria-label={displayLabel}
                    >
                      {displayLabel}
                    </a>
                  ) : (
                    displayLabel !== cite.text && displayLabel
                  )}
                </CitationNote>
              )
            })}
          </CitationZone>
        </div>
      )}

      {tools?.length > 0 && (
        <div className={styles.tagRow}>
          {tools.map((tool) => (
            <Chip
              key={tool.label}
              label={tool.label}
              href={tool.href}
              size="sm"
              color="grey"
              className={styles.footerChip}
            />
          ))}
        </div>
      )}

      {tags?.length > 0 && (
        <div className={styles.tagRow}>
          {tags.map((tag) => (
            <Chip
              key={tag.label}
              label={tag.label}
              href={tag.href}
              size="sm"
              className={styles.footerChip}
            />
          ))}
        </div>
      )}
    </div>
  ) : undefined

  return (
    <Card
      variant={variant}
      title={card.title}
      eyebrow={card.eyebrow || undefined}
      categoryPosition={card.categoryPosition || undefined}
      excerpt={card.subtitle || undefined}
      href={href}
      thumbnailUrl={thumbnailUrl}
      thumbnailAlt={card.image?.alt || ''}
      thumbnailClassName={thumbOverlayClass}
      thumbnailStyle={Object.keys(thumbStyle).length ? thumbStyle : undefined}
      footerChildren={footerContent}
    >
      {/* Body portable text */}
      {card.body && (
        <div className={styles.body}>
          <PortableText value={card.body} components={cardBodyComponents} />
        </div>
      )}
    </Card>
  )
}

/**
 * CardBuilderSection — page section renderer.
 * Receives { heading, layout, cards[] } from the GROQ projection.
 */
export default function CardBuilderSection({ section }) {
  const { heading, layout = 'grid', cards } = section

  if (!cards?.length) return null

  const isGrid = layout !== 'list'
  const layoutClass = isGrid ? styles.grid : styles.list
  const gridStyle = isGrid ? { '--grid-cols': getGridCols(cards.length) } : undefined

  return (
    <section className={styles.section} id={section._sectionId}>
      {heading && <h2 className={styles.heading}>{heading}</h2>}
      <div className={layoutClass} style={gridStyle}>
        {cards.map((card, index) => (
          <BuilderCard key={card._key || index} card={card} variant={isGrid ? 'default' : 'listing'} />
        ))}
      </div>
    </section>
  )
}
