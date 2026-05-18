import React from 'react';
import styles from './IndexGroup.module.css';

export interface IndexGroupProps {
  children: React.ReactNode;
  /** Accessible label for the group */
  label?: string;
  className?: string;
}

export const IndexGroup: React.FC<IndexGroupProps> = ({
  children,
  label = 'Index navigation',
  className,
}) => {
  return (
    <div
      className={[styles.group, className].filter(Boolean).join(' ')}
      aria-label={label}
      role="group"
    >
      {children}
    </div>
  );
};
