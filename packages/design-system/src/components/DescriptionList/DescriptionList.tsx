import React from 'react';
import styles from './DescriptionList.module.css';

export interface DescriptionItem {
  label: string;
  value: React.ReactNode;
}

export interface DescriptionListProps {
  items: DescriptionItem[];
  /** Number of columns — 1 for stacked, 2 for side-by-side */
  columns?: 1 | 2;
  /**
   * Ledger treatment (two-column only): hairline between columns,
   * rule under the first row, last item spans full width above a top rule.
   * Collapses to a stacked single column below 768px.
   */
  ledger?: boolean;
  className?: string;
}

export function DescriptionList({ items, columns = 1, ledger = false, className }: DescriptionListProps) {
  return (
    <dl
      className={[
        styles.dl,
        columns === 2 ? styles.twoCol : styles.oneCol,
        ledger && columns === 2 ? styles.ledger : null,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {items.map(({ label, value }) => (
        <div key={label} className={styles.item}>
          <dt className={styles.term}>{label}</dt>
          <dd className={styles.detail}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
