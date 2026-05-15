import React from 'react';
import styles from './Chip.module.css';

/** Named color presets for the Chip component. */
export type ChipColor = 'pink' | 'seafoam' | 'lime' | 'violet' | 'amber' | 'grey';

/** Status values for rule-dot chips */
export type ChipStatus = 'evergreen' | 'validated' | 'exploring' | 'active' | 'draft' | 'deprecated';

export interface ChipProps {
  /** Text label displayed inside the chip */
  label?: string;
  /** Child content — used by rule-dot chips (variant="status"|"tag") */
  children?: React.ReactNode;
  /**
   * Rule-dot variant (SUG-88). When set, activates the neutral mono box system.
   * Omit for legacy color-mix chips (backward-compatible).
   */
  variant?: 'status' | 'tag';
  /** Status key for the semantic dot color. Only meaningful when variant="status". */
  status?: ChipStatus;
  /** Pink rubric — first-child taxonomy highlight. Only applied when variant="tag". */
  featured?: boolean;
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
   */
  color?: ChipColor;
  /**
   * Optional hex colour to override the default pink accent.
   * Takes precedence over the `color` preset prop.
   */
  colorHex?: string;
  /**
   * Project dot-color mode (SUG-118). When provided, renders the rule-dot
   * chassis with a 6px circular dot at this hex color (from Sanity project.colorHex).
   * No token needed — color is injected inline via --chip-dot CSS custom property.
   */
  dotColor?: string;
  /** Size variant. Defaults to 'md'. */
  size?: 'sm' | 'md';
  /** Extra class names (for external layout overrides) */
  className?: string;
  /** Accessible label when the visible text alone is insufficient */
  'aria-label'?: string;
}

export const Chip: React.FC<ChipProps> = ({
  variant,
  status,
  featured,
  dotColor,
  label,
  children,
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
  const isRuleDot = variant === 'status' || variant === 'tag';
  const isDotColor = Boolean(dotColor);

  const classNames = [
    styles.chip,
    isRuleDot && styles.ruleDot,
    variant === 'status' && styles.variantStatus,
    variant === 'tag' && styles.variantTag,
    featured && variant === 'tag' && styles.featured,
    isDotColor && styles.ruleDot,
    isDotColor && styles.dotColor,
    isInteractive && styles.interactive,
    !isRuleDot && !isDotColor && isActive && styles.active,
    (isRuleDot || isDotColor) ? size === 'sm' && styles.sm : size === 'sm' && styles.sm,
    !isRuleDot && !isDotColor && color && styles[color as string],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const chipStyle = isDotColor
    ? ({ '--chip-dot': dotColor } as React.CSSProperties)
    : (!isRuleDot && colorHex ? ({ '--chip-color': colorHex } as React.CSSProperties) : undefined);

  const dotEl = (variant === 'status' && status)
    ? <span className={`${styles.dot} ${(styles as Record<string, string>)[`dot-${status}`] ?? ''}`} aria-hidden="true" />
    : isDotColor
      ? <span className={styles.dot} aria-hidden="true" />
      : null;

  const content = (isRuleDot || isDotColor)
    ? <>{dotEl}{children ?? label}</>
    : label;

  if (href) {
    return (
      <a href={href} className={classNames} style={chipStyle} aria-label={ariaLabel}>
        {content}
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
        {content}
      </button>
    );
  }

  return (
    <span className={classNames} style={chipStyle} aria-label={ariaLabel}>
      {content}
    </span>
  );
};
