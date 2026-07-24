import React from 'react';
import styles from './PageHeader.module.css';

export interface PageHeaderProps {
  /** Nav trail, rendered in the top row above the identity block (e.g. Breadcrumb). */
  breadcrumb?: React.ReactNode;
  /** Media slot — Avatar or logo, rendered left of the identity content. */
  media?: React.ReactNode;
  /** Mono uppercase kicker rendered above the title. */
  eyebrow?: React.ReactNode;
  /** Page title, rendered as an H1. */
  title: React.ReactNode;
  /** Prose description below the title. */
  description?: React.ReactNode;
  /** Count badge shown next to the title (e.g. archive item count). */
  count?: number;
  /** Structured content node (e.g. DescriptionList) rendered below the identity block. */
  metadataCard?: React.ReactNode;
  /** Admin/edit controls, rendered in the top row alongside breadcrumb. */
  actions?: React.ReactNode;
  /** CSS colour value, blended at 10% over the surface background via color-mix. */
  tint?: string;
  /** Italic H1 — used for archive mastheads and person folios. Default: false. */
  italic?: boolean;
  className?: string;
  /** Trailing slot below the description (tool URL, social links, pronunciation). */
  children?: React.ReactNode;
}

/**
 * PageHeader — full-width identity band at the top of archive, entity, and
 * taxonomy pages. Lives in Page's header slot, above the main content container.
 */
export function PageHeader({
  breadcrumb,
  media,
  eyebrow,
  title,
  description,
  count,
  metadataCard,
  actions,
  tint,
  italic = false,
  className,
  children,
}: PageHeaderProps) {
  const tintStyle = tint ? ({ '--page-header-tint': tint } as React.CSSProperties) : undefined;

  const hasTopRow = breadcrumb || actions;

  return (
    <div
      className={[styles.root, tint ? styles.tinted : undefined, className]
        .filter(Boolean)
        .join(' ')}
      style={tintStyle}
    >
      <div className={styles.inner}>
        {hasTopRow && (
          <div className={styles.topRow}>
            {breadcrumb && <div className={styles.breadcrumbSlot}>{breadcrumb}</div>}
            {actions && <div className={styles.actions}>{actions}</div>}
          </div>
        )}

        <div className={styles.body}>
          {media && <div className={styles.media}>{media}</div>}

          <div className={styles.content}>
            {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}

            <div className={styles.titleRow}>
              <h1 className={[styles.title, italic ? styles.titleItalic : undefined].filter(Boolean).join(' ')}>{title}</h1>
              {count !== undefined && (
                <span className={styles.count} aria-label={`${count} items`}>
                  {count}
                </span>
              )}
            </div>

            {description && <p className={styles.description}>{description}</p>}

            {children}
          </div>
        </div>

        {metadataCard && <div className={styles.metadataCard}>{metadataCard}</div>}
      </div>
    </div>
  );
}
