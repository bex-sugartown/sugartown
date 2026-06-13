import React from 'react';
import styles from './IndexCell.module.css';

export type IndexCellState = 'active' | 'selected' | 'inactive';

export interface IndexCellProps {
  /**
   * Visual + interactive state:
   * - `active` — letter/page has content; clickable, pink border + text on hover (default)
   * - `selected` — currently chosen; solid pink fill, maroon on hover
   * - `inactive` — no content; muted, non-interactive (render `as="span"`)
   */
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
  state = 'active',
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
