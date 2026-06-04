import React from 'react';
import styles from './Page.module.css';
import { Container } from '../Container/Container';
import type { ContainerSize } from '../Container/Container';

export interface PageProps {
  /** Container size for the main content region */
  size?: ContainerSize;
  /** Header slot — rendered full-width above the container */
  header?: React.ReactNode;
  /** Footer slot — rendered full-width below the container */
  footer?: React.ReactNode;
  /** Main content */
  children?: React.ReactNode;
  className?: string;
}

export function Page({ size = 'reading', header, footer, children, className }: PageProps) {
  return (
    <div className={[styles.page, className].filter(Boolean).join(' ')}>
      {header && <header className={styles.header}>{header}</header>}
      <main className={styles.main}>
        <Container size={size}>{children}</Container>
      </main>
      {footer && <footer className={styles.footer}>{footer}</footer>}
    </div>
  );
}
