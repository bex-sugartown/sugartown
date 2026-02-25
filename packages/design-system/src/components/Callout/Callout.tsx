import React from 'react';
import { Heart, Info, Lightbulb, AlertTriangle, AlertOctagon } from 'lucide-react';
import styles from './Callout.module.css';

/**
 * Callout — Sugartown Design System
 *
 * Coloured aside for tips, warnings, and featured notes.
 * Five variants: default (pink), info, tip, warn, danger.
 * Each variant has a default Lucide icon; pass `icon` to override, `icon={null}` to suppress.
 *
 * Canonical CSS: artifacts/style 260118.css §.st-callout
 */

type CalloutVariant = 'default' | 'info' | 'tip' | 'warn' | 'danger';

export interface CalloutProps {
  /** Colour variant */
  variant?: CalloutVariant;
  /** Override the default icon; pass `null` to suppress entirely */
  icon?: React.ReactNode | null;
  /** Optional bold title above the body */
  title?: string;
  /** Body content */
  children: React.ReactNode;
  className?: string;
}

const VARIANT_ICONS: Record<CalloutVariant, React.ReactNode> = {
  default: <Heart size={18} />,
  info: <Info size={18} />,
  tip: <Lightbulb size={18} />,
  warn: <AlertTriangle size={18} />,
  danger: <AlertOctagon size={18} />,
};

export function Callout({
  variant = 'default',
  icon,
  title,
  children,
  className,
}: CalloutProps) {
  // icon={undefined} → use default; icon={null} → no icon; icon={<X/>} → custom
  const resolvedIcon = icon === undefined ? VARIANT_ICONS[variant] : icon;

  const classNames = [
    styles.callout,
    styles[variant] ?? '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <aside className={classNames} role="note">
      {(resolvedIcon || title) && (
        <div className={styles.header}>
          {resolvedIcon && <span className={styles.icon}>{resolvedIcon}</span>}
          {title && <strong className={styles.title}>{title}</strong>}
        </div>
      )}
      <div className={styles.body}>{children}</div>
    </aside>
  );
}
