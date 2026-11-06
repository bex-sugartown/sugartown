/**
 * ImageLightbox — fullscreen image viewer modal
 *
 * Opens from a gallery image or a carousel slide (the active slide, linked or not); a linked image
 * shows a "Read: …" link below the caption (ST-205).
 * Supports prev/next navigation, Escape to close, click-outside to close,
 * and focus trapping for accessibility.
 *
 * Atomic Reuse Gate:
 * 1. No modal/lightbox exists in the codebase — confirmed
 * 2. Consumed by ImageGallerySection, potentially future inline image views
 * 3. Composable API: images[], initialIndex, onClose
 */
import { useEffect, useCallback, useRef, useState } from 'react'
import { urlFor } from '../lib/sanity'
import { getLinkProps, resolveImageLink } from '../lib/linkUtils'
import { stampedCopies, aiLabelProps } from '../lib/provenance'
import { Button, MediaLabel } from '../design-system'
import styles from './ImageLightbox.module.css'

/**
 * Pixel size of a Sanity image from its CDN URL (`.../<hash>-880x512.svg?w=1600`) or asset id
 * (`image-<hash>-880x512-svg`), or null. An SVG with only a viewBox has no intrinsic size, so the
 * lightbox sizes the image from this instead. Stamped file-asset URLs carry no size (null).
 */
function assetSize(url, asset) {
  const id = asset?._ref || asset?._id || ''
  const m = /-(\d+)x(\d+)\.(\w+)(?:\?|$)/.exec(url || '') || /-(\d+)x(\d+)-(\w+)$/.exec(id)
  return m ? { w: Number(m[1]), h: Number(m[2]), isSvg: m[3] === 'svg' } : null
}

export default function ImageLightbox({ images, initialIndex = 0, onClose, onIndexChange }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const closeRef = useRef(null)

  // Tell the caller which image is showing, so a carousel can move to it on close (ST-205).
  const onIndexChangeRef = useRef(onIndexChange)
  useEffect(() => {
    onIndexChangeRef.current = onIndexChange
  })
  useEffect(() => {
    onIndexChangeRef.current?.(currentIndex)
  }, [currentIndex])

  const image = images[currentIndex]
  const hasMultiple = images.length > 1

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % images.length)
  }, [images.length])

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + images.length) % images.length)
  }, [images.length])

  // Escape key + arrow keys
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
      if (hasMultiple && e.key === 'ArrowRight') goNext()
      if (hasMultiple && e.key === 'ArrowLeft') goPrev()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose, goNext, goPrev, hasMultiple])

  // Lock body scroll and restore position on close
  useEffect(() => {
    const scrollY = window.scrollY
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
      window.scrollTo(0, scrollY)
    }
  }, [])

  // Focus the close button on mount; give focus back to whatever opened the lightbox on close (ST-205)
  useEffect(() => {
    const opener = document.activeElement
    closeRef.current?.focus()
    return () => {
      if (opener && opener !== document.body && typeof opener.focus === 'function') {
        opener.focus({ preventScroll: true })
      }
    }
  }, [])

  // Click on backdrop (not image or controls) closes
  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  // Build image URL — use Sanity CDN for full quality
  // AI-generated images with stamped copies (ST-178) show the stamped copy, not the Sanity URL.
  const copies = stampedCopies(image)
  const imgUrl = copies
    ? (copies.find((c) => c.width >= 1600) ?? copies[copies.length - 1]).url
    : image?.asset
      ? urlFor(image.asset).width(1600).auto('format').url()
      : null

  if (!imgUrl) return null

  // A linked image shows where it goes, below the caption (ST-205 vspec).
  const linkTarget = resolveImageLink(image)
  const linked = linkTarget ? getLinkProps(linkTarget.url, linkTarget.openInNewTab) : null
  const linkText = `${linkTarget?.label ? `Read: ${linkTarget.label}` : 'Open link'} ↗`

  // Fit the viewport (90vw by 80vh). Vector images scale up to fill it; photos stop at the 1600px
  // that was requested, so they are never stretched past their pixels.
  const size = assetSize(imgUrl, image.asset)
  const wrapStyle = size
    ? { width: `min(90vw, calc(80vh * ${size.w / size.h}), ${size.isSvg ? '100vw' : '1600px'})`, aspectRatio: `${size.w} / ${size.h}` }
    : undefined

  return (
    <div
      className={styles.overlay}
      data-theme="dark-pink-moon"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
    >
      <button
        ref={closeRef}
        className={styles.closeButton}
        onClick={onClose}
        aria-label="Close lightbox"
      >
        ✕
      </button>

      {hasMultiple && (
        <button
          className={`${styles.navButton} ${styles.prevButton}`}
          onClick={goPrev}
          aria-label="Previous image"
        >
          ‹
        </button>
      )}

      <div className={styles.content}>
        {/* ST-181: the wrapper shrink-wraps the image so the AI label sits on the picture, not the screen. */}
        <div className={styles.imageWrap} style={wrapStyle}>
          <img
            src={imgUrl}
            alt={image.alt || ''}
            className={size ? styles.imageSized : styles.image}
          />
          {image.aiGenerated && <MediaLabel frame {...aiLabelProps(image)} />}
        </div>
        {(image.caption || image.credit || image.alt) && (
          <p className={styles.caption}>
            {image.caption || image.alt}
            {image.credit && (
              <span className={styles.credit}> — {image.credit}</span>
            )}
          </p>
        )}
        {linked && (
          <Button
            variant="tertiary"
            href={linked.linkProps.to ?? linked.linkProps.href}
            openInNewTab={linked.isExternal}
            className={styles.captionLink}
          >
            {linkText}
          </Button>
        )}
        {hasMultiple && (
          <p className={styles.counter}>
            {currentIndex + 1} / {images.length}
          </p>
        )}
      </div>

      {hasMultiple && (
        <button
          className={`${styles.navButton} ${styles.nextButton}`}
          onClick={goNext}
          aria-label="Next image"
        >
          ›
        </button>
      )}
    </div>
  )
}
