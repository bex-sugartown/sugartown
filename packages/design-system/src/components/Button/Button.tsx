import React from 'react';
import styles from './Button.module.css';

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: 'start' | 'end';
  iconAfter?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  icon,
  iconPosition = 'start',
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
      {icon && iconPosition !== 'end' && icon}
      {children}
      {iconAfter}
      {icon && iconPosition === 'end' && icon}
    </button>
  );
};
