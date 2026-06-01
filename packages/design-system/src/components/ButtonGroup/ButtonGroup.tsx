import React from 'react';
import styles from './ButtonGroup.module.css';

export interface ButtonGroupProps {
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  wrap?: boolean;
  className?: string;
}

export default function ButtonGroup({
  children,
  align = 'start',
  wrap = true,
  className,
}: ButtonGroupProps) {
  return (
    <div
      className={[
        styles.group,
        styles[align],
        wrap ? styles.wrap : '',
        className,
      ].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  );
}
