import React from 'react';
import styles from './Chip.module.css';

/** Named color presets for the Chip component. */
export type ChipColor = 'pink' | 'seafoam' | 'lime' | 'violet' | 'amber' | 'grey';

export interface ChipProps {
  /** Text label displayed inside the chip */
  label: string;
  /**
   * When provided, the chip renders as an <a> tag.
   * Pass a full URL; routing is the caller's responsibility.
   */
  href?: string;
  /**
   * When provided (and no href), the chip renders as a <button>.
   * Useful for filter toggles or any click-to-select interaction.
   */
  onClick?: () => void;
  /** Active / selected state — solid accent fill, white label */
  isActive?: boolean;
  /**
   * Named color preset from the Sugartown palette.
   * Sets the chip's accent via a CSS class (--chip-color token).
   * Overridden by `colorHex` if both are provided.
   *
   * Presets: pink (brand), seafoam (tools), lime (evergreen),
   *          violet (project), amber (status/warning).
   * Default (no color, no colorHex) = brand pink.
   */
  color?: ChipColor;
  /**
   * Optional hex colour to override the default pink accent.
   * Injects `--chip-color` as an inline style; the CSS resolves
   * background, border, and text from this single value.
   * Takes precedence over the `color` preset prop.
   */
  colorHex?: string;
  /** Size variant. Defaults to 'md'. */
  size?: 'sm' | 'md';
  /** Extra class names (for external layout overrides) */
  className?: string;
  /** Accessible label when the visible text alone is insufficient */
  'aria-label'?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  href,
  onClick,
  isActive = false,
  color,
  colorHex,
  size = 'md',
  className,
  'aria-label': ariaLabel,
}) => {
  const isInteractive = Boolean(href || onClick);

  const classNames = [
    styles.chip,
    isInteractive && styles.interactive,
    isActive && styles.active,
    size === 'sm' && styles.sm,
    // Named color preset class — sets --chip-color via CSS token.
    // colorHex inline style takes precedence when both are present.
    color && styles[color],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Inject --chip-color so the CSS color-mix() expressions can resolve it
  const chipStyle = colorHex
    ? ({ '--chip-color': colorHex } as React.CSSProperties)
    : undefined;

  if (href) {
    return (
      <a
        href={href}
        className={classNames}
        style={chipStyle}
        aria-label={ariaLabel}
      >
        {label}
      </a>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={classNames}
        style={chipStyle}
        aria-label={ariaLabel}
        aria-pressed={isActive}
      >
        {label}
      </button>
    );
  }

  // Static span — no interaction, used for display-only taxonomy labels
  return (
    <span className={classNames} style={chipStyle} aria-label={ariaLabel}>
      {label}
    </span>
  );
};
