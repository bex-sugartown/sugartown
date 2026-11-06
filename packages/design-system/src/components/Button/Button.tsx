import React from 'react';
import styles from './Button.module.css';
import { Link } from '../../link/Link';
import { isExternalHref } from '../../link/isExternalHref';

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  iconBefore?: React.ReactNode;
  iconAfter?: React.ReactNode;
  /** Destination. When present, Button renders as a link instead of a <button>. */
  href?: string;
  /**
   * Forces external-style rendering (`target="_blank" rel="noopener noreferrer"`)
   * even for an internal href. Matches the Sanity `openInNewTab` field on
   * link/ctaButton objects.
   */
  openInNewTab?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

/**
 * Button renders its own target/rel handling for external hrefs rather than
 * delegating to the DS Link seam (SUG-230), which deliberately omits
 * target/rel as an editorial choice other seamed components don't make.
 * Decision (SUG-224 Phase 0, 2026-07-23): the merged Button is the only
 * Button, so this is where that behaviour is decided — dropping it here
 * would be a functional regression for the web adapter Button being merged in.
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  iconBefore,
  iconAfter,
  href,
  openInNewTab,
  type = 'button',
  ...rest
}) => {
  const classes = [
    styles.button,
    styles[variant],
    size !== 'md' ? styles[size] : null,
    className,
  ].filter(Boolean).join(' ');

  const content = (
    <>
      {iconBefore}
      {children}
      {iconAfter}
    </>
  );

  if (href) {
    const external = isExternalHref(href) || openInNewTab;

    if (external) {
      return (
        <a className={classes} href={href} target="_blank" rel="noopener noreferrer" {...rest}>
          {content}
        </a>
      );
    }

    // Internal path → the DS Link seam (injected router component, or plain <a>
    // if no LinkProvider is mounted).
    return (
      <Link className={classes} href={href} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} onClick={onClick} disabled={disabled} type={type} {...rest}>
      {content}
    </button>
  );
};
