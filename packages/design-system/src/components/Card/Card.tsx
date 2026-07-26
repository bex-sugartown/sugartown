import React from 'react';
import styles from './Card.module.css';
import { Chip } from '../Chip/Chip';
import { Link } from '../../link/Link';
import { isExternalHref } from '../../link/isExternalHref';

export type CardVariant = 'default' | 'elevated' | 'listing' | 'metadata' | 'accent';

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

// ─── Variant classes ─────────────────────────────────────────────────────────
// 'default' and 'elevated' intentionally have no dedicated class (elevated is
// .card's default appearance) — they resolve to undefined and are filtered out.
const VARIANT_CLASS: Partial<Record<CardVariant, string>> = {
  listing: styles.variantListing,
  metadata: styles.variantMetadata,
  accent: styles.variantAccent,
};

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CardProps {
  // Layout
  /**
   * Visual variant. Default: 'default'.
   * - elevated / default — card with shadow (elevated is the canonical name)
   * - listing — compact row layout
   * - metadata — structured field grid layout
   * - accent — 3px brand-primary left rule + tinted header bg
   */
  variant?: CardVariant;
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
   * @deprecated Category always renders before the title. Passing this prop has
   * no effect and it will be removed in a future release.
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
  /**
   * AI tool attribution.
   * @deprecated Use the `tools[]` chip row instead — pass `{ label: 'Claude', href: '/tools/claude' }`.
   * This prop will be removed in a future release.
   */
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
  /** Extra class name applied to the thumbnail wrapper (hero or rail). For overlay/effect treatments. */
  thumbnailClassName?: string;
  /** Inline style applied to the thumbnail wrapper (hero or rail). For overlay styles or hotspot-driven object-position. */
  thumbnailStyle?: React.CSSProperties;

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

  /** Escape hatch for custom body content (e.g. Portable Text). Rendered after the tags row. */
  children?: React.ReactNode;
  /** Escape hatch for custom footer content (e.g. citations). Rendered after the standard footer fields. */
  footerChildren?: React.ReactNode;

  /**
   * Render the folio row above the card header.
   * When true: eyebrow label appears left and status badge appears right in a
   * grey canvas strip; both are suppressed from the card header below.
   * Matches the Ledger Tradition card structure (SUG-82).
   */
  showFolio?: boolean;
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
  thumbnailClassName,
  thumbnailStyle,
  accentColor,
  href,
  className,
  children,
  footerChildren,
  showFolio = false,
}) => {
  // ── Root class list ───────────────────────────────────────────────────────
  const rootClasses = [
    styles.card,
    VARIANT_CLASS[variant],
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
  // External hrefs get target/rel here rather than through the Link seam,
  // which deliberately omits them (SUG-230 editorial choice). Card's full-card
  // link is real Sanity-authored content (CardBuilderSection titleLink can be
  // type="external") and dropping target/rel would be a functional regression
  // for that consumer — same reasoning as Button's decision C (SUG-224 Phase 0).
  const titleNode = href ? (
    isExternalHref(href) ? (
      <a href={href} target="_blank" rel="noopener noreferrer" className={styles.titleLink} aria-label={title}>
        {title}
      </a>
    ) : (
      <Link href={href} className={styles.titleLink} aria-label={title}>
        {title}
      </Link>
    )
  ) : (
    title
  );

  // ── Category element ──────────────────────────────────────────────────────
  const categoryEl = category ? (
    <div className={styles.category}>
      <span className={styles.categoryLabel}>Category: </span>
      <Link href={category.href} className={styles.categoryLink}>
        {category.label}
      </Link>
    </div>
  ) : null;

  // ── Header ────────────────────────────────────────────────────────────────
  // evolution takes priority; status is the fallback. Never both simultaneously.
  const badgeValue = evolution ?? status;

  // When showFolio is true, eyebrow + badge move to the folio row above.
  const folioEl = showFolio ? (
    <div className={styles.cardFolio}>
      {eyebrow && <div className={styles.folioLabel}>{eyebrow}</div>}
      {badgeValue && (
        <Chip variant="badge" status={badgeValue as any} size="sm" aria-label={`Status: ${badgeValue}`}>
          {badgeValue}
        </Chip>
      )}
    </div>
  ) : null;

  const headerEl = (
    <div className={styles.header}>
      {eyebrow && !showFolio && <div className={styles.eyebrow}>{eyebrow}</div>}
      {categoryPosition === 'before' && !showFolio && categoryEl}
      {badgeValue && !showFolio && (
        <span
          className={[styles.statusBadge, STATUS_BADGE_CLASS[badgeValue]].filter(Boolean).join(' ')}
          aria-label={`Status: ${badgeValue}`}
        >
          {badgeValue}
        </span>
      )}
      <h3 className={styles.title}>{titleNode}</h3>
      {categoryPosition === 'after' && !showFolio && categoryEl}
    </div>
  );

  // ── Body ──────────────────────────────────────────────────────────────────
  const hasBody =
    excerpt ||
    (metadata && metadata.length > 0) ||
    (tools && tools.length > 0) ||
    (tags && tags.length > 0) ||
    project ||
    children;

  const bodyEl = hasBody ? (
    <div className={styles.body}>
      {excerpt && <p className={styles.excerpt}>{excerpt}</p>}

      {project && (
        <div className={styles.projectAttribution}>
          <span className={styles.projectLabel}>Project: </span>
          {project.href ? (
            <Link href={project.href} className={[styles.projectLink, href ? styles.hasCardLink : ''].filter(Boolean).join(' ')}>
              {project.label}
            </Link>
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
                  variant="tag"
                  label={label}
                  href={chipHref}
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
            {tags.map(({ label, href: chipHref }, i) => (
              <li key={label}>
                <Chip
                  variant="tag"
                  featured={i === 0}
                  label={label}
                  href={chipHref}
                  size="sm"
                  className={chipHref && href ? styles.hasCardLink : undefined}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Escape hatch: custom body content (e.g. Portable Text) */}
      {children}
    </div>
  ) : null;

  // ── Footer ────────────────────────────────────────────────────────────────
  const hasFooter = nextStep || aiTool || kpiLink || date || footerChildren || (!!category && showFolio);

  const footerEl = hasFooter ? (
    <div className={styles.footer}>
      {(nextStep || aiTool || kpiLink || date || (!!category && showFolio)) && (
        <>
          <div className={styles.footerLeft}>
            {showFolio && category && (
              category.href ? (
                <Link
                  href={category.href}
                  className={[styles.footerCategoryLink, href ? styles.hasCardLink : ''].filter(Boolean).join(' ')}
                >
                  {category.label}
                </Link>
              ) : (
                <span className={styles.footerCategoryLink}>{category.label}</span>
              )
            )}
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
              <Link
                href={kpiLink.href}
                className={[styles.kpiLink, href ? styles.hasCardLink : ''].filter(Boolean).join(' ')}
              >
                KPIs: {kpiLink.label} →
              </Link>
            )}
          </div>
          <div className={styles.footerRight}>
            {date && <time className={styles.date} dateTime={date}>{formatDate(date)}</time>}
          </div>
        </>
      )}
      {footerChildren}
    </div>
  ) : null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <article className={rootClasses} style={accentStyle}>
      {/* Hero thumbnail — default variant, full-width above header.
          width/height attrs give browser intrinsic 16:9 ratio before image loads → no CLS. */}
      {variant === 'default' && thumbnailUrl && (
        <div className={[styles.thumbnailHero, thumbnailClassName].filter(Boolean).join(' ')} style={thumbnailStyle}>
          <img src={thumbnailUrl} alt={thumbnailAlt} className={styles.thumbnailImg} loading="lazy" decoding="async" width="1600" height="900" />
        </div>
      )}

      {/* Folio row — structural label strip, spans full card width */}
      {folioEl}

      {/* Listing variant: row layout when thumbnail present */}
      {isListingWithThumb ? (
        <div className={styles.listingRow}>
          <div className={[styles.thumbnailRail, thumbnailClassName].filter(Boolean).join(' ')} style={thumbnailStyle}>
            <img src={thumbnailUrl} alt={thumbnailAlt} className={styles.thumbnailImg} loading="lazy" decoding="async" width="400" height="225" />
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
