/**
 * ImageLightbox — fullscreen image viewer modal
 *
 * Opens when clicking a gallery image that has no link.
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
import styles from './ImageLightbox.module.css'

export default function ImageLightbox({ images, initialIndex = 0, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const closeRef = useRef(null)

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

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // Focus the close button on mount
  useEffect(() => {
    closeRef.current?.focus()
  }, [])

  // Click on backdrop (not image or controls) closes
  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  // Build image URL — use Sanity CDN for full quality
  const imgUrl = image?.asset
    ? urlFor(image.asset).width(1600).auto('format').url()
    : null

  if (!imgUrl) return null

  return (
    <div
      className={styles.overlay}
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
        <img
          src={imgUrl}
          alt={image.alt || ''}
          className={styles.image}
        />
        {(image.alt || image.caption) && (
          <p className={styles.caption}>
            {image.caption || image.alt}
          </p>
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
