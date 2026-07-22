import React from 'react';
import styles from './Table.module.css';

/* ── TableWrap ───────────────────────────────────────────────────────────────
 * Scroll container + caption surface.
 * Caption renders as a <div> ABOVE <table> — position:sticky on <caption>
 * element is broken cross-browser (Chrome renders it below thead stacking
 * context). The div approach is reliable and keeps sticky offset correct.
 */
export interface TableWrapProps {
  caption?: React.ReactNode;
  captionMeta?: React.ReactNode;
  variant?: 'default' | 'wide';
  children: React.ReactNode;
  className?: string;
}

export function TableWrap({ caption, captionMeta, variant, children, className }: TableWrapProps) {
  const hasCaption = !!(caption || captionMeta);

  const wrapClass = [
    styles.tableWrap,
    hasCaption ? styles.hasCaption : '',
    variant === 'wide' ? styles.wrapWide : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapClass}>
      {hasCaption && (
        <div className={styles.caption}>
          <span className={styles.captionLabel}>{caption}</span>
          {captionMeta && <span className={styles.captionMeta}>{captionMeta}</span>}
        </div>
      )}
      {children}
    </div>
  );
}

/* ── Column / Row types ──────────────────────────────────────────────────── */
export interface Column {
  key: string;
  label: React.ReactNode;
  width?: string | number;
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
}

export type Row = Record<string, unknown>;

/* ── Table ────────────────────────────────────────────────────────────────────
 * Semantic <table> primitive with tone, zebra, layout, and density props.
 *
 * tone:
 *   accent  — pink accent header, zebra on by default
 *   subdued — neutral header, zebra off by default
 *
 * Caption / captionMeta live on <TableWrap>, not here.
 *
 * columns / rows:
 *   Props-driven API. When omitted, render children as <thead>/<tbody>.
 */
export interface TableProps {
  tone?: 'accent' | 'subdued';
  variant?: 'default' | 'responsive' | 'wide';
  zebra?: boolean;
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
  columns,
  rows,
  layout = 'auto',
  density = 'comfortable',
  children,
  className,
  style,
}: TableProps) {
  const zebraOn = zebra ?? (tone === 'accent');

  const classNames = [
    styles.table,
    tone === 'subdued'        ? styles.toneSubdued  : styles.toneAccent,
    zebraOn && tone === 'subdued' ? styles.zebra    : '',
    variant === 'responsive'  ? styles.responsive   : '',
    // No `.wide` class on the <table> itself: `variant="wide"` is implemented
    // entirely by `.wrapWide` on TableWrap (full-bleed 100vw + overflow-x).
    // A `styles.wide` reference lived here with nothing behind it in either
    // stylesheet — it resolved to undefined and was silently dropped by the
    // filter below, so removing it changes no rendered output. SUG-231.
    layout === 'fixed'        ? styles.layoutFixed  : '',
    density === 'compact'     ? styles.compact      : '',
    !zebraOn                  ? styles.noZebra      : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <table className={classNames} style={style}>
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

export default Table;
