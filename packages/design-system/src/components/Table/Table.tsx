import React from 'react';
import styles from './Table.module.css';

/* ── Table Wrap ──────────────────────────────────────────────────────────────
 * Scroll container with max-width + centering.
 * Wraps <Table> for horizontal scroll on wide tables.
 */
export interface TableWrapProps {
  /** When 'wide', the wrap breaks out of the content column to near-viewport width. */
  variant?: 'default' | 'responsive' | 'wide';
  children: React.ReactNode;
  className?: string;
}

export function TableWrap({ variant, children, className }: TableWrapProps) {
  const classNames = [
    styles.wrap,
    variant === 'wide' ? styles.wrapWide : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames}>
      {children}
    </div>
  );
}

/* ── Table ────────────────────────────────────────────────────────────────────
 * Semantic <table> with optional variant modifiers.
 *
 * Variants:
 *   default    — base styles, zebra striping, pink accent header
 *   responsive — mobile card layout at <=860px (rows → stacked cards)
 *   wide       — table-layout: fixed with column width tokens
 *
 * Canonical CSS: artifacts/style 260118.css §ST TABLE
 */
export interface TableProps {
  /** Visual variant */
  variant?: 'default' | 'responsive' | 'wide';
  children: React.ReactNode;
  className?: string;
}

export function Table({ variant = 'default', children, className }: TableProps) {
  const classNames = [
    styles.table,
    variant === 'responsive' ? styles.responsive : '',
    variant === 'wide' ? styles.wide : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return <table className={classNames}>{children}</table>;
}
