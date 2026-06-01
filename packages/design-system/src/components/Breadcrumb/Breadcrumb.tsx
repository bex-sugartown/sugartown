import React from 'react';
import styles from './Breadcrumb.module.css';

export interface BreadcrumbItem {
  /** Display label */
  label: string;
  /** Navigation href. Omit for the current (last) crumb. */
  href?: string;
}

export interface BreadcrumbProps {
  /** Ordered trail. Last item without href renders as the current crumb (pink, non-linked). */
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className }: BreadcrumbProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={[styles.breadcrumb, className].filter(Boolean).join(' ')}>
      {items.map((item, i) => {
        const isFirst = i === 0;
        const isLast = i === items.length - 1;
        const isCurrent = isLast && !item.href;

        return (
          <React.Fragment key={i}>
            {!isFirst && <span className={styles.sep} aria-hidden="true">/</span>}
            {isCurrent ? (
              <span className={styles.current} aria-current="page">
                {isFirst && <span className={styles.arrow} aria-hidden="true">←&nbsp;</span>}
                {item.label}
              </span>
            ) : (
              <a href={item.href} className={styles.link}>
                {isFirst && <span className={styles.arrow} aria-hidden="true">←&nbsp;</span>}
                {item.label}
              </a>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
