import React from 'react';
import styles from './Table.module.css';

/* ── Table Wrap ──────────────────────────────────────────────────────────────
 * Scroll container with max-width + centering.
 * Wraps <Table> for horizontal scroll on wide tables.
 */
export interface TableWrapProps {
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

/* ── Column / Row types (folded from DataTable) ──────────────────────────── */
export interface Column {
  key: string;
  label: React.ReactNode;
  width?: string | number;
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
}

export type Row = Record<string, unknown>;

/* ── Table ────────────────────────────────────────────────────────────────────
 * Semantic <table> with tone, caption surface, and optional props-driven API.
 *
 * tone:
 *   accent  — pink accent header (default)
 *   subdued — neutral header; zebra off by default
 *
 * caption / captionMeta:
 *   Renders a styled <caption> element (a11y-positive: announced by screen readers).
 *   Pins together with thead when --st-table-sticky-offset is set on the wrapper.
 *
 * columns / rows:
 *   Props-driven API (folded from DataTable). When omitted, render children
 *   directly as <thead>/<tbody> markup.
 *
 * Canonical CSS: artifacts/style 260118.css §ST TABLE
 */
export interface TableProps {
  tone?: 'accent' | 'subdued';
  variant?: 'default' | 'responsive' | 'wide';
  zebra?: boolean;
  caption?: React.ReactNode;
  captionMeta?: React.ReactNode;
  columns?: Column[];
  rows?: Row[];
  layout?: 'auto' | 'fixed';
  density?: 'comfortable' | 'compact';
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Table({
  tone = 'accent',
  variant = 'default',
  zebra,
  caption,
  captionMeta,
  columns,
  rows,
  layout = 'auto',
  density = 'comfortable',
  children,
  className,
  style,
}: TableProps) {
  // zebra defaults: on for accent, off for subdued
  const zebraOn = zebra ?? (tone === 'accent');

  const classNames = [
    styles.table,
    tone === 'subdued'    ? styles.toneSubdued  : styles.toneAccent,
    variant === 'responsive' ? styles.responsive : '',
    variant === 'wide'       ? styles.wide       : '',
    layout === 'fixed'       ? styles.layoutFixed : '',
    density === 'compact'    ? styles.compact     : '',
    !zebraOn                 ? styles.noZebra     : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <table className={classNames} style={style}>
      {(caption || captionMeta) && (
        <caption className={styles.caption}>
          <span className={styles.captionLabel}>{caption}</span>
          {captionMeta && <span className={styles.captionMeta}>{captionMeta}</span>}
        </caption>
      )}
      {columns && rows ? (
        <>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} style={col.width ? { width: col.width } : undefined}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render ? col.render(row[col.key], row) : (row[col.key] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </>
      ) : (
        children
      )}
    </table>
  );
}
