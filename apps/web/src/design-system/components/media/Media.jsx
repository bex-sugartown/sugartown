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
    start: 'var(--st-media-duotone-standard-start, rgba(255, 36, 125, 0.55))',
    end: 'var(--st-media-duotone-standard-end, rgba(43, 212, 170, 0.45))',
  },
  featured: {
    start: 'var(--st-media-duotone-featured-start, rgba(255, 36, 125, 0.70))',
    end: 'var(--st-media-duotone-featured-end, rgba(43, 212, 170, 0.50))',
  },
  subtle: {
    start: 'var(--st-media-duotone-subtle-start, rgba(255, 36, 125, 0.30))',
    end: 'var(--st-media-duotone-subtle-end, rgba(43, 212, 170, 0.25))',
  },
  extreme: {
    start: 'var(--st-media-duotone-extreme-start, rgba(255, 36, 125, 0.85))',
    end: 'var(--st-media-duotone-extreme-end, rgba(43, 212, 170, 0.70))',
  },
}

/**
 * Parse overlay type from Sanity schema values.
 *
 * Schema stores combined values like 'duotone-standard', 'duotone-featured'.
 * The component needs to split these into a type ('duotone') and preset ('standard').
 * Also handles legacy API where type='duotone' and duotonePreset is a separate field.
 */
function parseOverlay(overlay) {
  if (!overlay?.type || overlay.type === 'none') return { parsedType: null }

  if (overlay.type === 'dark-scrim') {
    return { parsedType: 'dark-scrim' }
  }

  if (overlay.type === 'color') {
    return { parsedType: 'color' }
  }

  // Handle schema values: 'duotone-standard', 'duotone-featured', etc.
  if (overlay.type.startsWith('duotone')) {
    const preset = overlay.type === 'duotone'
      ? (overlay.duotonePreset ?? 'standard')  // legacy API
      : overlay.type.replace('duotone-', '')     // schema value
    return { parsedType: 'duotone', preset }
  }

  return { parsedType: null }
}

function getOverlayStyles(overlay) {
  const { parsedType, preset } = parseOverlay(overlay)

  if (parsedType === 'duotone') {
    if (preset === 'custom' && overlay.customGradient) {
      const { startColor, endColor, angle = 135 } = overlay.customGradient
      return {
        '--st-media-overlay-gradient': `linear-gradient(${angle}deg, ${startColor}, ${endColor})`,
      }
    }
    const presetConfig = DUOTONE_PRESETS[preset] ?? DUOTONE_PRESETS.standard
    const angle = overlay.customGradient?.angle ?? 135
    const styles = {
      '--st-media-overlay-gradient': `linear-gradient(${angle}deg, ${presetConfig.start}, ${presetConfig.end})`,
    }
    // "featured" (Studio label: Standard) preserves image color depth
    if (preset === 'featured') {
      styles['--st-media-duotone-grayscale'] = '0%'
    }
    return styles
  }

  if (parsedType === 'dark-scrim') {
    return {
      '--st-media-overlay-gradient': 'var(--st-media-scrim-dark, linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.25) 50%, transparent 100%))',
    }
  }

  if (parsedType === 'color') {
    const alpha = (overlay.opacity ?? overlay.overlayOpacity ?? 50) / 100
    return {
      '--st-media-overlay-color': overlay.color ?? overlay.overlayColor ?? 'rgba(0, 0, 0, 0.5)',
      '--st-media-overlay-opacity': String(alpha),
      '--st-media-overlay-blend': overlay.blendMode ?? 'normal',
    }
  }

  return {}
}

/**
 * Exported for reuse in HeroSection overlay rendering.
 */
export { getOverlayStyles, parseOverlay, ensureSvgFilter }

/**
 * SVG duotone filter — true colour remap via feComponentTransfer.
 * Maps shadow→pink (#ff247d), highlight→seafoam (#2bd4aa) at the pixel level.
 * Used for "extreme" preset to match WP duotone behaviour.
 */
let svgFilterInjected = false
const SVG_FILTER_ID = 'st-duotone-extreme'
function ensureSvgFilter() {
  if (svgFilterInjected || typeof document === 'undefined') return
  svgFilterInjected = true
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('width', '0')
  svg.setAttribute('height', '0')
  svg.setAttribute('aria-hidden', 'true')
  svg.style.position = 'absolute'
  svg.innerHTML = `
    <filter id="${SVG_FILTER_ID}" color-interpolation-filters="sRGB">
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

  const { parsedType, preset } = parseOverlay(overlay)
  const isDuotone = parsedType === 'duotone'
  const isExtremeSvg = isDuotone && preset === 'extreme'
  const isColorOverlay = parsedType === 'color'
  const isDarkScrim = parsedType === 'dark-scrim'
  const hasOverlay = isDuotone || isDarkScrim || isColorOverlay
  const shouldScale = hoverScale ?? hasOverlay

  // Inject the SVG filter element once if extreme duotone is used
  if (isExtremeSvg) ensureSvgFilter()

  const figureClassNames = [
    styles.figure,
    isDuotone ? styles.duotone : '',
    isExtremeSvg ? styles.duotoneExtreme : '',
    isDarkScrim ? styles.darkScrim : '',
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
