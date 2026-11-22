import React from 'react';
import styles from './IconButton.module.css';

export interface IconButtonProps {
  children: React.ReactNode;
  shape?: 'square' | 'circle';
  onClick?: () => void;
  disabled?: boolean;
  /** Toggle state. When defined, sets aria-pressed and, when true, the selected look (solid fill). */
  selected?: boolean;
  className?: string;
  'aria-label': string;
  [key: string]: unknown;
}

export const IconButton: React.FC<IconButtonProps> = ({
  children,
  shape = 'square',
  onClick,
  disabled = false,
  selected,
  className = '',
  ...props
}) => {
  const shapeClass = shape === 'circle' ? styles.circle : styles.square;
  const classes = [styles.iconButton, shapeClass, selected && styles.iconButtonActive, className].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      className={classes}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      {...props}
    >
      {children}
    </button>
  );
};
