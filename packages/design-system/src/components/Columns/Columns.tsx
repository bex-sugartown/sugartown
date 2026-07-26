import React from 'react';
import styles from './Columns.module.css';

export type ColumnsGap = '0' | '1' | '2' | '3' | '4' | '5' | '6';
export type ColumnsBreakpoint = 'sm' | 'md' | 'lg';

export interface ColumnsProps {
  /** Number of columns */
  count?: 2 | 3 | 4;
  /** Gap between columns — maps to --st-space-{n} */
  gap?: ColumnsGap;
  /** Breakpoint below which columns stack to a single column */
  collapse?: ColumnsBreakpoint;
  children?: React.ReactNode;
  className?: string;
}

const COUNT_CLASS: Record<2 | 3 | 4, string> = {
  2: styles.count2,
  3: styles.count3,
  4: styles.count4,
};

const COLLAPSE_CLASS: Record<ColumnsBreakpoint, string> = {
  sm: styles.collapseSm,
  md: styles.collapseMd,
  lg: styles.collapseLg,
};

export function Columns({ count = 2, gap = '5', collapse = 'md', children, className }: ColumnsProps) {
  return (
    <div
      className={[
        styles.columns,
        COUNT_CLASS[count],
        COLLAPSE_CLASS[collapse],
        className,
      ].filter(Boolean).join(' ')}
      style={{ '--columns-gap': `var(--st-space-${gap})` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
