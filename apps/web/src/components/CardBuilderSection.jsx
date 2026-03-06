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
 */
import { PortableText } from '@portabletext/react'
import { urlFor } from '../lib/sanity'
import { getCanonicalPath } from '../lib/routes'
import { Card, CitationNote, CitationZone } from '../design-system'
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
  },
}

/**
 * Resolve the card's primary href from its titleLink field.
 * Internal links use getCanonicalPath; external links pass through.
 */
function resolveHref(titleLink) {
  if (!titleLink) return undefined

  if (titleLink.type === 'internal' && titleLink.internalUrl && titleLink.internalType) {
    return getCanonicalPath({
      docType: titleLink.internalType,
      slug: titleLink.internalUrl,
    })
  }

  if (titleLink.type === 'external' && titleLink.externalUrl) {
    return titleLink.externalUrl
  }

  return undefined
}

/**
 * Map tag references → chip props with navigation hrefs.
 */
function mapTags(tags) {
  if (!tags?.length) return undefined
  return tags
    .filter((t) => t.title && t.slug?.current)
    .map((t) => ({
      label: t.title,
      href: getCanonicalPath({ docType: 'tag', slug: t.slug.current }),
    }))
}

/**
 * Render a single card from cardBuilderItem data.
 * Wraps the Card in a div with a data-image-effect attribute so
 * CSS can target the thumbnail <img> for greyscale/overlay effects.
 */
function BuilderCard({ card }) {
  const href = resolveHref(card.titleLink)
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

        {/* Citation footer */}
        {card.citation?.text && (
          <CitationZone>
            <CitationNote index={1}>
              {card.citation.url ? (
                <a
                  href={card.citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.citationLink}
                  aria-label={card.citation.label || card.citation.text}
                >
                  {card.citation.text}
                </a>
              ) : (
                card.citation.text
              )}
            </CitationNote>
          </CitationZone>
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

  const layoutClass = layout === 'list' ? styles.list : styles.grid

  return (
    <section className={styles.section}>
      {heading && <h2 className={styles.heading}>{heading}</h2>}
      <div className={layoutClass}>
        {cards.map((card, index) => (
          <BuilderCard key={card._key || index} card={card} />
        ))}
      </div>
    </section>
  )
}
