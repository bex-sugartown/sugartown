import React from 'react';
import styles from './Card.module.css';

// ─── Status badge colours ───────────────────────────────────────────────────
const STATUS_BADGE_CLASS: Record<string, string> = {
  draft:       styles.statusDraft,
  active:      styles.statusActive,
  archived:    styles.statusArchived,
  evergreen:   styles.statusEvergreen,
  implemented: styles.statusImplemented,
  validated:   styles.statusValidated,
  deprecated:  styles.statusDeprecated,
};

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CardProps {
  // Layout
  /** Visual variant — default | listing | metadata. Default: 'default'. */
  variant?: 'default' | 'listing' | 'metadata';
  /** Density modifier — 'compact' reduces padding + type scale. Default: 'default'. */
  density?: 'default' | 'compact';

  // Header
  /** Required title string. */
  title: string;
  /** Eyebrow label — mono uppercase. Example: "Node · PROJ-001". */
  eyebrow?: string;
  /** Category text link. "Category: [linked label]" treatment. */
  category?: { label: string; href: string };
  /**
   * Category vertical position.
   * 'below-eyebrow' (default) = between eyebrow and title.
   * 'above-title' = between eyebrow + any spacer and title.
   * Position locked after Storybook review (BL-06).
   */
  categoryPosition?: 'below-eyebrow' | 'above-title';
  /** Optional subtitle — default variant only. */
  subtitle?: string;
  /** Status badge — rendered as a floated pill in the header. */
  status?: 'draft' | 'active' | 'archived' | 'evergreen' | 'implemented' | 'validated' | 'deprecated';

  // Body
  /** Short description prose — default + listing variants. */
  excerpt?: string;
  /** Project attribution — listing variant. Plain text or linked. */
  project?: { label: string; href?: string };

  // Metadata grid (variant="metadata" only)
  /**
   * Structured field rows — rendered as a two-column label / value grid.
   * Handles all sub-type-specific fields (conversationType, projectId, priority,
   * client, role etc.) — do not add named props for single sub-type fields.
   */
  metadata?: Array<{ label: string; value: string }>;

  // Chips
  /** Filled pink chips. */
  tags?: Array<{ label: string; href?: string }>;
  /** Outlined seafoam chips. */
  tools?: Array<{ label: string; href?: string }>;

  // Footer
  /** ISO date string — component formats for display. */
  date?: string;
  /** "Next Step: [text]" — renders in footer-left. */
  nextStep?: string;
  /** AI tool attribution — "Claude" | "ChatGPT" | "Gemini" | etc. */
  aiTool?: string;
  /** Stamp label — "Reviewed" | "Implemented" | "Due" etc. */
  stamp?: string;
  /** KPI link — "KPIs: [View →]". No data, no bars. */
  kpiLink?: { label: string; href: string };

  // Media
  /**
   * Resolved thumbnail URL.
   * Source in apps/web: hero.media[0] or sections[] via GROQ projection.
   * NEVER use featuredImage — that field is deprecated (BL-07).
   */
  thumbnailUrl?: string;
  /** Alt text for thumbnail image. */
  thumbnailAlt?: string;

  // Project colorway
  /**
   * Hex value from project.colorHex.
   * Applied via CSS custom property --accent.
   * Produces: left border strip, header wash, eyebrow tint via color-mix().
   * Absent prop = no style = default appearance.
   */
  accentColor?: string;

  // Linking
  /**
   * Full-card link URL.
   * Implemented via ::after hit-target on title link — NOT a wrapping <a>.
   * Other interactive children (tags, footer links) get position:relative; z-index:1.
   */
  href?: string;

  /** Extra class names for layout overrides from parent grid. */
  className?: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

// ─── Component ──────────────────────────────────────────────────────────────

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  density = 'default',
  title,
  eyebrow,
  category,
  categoryPosition = 'below-eyebrow',
  subtitle,
  status,
  excerpt,
  project,
  metadata,
  tags,
  tools,
  date,
  nextStep,
  aiTool,
  stamp,
  kpiLink,
  thumbnailUrl,
  thumbnailAlt = '',
  accentColor,
  href,
  className,
}) => {
  // ── Root class list ───────────────────────────────────────────────────────
  const rootClasses = [
    styles.card,
    styles[`variant-${variant}`],
    density === 'compact' && styles.compact,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // ── Accent color via CSS custom property ─────────────────────────────────
  const accentStyle = accentColor ? ({ '--accent': accentColor } as React.CSSProperties) : undefined;

  // ── Listing + thumbnail → row layout ─────────────────────────────────────
  const isListingWithThumb = variant === 'listing' && !!thumbnailUrl;

  // ── Title node: full-card link via ::after, or plain text ─────────────────
  const titleNode = href ? (
    <a href={href} className={styles.titleLink} aria-label={title}>
      {title}
    </a>
  ) : (
    title
  );

  // ── Category element ──────────────────────────────────────────────────────
  const categoryEl = category ? (
    <div className={styles.category}>
      <span className={styles.categoryLabel}>Category: </span>
      <a href={category.href} className={styles.categoryLink}>
        {category.label}
      </a>
    </div>
  ) : null;

  // ── Header ────────────────────────────────────────────────────────────────
  const headerEl = (
    <div className={styles.header}>
      {eyebrow && <div className={styles.eyebrow}>{eyebrow}</div>}
      {categoryPosition === 'below-eyebrow' && categoryEl}
      {status && (
        <span
          className={[styles.statusBadge, STATUS_BADGE_CLASS[status]].filter(Boolean).join(' ')}
          aria-label={`Status: ${status}`}
        >
          {status}
        </span>
      )}
      <h3 className={styles.title}>{titleNode}</h3>
      {categoryPosition === 'above-title' && categoryEl}
      {subtitle && variant === 'default' && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
  );

  // ── Body ──────────────────────────────────────────────────────────────────
  const hasBody =
    excerpt ||
    (metadata && metadata.length > 0) ||
    (tools && tools.length > 0) ||
    (tags && tags.length > 0) ||
    project;

  const bodyEl = hasBody ? (
    <div className={styles.body}>
      {excerpt && <p className={styles.excerpt}>{excerpt}</p>}

      {project && (
        <div className={styles.projectAttribution}>
          <span className={styles.projectLabel}>Project: </span>
          {project.href ? (
            <a href={project.href} className={[styles.projectLink, href ? styles.hasCardLink : ''].filter(Boolean).join(' ')}>
              {project.label}
            </a>
          ) : (
            <span className={styles.projectValue}>{project.label}</span>
          )}
        </div>
      )}

      {metadata && metadata.length > 0 && (
        <dl className={styles.metadataGrid}>
          {metadata.map(({ label, value }) => (
            <React.Fragment key={label}>
              <dt className={styles.metadataLabel}>{label}</dt>
              <dd className={styles.metadataValue}>{value}</dd>
            </React.Fragment>
          ))}
        </dl>
      )}

      {tools && tools.length > 0 && (
        <ul className={styles.toolsRow} aria-label="Tools">
          {tools.map(({ label, href: chipHref }) => (
            <li key={label}>
              {chipHref ? (
                <a
                  href={chipHref}
                  className={[styles.chip, styles.chipTool, href ? styles.hasCardLink : ''].filter(Boolean).join(' ')}
                >
                  {label}
                </a>
              ) : (
                <span className={[styles.chip, styles.chipTool].join(' ')}>{label}</span>
              )}
            </li>
          ))}
        </ul>
      )}

      {tags && tags.length > 0 && (
        <ul className={styles.tagsRow} aria-label="Tags">
          {tags.map(({ label, href: chipHref }) => (
            <li key={label}>
              {chipHref ? (
                <a
                  href={chipHref}
                  className={[styles.chip, styles.chipTag, href ? styles.hasCardLink : ''].filter(Boolean).join(' ')}
                >
                  {label}
                </a>
              ) : (
                <span className={[styles.chip, styles.chipTag].join(' ')}>{label}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  ) : null;

  // ── Footer ────────────────────────────────────────────────────────────────
  const hasFooter = nextStep || aiTool || kpiLink || date || stamp;

  const footerEl = hasFooter ? (
    <div className={styles.footer}>
      <div className={styles.footerLeft}>
        {nextStep && (
          <span className={styles.nextStep}>
            <span className={styles.nextStepLabel}>Next Step: </span>
            {nextStep}
          </span>
        )}
        {aiTool && <span className={styles.aiTool}>{aiTool}</span>}
        {kpiLink && (
          <a
            href={kpiLink.href}
            className={[styles.kpiLink, href ? styles.hasCardLink : ''].filter(Boolean).join(' ')}
          >
            KPIs: {kpiLink.label} →
          </a>
        )}
      </div>
      <div className={styles.footerRight}>
        {date && <time className={styles.date} dateTime={date}>{formatDate(date)}</time>}
        {stamp && <span className={styles.stamp}>{stamp}</span>}
      </div>
    </div>
  ) : null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <article className={rootClasses} style={accentStyle}>
      {/* Hero thumbnail — default variant, full-width above header */}
      {variant === 'default' && thumbnailUrl && (
        <div className={styles.thumbnailHero}>
          <img src={thumbnailUrl} alt={thumbnailAlt} className={styles.thumbnailImg} loading="lazy" />
        </div>
      )}

      {/* Listing variant: row layout when thumbnail present */}
      {isListingWithThumb ? (
        <div className={styles.listingRow}>
          <div className={styles.thumbnailRail}>
            <img src={thumbnailUrl} alt={thumbnailAlt} className={styles.thumbnailImg} loading="lazy" />
          </div>
          <div className={styles.listingContent}>
            {headerEl}
            {bodyEl}
            {footerEl}
          </div>
        </div>
      ) : (
        <>
          {headerEl}
          {bodyEl}
          {footerEl}
        </>
      )}
    </article>
  );
};
