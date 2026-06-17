import React from 'react';
import styles from './IconButton.module.css';

export interface IconButtonProps {
  children: React.ReactNode;
  shape?: 'square' | 'circle';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  'aria-label': string;
  [key: string]: unknown;
}

export const IconButton: React.FC<IconButtonProps> = ({
  children,
  shape = 'square',
  onClick,
  disabled = false,
  className = '',
  ...props
}) => {
  const shapeClass = shape === 'circle' ? styles.circle : styles.square;
  const classes = [styles.iconButton, shapeClass, className].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
