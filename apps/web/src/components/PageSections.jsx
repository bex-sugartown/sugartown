import { urlFor } from '../lib/sanity'
import { PortableText } from '@portabletext/react'
import { Button, Blockquote, CodeBlock, InlineCode, Table, TableWrap, Callout } from '../design-system'
import CardBuilderSection from './CardBuilderSection'
import styles from './PageSections.module.css'

// Portable Text components for text sections
const portableTextComponents = {
  block: {
    h2: ({ children }) => <h2 className={styles.h2}>{children}</h2>,
    h3: ({ children }) => <h3 className={styles.h3}>{children}</h3>,
    h4: ({ children }) => <h4 className={styles.h4}>{children}</h4>,
    blockquote: ({ children }) => <Blockquote>{children}</Blockquote>,
  },
  marks: {
    link: ({ value, children }) => {
      const target = value?.href?.startsWith('http') ? '_blank' : undefined
      const rel = target === '_blank' ? 'noopener noreferrer' : undefined
      return (
        <a href={value?.href} target={target} rel={rel} className={styles.link}>
          {children}
        </a>
      )
    },
    strong: ({ children }) => <strong className={styles.strong}>{children}</strong>,
    em: ({ children }) => <em className={styles.em}>{children}</em>,
    code: ({ children }) => <InlineCode>{children}</InlineCode>,
  },
  types: {
    // richImage blocks inline in textSection.content
    richImage: ({ value }) => {
      if (!value?.asset) return null
      return (
        <figure className={styles.inlineImage}>
          <img
            src={urlFor(value.asset).width(900).quality(85).url()}
            alt={value.alt ?? ''}
            className={styles.inlineImageImg}
          />
          {value.caption && (
            <figcaption className={styles.inlineImageCaption}>{value.caption}</figcaption>
          )}
        </figure>
      )
    },
    // Code blocks from Sanity's code input plugin — DS CodeBlock with Prism highlighting
    code: ({ value }) => {
      if (!value?.code) return null
      return (
        <CodeBlock
          code={value.code}
          language={value.language ?? undefined}
          filename={value.filename ?? undefined}
        />
      )
    },
    // Table blocks (EPIC-0163) — DS Table component with semantic HTML
    tableBlock: ({ value }) => {
      if (!value?.rows?.length) return null
      const { variant = 'default', hasHeaderRow = true, rows } = value
      const headerRow = hasHeaderRow ? rows[0] : null
      const bodyRows = hasHeaderRow ? rows.slice(1) : rows
      return (
        <TableWrap>
          <Table variant={variant}>
            {headerRow && (
              <thead>
                <tr>
                  {headerRow.cells?.map((cell, i) => (
                    <th key={i}>{cell}</th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {bodyRows.map((row, ri) => (
                <tr key={row._key ?? ri}>
                  {row.cells?.map((cell, ci) => (
                    <td key={ci}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrap>
      )
    },
  },
}

// Map Sanity CTA style values to DS Button variant props
// Schema stores 'ghost' but the Button component expects 'tertiary'
const CTA_STYLE_TO_VARIANT = { primary: 'primary', secondary: 'secondary', ghost: 'tertiary' }
const mapCtaStyle = (style, fallback = 'primary') =>
  CTA_STYLE_TO_VARIANT[style] || fallback

// Hero Section Component
function HeroSection({ section }) {
  const { heading, subheading, backgroundImage, ctas, imageWidth } = section

  const backgroundStyles = {}
  const hasImage = backgroundImage?.asset

  if (hasImage) {
    const x = backgroundImage.hotspot?.x ?? 0.5
    const y = backgroundImage.hotspot?.y ?? 0.5

    backgroundStyles.backgroundImage = `url(${urlFor(backgroundImage.asset).width(1920).quality(90).url()})`
    backgroundStyles.backgroundPosition = `${Math.round(x * 100)}% ${Math.round(y * 100)}%`
  }

  const primary = ctas?.[0]
  const secondary = ctas?.[1]

  const widthClass = imageWidth === 'full-width'
    ? styles.heroFullWidth
    : imageWidth === 'content-width'
      ? styles.heroContentWidth
      : ''

  const sectionClasses = [
    styles.heroSection,
    widthClass,
    hasImage ? styles.heroWithImage : '',
  ].filter(Boolean).join(' ')

  return (
    <section className={sectionClasses} style={backgroundStyles}>
      <div className={styles.heroContainer}>
        <div className={styles.heroContent}>
          {heading && <h1 className={styles.heroHeading}>{heading}</h1>}
          {subheading && <p className={styles.heroSubheading}>{subheading}</p>}
          {(primary || secondary) && (
            <div className={styles.heroActions}>
              {primary && (
                <Button
                  variant={mapCtaStyle(primary.style, 'primary')}
                  href={primary.url}
                  target={primary.openInNewTab ? '_blank' : undefined}
                  rel={primary.openInNewTab ? 'noreferrer' : undefined}
                >
                  {primary.label}
                </Button>
              )}
              {secondary && (
                <Button
                  variant={mapCtaStyle(secondary.style, 'secondary')}
                  href={secondary.url}
                  target={secondary.openInNewTab ? '_blank' : undefined}
                  rel={secondary.openInNewTab ? 'noreferrer' : undefined}
                >
                  {secondary.label}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// Text Section Component
function TextSection({ section }) {
  const { heading, content } = section

  return (
    <section className={styles.textSection}>
      {heading && <h2 className={styles.sectionHeading}>{heading}</h2>}
      {content && (
        <div className={styles.textContent}>
          <PortableText value={content} components={portableTextComponents} />
        </div>
      )}
    </section>
  )
}

// Image Gallery Section Component
function ImageGallerySection({ section }) {
  const { layout, images } = section

  if (!images || images.length === 0) return null

  return (
    <section className={`${styles.imageGallery} ${styles[`gallery-${layout}`]}`}>
      {images.map((image, index) => (
        <figure key={index} className={styles.galleryItem}>
          {image.asset && (
            <img
              src={urlFor(image.asset).width(800).quality(85).url()}
              alt={image.alt || ''}
              className={styles.galleryImage}
            />
          )}
          {image.caption && (
            <figcaption className={styles.galleryCaption}>{image.caption}</figcaption>
          )}
        </figure>
      ))}
    </section>
  )
}

// HTML Section Component
// htmlSection — renders raw HTML as-is; no sanitization applied
function HtmlSection({ section }) {
  if (!section.html) return null
  return (
    <div
      className="st-html-section"
      dangerouslySetInnerHTML={{ __html: section.html }}
    />
  )
}

// Callout Section Component (EPIC-0164)
function CalloutSection({ section }) {
  if (!section.body) return null
  return (
    <Callout variant={section.variant} title={section.title}>
      <p style={{ whiteSpace: 'pre-line' }}>{section.body}</p>
    </Callout>
  )
}

// CTA Section Component
function CTASection({ section }) {
  const { heading, description, buttons } = section

  return (
    <section className={styles.ctaSection}>
      {heading && <h2 className={styles.ctaHeading}>{heading}</h2>}
      {description && <p className={styles.ctaDescription}>{description}</p>}
      {buttons && buttons.length > 0 && (
        <div className={styles.ctaButtons}>
          {buttons.map((button, index) => (
            <Button
              key={index}
              variant={mapCtaStyle(button.style)}
              href={button.link?.url}
              target={button.link?.openInNewTab ? '_blank' : undefined}
              rel={button.link?.openInNewTab ? 'noreferrer' : undefined}
            >
              {button.text}
            </Button>
          ))}
        </div>
      )}
    </section>
  )
}

// Main Section Renderer
// context="detail" — sections inherit containment from parent .detailPage (no own max-width / padding-inline)
// context="full"   — sections self-contain (default, used on standalone pages)
export default function PageSections({ sections, context = 'full' }) {
  if (!sections || sections.length === 0) return null

  const content = sections.map((section) => {
    const key = section._key

    switch (section._type) {
      case 'heroSection':
      case 'hero':
        return <HeroSection key={key} section={section} />
      case 'textSection':
        return <TextSection key={key} section={section} />
      case 'imageGallery':
        return <ImageGallerySection key={key} section={section} />
      case 'ctaSection':
        return <CTASection key={key} section={section} />
      case 'htmlSection':
        return <HtmlSection key={key} section={section} />
      case 'cardBuilderSection':
        return <CardBuilderSection key={key} section={section} />
      case 'calloutSection':
        return <CalloutSection key={key} section={section} />
      default:
        console.warn(`Unknown section type: ${section._type}`)
        return null
    }
  })

  if (context === 'detail') {
    return <div className={styles.detailContext}>{content}</div>
  }

  return <>{content}</>
}
