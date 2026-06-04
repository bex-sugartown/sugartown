import React from 'react';
import styles from './HelperText.module.css';

export interface HelperTextProps {
  /** Must match the control's aria-describedby value */
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function HelperText({ id, children, className }: HelperTextProps) {
  return (
    <p id={id} className={[styles.helperText, className].filter(Boolean).join(' ')}>
      {children}
    </p>
  );
}
