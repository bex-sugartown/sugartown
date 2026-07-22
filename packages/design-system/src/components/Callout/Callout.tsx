import React from 'react';
import styles from './Callout.module.css';

/**
 * Callout — Sugartown Design System · row format (SUG-99)
 *
 * Two-column grid: solid label column (--st-card-label-bg) + body column.
 * 2px accent top border, 1px rule-accent box border. No radius.
 *
 * Variants: info (pink, default), tip (violet), warn (orange), danger (maroon),
 *           banner (single-row strip)
 *
 * banner: flat flex row — inline label + body, full-width, no label column.
 * Used for page-level status messages (role="status").
 *
 * SUG-192: 'default' removed — it was CSS-identical to 'info'.
 * SUG-231 Phase 3: this copy adopted web's row format wholesale. It previously
 * carried the pre-SUG-99 design (padded box, per-variant lucide icon, title)
 * sourced from `artifacts/style 260118.css`, and had no Storybook story — which
 * is why the drift went unseen. The `icon` prop and the `default` variant were
 * removed here; see the epic doc for the recorded canonical decision.
 *
 * Mirrors: apps/web/src/design-system/components/callout/Callout.jsx
 */

export type CalloutVariant = 'info' | 'tip' | 'warn' | 'danger' | 'banner';

export interface CalloutProps {
  /** Colour variant. `banner` renders the flat full-width strip. */
  variant?: CalloutVariant;
  /** Folio number rendered above the label, e.g. §01. Ignored by `banner`. */
  number?: React.ReactNode;
  /** Label text. Defaults to the variant name. For `banner`, the inline label. */
  title?: string;
  /** Body text convenience — wrapped in a <p>. Takes precedence over children. */
  content?: React.ReactNode;
  /** Body content. Used when `content` is not supplied. */
  children?: React.ReactNode;
}

export function Callout({
  variant = 'info',
  number,
  title,
  content,
  children,
}: CalloutProps) {
  const body = content ? <p>{content}</p> : children;
  const classNames = [styles.callout, styles[variant] ?? ''].filter(Boolean).join(' ');

  if (variant === 'banner') {
    return (
      <div className={classNames} role="status">
        {title && <span className={styles.bannerLabel}>{title}</span>}
        <div className={styles.bannerBody}>{body}</div>
      </div>
    );
  }

  const label = title || variant;

  return (
    <aside className={classNames} role="note">
      <div className={styles.labelCol}>
        {number && <span className={styles.number}>{number}</span>}
        <span className={styles.label}>{label}</span>
      </div>
      <div className={styles.body}>{body}</div>
    </aside>
  );
}
