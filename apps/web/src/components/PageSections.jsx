import { useState, useRef, useEffect, useCallback, Children } from 'react'
import { Link } from 'react-router-dom'
import { urlFor } from '../lib/sanity'
import { isExternalUrl, getLinkProps } from '../lib/linkUtils'
import { PortableText } from '@portabletext/react'
import { Button, Media, Blockquote, CodeBlock, Table, TableWrap, Callout, CitationMarker, Accordion } from '../design-system'
import { getOverlayStyles, parseOverlay } from '../design-system/components/media/Media'
import CardBuilderSection from './CardBuilderSection'
import ImageLightbox from './ImageLightbox'
import { LinkAnnotation, DividerBlock } from './portableTextComponents'
import styles from './PageSections.module.css'

/**
 * InlineImage — richImage block in PortableText with lightbox support.
 * Clicks open a full-size lightbox view (no link on the image).
 */
function InlineImage({ value }) {
  const [lightboxOpen, setLightboxOpen] = useState(false)

  if (!value?.asset) return null
  const imgSrc = urlFor(value.asset).width(900).auto('format').url()

  // Pass intrinsic dimensions to Media so the browser can reserve space
  // before the image loads (SUG-63 Phase 1b — prevents CLS from unsized images).
  // GROQ projects asset.asset->metadata.dimensions as `value.dimensions`.
  const { width, height } = value.dimensions ?? {}

  return (
    <>
      <figure
        className={`${styles.inlineImage} ${styles.inlineImageClickable}`}
        onClick={() => setLightboxOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLightboxOpen(true) } }}
        aria-label={`View full size: ${value.alt || 'image'}`}
      >
        <Media
          src={imgSrc}
          alt={value.alt ?? ''}
          overlay={value.overlay}
          className={styles.inlineImageImg}
          width={width}
          height={height}
        />
        {value.caption && (
          <figcaption className={styles.inlineImageCaption}>{value.caption}</figcaption>
        )}
      </figure>
      {lightboxOpen && (
        <ImageLightbox
          images={[value]}
          initialIndex={0}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  )
}

/** Extract text from React children tree for anchor ID generation. */
function extractTextFromChildren(node) {
  if (node == null || node === false) return ''
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(extractTextFromChildren).join('')
  if (node.props?.children) return extractTextFromChildren(node.props.children)
  return ''
}

/** Generate a slug-style anchor ID from heading text (matches MarginColumn extractToc). */
function headingAnchor(children) {
  const text = extractTextFromChildren(Children.toArray(children))
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

// Portable Text components for text sections
const portableTextComponents = {
  block: {
    h1: ({ children }) => <h2 className={styles.h2} id={headingAnchor(children)}>{children}</h2>,
    h2: ({ children }) => <h2 className={styles.h2} id={headingAnchor(children)}>{children}</h2>,
    h3: ({ children }) => <h3 className={styles.h3} id={headingAnchor(children)}>{children}</h3>,
    h4: ({ children }) => <h4 className={styles.h4} id={headingAnchor(children)}>{children}</h4>,
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
    // richImage blocks inline in textSection.content — clickable lightbox for full-size view
    richImage: ({ value }) => <InlineImage value={value} />,
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
        <TableWrap variant={variant}>
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
    const bgUrl = `url(${urlFor(backgroundImage.asset).width(1920).quality(90).url()})`

    backgroundStyles.backgroundPosition = `${Math.round(x * 100)}% ${Math.round(y * 100)}%`
    // CSS variable consumed by ::after pseudo-element (all hero treatments)
    backgroundStyles['--st-hero-bg-image'] = bgUrl
  }

  // Apply image treatment overlay styles (duotone, scrim, color)
  const { parsedType: treatmentType, preset: treatmentPreset } = parseOverlay(imageTreatment)
  const hasTreatment = treatmentType && treatmentType !== 'none'
  const isExtremeHero = treatmentType === 'duotone' && treatmentPreset === 'extreme'

  if (hasTreatment && hasImage) {
    const overlayStyles = getOverlayStyles(imageTreatment)
    Object.assign(backgroundStyles, overlayStyles)
  }

  // For extreme duotone, inject the SVG filter element
  if (isExtremeHero && typeof window !== 'undefined') {
    // Lazy-inject the SVG filter (same as Media component)
    if (!document.getElementById('st-duotone-extreme')) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      svg.setAttribute('width', '0')
      svg.setAttribute('height', '0')
      svg.setAttribute('aria-hidden', 'true')
      svg.style.position = 'absolute'
      svg.innerHTML = `
        <filter id="st-duotone-extreme" color-interpolation-filters="sRGB">
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncR type="table" tableValues="1.0 0.17" />
            <feFuncG type="table" tableValues="0.14 0.83" />
            <feFuncB type="table" tableValues="0.49 0.67" />
          </feComponentTransfer>
        </filter>
      `
      document.body.appendChild(svg)
    }
  }

  const primary = ctas?.[0]
  const secondary = ctas?.[1]
  const tertiary = ctas?.[2]

  const widthClass = imageWidth === 'full-width'
    ? styles.heroFullWidth
    : imageWidth === 'content-width'
      ? styles.heroContentWidth
      : ''

  const isGreyscalePanel = treatmentType === 'greyscale-panel'

  // Text glow class — keyed to treatment type when image is present
  // Greyscale-panel full-width uses no glow (the frosted panel provides contrast)
  // Greyscale-panel content-width uses default glow (no panel, needs shadow)
  const isFullWidthPanel = isGreyscalePanel && imageWidth === 'full-width'
  let glowClass = ''
  if (hasImage) {
    if (isFullWidthPanel) glowClass = styles.heroGlowNone
    else if (isExtremeHero) glowClass = styles.heroGlowExtreme
    else if (treatmentType === 'duotone') glowClass = styles.heroGlowDuotone
    else if (treatmentType === 'dark-scrim') glowClass = styles.heroGlowScrim
    else if (treatmentType === 'color') glowClass = styles.heroGlowColor
    else glowClass = styles.heroGlowDefault
  }

  const sectionClasses = [
    styles.heroSection,
    widthClass,
    hasImage ? styles.heroWithImage : styles.heroImageless,
    hasTreatment ? styles.heroWithTreatment : '',
    treatmentType === 'duotone' ? styles.heroTreatmentDuotone : '',
    isExtremeHero ? styles.heroTreatmentExtreme : '',
    treatmentType === 'dark-scrim' ? styles.heroTreatmentScrim : '',
    treatmentType === 'color' ? styles.heroTreatmentColor : '',
    isGreyscalePanel ? styles.heroTreatmentGreyscalePanel : '',
    glowClass,
  ].filter(Boolean).join(' ')

  // Hero content elements — shared between panel and non-panel rendering
  const heroElements = (
    <>
      {eyebrow && <span className={styles.heroEyebrow}>{eyebrow}</span>}
      {heading && <h1 className={styles.heroHeading}>{heading}</h1>}
      {subheading && <p className={styles.heroSubheading}>{subheading}</p>}
      {isGreyscalePanel && section._meta && (
        <p className={styles.heroMeta}>
          {section._meta.date && new Date(section._meta.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          {section._meta.date && section._meta.status && ' · '}
          {section._meta.status}
          {section._meta.readingTime && ` · ${section._meta.readingTime} min read`}
        </p>
      )}
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
    </>
  )

  return (
    <section className={sectionClasses} style={backgroundStyles} id={section._sectionId}>
      <div className={styles.heroContainer}>
        {isGreyscalePanel && hasImage && imageWidth === 'full-width' ? (
          <div className={styles.heroPanel}>
            {heroElements}
          </div>
        ) : (
          <div className={styles.heroContent}>
            {heroElements}
          </div>
        )}
      </div>
    </section>
  )
}

// Text Section Component
function TextSection({ section }) {
  const { heading, content } = section

  return (
    <section className={styles.textSection} id={section._sectionId}>
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
function GalleryImage({ image, index, onLightbox, treatment, layout }) {
  if (!image.asset) return null

  const imgSrc = urlFor(image.asset).width(800).auto('format').url()
  const linkTarget = resolveImageLink(image)

  // Uniform aspect ratio per layout; hotspot controls crop focus point
  const aspectRatio = layout === 'carousel' ? '16/9' : '4/3'

  const mediaEl = (
    <Media
      src={imgSrc}
      alt={image.alt || ''}
      overlay={treatment}
      aspectRatio={aspectRatio}
      hotspot={image.hotspot}
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
  const { heading, layout, images, treatment } = section
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
      <section className={galleryClassName} id={section._sectionId}>
        {heading && <h2 className={styles.sectionHeading}>{heading}</h2>}
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
                  layout={layout}
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
              layout={layout}
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
        flowchart: { curve: 'step', defaultRenderer: 'elk' },
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
              primaryBorderColor: '#FF247D',
              lineColor: '#FF247D',
              textColor: '#0D1226',
              mainBkg: '#F5F6F8',
              nodeBorder: '#FF247D',
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
    <section className={styles.mermaidSection} id={section._sectionId}>
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
      id={section._sectionId}
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
    <div className={styles.calloutSection} id={section._sectionId}>
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
    <section className={styles.ctaSection} id={section._sectionId}>
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

// Accordion Section Component (SUG-44)
function AccordionSection({ section }) {
  if (!section.items || section.items.length === 0) return null
  const accordionItems = section.items.map((item) => ({
    id: item._key,
    trigger: item.title,
    content: item.content ? (
      <PortableText value={item.content} components={portableTextComponents} />
    ) : null,
  }))
  return (
    <div className={styles.accordionSection} id={section._sectionId}>
      {section.heading && (
        <h2 className={styles.sectionHeading}>{section.heading}</h2>
      )}
      <Accordion items={accordionItems} multi={section.multi ?? false} />
    </div>
  )
}

// Main Section Renderer
// context="detail" — sections inherit containment from parent .detailPage (no own max-width / padding-inline)
// context="full"   — sections self-contain (default, used on standalone pages)
export default function PageSections({ sections, context = 'full', docMeta }) {
  if (!sections || sections.length === 0) return null

  const content = sections.map((section) => {
    const key = section._key
    // Anchor ID for TOC links (SUG-52 margin column)
    const sectionId = key ? `section-${key}` : undefined

    switch (section._type) {
      case 'heroSection':
      case 'hero':
        // Thread document metadata (date, status, readingTime) to hero for the metadata line
        return <HeroSection key={key} section={docMeta ? { ...section, _meta: docMeta, _sectionId: sectionId } : { ...section, _sectionId: sectionId }} />
      case 'textSection':
        return <TextSection key={key} section={{ ...section, _sectionId: sectionId }} />
      case 'imageGallery':
        return <ImageGallerySection key={key} section={{ ...section, _sectionId: sectionId }} />
      case 'ctaSection':
        return <CTASection key={key} section={{ ...section, _sectionId: sectionId }} />
      case 'htmlSection':
        return <HtmlSection key={key} section={{ ...section, _sectionId: sectionId }} />
      case 'cardBuilderSection':
        return <CardBuilderSection key={key} section={{ ...section, _sectionId: sectionId }} />
      case 'calloutSection':
        return <CalloutSection key={key} section={{ ...section, _sectionId: sectionId }} />
      case 'mermaidSection':
        return <MermaidDiagram key={key} section={{ ...section, _sectionId: sectionId }} />
      case 'accordionSection':
        return <AccordionSection key={key} section={{ ...section, _sectionId: sectionId }} />
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
