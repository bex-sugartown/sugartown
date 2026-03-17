import React from 'react';
import styles from './Card.module.css';
import { Chip } from '../Chip/Chip';

// ─── Status badge colours ───────────────────────────────────────────────────
const STATUS_BADGE_CLASS: Record<string, string> = {
  // Legacy / generic
  draft:            styles.statusDraft,
  active:           styles.statusActive,
  archived:         styles.statusArchived,
  implemented:      styles.statusImplemented,
  // Shared / evergreen
  evergreen:        styles.statusEvergreen,
  validated:        styles.statusValidated,
  deprecated:       styles.statusDeprecated,
  // Node evolution (Studio: node.status)
  exploring:        styles.statusExploring,
  operationalized:  styles.statusOperationalized,
  // Project lifecycle (Studio: project.status)
  dreaming:         styles.statusDreaming,
  designing:        styles.statusDesigning,
  developing:       styles.statusDeveloping,
  testing:          styles.statusTesting,
  deploying:        styles.statusDeploying,
  iterating:        styles.statusIterating,
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
   * Category position relative to the title.
   * 'before' (default) — renders between eyebrow and title.
   * 'after' — renders after the title.
   * Semantic naming enables responsive reflow where spatial direction changes
   * across viewports (top/bottom vs left/right) but logical order is preserved.
   */
  categoryPosition?: 'before' | 'after';
  /**
   * Status badge for project lifecycle (and legacy generic values).
   * Project lifecycle (Studio: project.status):
   *   dreaming | designing | developing | testing | deploying | iterating
   * Legacy / generic:
   *   draft | active | archived | implemented | evergreen | deprecated
   *
   * For node evolution use the `evolution` prop instead.
   * Never set both status and evolution on the same card.
   */
  status?:
    | 'draft' | 'active' | 'archived' | 'implemented'           // legacy / generic
    | 'evergreen' | 'deprecated'                                  // shared longevity states
    | 'dreaming' | 'designing' | 'developing'                     // project lifecycle
    | 'testing' | 'deploying' | 'iterating';
  /**
   * Evolution badge for knowledge graph nodes (Studio: node.status).
   * Values: exploring | validated | operationalized | deprecated | evergreen
   *
   * For project lifecycle use the `status` prop instead.
   * Never set both status and evolution on the same card.
   */
  evolution?:
    | 'exploring' | 'validated' | 'operationalized'
    | 'deprecated' | 'evergreen';

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
  /** Outlined grey chips (tools/platforms). */
  tools?: Array<{ label: string; href?: string }>;
  /** Label shown before the tools chip group (default: 'Tools'). */
  toolsLabel?: string;
  /** Label shown before the tags chip group (default: 'Tags'). */
  tagsLabel?: string;

  // Footer
  /** ISO date string — component formats for display. */
  date?: string;
  /** "Next Step: [text]" — renders in footer-left. */
  nextStep?: string;
  /** AI tool attribution — "Claude" | "ChatGPT" | "Gemini" | etc. */
  aiTool?: string;
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
  categoryPosition = 'before',
  status,
  evolution,
  excerpt,
  project,
  metadata,
  tags,
  tools,
  toolsLabel = 'Tools',
  tagsLabel = 'Tags',
  date,
  nextStep,
  aiTool,
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
  // evolution takes priority; status is the fallback. Never both simultaneously.
  const badgeValue = evolution ?? status;

  const headerEl = (
    <div className={styles.header}>
      {eyebrow && <div className={styles.eyebrow}>{eyebrow}</div>}
      {categoryPosition === 'before' && categoryEl}
      {badgeValue && (
        <span
          className={[styles.statusBadge, STATUS_BADGE_CLASS[badgeValue]].filter(Boolean).join(' ')}
          aria-label={`Status: ${badgeValue}`}
        >
          {badgeValue}
        </span>
      )}
      <h3 className={styles.title}>{titleNode}</h3>
      {categoryPosition === 'after' && categoryEl}
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
        <div className={styles.chipGroup}>
          <span className={styles.chipGroupLabel}>{toolsLabel}</span>
          <ul className={styles.toolsRow} aria-label={toolsLabel}>
            {tools.map(({ label, href: chipHref }) => (
              <li key={label}>
                <Chip
                  label={label}
                  href={chipHref}
                  color="grey"
                  size="sm"
                  className={chipHref && href ? styles.hasCardLink : undefined}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {tags && tags.length > 0 && (
        <div className={styles.chipGroup}>
          <span className={styles.chipGroupLabel}>{tagsLabel}</span>
          <ul className={styles.tagsRow} aria-label={tagsLabel}>
            {tags.map(({ label, href: chipHref }) => (
              <li key={label}>
                <Chip
                  label={label}
                  href={chipHref}
                  size="sm"
                  className={[
                    styles.chipTag,
                    chipHref && href ? styles.hasCardLink : '',
                  ].filter(Boolean).join(' ') || undefined}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  ) : null;

  // ── Footer ────────────────────────────────────────────────────────────────
  const hasFooter = nextStep || aiTool || kpiLink || date;

  const footerEl = hasFooter ? (
    <div className={styles.footer}>
      <div className={styles.footerLeft}>
        {nextStep && (
          <span className={styles.nextStep}>
            <span className={styles.nextStepLabel}>Next Step: </span>
            {nextStep}
          </span>
        )}
        {aiTool && (
          <span className={styles.aiTool}>
            <span className={styles.aiToolLabel}>AI: </span>
            {aiTool}
          </span>
        )}
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
      </div>
    </div>
  ) : null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <article className={rootClasses} style={accentStyle}>
      {/* Hero thumbnail — default variant, full-width above header */}
      {variant === 'default' && thumbnailUrl && (
        <div className={styles.thumbnailHero}>
          <img src={thumbnailUrl} alt={thumbnailAlt} className={styles.thumbnailImg} loading="lazy" decoding="async" />
        </div>
      )}

      {/* Listing variant: row layout when thumbnail present */}
      {isListingWithThumb ? (
        <div className={styles.listingRow}>
          <div className={styles.thumbnailRail}>
            <img src={thumbnailUrl} alt={thumbnailAlt} className={styles.thumbnailImg} loading="lazy" decoding="async" />
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
