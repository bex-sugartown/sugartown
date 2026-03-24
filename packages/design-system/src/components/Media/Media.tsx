import React from 'react';
import styles from './Media.module.css';

/**
 * Media — Sugartown Design System
 *
 * Responsive figure with optional duotone or colour overlay.
 *
 * Duotone uses canonical brand colours: #ff247d (Pink) + #2bd4aa (Seafoam).
 * The legacy #ED008E is deprecated — all gradients use the unified palette.
 *
 * Canonical CSS: artifacts/style 260118.css §st-media--duotone
 */

export type DuotonePreset = 'standard' | 'featured' | 'subtle' | 'extreme' | 'custom';

export interface OverlayConfig {
  /** Overlay type — supports legacy ('duotone', 'color') and schema values ('duotone-standard', 'dark-scrim', etc.) */
  type: 'duotone' | 'duotone-standard' | 'duotone-featured' | 'duotone-subtle' | 'duotone-extreme' | 'dark-scrim' | 'color' | 'none';
  /** Alpha-intensity preset for duotone (legacy API — ignored when type contains preset) */
  duotonePreset?: DuotonePreset;
  /** Custom gradient (only when duotonePreset='custom') */
  customGradient?: {
    startColor: string;
    endColor: string;
    angle?: number;
  };
  /** For color overlay: CSS colour value (legacy API) */
  color?: string;
  /** For color overlay: CSS colour value (schema API) */
  overlayColor?: string;
  /** For color overlay: opacity 0-100 (legacy API, converted to 0-1) */
  opacity?: number;
  /** For color overlay: opacity 0-100 (schema API, converted to 0-1) */
  overlayOpacity?: number;
  /** Blend mode (default: hard-light) */
  blendMode?: string;
}

export interface MediaProps {
  /** Image source URL */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Optional caption below the image */
  caption?: string;
  /** Overlay configuration (duotone or colour) */
  overlay?: OverlayConfig;
  /** CSS aspect-ratio (e.g. '21/9', '16/9', '1/1') */
  aspectRatio?: string;
  /** Zoom on hover — default true for duotone, false otherwise */
  hoverScale?: boolean;
  className?: string;
}

/**
 * CSS custom properties for duotone presets.
 * Uses canonical #ff247d (pink) and #2bd4aa (seafoam) with alpha channels.
 */
const DUOTONE_PRESETS: Record<string, { start: string; end: string }> = {
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
};

/**
 * Parse overlay type from Sanity schema values.
 *
 * Schema stores combined values like 'duotone-standard', 'duotone-featured'.
 * The component needs to split these into a type ('duotone') and preset ('standard').
 * Also handles legacy API where type='duotone' and duotonePreset is a separate field.
 */
function parseOverlay(overlay?: OverlayConfig): { parsedType: string | null; preset?: string } {
  if (!overlay?.type || overlay.type === 'none') return { parsedType: null };

  if (overlay.type === 'dark-scrim') return { parsedType: 'dark-scrim' };
  if (overlay.type === 'color') return { parsedType: 'color' };

  if (overlay.type.startsWith('duotone')) {
    const preset = overlay.type === 'duotone'
      ? (overlay.duotonePreset ?? 'standard')
      : overlay.type.replace('duotone-', '');
    return { parsedType: 'duotone', preset };
  }

  return { parsedType: null };
}

function getOverlayStyles(overlay: OverlayConfig): React.CSSProperties {
  const { parsedType, preset } = parseOverlay(overlay);

  if (parsedType === 'duotone') {
    if (preset === 'custom' && overlay.customGradient) {
      const { startColor, endColor, angle = 135 } = overlay.customGradient;
      return {
        '--st-media-overlay-gradient': `linear-gradient(${angle}deg, ${startColor}, ${endColor})`,
      } as React.CSSProperties;
    }
    const presetConfig = DUOTONE_PRESETS[preset ?? 'standard'] ?? DUOTONE_PRESETS.standard;
    const angle = overlay.customGradient?.angle ?? 135;
    const styles: Record<string, string> = {
      '--st-media-overlay-gradient': `linear-gradient(${angle}deg, ${presetConfig.start}, ${presetConfig.end})`,
    };
    // "featured" (Studio label: Standard) preserves image color depth
    if (preset === 'featured') {
      styles['--st-media-duotone-grayscale'] = '0%';
    }
    return styles as React.CSSProperties;
  }

  if (parsedType === 'dark-scrim') {
    return {
      '--st-media-overlay-gradient': 'var(--st-media-scrim-dark, linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.25) 50%, transparent 100%))',
    } as React.CSSProperties;
  }

  if (parsedType === 'color') {
    const alpha = (overlay.opacity ?? overlay.overlayOpacity ?? 50) / 100;
    return {
      '--st-media-overlay-color': overlay.color ?? overlay.overlayColor ?? 'rgba(0, 0, 0, 0.5)',
      '--st-media-overlay-opacity': String(alpha),
      '--st-media-overlay-blend': overlay.blendMode ?? 'normal',
    } as React.CSSProperties;
  }

  return {} as React.CSSProperties;
}

/**
 * SVG duotone filter — true colour remap via feComponentTransfer.
 * Maps shadow→pink (#ff247d), highlight→seafoam (#2bd4aa).
 */
let svgFilterInjected = false;
const SVG_FILTER_ID = 'st-duotone-extreme';
function ensureSvgFilter(): void {
  if (svgFilterInjected || typeof document === 'undefined') return;
  svgFilterInjected = true;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.setAttribute('aria-hidden', 'true');
  svg.style.position = 'absolute';
  svg.innerHTML = `
    <filter id="${SVG_FILTER_ID}" color-interpolation-filters="sRGB">
      <feColorMatrix type="saturate" values="0" />
      <feComponentTransfer>
        <feFuncR type="table" tableValues="1.0 0.17" />
        <feFuncG type="table" tableValues="0.14 0.83" />
        <feFuncB type="table" tableValues="0.49 0.67" />
      </feComponentTransfer>
    </filter>
  `;
  document.body.appendChild(svg);
}

export function Media({
  src,
  alt,
  caption,
  overlay,
  aspectRatio,
  hoverScale,
  className,
}: MediaProps) {
  if (!src) return null;

  const { parsedType, preset } = parseOverlay(overlay);
  const isDuotone = parsedType === 'duotone';
  const isExtremeSvg = isDuotone && preset === 'extreme';
  const isColorOverlay = parsedType === 'color';
  const isDarkScrim = parsedType === 'dark-scrim';
  const hasOverlay = isDuotone || isDarkScrim || isColorOverlay;
  const shouldScale = hoverScale ?? hasOverlay;

  if (isExtremeSvg) ensureSvgFilter();

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
    .join(' ');

  const figureStyle: React.CSSProperties = {
    ...(aspectRatio ? { aspectRatio } : {}),
    ...(overlay ? getOverlayStyles(overlay) : {}),
  };

  return (
    <figure className={figureClassNames} style={figureStyle}>
      <img src={src} alt={alt} className={styles.image} />
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  );
}
