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

export type DuotonePreset = 'standard' | 'featured' | 'subtle' | 'custom';

export interface OverlayConfig {
  /** Overlay type */
  type: 'duotone' | 'color';
  /** Alpha-intensity preset for duotone (ignored for color type) */
  duotonePreset?: DuotonePreset;
  /** Custom gradient (only when duotonePreset='custom') */
  customGradient?: {
    startColor: string;
    endColor: string;
    angle?: number;
  };
  /** For color overlay: CSS colour value */
  color?: string;
  /** For color overlay: opacity 0-100 (converted to 0-1) */
  opacity?: number;
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
};

function getOverlayStyles(overlay: OverlayConfig): React.CSSProperties {
  if (overlay.type === 'duotone') {
    if (overlay.duotonePreset === 'custom' && overlay.customGradient) {
      const { startColor, endColor, angle = 135 } = overlay.customGradient;
      return {
        '--st-media-overlay-gradient': `linear-gradient(${angle}deg, ${startColor}, ${endColor})`,
      } as React.CSSProperties;
    }
    const preset = DUOTONE_PRESETS[overlay.duotonePreset ?? 'standard'];
    const angle = overlay.customGradient?.angle ?? 135;
    return {
      '--st-media-overlay-gradient': `linear-gradient(${angle}deg, ${preset.start}, ${preset.end})`,
    } as React.CSSProperties;
  }

  // Color overlay
  const alpha = (overlay.opacity ?? 50) / 100;
  return {
    '--st-media-overlay-color': overlay.color ?? 'rgba(0, 0, 0, 0.5)',
    '--st-media-overlay-opacity': String(alpha),
    '--st-media-overlay-blend': overlay.blendMode ?? 'normal',
  } as React.CSSProperties;
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

  const isDuotone = overlay?.type === 'duotone';
  const isColorOverlay = overlay?.type === 'color';
  const shouldScale = hoverScale ?? isDuotone; // default true for duotone

  const figureClassNames = [
    styles.figure,
    isDuotone ? styles.duotone : '',
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
