import React from 'react';
import styles from './ErrorMessage.module.css';

export interface ErrorMessageProps {
  /** Must match the control's aria-describedby value */
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function ErrorMessage({ id, children, className }: ErrorMessageProps) {
  return (
    <p
      id={id}
      role="alert"
      aria-live="polite"
      className={[styles.errorMessage, className].filter(Boolean).join(' ')}
    >
      {children}
    </p>
  );
}
