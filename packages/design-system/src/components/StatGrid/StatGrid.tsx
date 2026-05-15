import React from 'react';
import styles from './StatGrid.module.css';

export interface StatGridProps {
  columns?: 3 | 4;
  children: React.ReactNode;
  className?: string;
}

export interface StatGridCellProps {
  label: string;
  value?: React.ReactNode;
  signal?: string;
  href?: string;
  foot?: React.ReactNode;
  children?: React.ReactNode;
}

export const StatGrid: React.FC<StatGridProps> = ({ columns = 4, children, className }) => (
  <div className={[styles.grid, styles[`cols${columns}` as keyof typeof styles], className].filter(Boolean).join(' ')}>
    {children}
  </div>
);

export const StatGridCell: React.FC<StatGridCellProps> = ({ label, value, signal, href, foot, children }) => {
  const inner = (
    <div className={[styles.cell, foot != null ? styles.artifact : ''].filter(Boolean).join(' ')}>
      <span className={styles.cellLabel}>{label}</span>
      <span className={styles.cellValue}>{value ?? children}</span>
      {signal && <span className={styles.cellSignal}>{signal}</span>}
      {foot != null && <span className={styles.cellFoot}>{foot}</span>}
    </div>
  );

  if (href) {
    return (
      <a href={href} className={styles.cellLink} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  }
  return inner;
};
