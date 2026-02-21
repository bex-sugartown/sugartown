import { urlFor } from '../lib/sanity'
import { PortableText } from '@portabletext/react'
import { Button } from '../design-system'
import styles from './PageSections.module.css'

// Portable Text components for text sections
const portableTextComponents = {
  block: {
    h2: ({ children }) => <h2 className={styles.h2}>{children}</h2>,
    h3: ({ children }) => <h3 className={styles.h3}>{children}</h3>,
    h4: ({ children }) => <h4 className={styles.h4}>{children}</h4>,
    blockquote: ({ children }) => (
      <blockquote className={styles.blockquote}>{children}</blockquote>
    ),
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
    code: ({ children }) => <code className={styles.code}>{children}</code>,
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
  },
}

// Hero Section Component
function HeroSection({ section }) {
  const { heading, subheading, backgroundImage, ctas } = section

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

  return (
    <section className={styles.heroSection} style={backgroundStyles}>
      <div className={styles.heroContainer}>
        <div className={styles.heroContent}>
          {heading && <h1 className={styles.heroHeading}>{heading}</h1>}
          {subheading && <p className={styles.heroSubheading}>{subheading}</p>}
          {(primary || secondary) && (
            <div className={styles.heroActions}>
              {primary && (
                <Button
                  variant="primary"
                  href={primary.url}
                  target={primary.openInNewTab ? '_blank' : undefined}
                  rel={primary.openInNewTab ? 'noreferrer' : undefined}
                >
                  {primary.label}
                </Button>
              )}
              {secondary && (
                <Button
                  variant="secondary"
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
              variant={button.style || 'primary'}
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
export default function PageSections({ sections }) {
  if (!sections || sections.length === 0) return null

  return (
    <>
      {sections.map((section) => {
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
          default:
            console.warn(`Unknown section type: ${section._type}`)
            return null
        }
      })}
    </>
  )
}
