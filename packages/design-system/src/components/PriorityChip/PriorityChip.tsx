import React from 'react';
import styles from './PriorityChip.module.css';

export type PriorityLevel = 'high' | 'medium' | 'low' | 'none';

export interface PriorityChipProps {
  level: PriorityLevel;
  className?: string;
}

const LABELS: Record<PriorityLevel, string> = {
  high:   'High',
  medium: 'Medium',
  low:    'Low',
  none:   'No priority',
};

export const PriorityChip: React.FC<PriorityChipProps> = ({ level, className }) => {
  const classNames = [
    styles.chip,
    styles[level],
    className,
  ].filter(Boolean).join(' ');

  return (
    <span className={classNames}>
      <span className={styles.swatch} aria-hidden="true" />
      {LABELS[level]}
    </span>
  );
};
