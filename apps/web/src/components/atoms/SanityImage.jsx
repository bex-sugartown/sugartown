/**
 * SanityImage — responsive image component with srcset for Sanity CDN images.
 *
 * Generates a `srcset` with multiple width variants so the browser can pick
 * the optimal resolution for the viewport. All URLs go through `urlFor()`
 * which already applies `.auto('format')` (EPIC-0182 Phase 2).
 *
 * Props:
 *   asset    — Sanity image asset reference (required)
 *   alt      — alt text (default: '')
 *   width    — base/fallback width for `src` (default: 800)
 *   sizes    — `sizes` attribute (default: '(max-width: 768px) 100vw, 800px')
 *   quality  — JPEG/WebP quality 1–100 (default: 85)
 *   loading  — 'lazy' | 'eager' (default: 'lazy')
 *   decoding — 'async' | 'sync' | 'auto' (default: 'async')
 *   fetchPriority — 'high' | 'low' | 'auto' (optional)
 *   className — passed to <img>
 *
 * The srcset widths are: 400, 800, 1200. This covers:
 *   - Mobile 1x (400), Mobile 2x / Tablet (800), Desktop / Retina (1200)
 */
import { urlFor } from '../../lib/sanity'

const SRCSET_WIDTHS = [400, 800, 1200]

export default function SanityImage({
  asset,
  alt = '',
  width = 800,
  sizes = '(max-width: 768px) 100vw, 800px',
  quality = 85,
  loading = 'lazy',
  decoding = 'async',
  fetchPriority,
  className,
}) {
  if (!asset) return null

  const src = urlFor(asset).width(width).quality(quality).url()
  const srcSet = SRCSET_WIDTHS
    .map((w) => `${urlFor(asset).width(w).quality(quality).url()} ${w}w`)
    .join(', ')

  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      width={width}
      loading={loading}
      decoding={decoding}
      {...(fetchPriority ? { fetchpriority: fetchPriority } : {})}
      className={className}
    />
  )
}
