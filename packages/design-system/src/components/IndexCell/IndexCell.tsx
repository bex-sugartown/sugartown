import React from 'react';
import styles from './IndexCell.module.css';

export type IndexCellState = 'default' | 'active' | 'selected' | 'inactive';

export interface IndexCellProps {
  /** Visual + interactive state */
  state?: IndexCellState;
  /** Render as button, anchor, or non-interactive span */
  as?: 'button' | 'a' | 'span';
  href?: string;
  onClick?: () => void;
  'aria-pressed'?: boolean;
  'aria-label'?: string;
  children: React.ReactNode;
  className?: string;
}

export const IndexCell: React.FC<IndexCellProps> = ({
  state = 'default',
  as: Tag = 'button',
  href,
  onClick,
  'aria-pressed': ariaPressed,
  'aria-label': ariaLabel,
  children,
  className,
}) => {
  const classNames = [
    styles.cell,
    styles[state],
    className,
  ].filter(Boolean).join(' ');

  if (Tag === 'a' && href) {
    return (
      <a href={href} className={classNames} aria-label={ariaLabel}>
        {children}
      </a>
    );
  }

  if (Tag === 'button') {
    return (
      <button
        type="button"
        className={classNames}
        onClick={onClick}
        disabled={state === 'inactive'}
        aria-pressed={ariaPressed}
        aria-label={ariaLabel}
      >
        {children}
      </button>
    );
  }

  return (
    <span className={classNames} aria-label={ariaLabel}>
      {children}
    </span>
  );
};
