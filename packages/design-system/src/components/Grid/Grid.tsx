import React from 'react';
import styles from './Grid.module.css';

export type GridSpacing = 'lg' | '0';
export type GridAccentColor = 'brand' | 'ink';

export interface GridProps {
  /** Gap mode. 'lg' = open card gap. '0' = 1px hairline bg-through-gap dividers. Default: 'lg'. */
  spacing?: GridSpacing;
  /** Fixed column count. Omit for auto-fit (responsive minmax columns). */
  columns?: number;
  /** Column count at the tablet breakpoint (≤900px). Defaults to 2 when columns >= 3. */
  tabletColumns?: number;
  /** Renders a 2px accent rule on the top edge. */
  accentTop?: boolean;
  /** Accent rule colour — 'brand' (pink) or 'ink' (adapts light/dark). Only applies when accentTop is true. */
  accentColor?: GridAccentColor;
  className?: string;
  children?: React.ReactNode;
}

const SPACING_CLASS: Record<GridSpacing, string> = {
  lg: styles.spacingLg,
  '0': styles.spacing0,
};

const ACCENT_TOP_CLASS: Record<GridAccentColor, string> = {
  brand: styles.accentTopBrand,
  ink: styles.accentTopInk,
};

export function Grid({
  spacing = 'lg',
  columns,
  tabletColumns,
  accentTop = false,
  accentColor = 'brand',
  className,
  children,
}: GridProps) {
  const classNames = [
    styles.grid,
    SPACING_CLASS[spacing],
    accentTop ? ACCENT_TOP_CLASS[accentColor] : '',
    className ?? '',
  ].filter(Boolean).join(' ');

  // Auto-collapse: 3+ col grids step down to 2 at tablet unless explicit tabletColumns is provided
  const resolvedTablet = tabletColumns ?? (columns && columns >= 3 ? 2 : undefined);
  const style: React.CSSProperties = {
    ...(columns ? { '--grid-columns': columns } : {}),
    ...(resolvedTablet ? { '--grid-columns-tablet': resolvedTablet } : {}),
  } as React.CSSProperties;

  return (
    <div className={classNames} style={style}>
      {children}
    </div>
  );
}
