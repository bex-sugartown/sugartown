import React from 'react';
import styles from './Button.module.css';

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  iconBefore?: React.ReactNode;
  iconAfter?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  iconBefore,
  iconAfter,
}) => {
  const classes = [
    styles.button,
    styles[variant],
    size !== 'md' ? styles[size] : null,
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {iconBefore}
      {children}
      {iconAfter}
    </button>
  );
};
