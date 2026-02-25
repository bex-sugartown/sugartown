/**
 * Media — web app adapter of the DS Media visual primitive.
 *
 * Mirrors: packages/design-system/src/components/Media/Media.tsx
 * CSS sync: Media.module.css must match DS Media.module.css (see MEMORY.md token drift rules).
 *
 * TODO: When @sugartown/design-system becomes a build-time dependency of apps/web,
 * replace this with a direct re-export from the package.
 */
import styles from './Media.module.css'

const DUOTONE_PRESETS = {
  standard: {
    start: 'rgba(255, 36, 125, 0.55)',
    end: 'rgba(43, 212, 170, 0.45)',
  },
  featured: {
    start: 'rgba(255, 36, 125, 0.70)',
    end: 'rgba(43, 212, 170, 0.50)',
  },
  subtle: {
    start: 'rgba(255, 36, 125, 0.30)',
    end: 'rgba(43, 212, 170, 0.25)',
  },
}

function getOverlayStyles(overlay) {
  if (overlay.type === 'duotone') {
    if (overlay.duotonePreset === 'custom' && overlay.customGradient) {
      const { startColor, endColor, angle = 135 } = overlay.customGradient
      return {
        '--st-media-overlay-gradient': `linear-gradient(${angle}deg, ${startColor}, ${endColor})`,
      }
    }
    const preset = DUOTONE_PRESETS[overlay.duotonePreset ?? 'standard']
    const angle = overlay.customGradient?.angle ?? 135
    return {
      '--st-media-overlay-gradient': `linear-gradient(${angle}deg, ${preset.start}, ${preset.end})`,
    }
  }

  // Color overlay
  const alpha = (overlay.opacity ?? 50) / 100
  return {
    '--st-media-overlay-color': overlay.color ?? 'rgba(0, 0, 0, 0.5)',
    '--st-media-overlay-opacity': String(alpha),
    '--st-media-overlay-blend': overlay.blendMode ?? 'normal',
  }
}

export default function Media({
  src,
  alt = '',
  caption,
  overlay,
  aspectRatio,
  hoverScale,
  className,
}) {
  if (!src) return null

  const isDuotone = overlay?.type === 'duotone'
  const isColorOverlay = overlay?.type === 'color'
  const shouldScale = hoverScale ?? isDuotone

  const figureClassNames = [
    styles.figure,
    isDuotone ? styles.duotone : '',
    isColorOverlay ? styles.colorOverlay : '',
    shouldScale ? styles.hoverScale : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  const figureStyle = {
    ...(aspectRatio ? { aspectRatio } : {}),
    ...(overlay ? getOverlayStyles(overlay) : {}),
  }

  return (
    <figure className={figureClassNames} style={figureStyle}>
      <img src={src} alt={alt} className={styles.image} />
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  )
}
