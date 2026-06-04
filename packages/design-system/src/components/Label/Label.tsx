import React from 'react';
import styles from './Label.module.css';

export interface LabelProps {
  /** ID of the associated form control */
  htmlFor: string;
  /** Marks the field as required — adds a visual indicator */
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Label({ htmlFor, required = false, children, className }: LabelProps) {
  return (
    <label htmlFor={htmlFor} className={[styles.label, className].filter(Boolean).join(' ')}>
      {children}
      {required && <span className={styles.required} aria-hidden="true"> *</span>}
    </label>
  );
}
