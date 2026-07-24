import React from 'react';
import styles from './SectionLabel.module.css';

export type SectionLabelLevel = 'h2' | 'h3' | 'h4';

export interface SectionLabelProps {
  /** Section number, e.g. "§ 03". */
  number?: React.ReactNode;
  /** Decorative label — becomes the heading when title is absent. */
  name?: React.ReactNode;
  /** The semantic heading text, when present. */
  title?: React.ReactNode;
  /** Right-aligned mono kicker text. */
  kicker?: React.ReactNode;
  /** Heading level for the title element (or name, when title is absent). Default: 'h2'. */
  level?: SectionLabelLevel;
  className?: string;
}

/**
 * SectionLabel — three-zone folio row over a 1px ink baseline.
 *
 * Layout: §NN · name (mono left) | Cormorant title (centre) | mono kicker (right)
 * Props: number, name, title, kicker (all optional — render only if provided)
 * level: 'h2' | 'h3' | 'h4' — heading level for the title element (default 'h2')
 */
export function SectionLabel({ number, name, title, kicker, level = 'h2', className }: SectionLabelProps) {
  // When title is present it is the semantic heading; name is a decorative label.
  // When only name is present, name is the heading (at the given level).
  const TitleEl = level;
  const NameEl = title ? 'span' : level;
  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      <div className={styles.left}>
        {number && <span className={styles.number}>{number}</span>}
        {name   && <NameEl className={styles.name}>{name}</NameEl>}
      </div>
      {title  && <TitleEl className={styles.title}>{title}</TitleEl>}
      {kicker && <span className={styles.kicker}>{kicker}</span>}
    </div>
  );
}
