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
  className?: string;
}

export function DescriptionList({ items, columns = 1, className }: DescriptionListProps) {
  return (
    <dl
      className={[
        styles.dl,
        columns === 2 ? styles.twoCol : styles.oneCol,
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
