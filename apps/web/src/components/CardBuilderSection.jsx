/**
 * CardBuilderSection — EPIC-0160
 *
 * Renders an editor-assembled card grid (or list) from `cardBuilderSection` data.
 * Each card maps cardBuilderItem fields to the web Card adapter props.
 *
 * Image effects: original | greyscale | greyscale-overlay (pink brand tint)
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
import { Card, CitationMarker, CitationNote, CitationZone } from '../design-system'
import styles from './CardBuilderSection.module.css'

// Minimal portable text renderer for card body — styled text only, no images
const bodyComponents = {
  block: {
    normal: ({ children }) => <p className={styles.bodyParagraph}>{children}</p>,
  },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    link: ({ value, children }) => (
      <a
        href={value?.href}
        target={value?.href?.startsWith('http') ? '_blank' : undefined}
        rel={value?.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
        className={styles.bodyLink}
      >
        {children}
      </a>
    ),
    citationRef: ({ value, children }) => (
      <>
        {children}
        <CitationMarker index={value?.index || 1} />
      </>
    ),
  },
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
 * Map tag references → chip props with navigation hrefs.
 */
function mapTags(tags) {
  if (!tags?.length) return undefined
  return tags
    .filter((t) => t && t.title && t.slug?.current)
    .map((t) => ({
      label: t.title,
      href: getCanonicalPath({ docType: 'tag', slug: t.slug.current }),
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
function BuilderCard({ card }) {
  const href = resolveLinkHref(card.titleLink)
  const tags = mapTags(card.tags)
  const thumbnailUrl = card.image?.asset
    ? urlFor(card.image.asset).width(600).quality(85).url()
    : undefined

  const imageEffect = card.imageEffect || 'original'
  const wrapperClass = [
    styles.cardWrap,
    imageEffect === 'greyscale' && styles.effectGreyscale,
    imageEffect === 'greyscale-overlay' && styles.effectGreyscaleOverlay,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={wrapperClass}>
      <Card
        title={card.title}
        eyebrow={card.eyebrow || undefined}
        categoryPosition={card.categoryPosition || undefined}
        excerpt={card.subtitle || undefined}
        href={href}
        thumbnailUrl={thumbnailUrl}
        thumbnailAlt={card.image?.alt || ''}
        tags={tags}
      >
        {/* Body portable text */}
        {card.body && (
          <div className={styles.body}>
            <PortableText value={card.body} components={bodyComponents} />
          </div>
        )}

        {/* Citation footer — margin-top: auto pushes to bottom of card body */}
        {card.citations?.length > 0 && (
          <div className={styles.citationFooter}>
            <CitationZone>
              {card.citations.map((cite, i) => {
                const href = resolveLinkHref(cite.link)
                const displayLabel = cite.linkLabel || cite.link?.internalTitle || cite.text
                return (
                  <CitationNote key={i} index={i + 1}>
                    {cite.text && <span className={styles.citationPrefix}>{cite.text} </span>}
                    {href ? (
                      <a
                        href={href}
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
      </Card>
    </div>
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
    <section className={styles.section}>
      {heading && <h2 className={styles.heading}>{heading}</h2>}
      <div className={layoutClass} style={gridStyle}>
        {cards.map((card, index) => (
          <BuilderCard key={card._key || index} card={card} />
        ))}
      </div>
    </section>
  )
}
