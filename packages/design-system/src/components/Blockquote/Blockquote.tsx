import React from 'react';
import styles from './Blockquote.module.css';

/**
 * Blockquote — Sugartown Design System
 *
 * Single canonical style: pink left border, italic text, muted colour.
 * No variants at this time.
 *
 * Canonical CSS: artifacts/style 260118.css §02 Canonical HTML
 */
export interface BlockquoteProps {
  children: React.ReactNode;
  /** Attribution — renders as <footer><cite> inside the blockquote */
  citation?: string;
  className?: string;
}

export function Blockquote({ children, citation, className }: BlockquoteProps) {
  return (
    <blockquote className={`${styles.blockquote} ${className ?? ''}`}>
      {children}
      {citation && (
        <footer className={styles.footer}>
          <cite className={styles.cite}>{citation}</cite>
        </footer>
      )}
    </blockquote>
  );
}
