import { useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { urlFor } from '../lib/sanity'
import { isExternalUrl, getLinkProps } from '../lib/linkUtils'
import { PortableText } from '@portabletext/react'
import { Button, Media, Blockquote, CodeBlock, Table, TableWrap, Callout, CitationMarker } from '../design-system'
import { getOverlayStyles, parseOverlay } from '../design-system/components/media/Media'
import CardBuilderSection from './CardBuilderSection'
import ImageLightbox from './ImageLightbox'
import SanityImage from './atoms/SanityImage'
import { LinkAnnotation, DividerBlock } from './portableTextComponents'
import styles from './PageSections.module.css'

// Portable Text components for text sections
const portableTextComponents = {
  block: {
    h1: ({ children }) => <h2 className={styles.h2}>{children}</h2>,
    h2: ({ children }) => <h2 className={styles.h2}>{children}</h2>,
    h3: ({ children }) => <h3 className={styles.h3}>{children}</h3>,
    h4: ({ children }) => <h4 className={styles.h4}>{children}</h4>,
    blockquote: ({ children }) => <Blockquote>{children}</Blockquote>,
  },
  marks: {
    link: ({ value, children }) => (
      <LinkAnnotation value={value} className={styles.link}>{children}</LinkAnnotation>
    ),
    strong: ({ children }) => <strong className={styles.strong}>{children}</strong>,
    em: ({ children }) => <em className={styles.em}>{children}</em>,
    code: ({ children }) => <code>{children}</code>,
    citationRef: ({ value, children }) => (
      <>{children}<CitationMarker index={value?.index || 1} /></>
    ),
  },
  types: {
    // richImage blocks inline in textSection.content
    richImage: ({ value }) => {
      if (!value?.asset) return null
      return (
        <figure className={styles.inlineImage}>
          <SanityImage
            asset={value.asset}
            alt={value.alt ?? ''}
            width={900}
            sizes="(max-width: 768px) 100vw, 900px"
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
    // Divider — horizontal rule between content blocks
    divider: ({ value }) => <DividerBlock value={value} />,
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
// 'ghost' kept for backward compat with existing Sanity docs not yet re-saved
const CTA_STYLE_TO_VARIANT = { primary: 'primary', secondary: 'secondary', tertiary: 'tertiary', ghost: 'tertiary' }
const mapCtaStyle = (style, fallback = 'primary') =>
  CTA_STYLE_TO_VARIANT[style] || fallback

// Hero Section Component
function HeroSection({ section }) {
  const { heading, subheading, eyebrow, imageTreatment, backgroundImage, ctas, imageWidth } = section
  const backgroundStyles = {}
  const hasImage = backgroundImage?.asset

  if (hasImage) {
    const x = backgroundImage.hotspot?.x ?? 0.5
    const y = backgroundImage.hotspot?.y ?? 0.5

    backgroundStyles.backgroundImage = `url(${urlFor(backgroundImage.asset).width(1920).quality(90).url()})`
    backgroundStyles.backgroundPosition = `${Math.round(x * 100)}% ${Math.round(y * 100)}%`
  }

  // Apply image treatment overlay styles (duotone, scrim, color)
  const { parsedType: treatmentType } = parseOverlay(imageTreatment)
  const hasTreatment = treatmentType && treatmentType !== 'none'

  if (hasTreatment && hasImage) {
    const overlayStyles = getOverlayStyles(imageTreatment)
    Object.assign(backgroundStyles, overlayStyles)
  }

  const primary = ctas?.[0]
  const secondary = ctas?.[1]
  const tertiary = ctas?.[2]

  const widthClass = imageWidth === 'full-width'
    ? styles.heroFullWidth
    : imageWidth === 'content-width'
      ? styles.heroContentWidth
      : ''

  const sectionClasses = [
    styles.heroSection,
    widthClass,
    hasImage ? styles.heroWithImage : '',
    hasTreatment ? styles.heroWithTreatment : '',
    treatmentType === 'duotone' ? styles.heroTreatmentDuotone : '',
    treatmentType === 'dark-scrim' ? styles.heroTreatmentScrim : '',
    treatmentType === 'color' ? styles.heroTreatmentColor : '',
  ].filter(Boolean).join(' ')

  return (
    <section className={sectionClasses} style={backgroundStyles}>
      <div className={styles.heroContainer}>
        <div className={styles.heroContent}>
          {eyebrow && <span className={styles.heroEyebrow}>{eyebrow}</span>}
          {heading && <h1 className={styles.heroHeading}>{heading}</h1>}
          {subheading && <p className={styles.heroSubheading}>{subheading}</p>}
          {(primary || secondary || tertiary) && (
            <div className={styles.heroActions}>
              {primary && (
                <Button
                  variant={mapCtaStyle(primary.style, 'primary')}
                  href={primary.url}
                  openInNewTab={primary.openInNewTab}
                >
                  {primary.label}
                </Button>
              )}
              {secondary && (
                <Button
                  variant={mapCtaStyle(secondary.style, 'secondary')}
                  href={secondary.url}
                  openInNewTab={secondary.openInNewTab}
                >
                  {secondary.label}
                </Button>
              )}
              {tertiary && (
                <Button
                  variant={mapCtaStyle(tertiary.style, 'tertiary')}
                  href={tertiary.url}
                  openInNewTab={tertiary.openInNewTab}
                >
                  {tertiary.label}
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

/**
 * Resolves the click target for a gallery image:
 * - If it has a link (linkItem or legacy linkUrl): returns { url, isExternal, openInNewTab }
 * - Otherwise: returns null (image should open lightbox)
 */
function resolveImageLink(image) {
  const url = image.link?.url || image.legacyLinkUrl
  if (!url) return null
  return {
    url,
    isExternal: isExternalUrl(url) || image.link?.openInNewTab,
    openInNewTab: image.link?.openInNewTab ?? false,
  }
}

/**
 * GalleryImage — renders a single image in the gallery.
 * Wraps in <Link> (SPA), <a> (external), or attaches lightbox onClick.
 */
function GalleryImage({ image, index, onLightbox, treatment }) {
  if (!image.asset) return null

  const imgSrc = urlFor(image.asset).width(800).auto('format').url()
  const linkTarget = resolveImageLink(image)

  const mediaEl = (
    <Media
      src={imgSrc}
      alt={image.alt || ''}
      overlay={treatment || image.overlay}
      className={styles.galleryImage}
    />
  )

  const captionOverlay = (image.caption || image.credit) ? (
    <div className={styles.galleryCaptionOverlay}>
      <span className={styles.galleryCaptionText}>
        {image.caption}
        {image.caption && image.credit && ' — '}
        {image.credit && <span className={styles.galleryCreditText}>{image.credit}</span>}
      </span>
    </div>
  ) : null

  if (linkTarget) {
    const { isExternal, linkProps } = getLinkProps(linkTarget.url, linkTarget.openInNewTab)
    if (isExternal) {
      return (
        <figure className={`${styles.galleryItem} ${styles.galleryLinked}`}>
          <a {...linkProps}>{mediaEl}</a>
          {captionOverlay}
        </figure>
      )
    }
    return (
      <figure className={`${styles.galleryItem} ${styles.galleryLinked}`}>
        <Link {...linkProps}>{mediaEl}</Link>
        {captionOverlay}
      </figure>
    )
  }

  // No link — lightbox on click
  return (
    <figure
      className={`${styles.galleryItem} ${styles.galleryLightbox}`}
      onClick={() => onLightbox(index)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onLightbox(index) } }}
    >
      {mediaEl}
      {captionOverlay}
    </figure>
  )
}

/**
 * CarouselDots — dot indicators tracking the active slide via IntersectionObserver.
 */
function CarouselDots({ count, activeIndex, onDotClick }) {
  return (
    <div className={styles.carouselDots} role="tablist" aria-label="Gallery slides">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          className={`${styles.carouselDot} ${i === activeIndex ? styles.carouselDotActive : ''}`}
          onClick={() => onDotClick(i)}
          role="tab"
          aria-selected={i === activeIndex}
          aria-label={`Slide ${i + 1}`}
        />
      ))}
    </div>
  )
}

// Image Gallery Section Component
function ImageGallerySection({ section }) {
  const { layout, images, treatment } = section
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const [activeSlide, setActiveSlide] = useState(0)
  const scrollRef = useRef(null)
  const slideRefs = useRef([])

  if (!images || images.length === 0) return null

  const isCarousel = layout === 'carousel'

  // IntersectionObserver for carousel dot tracking
  useEffect(() => {
    if (!isCarousel || !scrollRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = slideRefs.current.indexOf(entry.target)
            if (idx >= 0) setActiveSlide(idx)
          }
        })
      },
      { root: scrollRef.current, threshold: 0.6 }
    )

    slideRefs.current.forEach((el) => { if (el) observer.observe(el) })
    return () => observer.disconnect()
  }, [isCarousel, images.length])

  function scrollToSlide(index) {
    const target = slideRefs.current[index]
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }

  function scrollPrev() {
    const next = (activeSlide - 1 + images.length) % images.length
    scrollToSlide(next)
  }

  function scrollNext() {
    const next = (activeSlide + 1) % images.length
    scrollToSlide(next)
  }

  const galleryClassName = `${styles.imageGallery} ${styles[`gallery-${layout}`] || ''}`

  // Images that can open the lightbox (those without links)
  const lightboxImages = images.filter((img) => !resolveImageLink(img))

  return (
    <>
      <section className={galleryClassName}>
        {isCarousel && images.length > 1 && (
          <button className={`${styles.carouselArrow} ${styles.carouselPrev}`} onClick={scrollPrev} aria-label="Previous slide">‹</button>
        )}

        {isCarousel ? (
          <div className={styles.carouselTrack} ref={scrollRef}>
            {images.map((image, index) => (
              <div
                key={index}
                ref={(el) => (slideRefs.current[index] = el)}
                className={styles.carouselSlide}
              >
                <GalleryImage
                  image={image}
                  index={lightboxImages.indexOf(image)}
                  onLightbox={(lbIdx) => setLightboxIndex(lbIdx >= 0 ? lbIdx : 0)}
                  treatment={treatment}
                />
              </div>
            ))}
          </div>
        ) : (
          images.map((image, index) => (
            <GalleryImage
              key={index}
              image={image}
              index={lightboxImages.indexOf(image)}
              onLightbox={(lbIdx) => setLightboxIndex(lbIdx >= 0 ? lbIdx : 0)}
              treatment={treatment}
            />
          ))
        )}

        {isCarousel && images.length > 1 && (
          <>
            <button className={`${styles.carouselArrow} ${styles.carouselNext}`} onClick={scrollNext} aria-label="Next slide">›</button>
            <CarouselDots count={images.length} activeIndex={activeSlide} onDotClick={scrollToSlide} />
          </>
        )}
      </section>

      {lightboxIndex !== null && (
        <ImageLightbox
          images={lightboxImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  )
}

// Mermaid Diagram Section Component (SUG-13)
// mermaidSection — renders Mermaid markup as themed SVG via dynamic import
function MermaidDiagram({ section }) {
  const containerRef = useRef(null)
  const [error, setError] = useState(null)
  const [rendering, setRendering] = useState(false)
  const renderIdRef = useRef(`mermaid-${section._key || Math.random().toString(36).slice(2)}`)

  const renderDiagram = useCallback(async () => {
    if (!section.code || !containerRef.current) return
    setRendering(true)
    setError(null)
    try {
      const mermaid = (await import('mermaid')).default
      const theme = document.documentElement.getAttribute('data-theme')
      const isDark = theme !== 'light'
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: isDark ? 'dark' : 'neutral',
        themeVariables: isDark
          ? {
              primaryColor: '#1e1b4b',
              primaryBorderColor: '#FF247D',
              lineColor: '#FF247D',
              textColor: '#e4dded',
              mainBkg: '#1e1b4b',
              nodeBorder: '#FF247D',
              fontFamily: 'Fira Sans, system-ui, sans-serif',
            }
          : {
              primaryColor: '#F5F6F8',
              primaryBorderColor: '#0D1226',
              lineColor: '#0D1226',
              textColor: '#0D1226',
              mainBkg: '#F5F6F8',
              nodeBorder: '#0D1226',
              fontFamily: 'Fira Sans, system-ui, sans-serif',
            },
      })
      // Generate unique ID for each render to avoid collisions
      const renderId = `${renderIdRef.current}-${Date.now()}`
      const { svg } = await mermaid.render(renderId, section.code)
      if (containerRef.current) {
        containerRef.current.innerHTML = svg
      }
    } catch (err) {
      setError(err.message || 'Failed to render diagram')
    } finally {
      setRendering(false)
    }
  }, [section.code])

  useEffect(() => {
    renderDiagram()
    // Re-render on theme change
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.attributeName === 'data-theme') {
          renderDiagram()
          break
        }
      }
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [renderDiagram])

  if (!section.code) return null

  return (
    <section className={styles.mermaidSection}>
      {error ? (
        <pre className={styles.mermaidError}>{error}</pre>
      ) : (
        <div
          ref={containerRef}
          className={styles.mermaidContainer}
          aria-label={section.caption || 'Diagram'}
          role="img"
        />
      )}
      {section.caption && (
        <p className={styles.mermaidCaption}>{section.caption}</p>
      )}
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

// Callout Section Component (EPIC-0164, upgraded to Portable Text in EPIC-0173)
function CalloutSection({ section }) {
  if (!section.body) return null
  // body can be Portable Text (array) or legacy plain text (string)
  const isPortableText = Array.isArray(section.body)
  return (
    <div className={styles.calloutSection}>
      <Callout variant={section.variant} title={section.title}>
        {isPortableText ? (
          <PortableText value={section.body} components={portableTextComponents} />
        ) : (
          <p style={{ whiteSpace: 'pre-line' }}>{section.body}</p>
        )}
      </Callout>
    </div>
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
              href={button.url}
              openInNewTab={button.openInNewTab}
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
      case 'mermaidSection':
        return <MermaidDiagram key={key} section={section} />
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
