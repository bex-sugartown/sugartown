import React from 'react';
import styles from './Breadcrumb.module.css';
import { Link } from '../../link/Link';

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
        // CANONICAL (SUG-231): current = last AND not navigable. A crumb that
        // still has an href points somewhere else, so it is not the current
        // page and must not carry aria-current="page". The web mirror uses
        // plain `isLast`, which mislabels a linked final crumb; that copy is
        // scheduled for removal in SUG-224. Do not "reconcile" this toward the
        // web rule — this is the correct side.
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
              <Link href={item.href} className={styles.link}>
                {isFirst && <span className={styles.arrow} aria-hidden="true">←&nbsp;</span>}
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
